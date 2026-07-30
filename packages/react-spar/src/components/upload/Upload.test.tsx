import type { HTMLAttributes } from 'react';
import { fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProvider as render, screen } from '../../test-utils';

import { Field } from '../field';

// Internal by design — the package exports no upload helpers, but the wrapping
// contract is still worth pinning down.
import { createUploadFile } from './helpers';
import { Upload, type UploadFile } from './index';

const makeFile = (name: string, { type = 'text/plain', size = 8 } = {}): File => new File([new Uint8Array(size)], name, { type });

// An UploadFile literal for controlled-value cases (id keyed off the name).
const uf = (name: string, over: Partial<UploadFile> = {}): UploadFile => ({ id: name, name, size: 1024, type: 'text/plain', status: 'idle', ...over });

const fileInput = (container: HTMLElement): HTMLInputElement => {
  const input = container.querySelector('input[type="file"]');
  if (!input) throw new Error('hidden file input not found');
  return input as HTMLInputElement;
};

const uploadRoot = (container: HTMLElement): HTMLElement => container.querySelector('.tk-upload') as HTMLElement;

// The default anatomy used by most cases: the consumer maps the files, so each
// row's actions close over their own entry.
const Anatomy = (props: Parameters<typeof Upload>[0]) => (
  <Upload {...props}>
    <Upload.Dropzone data-testid="dropzone">
      <Upload.Trigger>Choose file</Upload.Trigger>
      <Upload.Submit>Upload</Upload.Submit>
    </Upload.Dropzone>
    <Upload.List>
      {files =>
        files.map(file => (
          <Upload.Item key={file.id} file={file}>
            <Upload.ItemAction action="download" />
            <Upload.ItemAction label="Preview {name}" onClick={() => previewed.push(file.name)} />
            <Upload.ItemAction action="remove" />
          </Upload.Item>
        ))
      }
    </Upload.List>
  </Upload>
);

// Names the consumer-wired action was invoked with (reset per test). Widened
// because an entry states its own `name` or leaves it to the wrapped `File`, so
// reading it back off the value is `string | undefined` — every entry the
// component wraps carries one, which is what the assertions check.
const previewed: (string | undefined)[] = [];
beforeEach(() => {
  previewed.length = 0;
});

// The prototype spy below would otherwise outlive its case (no global
// restoreMocks in the vitest config).
afterEach(() => {
  vi.restoreAllMocks();
});

// Captures what the built-in download handed to the browser, without letting
// jsdom try to navigate.
const captureDownloads = (): Array<{ href: string; name: string }> => {
  const saved: Array<{ href: string; name: string }> = [];
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
    saved.push({ href: this.getAttribute('href') ?? '', name: this.getAttribute('download') ?? '' });
  });
  return saved;
};

