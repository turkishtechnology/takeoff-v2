/**
 * JSDOM never loads images, so tests drive `window.Image` by hand:
 * `MockImage.instances` holds every preload, and `load()` / `fail()` settle it.
 */
export class MockImage {
  static instances: MockImage[] = [];
  static cached = new Set<string>();

  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  crossOrigin: string | null = null;
  referrerPolicy = '';
  sizes = '';
  srcset = '';
  complete = false;
  naturalWidth = 0;
  private source = '';

  constructor() {
    MockImage.instances.push(this);
  }

  get src() {
    return this.source;
  }

  set src(value: string) {
    this.source = value;
    if (MockImage.cached.has(value)) {
      this.complete = true;
      this.naturalWidth = 40;
    }
  }

  load() {
    this.complete = true;
    this.naturalWidth = 40;
    this.onload?.();
  }

  fail() {
    this.complete = true;
    this.onerror?.();
  }

  static last() {
    return MockImage.instances[MockImage.instances.length - 1];
  }

  static install() {
    const original = window.Image;
    beforeEach(() => {
      MockImage.instances = [];
      MockImage.cached = new Set();
      (window as unknown as { Image: unknown }).Image = MockImage;
    });
    afterEach(() => {
      window.Image = original;
    });
  }
}