describe('Upload (compound)', () => {
  describe('rendering', () => {
    it('renders a Trigger and a hidden file input', () => {
      const { container } = render(<Anatomy />);
      expect(screen.getByRole('button', { name: 'Choose file' })).toBeInTheDocument();
      const input = fileInput(container);
      expect(input).toHaveAttribute('type', 'file');
      expect(input).toHaveAttribute('hidden');
    });

    it('gives the Submit the same treatment as the Trigger', () => {
      render(<Anatomy value={[uf('a.txt')]} />);
      const trigger = screen.getByRole('button', { name: 'Choose file' });
      const submit = screen.getByRole('button', { name: 'Upload' });

      // Written as a pair in the zone, browse and send read as one group rather
      // than as two weights. Which treatment that is stays the design's to
      // change (the item-action rule), so this pins that the two match each
      // other — not what they match to.
      expect(submit).toHaveAttribute('data-type', trigger.getAttribute('data-type'));
      expect(submit).toHaveAttribute('data-variant', trigger.getAttribute('data-variant'));
      expect(submit).toHaveAttribute('data-size', trigger.getAttribute('data-size'));
    });

    it('groups a Trigger + Submit pair into one row', () => {
      const { container } = render(<Anatomy value={[uf('a.txt')]} />);
      const row = container.querySelector('.tk-upload-dropzone-actions');

      // The zone stacks its children, so the pair needs this box to share a line.
      expect(row).toBeInTheDocument();
      expect(row?.children).toHaveLength(2);
      expect(row?.firstElementChild).toHaveClass('tk-upload-trigger');
      expect(row?.lastElementChild).toHaveClass('tk-upload-submit');
    });

    it('leaves a Trigger standing alone in the zone ungrouped', () => {
      const { container } = render(
        <Upload>
          <Upload.Dropzone>
            <Upload.Trigger>Choose file</Upload.Trigger>
          </Upload.Dropzone>
        </Upload>,
      );
      expect(container.querySelector('.tk-upload-dropzone-actions')).toBeNull();
      expect(screen.getByRole('button', { name: 'Choose file' }).parentElement).toHaveClass('tk-upload-dropzone');
    });

    it('still pairs across a conditional that renders nothing', () => {
      // `Children.toArray` drops the `false`, so the two stay adjacent — the case
      // a raw children walk would silently stop grouping.
      const show = false;
      const { container } = render(
        <Upload value={[uf('a.txt')]}>
          <Upload.Dropzone>
            <Upload.Trigger>Choose file</Upload.Trigger>
            {show && <span>never</span>}
            <Upload.Submit>Upload</Upload.Submit>
          </Upload.Dropzone>
        </Upload>,
      );
      expect(container.querySelector('.tk-upload-dropzone-actions')?.children).toHaveLength(2);
    });

    it('lets a call site re-point the Submit off the pair', () => {
      // Defaults, not fixed values: a page whose primary action really is the
      // send says so at the call site.
      render(
        <Upload value={[uf('a.txt')]}>
          <Upload.Dropzone>
            <Upload.Trigger>Choose file</Upload.Trigger>
            <Upload.Submit appearance="filled" variant="primary">
              Upload
            </Upload.Submit>
          </Upload.Dropzone>
        </Upload>,
      );

      const submit = screen.getByRole('button', { name: 'Upload' });
      expect(submit).toHaveAttribute('data-type', 'filled');
      expect(submit).toHaveAttribute('data-variant', 'primary');
    });

    it('renders nothing in the list until there are files', () => {
      const { container } = render(<Anatomy />);
      expect(container.querySelector('.tk-upload-list')).toBeNull();
      expect(container.querySelector('.tk-upload-item')).toBeNull();
    });

    it('opens the native picker when the Trigger is clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(<Anatomy />);
      const clickSpy = vi.spyOn(fileInput(container), 'click');
      await user.click(screen.getByRole('button', { name: 'Choose file' }));
      expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    it('keeps a decorative slotProps.root onClick on both buttons', async () => {
      // Both parts set their own `onClick` after spreading rootAttrs, so a
      // consumer's analytics handler is one careless spread away from being
      // silently dropped — the exact failure the slotProps contract warns about.
      const user = userEvent.setup();
      const onTrigger = vi.fn();
      const onSubmit = vi.fn();
      render(
        <Upload value={[uf('a.txt')]}>
          <Upload.Trigger slotProps={{ root: { onClick: onTrigger } }}>Choose file</Upload.Trigger>
          <Upload.Submit slotProps={{ root: { onClick: onSubmit } }}>Upload</Upload.Submit>
        </Upload>,
      );

      await user.click(screen.getByRole('button', { name: 'Choose file' }));
      await user.click(screen.getByRole('button', { name: 'Upload' }));
      expect(onTrigger).toHaveBeenCalledTimes(1);
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('renders the Trigger and Submit through Button, keeping both class layers', () => {
      render(<Anatomy />);
      // The Button recipe class must survive alongside the Upload anatomy class
      // — losing either one silently drops the styling or the position hook.
      expect(screen.getByRole('button', { name: 'Choose file' })).toHaveClass('tk-button', 'tk-upload-trigger');
      expect(screen.getByRole('button', { name: 'Upload' })).toHaveClass('tk-button', 'tk-upload-submit');
      // Spar's Button already pins type="button" on a button element, so
      // neither part re-implements it — this guards that delegation.
      expect(screen.getByRole('button', { name: 'Choose file' })).toHaveAttribute('type', 'button');
      expect(screen.getByRole('button', { name: 'Upload' })).toHaveAttribute('type', 'button');
    });
  });

  describe('list', () => {
    it('renders the full row anatomy for a mapped file', () => {
      const { container } = render(
        <Upload value={[uf('report.pdf', { status: 'uploading', progress: 40 })]}>
          <Upload.List>
            {files =>
              files.map(file => (
                <Upload.Item key={file.id} file={file}>
                  <Upload.ItemAction action="remove" />
                </Upload.Item>
              ))
            }
          </Upload.List>
        </Upload>,
      );

      expect(container.querySelector('.tk-upload-item-name')).toHaveTextContent('report.pdf');
      expect(container.querySelector('.tk-upload-item-size')).toBeInTheDocument();
      expect(container.querySelector('.tk-upload-item-preview')).toBeInTheDocument();
      expect(container.querySelector('.tk-upload-item-progress')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Remove report.pdf' })).toBeInTheDocument();
    });

    it('keeps the default rows when a conditional child renders nothing', () => {
      // `{flag && <Rows />}` with the flag off is children that render nothing,
      // not an empty list — blanking the region there would lose the files from
      // the screen while they are still in the value.
      const { container } = render(
        <Upload value={[uf('a.txt')]}>
          <Upload.List>{false}</Upload.List>
        </Upload>,
      );

      expect(container.querySelectorAll('.tk-upload-item')).toHaveLength(1);
      expect(container.querySelector('.tk-upload-item-name')).toHaveTextContent('a.txt');
    });
  });

  describe('selection', () => {
    it('wraps a selected file into an UploadFile and renders its name and size', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const { container } = render(<Anatomy onValueChange={onValueChange} />);

      await user.upload(fileInput(container), makeFile('report.pdf', { type: 'application/pdf', size: 1024 }));

      expect(onValueChange).toHaveBeenCalledTimes(1);
      const next = onValueChange.mock.calls[0][0] as UploadFile[];
      expect(next).toHaveLength(1);
      expect(next[0].name).toBe('report.pdf');
      expect(next[0].status).toBe('idle');
      expect(next[0].file).toBeInstanceOf(File);
      expect(next[0].id).toBeTruthy();
      expect(screen.getByText('report.pdf')).toBeInTheDocument();
      expect(screen.getByText('1 kB')).toBeInTheDocument();
    });

    it('replaces the file when not multiple', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const { container } = render(<Anatomy onValueChange={onValueChange} />);
      const input = fileInput(container);

      await user.upload(input, makeFile('a.txt'));
      await user.upload(input, makeFile('b.txt'));

      const last = onValueChange.mock.calls[onValueChange.mock.calls.length - 1]?.[0] as UploadFile[];
      expect(last).toHaveLength(1);
      expect(last[0].name).toBe('b.txt');
    });

    it('appends and de-duplicates when multiple', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const { container } = render(<Anatomy multiple onValueChange={onValueChange} />);
      const input = fileInput(container);
      const a = makeFile('a.txt');
      const b = makeFile('b.txt');

      await user.upload(input, [a, b]);
      expect(onValueChange.mock.calls[onValueChange.mock.calls.length - 1]?.[0]).toHaveLength(2);

      // Re-selecting an already-held file is a no-op (dedupe by name/size/mtime).
      onValueChange.mockClear();
      await user.upload(input, a);
      expect(onValueChange).not.toHaveBeenCalled();
    });
  });

  describe('directory', () => {
    it('sets webkitdirectory on the input and implies multiple', () => {
      const { container } = render(<Anatomy directory />);
      const input = fileInput(container);
      expect(input).toHaveAttribute('webkitdirectory');
      // A folder pick is always a batch, so `multiple` comes along with it.
      expect(input).toHaveAttribute('multiple');
    });

    it('omits webkitdirectory by default', () => {
      const { container } = render(<Anatomy />);
      expect(fileInput(container)).not.toHaveAttribute('webkitdirectory');
    });

    it('keeps same-named files from different folders apart', () => {
      const onValueChange = vi.fn();
      // webkitRelativePath is read-only and unset by the File constructor, so
      // the folder pick is simulated by defining it on each file.
      const inFolder = (path: string): File => {
        const file = makeFile(path.slice(path.lastIndexOf('/') + 1));
        Object.defineProperty(file, 'webkitRelativePath', { value: path });
        return file;
      };

      render(<Anatomy directory onValueChange={onValueChange} />);
      fireEvent.drop(screen.getByTestId('dropzone'), {
        dataTransfer: {
          files: [inFolder('shots/a/logo.png'), inFolder('shots/b/logo.png')],
          items: [
            { kind: 'file', type: 'text/plain' },
            { kind: 'file', type: 'text/plain' },
          ],
          types: ['Files'],
        },
      });

      expect(onValueChange.mock.calls[0][0]).toHaveLength(2);
    });
  });

  describe('validation', () => {
    it('rejects a file larger than maxFileSize', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const onFilesReject = vi.fn();
      const { container } = render(<Anatomy maxFileSize={100} onValueChange={onValueChange} onFilesReject={onFilesReject} />);

      await user.upload(fileInput(container), makeFile('big.bin', { size: 500 }));

      expect(onValueChange).not.toHaveBeenCalled();
      expect(onFilesReject).toHaveBeenCalledTimes(1);
      // The limit travels with the rejection: the consumer writes the sentence,
      // and writing it needs the number that was exceeded.
      expect(onFilesReject.mock.calls[0][0][0]).toMatchObject({ code: 'file-too-large', maxFileSize: 100 });
    });

    it('rejects a file whose type is not accepted', () => {
      // Dropped (not picked): userEvent.upload pre-filters by the input's
      // `accept` attribute, so the drop path is what exercises our own
      // type validation.
      const onFilesReject = vi.fn();
      render(<Anatomy accept="image/*" onFilesReject={onFilesReject} />);

      fireEvent.drop(screen.getByTestId('dropzone'), {
        dataTransfer: { files: [makeFile('note.txt', { type: 'text/plain' })], items: [{ kind: 'file', type: 'text/plain' }], types: ['Files'] },
      });

      expect(onFilesReject).toHaveBeenCalledTimes(1);
      expect(onFilesReject.mock.calls[0][0][0]).toMatchObject({ code: 'file-invalid-type', accept: 'image/*' });
    });

    it('rejects files beyond maxFileCount', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const onFilesReject = vi.fn();
      const { container } = render(<Anatomy multiple maxFileCount={1} onValueChange={onValueChange} onFilesReject={onFilesReject} />);

      await user.upload(fileInput(container), [makeFile('a.txt'), makeFile('b.txt')]);

      expect(onValueChange.mock.calls[onValueChange.mock.calls.length - 1]?.[0]).toHaveLength(1);
      expect(onFilesReject.mock.calls[onFilesReject.mock.calls.length - 1]?.[0][0]).toMatchObject({ code: 'too-many-files', maxFileCount: 1 });
    });

    it('reports the single slot as the count limit without multiple', () => {
      // A non-multiple upload has no maxFileCount to report, but it does have a
      // limit — 1 — and the consumer's message needs a number either way.
      // Dropped rather than picked: the native input carries no `multiple`, so
      // the picker would hand over one file and never reach the count branch.
      const onFilesReject = vi.fn();
      render(<Anatomy onFilesReject={onFilesReject} />);

      fireEvent.drop(screen.getByTestId('dropzone'), {
        dataTransfer: {
          files: [makeFile('a.txt'), makeFile('b.txt')],
          items: [
            { kind: 'file', type: 'text/plain' },
            { kind: 'file', type: 'text/plain' },
          ],
          types: ['Files'],
        },
      });

      expect(onFilesReject.mock.calls[0][0][0]).toMatchObject({ code: 'too-many-files', maxFileCount: 1 });
    });

    it('does not spend a count slot on a file it already holds', async () => {
      // A duplicate is discarded either way; what matters is that it is
      // discarded before the count is checked. Validated first, it would take
      // the last slot on its way out and leave b.txt rejected with room to
      // spare.
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const onFilesReject = vi.fn();
      const a = makeFile('a.txt');
      const { container } = render(<Anatomy multiple maxFileCount={2} onValueChange={onValueChange} onFilesReject={onFilesReject} />);

      await user.upload(fileInput(container), a);
      await user.upload(fileInput(container), [a, makeFile('b.txt')]);

      const held = onValueChange.mock.calls[onValueChange.mock.calls.length - 1]?.[0] as UploadFile[];
      expect(held.map(entry => entry.name)).toEqual(['a.txt', 'b.txt']);
      expect(onFilesReject).not.toHaveBeenCalled();
    });

    it('re-offering the file at the limit is a no-op, not a limit breach', async () => {
      // The upload is full, but the batch is asking for nothing it does not
      // already have — reporting `too-many-files` here would put a limit error
      // on screen for a drop that changed nothing.
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const onFilesReject = vi.fn();
      const a = makeFile('a.txt');
      const { container } = render(<Anatomy multiple maxFileCount={1} onValueChange={onValueChange} onFilesReject={onFilesReject} />);

      await user.upload(fileInput(container), a);
      onValueChange.mockClear();
      await user.upload(fileInput(container), a);

      expect(onValueChange).not.toHaveBeenCalled();
      expect(onFilesReject).not.toHaveBeenCalled();
    });
  });

  describe('onFileAccept', () => {
    it('reports the entries that just landed, not the whole value', async () => {
      const user = userEvent.setup();
      const onFileAccept = vi.fn();
      const { container } = render(<Anatomy multiple onFileAccept={onFileAccept} />);
      const second = makeFile('b.txt');

      await user.upload(fileInput(container), makeFile('a.txt'));
      await user.upload(fileInput(container), second);

      // The point of the callback: starting an upload needs what arrived, and
      // `onValueChange`'s next-array would have to be diffed against the
      // previous one to work it out.
      expect(onFileAccept).toHaveBeenCalledTimes(2);
      expect((onFileAccept.mock.calls[1][0] as UploadFile[]).map(f => f.name)).toEqual(['b.txt']);

      // Re-picking a file already held adds nothing, so it announces nothing.
      await user.upload(fileInput(container), second);
      expect(onFileAccept).toHaveBeenCalledTimes(2);
    });

    it('reports only the file that replaced the value, without multiple', () => {
      // Two dropped, one slot: the second never enters the value, so naming it
      // as accepted would point the consumer at a file it does not hold.
      const onFileAccept = vi.fn();
      const onFilesReject = vi.fn();
      render(<Anatomy onFileAccept={onFileAccept} onFilesReject={onFilesReject} />);

      fireEvent.drop(screen.getByTestId('dropzone'), {
        dataTransfer: {
          files: [makeFile('a.txt'), makeFile('b.txt')],
          items: [
            { kind: 'file', type: 'text/plain' },
            { kind: 'file', type: 'text/plain' },
          ],
          types: ['Files'],
        },
      });

      expect((onFileAccept.mock.calls[0][0] as UploadFile[]).map(f => f.name)).toEqual(['a.txt']);
      expect(onFilesReject.mock.calls[0][0][0]).toMatchObject({ code: 'too-many-files' });
    });

    it('stays silent when the whole batch is rejected', async () => {
      const user = userEvent.setup();
      const onFileAccept = vi.fn();
      const { container } = render(<Anatomy maxFileSize={100} onFileAccept={onFileAccept} />);

      await user.upload(fileInput(container), makeFile('big.bin', { size: 500 }));

      expect(onFileAccept).not.toHaveBeenCalled();
    });
  });

  describe('label props', () => {
    const statusLine = (container: HTMLElement): HTMLElement => container.querySelector('.tk-upload-item-status') as HTMLElement;

    // Spread at the call sites below, so a test that is not about one string in
    // particular still localizes the whole row.
    const tr = {
      uploadingLabel: 'Yükleniyor...',
      processingLabel: 'İşleniyor...',
      completedLabel: 'Tamamlandı',
      errorLabel: 'Başarısız',
      // The templates put the file first, which is where Turkish wants it —
      // the word order English's `Download {name}` cannot produce.
      progressLabel: '{name} yükleme ilerlemesi',
      downloadLabel: '{name} dosyasını indir',
      removeLabel: '{name} dosyasını kaldır',
    };

    it('takes the row status copy from the root, so it can be localized', () => {
      const { container, rerender } = render(<Anatomy value={[uf('a.txt', { status: 'uploading' })]} {...tr} />);
      expect(statusLine(container)).toHaveTextContent('Yükleniyor...');

      rerender(<Anatomy value={[uf('a.txt', { status: 'processing' })]} {...tr} />);
      expect(statusLine(container)).toHaveTextContent('İşleniyor...');

      rerender(<Anatomy value={[uf('a.txt', { status: 'completed' })]} {...tr} />);
      expect(statusLine(container)).toHaveTextContent('Tamamlandı');

      rerender(<Anatomy value={[uf('a.txt', { status: 'error' })]} {...tr} />);
      expect(statusLine(container)).toHaveTextContent('Başarısız');
    });

    it('resolves each label on its own, so naming one does not blank the rest', () => {
      const { container } = render(<Anatomy value={[uf('a.txt', { status: 'uploading' })]} uploadingLabel="Yükleniyor..." />);
      expect(statusLine(container)).toHaveTextContent('Yükleniyor...');
      // The props left unset keep their shipped defaults rather than going undefined.
      expect(screen.getByRole('button', { name: 'Remove a.txt' })).toBeInTheDocument();
    });

    it('drops the status line, glyph included, when its copy is emptied', () => {
      // Visible copy may be silenced — but the icon goes with it. Left behind,
      // an `aria-hidden` check would mean something to sighted users and
      // nothing at all to anyone else.
      const { container } = render(<Anatomy value={[uf('a.txt', { status: 'completed' })]} completedLabel="" />);
      expect(statusLine(container)).toBeNull();
      expect(container.querySelector('.tk-upload-item-status svg')).toBeNull();
    });

    it('refuses an emptied accessible name, since an icon-only button cannot go unnamed', () => {
      // The mirror image of the rule above: there is no visible text to lose
      // here, so a blank override would leave a button announcing nothing. The
      // shipped default takes over instead.
      render(<Anatomy value={[uf('a.txt', { url: '/files/a.txt', status: 'uploading', progress: 20 })]} removeLabel="" downloadLabel="" progressLabel="" />);
      expect(screen.getByRole('button', { name: 'Remove a.txt' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Download a.txt' })).toBeInTheDocument();
      expect(screen.getByRole('progressbar', { name: 'a.txt upload progress' })).toBeInTheDocument();
    });

    it('treats an explicit undefined as no label at all', () => {
      // What a lookup into a partial translation dictionary produces. It has to
      // read as an unset prop rather than as a blanked one.
      const { container } = render(<Anatomy value={[uf('a.txt', { status: 'completed' })]} removeLabel={undefined} completedLabel={undefined} />);
      expect(screen.getByRole('button', { name: 'Remove a.txt' })).toBeInTheDocument();
      expect(statusLine(container)).toHaveTextContent('Completed');
    });

    it('keeps an entry error ahead of the failure label', () => {
      // The generic label is the fallback for a failure that reports no reason;
      // localizing it must not start overwriting the reasons that do exist.
      const { container } = render(<Anatomy value={[uf('a.txt', { status: 'error', error: 'Sunucu reddetti' })]} {...tr} />);
      expect(statusLine(container)).toHaveTextContent('Sunucu reddetti');
    });

    it('localizes the progress bar accessible name, per file', () => {
      render(<Anatomy value={[uf('a.png', { type: 'image/png', status: 'uploading', progress: 20 })]} {...tr} />);
      expect(screen.getByRole('progressbar', { name: 'a.png yükleme ilerlemesi' })).toHaveAttribute('aria-valuenow', '20');
    });

    it('localizes the built-in action names, still per file — and lets the name move', () => {
      render(<Anatomy value={[uf('a.txt', { url: '/files/a.txt' })]} {...tr} />);
      // Not `İndir a.txt`: the template decides where the file name falls, so a
      // language that puts the verb last is expressible rather than approximated.
      expect(screen.getByRole('button', { name: 'a.txt dosyasını indir' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'a.txt dosyasını kaldır' })).toBeInTheDocument();
    });

    it('uses a template with no placeholder as written', () => {
      // A name that does not vary per file is a legitimate template — it must
      // not have the file name appended to it behind the consumer's back.
      render(<Anatomy value={[uf('a.txt', { url: '/files/a.txt' })]} removeLabel="Kaldır" />);
      expect(screen.getByRole('button', { name: 'Kaldır' })).toBeInTheDocument();
    });

    it("lets an action's own label win over the root's template", () => {
      render(
        <Upload value={[uf('a.txt', { url: '/files/a.txt' })]} {...tr}>
          <Upload.List>
            {files =>
              files.map(file => (
                <Upload.Item key={file.id} file={file}>
                  <Upload.ItemAction action="download" label="{name} dosyasını kaydet" />
                </Upload.Item>
              ))
            }
          </Upload.List>
        </Upload>,
      );
      expect(screen.getByRole('button', { name: 'a.txt dosyasını kaydet' })).toBeInTheDocument();
    });

    it("falls back to the root's template when the action's own label is empty", () => {
      // An empty `label` is a missing one, not a request for a silent button —
      // the same rule the root's copy follows, one scope down.
      render(
        <Upload value={[uf('a.txt', { url: '/files/a.txt' })]} {...tr}>
          <Upload.List>
            {files =>
              files.map(file => (
                <Upload.Item key={file.id} file={file}>
                  <Upload.ItemAction action="download" label="" />
                </Upload.Item>
              ))
            }
          </Upload.List>
        </Upload>,
      );
      expect(screen.getByRole('button', { name: 'a.txt dosyasını indir' })).toBeInTheDocument();
    });
  });

  describe('controlled / uncontrolled', () => {
    it('renders items from defaultValue (uncontrolled) and removes one by id', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Anatomy defaultValue={[uf('keep.txt'), uf('drop.txt')]} multiple onValueChange={onValueChange} />);

      expect(screen.getByText('keep.txt')).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Remove drop.txt' }));

      const next = onValueChange.mock.calls[onValueChange.mock.calls.length - 1]?.[0] as UploadFile[];
      expect(next.map(f => f.name)).toEqual(['keep.txt']);
      expect(screen.queryByText('drop.txt')).not.toBeInTheDocument();
    });

    it('renders items from a controlled value', () => {
      render(<Anatomy value={[uf('fixed.txt')]} />);
      expect(screen.getByText('fixed.txt')).toBeInTheDocument();
    });
  });

  describe('per-file status', () => {
    const statusLine = (container: HTMLElement): HTMLElement => container.querySelector('.tk-upload-item-status') as HTMLElement;

    it('shows a determinate progress bar while uploading', () => {
      const { container } = render(<Anatomy value={[uf('a.png', { type: 'image/png', status: 'uploading', progress: 40 })]} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '40');
      expect(statusLine(container)).toHaveTextContent('Uploading…');
      expect(statusLine(container).querySelector('.tk-spinner')).toBeInTheDocument();
    });

    it('shows the bar at nought percent, since a started upload is not an unknown one', () => {
      // Guards the `typeof` check: reduced to a truthiness test, 0% would fall
      // back to the indeterminate spinner line and the bar would only appear
      // once the first chunk landed.
      render(<Anatomy value={[uf('a.png', { type: 'image/png', status: 'uploading', progress: 0 })]} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    });

    it('names each bar after its own file, so concurrent uploads stay distinguishable', () => {
      render(<Anatomy value={[uf('a.png', { type: 'image/png', status: 'uploading', progress: 20 }), uf('b.png', { type: 'image/png', status: 'uploading', progress: 60 })]} />);
      expect(screen.getByRole('progressbar', { name: 'a.png upload progress' })).toHaveAttribute('aria-valuenow', '20');
      expect(screen.getByRole('progressbar', { name: 'b.png upload progress' })).toHaveAttribute('aria-valuenow', '60');
    });

    it('drops the bar once the upload resolves, whatever percentage the entry keeps', () => {
      // The check / failure line is the outcome — a bar frozen at 100 (or at
      // wherever it died) would compete with it.
      const { rerender } = render(<Anatomy value={[uf('a.png', { type: 'image/png', status: 'completed', progress: 100 })]} />);
      expect(screen.queryByRole('progressbar')).toBeNull();

      rerender(<Anatomy value={[uf('a.png', { type: 'image/png', status: 'error', progress: 60, error: 'Network error' })]} />);
      expect(screen.queryByRole('progressbar')).toBeNull();
    });

    it('leaves the loading support text to carry an upload with no percentage', () => {
      const { container } = render(<Anatomy value={[uf('a.png', { type: 'image/png', status: 'uploading' })]} />);
      // The spinner line is already the indeterminate indicator, so no second
      // (looping) bar is rendered next to it.
      expect(screen.queryByRole('progressbar')).toBeNull();
      expect(statusLine(container)).toHaveTextContent('Uploading…');
    });

    it('shows the processing support text without a bar, whatever percentage the entry keeps', () => {
      // The server-side step reports that it is running, not how far along it
      // is — a bar left over from the transfer would claim a precision the
      // status does not have.
      const { container } = render(<Anatomy value={[uf('a.png', { type: 'image/png', status: 'processing', progress: 100 })]} />);
      expect(screen.queryByRole('progressbar')).toBeNull();
      expect(statusLine(container)).toHaveTextContent('Processing…');
      expect(statusLine(container).querySelector('.tk-spinner')).toBeInTheDocument();
      expect(container.querySelector('.tk-upload-item')).toHaveAttribute('data-status', 'processing');
    });

    it('marks a completed file with data-status', () => {
      const { container } = render(<Anatomy value={[uf('a.txt', { status: 'completed' })]} />);
      expect(container.querySelector('.tk-upload-item')).toHaveAttribute('data-status', 'completed');
      expect(statusLine(container)).toHaveTextContent('Completed');
    });

    it('treats an entry with no status as idle', () => {
      // A preloaded attachment is written as a literal, so the resting state is
      // the one it may leave out — and `data-status` must still name it, or a
      // recipe selecting on the attribute would miss the whole default case.
      const { container } = render(<Anatomy value={[{ id: 'a', name: 'a.txt', size: 1024, type: 'text/plain' }]} />);
      expect(container.querySelector('.tk-upload-item')).toHaveAttribute('data-status', 'idle');
      // Idle is deliberately silent: no support-text line at all.
      expect(statusLine(container)).toBeNull();
    });

    it('marks a failed file with data-status and surfaces the error as the support text', () => {
      const { container } = render(<Anatomy value={[uf('a.txt', { status: 'error', error: 'Network error' })]} />);
      expect(container.querySelector('.tk-upload-item')).toHaveAttribute('data-status', 'error');
      expect(statusLine(container)).toHaveTextContent('Network error');
      // The full message stays reachable when the line itself is clipped.
      expect(statusLine(container)).toHaveAttribute('title', 'Network error');
    });

    it('falls back to a generic failure label when the entry reports no reason', () => {
      const { container } = render(<Anatomy value={[uf('a.txt', { status: 'error' })]} />);
      expect(statusLine(container)).toHaveTextContent('Failed');
    });

    it('says nothing about a file that is merely idle', () => {
      const { container } = render(<Anatomy value={[uf('a.txt')]} />);
      expect(statusLine(container)).toBeNull();
    });
  });

  describe('item preview', () => {
    const previewRoot = (container: HTMLElement): HTMLElement => container.querySelector('.tk-upload-item-preview') as HTMLElement;

    it('previews a thumbUrl whatever the entry format is', () => {
      // The point of the field: a PDF cannot be drawn by the browser, so its
      // server-rendered page is the only way that row shows the actual file
      // instead of the generic PDF glyph.
      const entry = uf('contract.pdf', { type: 'application/pdf', url: '/files/contract.pdf', thumbUrl: '/thumbs/contract.png' });
      const { container } = render(<Anatomy value={[entry]} />);
      const preview = previewRoot(container);

      expect(preview.querySelector('img')).toHaveAttribute('src', '/thumbs/contract.png');
      // The image branch replaces the icon rather than sitting beside it.
      expect(preview.querySelector('.tk-upload-item-preview-icon')).toBeNull();
    });

    it('leaves the download pointing at the file, not at its thumbnail', async () => {
      const user = userEvent.setup();
      const saved = captureDownloads();
      const entry = uf('contract.pdf', { type: 'application/pdf', url: '/files/contract.pdf', thumbUrl: '/thumbs/contract.png' });
      render(<Anatomy value={[entry]} />);

      await user.click(screen.getByRole('button', { name: 'Download contract.pdf' }));

      expect(saved).toEqual([{ href: '/files/contract.pdf', name: 'contract.pdf' }]);
    });

    it('prefers a thumbUrl over allocating an object URL for a local image', () => {
      const createObjectURL = vi.fn(() => 'blob:unused');
      vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL: vi.fn() });

      const entry = uf('shot.png', { type: 'image/png', file: makeFile('shot.png', { type: 'image/png' }), thumbUrl: '/thumbs/shot.png' });
      const { container } = render(<Anatomy value={[entry]} />);

      expect(previewRoot(container).querySelector('img')).toHaveAttribute('src', '/thumbs/shot.png');
      expect(createObjectURL).not.toHaveBeenCalled();

      vi.unstubAllGlobals();
    });

    it('shows the shipped file-type icon for a covered format', () => {
      const { container } = render(<Anatomy value={[uf('report.pdf', { type: 'application/pdf' })]} />);
      const preview = previewRoot(container);
      expect(preview).toHaveAttribute('data-slot', 'root');
      const icon = preview.querySelector('.tk-upload-item-preview-icon') as SVGSVGElement;
      expect(icon).toBeInTheDocument();
      // Decorative: the row names the file next to it.
      expect(icon).toHaveAttribute('aria-hidden', 'true');
      expect(preview.querySelector('.tk-upload-item-preview-extension')).toBeNull();
      expect(preview.querySelector('img')).toBeNull();
    });

    it('picks the icon from the MIME type when the name has no extension', () => {
      const { container } = render(<Anatomy value={[uf('spreadsheet', { type: 'application/vnd.ms-excel' })]} />);
      expect(previewRoot(container).querySelector('.tk-upload-item-preview-icon')).toBeInTheDocument();
    });

    it('falls back to the uppercased extension for a format the icon set misses', () => {
      const { container } = render(<Anatomy value={[uf('notes.rtf', { type: 'application/rtf' })]} />);
      const preview = previewRoot(container);
      expect(preview.querySelector('.tk-upload-item-preview-extension')).toHaveTextContent('RTF');
      // Muted like the other two branches: the row names the file next to it,
      // so the badge would otherwise read as "RTF notes.rtf".
      expect(preview.querySelector('.tk-upload-item-preview-extension')).toHaveAttribute('aria-hidden', 'true');
      expect(preview.querySelector('.tk-upload-item-preview-icon')).toBeNull();
    });

    it('falls back to FILE when the name has no extension and the type is unknown', () => {
      const { container } = render(<Anatomy value={[uf('README', { type: '' })]} />);
      expect(previewRoot(container).querySelector('.tk-upload-item-preview-extension')).toHaveTextContent('FILE');
    });

    it('falls back to the file-type icon when the image fails to load', () => {
      // A dead or placeholder url would otherwise leave an empty tile — a
      // failed <img> renders nothing at all.
      const { container } = render(<Anatomy value={[uf('floor-plan.png', { type: 'image/png', url: '#' })]} />);
      const image = previewRoot(container).querySelector('img') as HTMLImageElement;
      expect(image).toBeInTheDocument();

      fireEvent.error(image);

      expect(previewRoot(container).querySelector('img')).toBeNull();
      expect(previewRoot(container).querySelector('.tk-upload-item-preview-icon')).toBeInTheDocument();
    });

    it('drops a broken thumbUrl to the entry’s next source before giving up on the image', () => {
      // The fallback picks the first source that has not failed, not the first
      // source: an expired thumb must not hide local bytes that were sitting
      // right there. The object URL is allocated only once the thumb is known
      // broken, so the working case still skips it.
      const createObjectURL = vi.fn(() => 'blob:local-bytes');
      vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL: vi.fn() });

      const entry = uf('shot.png', { type: 'image/png', file: makeFile('shot.png', { type: 'image/png' }), thumbUrl: '/thumbs/expired.png' });
      const { container } = render(<Anatomy value={[entry]} />);
      const thumb = previewRoot(container).querySelector('img') as HTMLImageElement;
      expect(thumb).toHaveAttribute('src', '/thumbs/expired.png');
      expect(createObjectURL).not.toHaveBeenCalled();

      fireEvent.error(thumb);

      const bytes = previewRoot(container).querySelector('img') as HTMLImageElement;
      expect(bytes).toHaveAttribute('src', 'blob:local-bytes');
      expect(createObjectURL).toHaveBeenCalledTimes(1);

      // Every failed source is remembered, so a second failure settles on the
      // icon instead of handing the tile back to the first.
      fireEvent.error(bytes);
      expect(previewRoot(container).querySelector('img')).toBeNull();
      expect(previewRoot(container).querySelector('.tk-upload-item-preview-icon')).toBeInTheDocument();

      vi.unstubAllGlobals();
    });

    it('keeps a consumer onError on the image slot', () => {
      const onError = vi.fn();
      const { container } = render(
        <Upload value={[uf('floor-plan.png', { type: 'image/png', url: '#' })]}>
          <Upload.List>
            {files =>
              files.map(file => (
                <Upload.Item key={file.id} file={file}>
                  <Upload.ItemPreview slotProps={{ image: { onError } }} />
                </Upload.Item>
              ))
            }
          </Upload.List>
        </Upload>,
      );

      fireEvent.error(previewRoot(container).querySelector('img') as HTMLImageElement);
      expect(onError).toHaveBeenCalledTimes(1);
    });

    it('lets slotProps override the image defaults', () => {
      // `alt` and `loading` are defaults, not invariants — a meaningful alt or
      // an eager above-the-fold row has to be reachable from the call site.
      const { container } = render(
        <Upload value={[uf('floor-plan.png', { type: 'image/png', url: '/plan.png' })]}>
          <Upload.List>
            {files =>
              files.map(file => (
                <Upload.Item key={file.id} file={file}>
                  <Upload.ItemPreview slotProps={{ image: { alt: 'Ground floor plan', loading: 'eager' } }} />
                </Upload.Item>
              ))
            }
          </Upload.List>
        </Upload>,
      );

      const image = previewRoot(container).querySelector('img') as HTMLImageElement;
      expect(image).toHaveAttribute('alt', 'Ground floor plan');
      expect(image).toHaveAttribute('loading', 'eager');
    });

    it('defaults the image to a decorative, lazily loaded thumbnail', () => {
      const { container } = render(<Anatomy value={[uf('floor-plan.png', { type: 'image/png', url: '/plan.png' })]} />);
      const image = previewRoot(container).querySelector('img') as HTMLImageElement;
      expect(image).toHaveAttribute('alt', '');
      expect(image).toHaveAttribute('loading', 'lazy');
      expect(image).toHaveAttribute('decoding', 'async');
    });

    it('skips the object URL when children replace the preview', () => {
      // The composed content is what renders, so allocating (and holding) a
      // blob URL for the file's own thumbnail is pure waste.
      const createObjectURL = vi.fn(() => 'blob:unused');
      vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL: vi.fn() });

      render(
        <Upload value={[uf('shot.png', { type: 'image/png', file: makeFile('shot.png', { type: 'image/png' }) })]}>
          <Upload.List>
            {files =>
              files.map(file => (
                <Upload.Item key={file.id} file={file}>
                  <Upload.ItemPreview>
                    <span data-testid="custom-preview">◆</span>
                  </Upload.ItemPreview>
                </Upload.Item>
              ))
            }
          </Upload.List>
        </Upload>,
      );

      expect(screen.getByTestId('custom-preview')).toBeInTheDocument();
      expect(createObjectURL).not.toHaveBeenCalled();
      vi.unstubAllGlobals();
    });

    it('prefers the real image over the file-type icon', () => {
      // A png has both a thumbnail and an icon available — the thumbnail wins,
      // since it says more about the file than its format does.
      const { container } = render(<Anatomy value={[uf('photo.png', { type: 'image/png', url: '/photo.png' })]} />);
      expect(previewRoot(container).querySelector('img')).toBeInTheDocument();
      expect(previewRoot(container).querySelector('.tk-upload-item-preview-icon')).toBeNull();
    });

    it('previews a remote image entry through its url', () => {
      const { container } = render(<Anatomy value={[uf('photo.png', { type: 'image/png', url: 'https://cdn.example/photo.png' })]} />);
      const image = previewRoot(container).querySelector('img') as HTMLImageElement;
      expect(image).toHaveAttribute('src', 'https://cdn.example/photo.png');
      expect(image).toHaveClass('tk-upload-item-preview-image');
      // Decorative: the row already renders the file name next to it.
      expect(image).toHaveAttribute('alt', '');
    });

    it('previews a local image File through an object URL and revokes it on unmount', () => {
      const createObjectURL = vi.fn(() => 'blob:preview');
      const revokeObjectURL = vi.fn();
      vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL });

      const file = makeFile('shot.png', { type: 'image/png' });
      const { container, unmount } = render(<Anatomy value={[uf('shot.png', { type: 'image/png', file })]} />);

      expect(createObjectURL).toHaveBeenCalledWith(file);
      expect(previewRoot(container).querySelector('img')).toHaveAttribute('src', 'blob:preview');

      unmount();
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:preview');
      vi.unstubAllGlobals();
    });

    it('replaces the default preview when one is composed, without landing in the actions', () => {
      const { container } = render(
        <Upload value={[uf('report.pdf', { type: 'application/pdf' })]}>
          <Upload.List>
            {files =>
              files.map(file => (
                <Upload.Item key={file.id} file={file}>
                  <Upload.ItemPreview>
                    <span data-testid="custom-preview">PDF icon</span>
                  </Upload.ItemPreview>
                  <Upload.ItemAction action="remove" />
                </Upload.Item>
              ))
            }
          </Upload.List>
        </Upload>,
      );

      // Exactly one preview: the composed one replaces the default rather than
      // rendering beside it.
      expect(container.querySelectorAll('.tk-upload-item-preview')).toHaveLength(1);
      expect(screen.getByTestId('custom-preview')).toBeInTheDocument();
      expect(previewRoot(container).querySelector('.tk-upload-item-preview-icon')).toBeNull();

      // …and it is hoisted to the thumbnail position, not left among the actions.
      const actions = container.querySelector('.tk-upload-item-actions') as HTMLElement;
      expect(actions.querySelector('.tk-upload-item-preview')).toBeNull();
      expect(previewRoot(container).parentElement).toBe(container.querySelector('.tk-upload-item'));
      expect(previewRoot(container)).toBe(container.querySelector('.tk-upload-item')?.firstElementChild);
    });

    it('lands classNames and slotProps on the preview slots', () => {
      const { container } = render(
        <Upload multiple value={[uf('report.pdf', { type: 'application/pdf' }), uf('notes.rtf', { type: 'application/rtf' })]}>
          <Upload.List>
            {files =>
              files.map(file => (
                <Upload.Item key={file.id} file={file}>
                  <Upload.ItemPreview classNames={{ root: 'custom-preview', icon: 'custom-icon', extension: 'custom-extension' }} slotProps={{ root: { title: file.name } }} />
                </Upload.Item>
              ))
            }
          </Upload.List>
        </Upload>,
      );

      const preview = previewRoot(container);
      expect(preview).toHaveClass('custom-preview');
      expect(preview).toHaveAttribute('title', 'report.pdf');
      // Both default branches take their slot layers: the icon on the mapped
      // format, the extension badge on the one the set misses.
      expect(container.querySelector('.tk-upload-item-preview-icon')).toHaveClass('custom-icon');
      expect(container.querySelector('.tk-upload-item-preview-extension')).toHaveClass('custom-extension');
    });

    it('renders as another element through `as`', () => {
      const { container } = render(
        <Upload value={[uf('report.pdf', { type: 'application/pdf' })]}>
          <Upload.List>
            {files =>
              files.map(file => (
                <Upload.Item key={file.id} file={file}>
                  <Upload.ItemPreview as="div" />
                </Upload.Item>
              ))
            }
          </Upload.List>
        </Upload>,
      );
      expect(previewRoot(container).tagName).toBe('DIV');
    });
  });

  describe('item content', () => {
    const contentRoot = (container: HTMLElement): HTMLElement => container.querySelector('.tk-upload-item-content') as HTMLElement;

    it('boxes the file details between the preview and the actions', () => {
      const { container } = render(<Anatomy value={[uf('report.pdf', { type: 'application/pdf', status: 'completed' })]} />);
      const row = container.querySelector('.tk-upload-item') as HTMLElement;
      const content = contentRoot(container);

      expect(content).toHaveAttribute('data-slot', 'root');
      // Three regions, in order: nothing the row says sits loose beside them.
      expect(Array.from(row.children).map(child => child.className.split(' ')[0])).toEqual(['tk-upload-item-preview', 'tk-upload-item-content', 'tk-upload-item-actions']);
      expect(content.querySelector('.tk-upload-item-name')).toHaveTextContent('report.pdf');
      expect(content.querySelector('.tk-upload-item-size')).toHaveTextContent('1 kB');
      expect(content.querySelector('.tk-upload-item-status')).toHaveTextContent('Completed');
    });

    it('replaces the default details when one is composed, without landing in the actions', () => {
      const { container } = render(
        <Upload value={[uf('report.pdf', { type: 'application/pdf' })]}>
          <Upload.List>
            {files =>
              files.map(file => (
                <Upload.Item key={file.id} file={file}>
                  <Upload.ItemAction action="remove" />
                  <Upload.ItemContent>
                    <span data-testid="own-content">{file.name} · attached</span>
                  </Upload.ItemContent>
                </Upload.Item>
              ))
            }
          </Upload.List>
        </Upload>,
      );

      expect(container.querySelectorAll('.tk-upload-item-content')).toHaveLength(1);
      expect(screen.getByTestId('own-content')).toBeInTheDocument();
      // The default name/size slots go with the details they replaced.
      expect(container.querySelector('.tk-upload-item-name')).toBeNull();
      expect(container.querySelector('.tk-upload-item-size')).toBeNull();
      // Hoisted into the middle region rather than left among the actions.
      expect((container.querySelector('.tk-upload-item-actions') as HTMLElement).querySelector('.tk-upload-item-content')).toBeNull();
      expect(contentRoot(container).previousElementSibling).toHaveClass('tk-upload-item-preview');
    });

    it('lands classNames and slotProps on the content slots', () => {
      const { container } = render(
        <Upload value={[uf('a.txt', { status: 'error', error: 'Network error' })]}>
          <Upload.List>
            {files =>
              files.map(file => (
                <Upload.Item key={file.id} file={file}>
                  <Upload.ItemContent
                    classNames={{ root: 'custom-content', name: 'custom-name', status: 'custom-status' }}
                    slotProps={{ size: { 'data-testid': 'size' } as HTMLAttributes<HTMLElement> }}
                  />
                </Upload.Item>
              ))
            }
          </Upload.List>
        </Upload>,
      );

      expect(contentRoot(container)).toHaveClass('custom-content');
      expect(container.querySelector('.tk-upload-item-name')).toHaveClass('custom-name');
      expect(screen.getByTestId('size')).toHaveClass('tk-upload-item-size');
      expect(container.querySelector('.tk-upload-item-status')).toHaveClass('custom-status');
    });

    it('renders as another element through `as`', () => {
      const { container } = render(
        <Upload value={[uf('a.txt')]}>
          <Upload.List>
            {files =>
              files.map(file => (
                <Upload.Item key={file.id} file={file}>
                  <Upload.ItemContent as="section" />
                </Upload.Item>
              ))
            }
          </Upload.List>
        </Upload>,
      );
      expect(contentRoot(container).tagName).toBe('SECTION');
    });
  });

  describe('item actions', () => {
    it('runs a consumer-wired action for its own row', async () => {
      // The row owns its file, so an action in a multi-file list acts on the
      // entry it was rendered for — not on the first or the last one.
      const user = userEvent.setup();
      render(<Anatomy multiple value={[uf('first.txt'), uf('second.txt')]} />);

      await user.click(screen.getByRole('button', { name: 'Preview second.txt' }));

      expect(previewed).toEqual(['second.txt']);
    });

    it('saves a preloaded entry through its url with action="download"', async () => {
      const user = userEvent.setup();
      const saved = captureDownloads();
      const createObjectURL = vi.fn(() => 'blob:unused');
      vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL: vi.fn() });
      render(<Anatomy multiple value={[uf('a.txt', { url: '/files/a.txt' }), uf('b.pdf', { url: '/files/b.pdf' })]} />);

      await user.click(screen.getByRole('button', { name: 'Download b.pdf' }));

      expect(saved).toEqual([{ href: '/files/b.pdf', name: 'b.pdf' }]);
      // The url is the authoritative copy. An entry that has one stands for
      // bytes on the server, so saving its own would write an empty file —
      // the object URL must not even be allocated.
      expect(createObjectURL).not.toHaveBeenCalled();
      // Saving is a read action: it must not touch the value.
      expect(previewed).toEqual([]);

      vi.unstubAllGlobals();
    });

    it('saves a picked File through an object URL, then releases it', async () => {
      const user = userEvent.setup();
      const saved = captureDownloads();
      const createObjectURL = vi.fn(() => 'blob:tk-upload');
      const revokeObjectURL = vi.fn();
      vi.stubGlobal('URL', Object.assign(Object.create(Object.getPrototypeOf(URL)) as typeof URL, URL, { createObjectURL, revokeObjectURL }));
      vi.useFakeTimers({ shouldAdvanceTime: true });

      const file = makeFile('local.txt');
      render(<Anatomy value={[uf('local.txt', { file })]} />);

      await user.click(screen.getByRole('button', { name: 'Download local.txt' }));

      expect(createObjectURL).toHaveBeenCalledWith(file);
      expect(saved).toEqual([{ href: 'blob:tk-upload', name: 'local.txt' }]);
      // The handle is released a beat later — revoking inline cancels the save.
      expect(revokeObjectURL).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1000);
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:tk-upload');

      vi.useRealTimers();
      vi.unstubAllGlobals();
    });

    it('leaves the download to the platform in the link form', async () => {
      // An href means the browser is already doing it; a built-in save on top
      // would download the file twice.
      const user = userEvent.setup();
      const saved = captureDownloads();
      render(
        <Upload value={[uf('a.txt', { url: '/files/a.txt' })]}>
          <Upload.List>
            {files =>
              files.map(file => (
                <Upload.Item key={file.id} file={file}>
                  <Upload.ItemAction action="download" as="a" href={file.url} download={file.name} />
                </Upload.Item>
              ))
            }
          </Upload.List>
        </Upload>,
      );

      await user.click(screen.getByRole('link', { name: 'Download a.txt' }));
      expect(saved).toEqual([]);
    });

    it('ignores an href on the button form rather than letting it disarm the save', async () => {
      // Only the link form has anywhere to put an `href`. Read as a download
      // source on a plain button it would leave the worst of both: no target on
      // the element and no built-in save behind it.
      const user = userEvent.setup();
      const saved = captureDownloads();
      render(
        <Upload value={[uf('a.txt', { url: '/files/a.txt' })]}>
          <Upload.List>
            {files =>
              files.map(file => (
                <Upload.Item key={file.id} file={file}>
                  <Upload.ItemAction
                    action="download"
                    // The button form's props do not carry `href` at all — the
                    // types turn this away, which is why the runtime guard
                    // below only ever protects a JS call site.
                    // @ts-expect-error href belongs to the `as="a"` form
                    href={file.url}
                  />
                </Upload.Item>
              ))
            }
          </Upload.List>
        </Upload>,
      );

      const action = screen.getByRole('button', { name: 'Download a.txt' });
      expect(action).not.toHaveAttribute('href');

      await user.click(action);
      expect(saved).toEqual([{ href: '/files/a.txt', name: 'a.txt' }]);
    });

    it('drops a download whose only source was an href with nowhere to land', () => {
      // Same rule from the other side: with no file and no url, an href on the
      // button form is not what makes the action real.
      render(
        <Upload value={[uf('ghost.txt')]}>
          <Upload.List>
            {files =>
              files.map(file => (
                <Upload.Item key={file.id} file={file}>
                  <Upload.ItemAction
                    action="download"
                    // Same as above: rejected by the types, so this pins the
                    // behavior a JS consumer would otherwise get silently.
                    // @ts-expect-error href belongs to the `as="a"` form
                    href="/files/ghost.txt"
                  />
                </Upload.Item>
              ))
            }
          </Upload.List>
        </Upload>,
      );

      expect(screen.queryByRole('button', { name: 'Download ghost.txt' })).toBeNull();
    });

    it('honours an action’s own disabled inside an enabled Upload', async () => {
      // The root's state is the floor, not the whole story — a retry with
      // nothing to retry yet is the call site's to freeze.
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <Upload value={[uf('a.txt')]} onValueChange={onValueChange}>
          <Upload.List>
            {files =>
              files.map(file => (
                <Upload.Item key={file.id} file={file}>
                  <Upload.ItemAction action="remove" disabled />
                </Upload.Item>
              ))
            }
          </Upload.List>
        </Upload>,
      );

      const action = screen.getByRole('button', { name: 'Remove a.txt' });
      expect(action).toBeDisabled();

      await user.click(action);
      expect(onValueChange).not.toHaveBeenCalled();
    });

    it('drops the link target of an action disabled by the call site', async () => {
      // The `as="a"` form is not blocked by the platform, so the target has to
      // go — `aria-disabled` alone still navigates.
      const user = userEvent.setup();
      const saved = captureDownloads();
      render(
        <Upload value={[uf('a.txt', { url: '/files/a.txt' })]}>
          <Upload.List>
            {files =>
              files.map(file => (
                <Upload.Item key={file.id} file={file}>
                  <Upload.ItemAction action="download" as="a" href={file.url} disabled />
                </Upload.Item>
              ))
            }
          </Upload.List>
        </Upload>,
      );

      // …and the link *semantics* go with it: an anchor with no href cannot
      // navigate, so it must not still announce itself as a link. Spar's own
      // `role="button"` stands in for a control that is now nothing but inert.
      const action = screen.getByRole('button', { name: 'Download a.txt' });
      expect(action.tagName).toBe('A');
      expect(action).not.toHaveAttribute('href');
      expect(action).toHaveAttribute('aria-disabled', 'true');
      expect(screen.queryByRole('link', { name: 'Download a.txt' })).toBeNull();

      await user.click(action);
      expect(saved).toEqual([]);
    });

    it('removes only its own row with action="remove"', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Anatomy multiple value={[uf('first.txt'), uf('second.txt')]} onValueChange={onValueChange} />);

      await user.click(screen.getByRole('button', { name: 'Remove first.txt' }));

      expect((onValueChange.mock.calls[0][0] as UploadFile[]).map(f => f.name)).toEqual(['second.txt']);
      expect(previewed).toEqual([]);
    });

    it('names each built-in action with data-action and leaves wired ones unflagged', () => {
      const { container } = render(<Anatomy value={[uf('a.txt', { url: '/files/a.txt' })]} />);
      const actions = container.querySelectorAll('.tk-upload-item-action');
      expect(actions).toHaveLength(3);
      expect(actions[0]).toHaveAttribute('data-action', 'download');
      expect(actions[1]).not.toHaveAttribute('data-action');
      expect(actions[2]).toHaveAttribute('data-action', 'remove');
    });

    it('names an action outside the wired pair and gives it no behavior of its own', async () => {
      const user = userEvent.setup();
      const saved = captureDownloads();
      const onClick = vi.fn();
      const onValueChange = vi.fn();
      const { container } = render(
        <Upload value={[uf('a.txt', { url: '/files/a.txt' })]} onValueChange={onValueChange}>
          <Upload.List>
            {files =>
              files.map(file => (
                <Upload.Item key={file.id} file={file}>
                  <Upload.ItemAction action="preview" label="Preview {name}" onClick={onClick} />
                </Upload.Item>
              ))
            }
          </Upload.List>
        </Upload>,
      );

      // Named for styling like the built-ins, but nothing else comes with the
      // name: no glyph of its own, and the click does only what onClick does.
      expect(container.querySelector('.tk-upload-item-action')).toHaveAttribute('data-action', 'preview');

      await user.click(screen.getByRole('button', { name: 'Preview a.txt' }));
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(onValueChange).not.toHaveBeenCalled();
      expect(saved).toEqual([]);
    });

    it('builds the accessible name per file from `label`, and lets aria-label win', () => {
      render(
        <Upload value={[uf('a.txt')]}>
          <Upload.List>
            {files =>
              files.map(file => (
                <Upload.Item key={file.id} file={file}>
                  <Upload.ItemAction label="Preview {name}" />
                  <Upload.ItemAction label="Share" aria-label="Send a copy" />
                </Upload.Item>
              ))
            }
          </Upload.List>
        </Upload>,
      );

      expect(screen.getByRole('button', { name: 'Preview a.txt' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Send a copy' })).toBeInTheDocument();
    });

    it('renders as a link for an already-hosted file', () => {
      render(
        <Upload value={[uf('a.txt', { url: '/files/a.txt' })]}>
          <Upload.List>
            {files =>
              files.map(file => (
                <Upload.Item key={file.id} file={file}>
                  <Upload.ItemAction as="a" href={file.url} download={file.name} label="Download {name}" />
                </Upload.Item>
              ))
            }
          </Upload.List>
        </Upload>,
      );

      const link = screen.getByRole('link', { name: 'Download a.txt' });
      expect(link).toHaveAttribute('href', '/files/a.txt');
      expect(link).toHaveAttribute('download', 'a.txt');
      // Not a button, so no `type` is invented for it.
      expect(link).not.toHaveAttribute('type');
    });

    it('strips navigation and focus from a disabled link action', () => {
      // The platform does not freeze a non-button, so disabled has to be
      // enforced on the element (coding-standards anchor rule).
      const onClick = vi.fn();
      const { container } = render(
        <Upload disabled value={[uf('a.txt', { url: '/files/a.txt' })]}>
          <Upload.List>
            {files =>
              files.map(file => (
                <Upload.Item key={file.id} file={file}>
                  <Upload.ItemAction as="a" href={file.url} label="Download {name}" onClick={onClick} />
                </Upload.Item>
              ))
            }
          </Upload.List>
        </Upload>,
      );

      const link = container.querySelector('.tk-upload-item-action') as HTMLElement;
      expect(link).not.toHaveAttribute('href');
      expect(link).toHaveAttribute('aria-disabled', 'true');
      expect(link).toHaveAttribute('tabindex', '-1');

      fireEvent.click(link);
      expect(onClick).not.toHaveBeenCalled();
    });

    it('lets a consumer handler cancel the built-in remove', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <Upload value={[uf('a.txt')]} onValueChange={onValueChange}>
          <Upload.List>
            {files =>
              files.map(file => (
                <Upload.Item key={file.id} file={file}>
                  <Upload.ItemAction action="remove" onClick={event => event.preventDefault()} />
                </Upload.Item>
              ))
            }
          </Upload.List>
        </Upload>,
      );

      await user.click(screen.getByRole('button', { name: 'Remove a.txt' }));
      expect(onValueChange).not.toHaveBeenCalled();
    });

    it('renders a complete default row per file when the List has no children', () => {
      // Batteries included: no children anywhere in the anatomy still yields the
      // preview, the name/size, and the default download + remove pair.
      const { container } = render(
        <Upload multiple value={[uf('a.txt', { url: '/files/a.txt' }), uf('b.txt', { url: '/files/b.txt' })]}>
          <Upload.List />
        </Upload>,
      );
      expect(container.querySelectorAll('.tk-upload-item')).toHaveLength(2);
      expect(container.querySelectorAll('.tk-upload-item-actions')).toHaveLength(2);
      expect(screen.getByRole('button', { name: 'Download a.txt' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Remove b.txt' })).toBeInTheDocument();
    });

    it('wraps bare action children in the default container, dropping the default pair', () => {
      const { container } = render(
        <Upload value={[uf('a.txt')]}>
          <Upload.List>
            {files =>
              files.map(file => (
                <Upload.Item key={file.id} file={file}>
                  <Upload.ItemAction action="remove" />
                </Upload.Item>
              ))
            }
          </Upload.List>
        </Upload>,
      );

      const actions = container.querySelector('.tk-upload-item-actions') as HTMLElement;
      expect(actions).toHaveAttribute('data-slot', 'root');
      // Only what was written — the container's default pair is replaced, not
      // extended, so no download action sneaks in.
      expect(actions.querySelectorAll('.tk-upload-item-action')).toHaveLength(1);
      expect(screen.queryByRole('button', { name: /Download/ })).not.toBeInTheDocument();
    });

    it('replaces the default pair with the children of a composed ItemActions', () => {
      const { container } = render(
        <Upload value={[uf('a.txt')]}>
          <Upload.List>
            {files =>
              files.map(file => (
                <Upload.Item key={file.id} file={file}>
                  <Upload.ItemActions className="own-actions" style={{ marginInlineStart: 0 }}>
                    <Upload.ItemAction label="Preview {name}" />
                  </Upload.ItemActions>
                </Upload.Item>
              ))
            }
          </Upload.List>
        </Upload>,
      );

      const actions = container.querySelector('.tk-upload-item-actions') as HTMLElement;
      expect(actions).toHaveClass('own-actions');
      expect(actions.style.marginInlineStart).toBe('0px');
      expect(actions.querySelectorAll('.tk-upload-item-action')).toHaveLength(1);
      expect(screen.getByRole('button', { name: 'Preview a.txt' })).toBeInTheDocument();
      // Exactly one container: the composed one replaced the row's default.
      expect(container.querySelectorAll('.tk-upload-item-actions')).toHaveLength(1);
    });

    it('keeps the download in the default pair but drops the remove in read-only', () => {
      render(
        <Upload readOnly value={[uf('a.txt', { url: '/files/a.txt' })]}>
          <Upload.List />
        </Upload>,
      );
      expect(screen.getByRole('button', { name: 'Download a.txt' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Remove/ })).not.toBeInTheDocument();
    });

    it('lands classNames and slotProps on the actions container', () => {
      const { container } = render(
        <Upload value={[uf('a.txt')]}>
          <Upload.List>
            {files =>
              files.map(file => (
                <Upload.Item key={file.id} file={file}>
                  <Upload.ItemActions classNames={{ root: 'custom-actions' }} slotProps={{ root: { title: 'Row actions' } }} />
                </Upload.Item>
              ))
            }
          </Upload.List>
        </Upload>,
      );

      const actions = container.querySelector('.tk-upload-item-actions') as HTMLElement;
      expect(actions).toHaveClass('custom-actions');
      expect(actions).toHaveAttribute('title', 'Row actions');
    });

    it('renders the actions through Button, keeping both class layers', () => {
      const { container } = render(<Anatomy value={[uf('a.txt', { url: '/files/a.txt' })]} />);
      const [download, , remove] = Array.from(container.querySelectorAll('.tk-upload-item-action'));

      // The Button recipe must survive alongside the Upload anatomy class, and
      // the icon-only Button anatomy is what sizes the glyph. The appearance /
      // variant knobs themselves are the design's to change, so they are not
      // pinned here — only that every action goes through Button.
      expect(download).toHaveClass('tk-button', 'tk-upload-item-action');
      expect(download).toHaveAttribute('data-icon-only', '');
      expect(download).toHaveAttribute('data-size', 'small');
      expect(download.querySelector('.tk-button-content svg')).toBeInTheDocument();
      expect(remove).toHaveClass('tk-button', 'tk-upload-item-action');
    });

    it('keeps a decorative slotProps.root onClick on an action', async () => {
      // The part sets its own onClick after spreading rootAttrs, so a
      // consumer's analytics handler is one careless spread away from silence.
      const user = userEvent.setup();
      const onAnalytics = vi.fn();
      const onValueChange = vi.fn();
      render(
        <Upload value={[uf('a.txt')]} onValueChange={onValueChange}>
          <Upload.List>
            {files =>
              files.map(file => (
                <Upload.Item key={file.id} file={file}>
                  <Upload.ItemAction action="remove" slotProps={{ root: { onClick: onAnalytics } }} />
                </Upload.Item>
              ))
            }
          </Upload.List>
        </Upload>,
      );

      await user.click(screen.getByRole('button', { name: 'Remove a.txt' }));
      expect(onAnalytics).toHaveBeenCalledTimes(1);
      expect(onValueChange).toHaveBeenCalledTimes(1);
    });

    it('lands slotProps on the action root', () => {
      const { container } = render(
        <Upload value={[uf('a.txt')]}>
          <Upload.List>
            {files =>
              files.map(file => (
                <Upload.Item key={file.id} file={file}>
                  <Upload.ItemAction action="remove" classNames={{ root: 'custom-action' }} slotProps={{ root: { title: 'Remove this file' } }} />
                </Upload.Item>
              ))
            }
          </Upload.List>
        </Upload>,
      );

      const action = container.querySelector('.tk-upload-item-action') as HTMLElement;
      expect(action).toHaveClass('custom-action');
      expect(action).toHaveAttribute('title', 'Remove this file');
      expect(action).toHaveAttribute('data-slot', 'root');
    });
  });

  describe('drag and drop', () => {
    it('commits dropped files', () => {
      const onValueChange = vi.fn();
      render(<Anatomy onValueChange={onValueChange} />);
      const file = makeFile('dropped.txt');

      fireEvent.drop(screen.getByTestId('dropzone'), {
        dataTransfer: { files: [file], items: [{ kind: 'file', type: 'text/plain' }], types: ['Files'] },
      });

      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(onValueChange.mock.calls[0][0][0].name).toBe('dropped.txt');
    });

    it('marks the dropzone accept / reject while dragging', () => {
      render(<Anatomy accept="image/*" />);
      const dropzone = screen.getByTestId('dropzone');
      const png = { dataTransfer: { items: [{ kind: 'file', type: 'image/png' }], types: ['Files'] } };
      const txt = { dataTransfer: { items: [{ kind: 'file', type: 'text/plain' }], types: ['Files'] } };

      // One payload per hover, as the platform delivers them: the state is
      // settled at `dragenter` and released at the matching `dragleave`.
      fireEvent.dragEnter(dropzone, png);
      expect(dropzone).toHaveAttribute('data-drag-state', 'accept');

      fireEvent.dragLeave(dropzone, png);
      expect(dropzone).not.toHaveAttribute('data-drag-state');

      fireEvent.dragEnter(dropzone, txt);
      expect(dropzone).toHaveAttribute('data-drag-state', 'reject');
    });

    it('settles the drag state once per hover rather than on every dragover tick', () => {
      // `dragover` fires every few frames for as long as the pointer hovers, and
      // the payload cannot change without a `dragleave` first — so the scan runs
      // at `dragenter` and the ticks after it cost nothing.
      render(<Anatomy accept="image/*" />);
      const dropzone = screen.getByTestId('dropzone');
      let scans = 0;
      // Stands in for a DataTransferItemList: the scan reads `length` first, so
      // counting that counts the scans.
      const items = {
        get length() {
          scans += 1;
          return 1;
        },
        [Symbol.iterator]: function* () {
          yield { kind: 'file', type: 'image/png' };
        },
      };
      const payload = { dataTransfer: { items, types: ['Files'] } };

      fireEvent.dragEnter(dropzone, payload);
      expect(dropzone).toHaveAttribute('data-drag-state', 'accept');
      const afterEnter = scans;

      fireEvent.dragOver(dropzone, payload);
      fireEvent.dragOver(dropzone, payload);

      expect(scans).toBe(afterEnter);
      expect(dropzone).toHaveAttribute('data-drag-state', 'accept');
    });

    it('still settles the state from a dragover with no dragenter before it', () => {
      // A drag that begins inside the zone gets no `dragenter` of its own, so
      // the first tick is what has to compute the hint.
      render(<Anatomy accept="image/*" />);
      const dropzone = screen.getByTestId('dropzone');

      fireEvent.dragOver(dropzone, { dataTransfer: { items: [{ kind: 'file', type: 'text/plain' }], types: ['Files'] } });
      expect(dropzone).toHaveAttribute('data-drag-state', 'reject');
    });

    it('releases the drag state when the control goes inert mid-drag', () => {
      // Otherwise the accept/reject border stays painted on a zone that no
      // longer takes drops, for as long as the row lives.
      const { rerender } = render(<Anatomy />);
      const dropzone = screen.getByTestId('dropzone');
      const payload = { dataTransfer: { files: [makeFile('a.txt')], items: [{ kind: 'file', type: 'text/plain' }], types: ['Files'] } };

      fireEvent.dragEnter(dropzone, payload);
      expect(dropzone).toHaveAttribute('data-drag-state', 'accept');

      rerender(<Anatomy disabled />);
      fireEvent.dragLeave(dropzone, payload);
      expect(dropzone).not.toHaveAttribute('data-drag-state');
    });

    it('lets a consumer cancel the built-in commit from onDrop', () => {
      // The same veto the Trigger and ItemAction honour — how a consumer routes
      // a drop through their own uploader instead of the component's value.
      const onValueChange = vi.fn();
      const onDrop = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
      render(
        <Upload onValueChange={onValueChange}>
          <Upload.Dropzone data-testid="dropzone" onDrop={onDrop} />
        </Upload>,
      );

      fireEvent.drop(screen.getByTestId('dropzone'), {
        dataTransfer: { files: [makeFile('routed.txt')], items: [{ kind: 'file', type: 'text/plain' }], types: ['Files'] },
      });

      expect(onDrop).toHaveBeenCalledTimes(1);
      expect(onValueChange).not.toHaveBeenCalled();
    });
  });

  describe('states', () => {
    it('disables the Trigger and input when disabled', () => {
      const { container } = render(<Anatomy disabled />);
      expect(screen.getByRole('button', { name: 'Choose file' })).toBeDisabled();
      expect(fileInput(container)).toBeDisabled();
      expect(uploadRoot(container)).toHaveAttribute('data-disabled', '');
    });

    it('keeps both item actions rendered but inert when disabled', () => {
      // `disabled` freezes the control without changing its shape — unlike
      // read-only, which drops the remove affordance altogether.
      render(<Anatomy disabled value={[uf('a.txt', { url: '/files/a.txt' })]} />);
      expect(screen.getByRole('button', { name: 'Remove a.txt' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Download a.txt' })).toBeDisabled();
    });

    it('lets a consumer freeze one action out of an otherwise live row', async () => {
      // The root's state is the floor, not the ceiling: the Trigger and Submit
      // both take an own `disabled` on top of it, and a retry with a request
      // already in flight needs the same.
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <Upload value={[uf('a.txt')]}>
          <Upload.List>
            {files =>
              files.map(file => (
                <Upload.Item key={file.id} file={file}>
                  <Upload.ItemAction action="retry" label="Retry {name}" disabled onClick={onClick} />
                </Upload.Item>
              ))
            }
          </Upload.List>
        </Upload>,
      );

      const action = screen.getByRole('button', { name: 'Retry a.txt' });
      expect(action).toBeDisabled();
      await user.click(action);
      expect(onClick).not.toHaveBeenCalled();
    });

    it('read-only hides remove but keeps download, and blocks the Trigger', () => {
      const { container } = render(<Anatomy readOnly value={[uf('a.txt', { url: '/files/a.txt' })]} />);
      expect(screen.queryByRole('button', { name: /Remove/ })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Download a.txt' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Choose file' })).toBeDisabled();
      expect(uploadRoot(container)).toHaveAttribute('data-readonly', '');
    });

    it('keeps Submit live in read-only, and takes it down when disabled', () => {
      // Read-only fixes the file list; handing a fixed list upstream does not
      // change it, so the one control that only reads the value stays usable.
      const { rerender } = render(<Anatomy readOnly value={[uf('a.txt')]} />);
      expect(screen.getByRole('button', { name: 'Upload' })).toBeEnabled();

      rerender(<Anatomy disabled value={[uf('a.txt')]} />);
      expect(screen.getByRole('button', { name: 'Upload' })).toBeDisabled();
    });

    it('drops the link target of a disabled Submit and Trigger', () => {
      // Spar's Button marks a disabled non-button but leaves its href
      // navigable, so a click — or a screen-reader activation, which
      // `tabindex="-1"` does not stop — would still leave the page.
      const { container } = render(
        <Upload disabled value={[uf('a.txt')]}>
          <Upload.Trigger as="a" href="/browse">
            Choose file
          </Upload.Trigger>
          <Upload.Submit as="a" href="/send">
            Upload
          </Upload.Submit>
        </Upload>,
      );

      const trigger = container.querySelector('a.tk-upload-trigger') as HTMLAnchorElement;
      const submit = container.querySelector('a.tk-upload-submit') as HTMLAnchorElement;
      expect(trigger).not.toHaveAttribute('href');
      expect(submit).not.toHaveAttribute('href');
      expect(submit).toHaveAttribute('aria-disabled', 'true');
    });

    it('keeps the link target of an enabled Submit', () => {
      const { container } = render(
        <Upload value={[uf('a.txt')]}>
          <Upload.Submit as="a" href="/send">
            Upload
          </Upload.Submit>
        </Upload>,
      );

      expect(container.querySelector('a.tk-upload-submit')).toHaveAttribute('href', '/send');
    });

    it('marks itself invalid from its own prop, standalone', () => {
      const { container } = render(<Anatomy invalid />);
      expect(uploadRoot(container)).toHaveAttribute('data-invalid', '');
    });

    it('inherits disabled from a surrounding Field', () => {
      const { container } = render(
        <Field disabled>
          <Anatomy />
        </Field>,
      );
      expect(screen.getByRole('button', { name: 'Choose file' })).toBeDisabled();
      expect(uploadRoot(container)).toHaveAttribute('data-disabled', '');
    });

    it('inherits readOnly from a surrounding Field', () => {
      const { container } = render(
        <Field readOnly>
          <Anatomy value={[uf('a.txt')]} />
        </Field>,
      );
      expect(uploadRoot(container)).toHaveAttribute('data-readonly', '');
      expect(screen.getByRole('button', { name: 'Choose file' })).toBeDisabled();
      expect(screen.queryByRole('button', { name: /Remove/ })).not.toBeInTheDocument();
      // Read-only must block adding by every route, not just the Trigger.
      expect(fileInput(container)).toBeDisabled();
    });

    it('reflects a surrounding invalid Field as data-invalid', () => {
      const { container } = render(
        <Field invalid>
          <Anatomy value={[uf('a.txt')]} />
        </Field>,
      );
      expect(uploadRoot(container)).toHaveAttribute('data-invalid', '');
    });

    it('lets an own prop win over the inherited Field state', () => {
      const { container } = render(
        <Field disabled readOnly invalid>
          <Anatomy disabled={false} readOnly={false} invalid={false} />
        </Field>,
      );
      const root = uploadRoot(container);
      expect(root).not.toHaveAttribute('data-disabled');
      expect(root).not.toHaveAttribute('data-readonly');
      expect(root).not.toHaveAttribute('data-invalid');
      expect(screen.getByRole('button', { name: 'Choose file' })).toBeEnabled();
    });
  });

  describe('context boundary', () => {
    it('throws when a part is used outside Upload', () => {
      expect(() => render(<Upload.Trigger>x</Upload.Trigger>)).toThrow();
      expect(() => render(<Upload.ItemAction action="remove" />)).toThrow();
    });

    it('throws when an action is used outside an Upload.Item', () => {
      // The action reads its file from the row, so a row-less action is a
      // programming error rather than a silently unbound button.
      expect(() =>
        render(
          <Upload value={[uf('a.txt')]}>
            <Upload.ItemAction action="remove" />
          </Upload>,
        ),
      ).toThrow();
    });

    it('throws when a preview is used outside an Upload.Item', () => {
      // Same contract as the action: the preview renders the row's file.
      expect(() =>
        render(
          <Upload value={[uf('a.txt')]}>
            <Upload.ItemPreview />
          </Upload>,
        ),
      ).toThrow();
    });

    it('throws when the content region is used outside an Upload.Item', () => {
      // It names and sizes the row's file, so it has no meaning without one.
      expect(() =>
        render(
          <Upload value={[uf('a.txt')]}>
            <Upload.ItemContent />
          </Upload>,
        ),
      ).toThrow();
    });
  });

  describe('accessibility', () => {
    it('takes its name and description from the surrounding Field', () => {
      const { container } = render(
        <Field>
          <Field.Label>Attachments</Field.Label>
          <Anatomy />
          <Field.Description>Text files only</Field.Description>
        </Field>,
      );
      const root = uploadRoot(container);
      expect(root).toHaveAttribute('role', 'group');
      expect(root).toHaveAccessibleName('Attachments');
      expect(root).toHaveAccessibleDescription('Text files only');
      // The Field's label points its `htmlFor` at the region rather than dangling.
      expect(root.id).not.toBe('');
      expect(container.querySelector('label')).toHaveAttribute('for', root.id);
      // …and the Trigger keeps its own name: the label must not shadow it.
      expect(screen.getByRole('button', { name: 'Choose file' })).toBeInTheDocument();
    });

    it('describes itself with the error message instead while invalid', () => {
      const { container } = render(
        <Field invalid>
          <Field.Label>Attachments</Field.Label>
          <Anatomy />
          <Field.Description>Text files only</Field.Description>
          <Field.ErrorMessage>At least one file is required</Field.ErrorMessage>
        </Field>,
      );
      expect(uploadRoot(container)).toHaveAccessibleDescription('At least one file is required');
    });

    it('keeps consumer ARIA attributes over the inherited ones', () => {
      const { container } = render(
        <Field>
          <Field.Label>Attachments</Field.Label>
          <Anatomy role="region" aria-label="Evidence" />
        </Field>,
      );
      const root = uploadRoot(container);
      expect(root).toHaveAttribute('role', 'region');
      expect(root).toHaveAccessibleName('Evidence');
    });

    it('has no a11y violations', async () => {
      const { container } = render(
        <Field>
          <Field.Label>Attachments</Field.Label>
          <Anatomy value={[uf('a.txt')]} />
          <Field.Description>Text files only</Field.Description>
        </Field>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('the value', () => {
    it('wraps a picked File without becoming one', () => {
      const file = makeFile('report.pdf', { type: 'application/pdf', size: 64 });
      const entry = createUploadFile(file);

      expect(entry.file).toBe(file);
      expect(entry.status).toBe('idle');
      expect(entry.id).toBeTruthy();
      expect(entry.name).toBe('report.pdf');
      expect(entry.size).toBe(64);
      expect(entry.type).toBe('application/pdf');
    });

    it('survives the spread a consumer patches it with', () => {
      // Why the entry is a plain object: this is how every consumer updates
      // status and progress, and it has to keep the whole row intact.
      const entry = createUploadFile(makeFile('a.png', { type: 'image/png', size: 2048 }));
      const patched = { ...entry, status: 'uploading' as const, progress: 40 };

      expect(patched).toMatchObject({ name: 'a.png', size: 2048, type: 'image/png', status: 'uploading', progress: 40 });
      expect(patched.file).toBe(entry.file);
    });

    it('resolves size and type by one rule, entry first then the File', () => {
      // Every derived read goes through the same fallback — a row whose size
      // comes off the File must not have its icon come from somewhere else.
      const file = makeFile('scan', { type: 'application/pdf', size: 4096 });
      const { container } = render(<Anatomy value={[{ id: 'a', file, name: 'scan', status: 'idle' }]} />);

      expect(container.querySelector('.tk-upload-item-size')).toHaveTextContent('4 kB');
      expect(container.querySelector('.tk-upload-item-preview-icon')).toBeInTheDocument();
    });

    it('reads the name off the wrapped File when the entry states none', () => {
      // `name` is the third value an entry can state twice, so it falls back the
      // same way `size` and `type` do rather than being the one field a
      // hand-built entry has to restate.
      const file = makeFile('quarterly.pdf', { type: 'application/pdf', size: 2048 });
      const { container } = render(<Anatomy value={[{ id: 'a', file, status: 'idle' }]} />);

      expect(container.querySelector('.tk-upload-item-name')).toHaveTextContent('quarterly.pdf');
      expect(container.querySelector('.tk-upload-item-size')).toHaveTextContent('2 kB');
      // The resolved name reaches every read that needs it, not just the row's
      // own text: the preview matches its icon on the extension, and the
      // actions are labelled per file.
      expect(container.querySelector('.tk-upload-item-preview-icon')).toBeInTheDocument();
      expect(screen.getByLabelText('Download quarterly.pdf')).toBeInTheDocument();
    });

    it('renders a remote entry at its stated size', () => {
      const { container } = render(<Anatomy value={[uf('contract.pdf', { type: 'application/pdf', size: 1048576, url: '/files/contract.pdf' })]} />);
      expect(container.querySelector('.tk-upload-item-size')).toHaveTextContent('1 MB');
    });

    it('carries a size that rounds past its unit into the next one', () => {
      // One byte under a megabyte is 1023.999 KB, which rounds to the "1024 KB"
      // the next unit exists to say.
      const { container } = render(<Anatomy value={[uf('almost.bin', { size: 1048575 })]} />);
      expect(container.querySelector('.tk-upload-item-size')).toHaveTextContent('1 MB');
    });

    it('names and punctuates the size in the runtime locale, not in hardcoded English', () => {
      // The size is the one string on the row no label prop can reach, so it
      // is `Intl`'s to write: the unit is CLDR's name for it and the decimal
      // mark is the locale's (`1.5 MB` here, `1,5 MB` in Turkish). Asserted
      // against `Intl` rather than a literal, so the expectation travels with
      // whatever locale the suite runs in.
      const megabytes = new Intl.NumberFormat(undefined, { style: 'unit', unit: 'megabyte', unitDisplay: 'short' });
      const { container } = render(<Anatomy value={[uf('clip.mp4', { size: 1572864 })]} />);
      expect(container.querySelector('.tk-upload-item-size')).toHaveTextContent(megabytes.format(1.5));
    });

    it('leaves the size out entirely when the entry states none', () => {
      // `size` is optional and a remote entry has no bytes to read it off, so a
      // server-side attachment whose byte count the API does not return has no
      // size at all — and "0 byte" is not the absence of one, it is the claim
      // that the file is empty. The row says nothing rather than something false.
      const { container } = render(<Anatomy value={[{ id: 'a', name: 'remote.pdf', url: '/files/remote.pdf' }]} />);
      expect(container.querySelector('.tk-upload-item-size')).toBeNull();
      // The rest of the details are untouched.
      expect(container.querySelector('.tk-upload-item-name')).toHaveTextContent('remote.pdf');
    });

    it('still states a size of zero for a file that really is empty', () => {
      // The distinction the branch above turns on: `0` is a fact about this
      // file, not a missing value, so it is written out in the locale's words.
      const bytes = new Intl.NumberFormat(undefined, { style: 'unit', unit: 'byte', unitDisplay: 'short' });
      const { container } = render(<Anatomy value={[{ id: 'a', name: 'empty.log', size: 0 }]} />);
      expect(container.querySelector('.tk-upload-item-size')).toHaveTextContent(bytes.format(0));
    });

    it('drops a download action with nothing to save, rather than leaving a dead button', () => {
      // Neither local bytes nor a url: the built-in save would be a no-op, and
      // read-only already sets the precedent that a dead affordance goes away.
      render(<Anatomy value={[uf('ghost.txt')]} />);
      expect(screen.queryByRole('button', { name: 'Download ghost.txt' })).toBeNull();
      // The rest of the row is untouched.
      expect(screen.getByRole('button', { name: 'Remove ghost.txt' })).toBeInTheDocument();
    });

    it('keeps that action when the consumer wires the source themselves', async () => {
      // A late-resolved URL is a real pattern, so an onClick is enough to make
      // the action real even with nothing on the entry.
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <Upload value={[uf('ghost.txt')]}>
          <Upload.List>
            {files =>
              files.map(file => (
                <Upload.Item key={file.id} file={file}>
                  <Upload.ItemAction action="download" onClick={onClick} />
                </Upload.Item>
              ))
            }
          </Upload.List>
        </Upload>,
      );

      await user.click(screen.getByRole('button', { name: 'Download ghost.txt' }));
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });
});
