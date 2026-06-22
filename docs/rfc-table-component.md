# RFC: Table Bileşeni — TanStack tabanlı, compound yüzey, props-first DX

**Durum:** Taslak / tartışmaya açık **Kapsam:** yeni `@takeoff-ui/react-spar`
`Table` bileşen ailesi **İlişkili:**
[`component-authoring-contract.md`](./component-authoring-contract.md) — **yeni
bir bileşen kategorisi** (TanStack tabanlı, Spar-wrapper değil) tanıtır; bkz.
[§9 Contract değişiklikleri](#9-contract-değişiklikleri-onay-gerektirir).
**Kavramsal olarak yerine geçer:** `takeoff-ui`'deki legacy `tk-table` web
bileşeni. Onun özellik listesini bir **envanter** olarak ele alıyoruz, bir
contract olarak değil — bkz. [§2.4](#24-legacy-tk-table-apisini-korumuyoruz).

> Bu bir tasarım önerisidir, uygulanmış bir değişiklik değil. Buradaki hiçbir
> şey onay (sign-off) olmadan yayınlanmaz; çünkü kataloğun ilk runtime engine
> bağımlılığını (TanStack Table) ve state çekirdeği bir Spar primitive'i
> **olmayan** ilk bileşeni ekliyor.

---

## 1. Özet

`takeoff-v2`'de bir Table istiyoruz. **Spar'da Table primitive'i yok** ve
Spar'ın geliştiricileri tabloları bilinçli olarak kapsam dışı tutuyor — Spar,
behavior-first (davranış öncelikli) bir kütüphane ve bellek-içi item-registry
desenini kullanıyor; bu desen veri-odaklı tablolara (harici veri,
virtualization, sunucu taraflı pagination) ölçeklenmez. Dolayısıyla bir Table,
`Select` veya `Tabs`'ın olduğu gibi "bir Spar wrapper'ı" olamaz.

Bu RFC, Table'ı **[TanStack Table](https://tanstack.com/table)**
(`@tanstack/react-table`) üzerine **headless state engine** olarak kurmayı
öneriyor; görünen her şeyin sahibi `takeoff-v2` oluyor:

- **TanStack sahiplenir** satır/sütun/veri modellerini — sıralama (sorting),
  filtreleme, seçim, expand, gruplama, pagination, sütun boyutlandırma. Test
  edilmiş reducer'lar, sıfır markup, sıfır CSS. Bir styling katmanı için doğru
  altitude (seviye).
- **`takeoff-v2` sahiplenir** markup'ı, `tk-*` class'larını, `data-*` görsel
  sözlüğünü (`data-size`, `data-striped`, `data-header-type`),
  sticky/export/edit sunumunu ve **compound yüzeyi** (`Table.Root` / `Header` /
  `Body` / `Row` / `Cell` / `Pagination` / `Toolbar`).
- **Spar (mevcut v2 wrapper'ları üzerinden) devrede kalır** tablonun _içindeki_
  interaktif widget'lar için: filtre panelleri için `Popover` (legacy z-index
  bug'ının doğru çözümü), seçim için `Checkbox`/`Radio`, sayfa başına satır için
  `Select`, sıralama/filtre tetikleyicileri için `Button`.

Public API **compound bir kaçış yoluyla (escape hatch) birlikte props-first** —
[Input](./rfc-input-api-redesign.md) için onaylanan aynı iki-katmanlı (two-tier)
felsefe. Yaygın tablolar tek bir `<Table data columns />` çağrısıdır; ileri
düzey tüketiciler tam kontrol için `Table.Header` / `Table.Body` /
`Table.Cell`'e iner.

Bileşen bir **native `<table>`** render eder (karar verildi — §6.5); Faz-3
virtualization için `Table.Body` contract'ının arkasında bir div/grid-override
render yolu rezerve edilir. Bu, çoğunlukla read-only olan Faz-1/2 yüzeyi için
ekran okuyucu tablo semantiğini ücretsiz tutar ve repo içindeki `tk-table`
emsaliyle uyumludur.

**Legacy `tk-table` API'sini korumuyoruz.** Özellik _kapsamı_ hedeftir; prop
isimleri, `column.html() → HTMLElement` render'ı, dual-mode gruplaması ve
imperative `@Method` yüzeyi değil. Legacy DX'in yanlış olduğu yerde düzeltiyoruz
(§2.3).

---

## 2. Problem & bağlam

### 2.1 Buna neden ihtiyacımız var

`takeoff-v2`'de tablo yok. Platformdaki tek tablo, yeni React katmanından
tüketilemeyen ve on yıllık birikmiş tuhaflıklar taşıyan legacy Stencil
`tk-table` web bileşeni. `takeoff-v2` üzerine inşa eden ürün ekiplerinin bir
datatable'a ihtiyacı var: sıralanabilir, sayfalanabilir, seçilebilir, özel
hücreli.

### 2.2 Neden her şey gibi "sadece Spar'ı wrap'lemiyoruz"

Diğer her `takeoff-v2` bileşeni `Pick<SparXxxProps, …>` wrapper desenini izler:
Spar davranışın sahibidir, v2 görsellerin. **Bir Table bunu yapamaz, çünkü
Spar'da Table yok** — ve bu kasıtlı, bir eksiklik değil:

- Spar primitive'leri **behavior-first**'tür; bellek-içi bir registry üzerinden
  kayıtlı, küçük ve tasarım zamanı bilinen bir öğe kümesiyle çalışır
  (`SelectItem` mount olduğunda kendini kaydeder). Bir tablonun satırları
  **harici veriden** gelir (yüz binlerce satır), **virtualization**, **sunucu
  taraflı pagination** ve item-registry deseninin asla bunun için inşa
  edilmediği **sütun/veri state koordinasyonu** gerektirir.
- TanStack Table **zaten headless** — hook'lar ve bir state şekli sunar, DOM
  yok, CSS yok. Onu bir "SparTable" primitive'i olarak yeniden uygulamak, olgun,
  test edilmiş bir engine'i tekrarlar ve Spar'ın sorumluluğunu kendi çartına
  aykırı şekilde genişletir.

Yani Table, kataloğun **state çekirdeği bir Spar primitive'i değil, üçüncü-parti
bir headless engine olan ilk bileşeni.** Bu RFC'nin ekipten onaylamasını
istediği merkezi mesele budur.

### 2.3 Legacy `tk-table`'ın yanlış yaptıkları (ve tekrarlamayacaklarımız)

Legacy bileşen, faydalı bir **özellik envanteri** ve faydalı bir **hatalar
kataloğu**. Bilinçli olarak _uzak durduğumuz_ gözlemlenmiş problemler:

| Legacy davranış                                                                                                                                | Problem                                                                                                                | Bizim yaklaşımımız                                                                                                    |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `column.html(row) → string \| HTMLElement`, sonuçlar `dataKey::field` ile anahtarlanmış bir `Map`'te memoize edilir                            | Imperative DOM enjeksiyonu; XSS yüzeyi; bir hücre yakalanmamış harici state'e bağlı olduğunda **stale-cache bug'ları** | `cell: (ctx) => ReactNode` — normal bir React render fonksiyonu. React reconcile eder; cache yok, `innerHTML` yok.    |
| Seçim üyeliği derin `lodash.isEqual` ile, kaldırma `row[dataKey]` ile                                                                          | **Tutarsız kimlik** — stabil anahtarı olmayan satırlar yanlış seçilebilir                                              | Zorunlu `getRowId`. Tek kimlik kaynağı; TanStack'in `RowSelectionState`'i buna göre anahtarlanır.                     |
| Filtre paneli `document.createElement` ile inşa edilip `document.body`'ye eklenir, `z-index: 1700`                                             | **Bilinen sticky-hücre z-index bug'ı** (iki stacking context; portal shadow DOM tarafından zorlanır)                   | Spar `Popover` (gerçek React portal). Hack'i zorlayan shadow-DOM kısıtı React'te yok.                                 |
| Gruplama dual-mode: `groupBy` prop'u (controlled) **ve** `groupByColumn()` metodu (uncontrolled), `componentWillLoad`'da bir kez karar verilir | Kafa karıştırıcı; iki doğruluk kaynağı                                                                                 | Tek controlled `grouping` state prop'u. Imperative ikizi yok.                                                         |
| 12 imperative `@Method` (`setSorting`, `clearFilters`, `serverRequest`, …)                                                                     | React'in veri akışıyla çatışan imperative kaçış yolları                                                                | Controlled state prop'ları (`value`/`onChange`) + nadir imperative ihtiyaç için opsiyonel bir `table` instance ref'i. |
| Resize dinleyicileri `.bind(this)` ile eklenir (her çağrıda yeni kimlik)                                                                       | `removeEventListener` asla çalışmaz → **listener leak**                                                                | React effect cleanup; sütun boyutlandırma state'inin sahibi TanStack.                                                 |
| Minimal a11y — yalnızca `aria-disabled`; `aria-sort` yok, `role` yok, klavye navigasyonu yok                                                   | Erişilebilirlik borcu                                                                                                  | a11y **kapatılacak bir parity gap'i, replike edilecek değil** (§3.5).                                                 |

### 2.4 Legacy `tk-table` API'sini korumuyoruz

Platformun **API-parity-değil-name-parity** politikası gereği, özellik
_kapsamını_ hak ettiği yerde tutar, gerisini bırakırız. Somut olarak:

- **`tk-*` event isimleri yok, `ITableColumn`/`ITableRequest` arayüzleri yok,
  `@Method` yüzeyi yok.** Yeni, React-idiomatik isimler (`onStateChange`,
  `TableColumnDef`, `cell`).
- **Bazı legacy özellikleri bilinçli olarak düşürüldü veya ertelendi** — inline
  hücre düzenleme, treeview/datepicker sütun filtreleri ve CSV/PDF/Excel export
  ağır, niş veya app-domain'dir (§5 bunları faza ayırır ya da bir follow-up için
  işaretler).
- Bir legacy yeteneği hayatta kaldığında bile **DX'i farklı olabilir** — örneğin
  özel hücreler HTML string değil React render prop'larıdır; density üç
  hardcoded CSS class'ı değil, `data-size` yayan bir `size` prop'udur.

---

## 3. Önerilen API

### 3.1 İki katman (tier)

```
Table (namespace)
│
├── TIER 1 — props-first kolaylık  (varsayılan yol; tek çağrı)
│   <Table
│     data={rows}
│     columns={columns}
│     getRowId={(r) => r.id}          // ZORUNLU — tek kimlik kaynağı
│     size="base"                      // data-size: 'xsmall' | 'small' | 'base'
│     headerType="basic"               // data-header-type: 'basic' | 'dark' | 'primary'
│     striped
│     selection={{ mode, value, onChange }}
│     sorting={{ multi, value, onChange }}
│     pagination={{ mode, pageSize, pageSizeOptions, … }}
│     manual={false}                   // client (otomatik) vs server (manuel) işleme
│     onStateChange={(req) => …}       // tek "veri isteği" event'i (server modu)
│     loading={isLoading}
│     emptyState={<Empty/>}
│   />
│
└── TIER 2 — compound PARÇALAR  (kaçış yolu; <Table> İÇİNDE yaşar)
    ├── <Table.Root>          useReactTable instance'ı + context'in sahibi
    ├── Table.Toolbar         başlık + aksiyonlar + global filtre slot'u
    ├── Table.Content         scroll container (sticky offset matematiğinin sahibi)
    ├── Table.Header          thead — getHeaderGroups(); aria-sort; sticky
    ├── Table.Body            tbody — getRowModel().rows; empty/loading durumları
    ├── Table.Row             tek satır; seçim/expansion state'i
    ├── Table.Cell            tek hücre; column.cell render-prop'unu render eder
    └── Table.Pagination      Spar Select (sayfa boyutu) + Button'lar
```

**Tier 1 varsayılandır.** `<Table data columns />` artı birkaç config nesnesi,
tabloların ezici çoğunluğunu tek çağrıda kapsar — montaj yok.

**Tier 2 kaçış yoludur.** Bir tüketici özel bir başlık satırı, tam istediği yere
yerleştirilmiş özel bir boş-durum (empty state) veya standart-dışı bir satır
düzeni istediğinde parçaları kompoze eder. Tier-1 formu _bu aynı parçaları
dahili olarak render eder_ — Input RFC'sindeki "prop varsayılan yoldur, parça
kaçış yoludur" kuralının ta kendisi.

```tsx
// Tier 1 — %95 senaryo
<Table data={users} columns={columns} getRowId={(u) => u.id} />

// Tier 2 — tam kontrol, altta aynı engine
<Table.Root data={users} columns={columns} getRowId={(u) => u.id}>
  <Table.Toolbar>{/* özel başlık çubuğu */}</Table.Toolbar>
  <Table.Content>
    <Table.Header sticky />
    <Table.Body>
      {(row) => <Table.Row row={row}>{/* özel hücreler */}</Table.Row>}
    </Table.Body>
  </Table.Content>
  <Table.Pagination />
</Table.Root>
```

> **Açık isimlendirme sorusu:** Tier 1, `<Table>` olarak mı mount edilir (ve
> "child yok → varsayılan kompozisyonu render et" tespitini mi yapar) yoksa ayrı
> bir `<Table.Auto>` / `<DataTable>` olarak mı? Input RFC'si namespace'li
> kardeşleri seçti (`Input.Number`). Table için, child verilmediğinde kendi
> varsayılan kompozisyonunu render eden tek bir `<Table>` öne çıkan seçenek, ama
> [§7](#7-açık-sorular)'de işaretli.

### 3.2 Sütun tanımı — v2-owned, Spar-türevli değil

Bu, [Pick<> contract](./component-authoring-contract.md#public-type-boundary)
etkileşiminin can alıcı noktası. **`Pick<>`'lenecek bir `SparTableProps` yok**,
dolayısıyla sütun ve options tipleri **v2-owned**'dır ve TanStack'in
generic'leri üzerine inşa edilir:

```ts
export interface TableColumnDef<TData> {
  id: string;
  header: ReactNode | ((ctx: HeaderContext<TData>) => ReactNode);
  accessor?: keyof TData | ((row: TData) => unknown); // dot-path veya fn
  cell?: (ctx: CellContext<TData>) => ReactNode; // React render-prop, HTML string DEĞİL
  sortable?: boolean;
  filter?: TableColumnFilter; // Faz 2
  sticky?: 'left' | 'right'; // fixed sütun
  width?: number;
  align?: 'start' | 'center' | 'end';
  meta?: Record<string, unknown>; // TanStack columnDef.meta'ya kaçış yolu
}

export interface TableOptions<TData> {
  data: TData[];
  columns: TableColumnDef<TData>[];
  getRowId: (row: TData, index: number) => string; // ZORUNLU
  manual?: boolean;
  sorting?: ControlledState<SortingState> & { multi?: boolean };
  selection?: {
    mode: 'single' | 'multiple';
  } & ControlledState<RowSelectionState>;
  pagination?: PaginationConfig;
  expansion?: ControlledState<ExpandedState> & {
    render: (row: TData) => ReactNode;
  };
  grouping?: ControlledState<GroupingState>;
  onStateChange?: (req: TableStateRequest) => void; // server-modu veri isteği
}
```

`TableColumnDef`/`TableOptions`, **dahili olarak** TanStack'in
`ColumnDef`/`TableOptions`'ının Takeoff sözlüğüne şekillendirilmiş ince
re-export'ları/iyileştirmeleridir. Niyet, `Pick<>` kuralının Spar wrapper'ları
için kurduğu sınırla aynıdır — her public alan bilinçli ve dökümante edilmiştir
— ama upstream tip **Spar değil, TanStack**'tir; dolayısıyla
`check-spar-pick.mjs` guard'ı (yalnızca `extends/& Spar*Props` işaretler)
uygulanmaz ve tetiklenmez (§9).

### 3.3 Client vs server (legacy `paginationMethod`'un yerine)

Legacy `paginationMethod: 'client' | 'server' | unset` tri-state'i, tek bir
boolean artı açık config'e dönüşür:

```tsx
// Client modu — TanStack bellek-içinde sıralar/filtreler/sayfalar
<Table data={allRows} columns={cols} getRowId={r => r.id}
       sorting={{ multi: true }} pagination={{ pageSize: 10 }} />

// Server modu — v2 HİÇBİR ŞEY işlemez; tek bir istek yayar, tüketici fetch'ler
<Table data={page.rows} columns={cols} getRowId={r => r.id}
       manual
       pagination={{ pageSize, pageIndex, rowCount: page.total }}
       sorting={{ value: sortingState, onChange: setSorting }}
       onStateChange={(req) => fetchData(req)} />
```

`manual`, doğrudan TanStack'in `manualSorting`/`manualFiltering`/
`manualPagination` flag'lerine eşlenir. `onStateChange`, legacy'nin `tk-request`
event'i + `serverRequest()` metodunun tek, debounce'lu yerine geçer.

### 3.4 Özel hücreler, doğru yöntem

```tsx
const columns: TableColumnDef<User>[] = [
  { id: 'name', header: 'Ad', accessor: 'name', sortable: true },
  { id: 'role', header: 'Rol', cell: ({ row }) => <Badge>{row.role}</Badge> },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => <RowMenu user={row} />,
    sticky: 'right',
  },
];
```

Bir `cell`, `ReactNode` döndüren bir React fonksiyonudur. `innerHTML` yok,
invalidate edilecek cache yok, `dataKey::field` map'i yok. Bu tek başına bir
legacy bug sınıfını tümüyle ortadan kaldırır.

### 3.5 Erişilebilirlik — kopyaladığımız değil, _kapattığımız_ bir gap

Legacy a11y, `aria-disabled` ve başka hiçbir şey. İlk günden itibaren sunuyoruz:

- `role="table"`/`row`/`columnheader`/`cell` (veya gerçek `<table>` render
  ediyorsak native semantik).
- Sıralanabilir başlıklarda `aria-sort`, sıralama state'iyle birlikte toggle
  edilir.
- Başlık hücrelerinde `scope="col"`.
- Klavye: başlıkta `Enter`/`Space` ile sıralama; seçim checkbox'ları gerçek,
  focuslanabilir Spar `Checkbox`'ları; pagination kontrolleri gerçek Spar
  `Button`'ları.
- Widget Spar'dan geldiğinde Spar'ın a11y'sini yeniden kullan (seçim,
  sayfa-boyutu select'i).

---

## 4. Mimari & katmanlama

```
takeoff-v2  (components/table/)
   markup · tk-* class'ları · data-* sözlüğü · sticky/export/edit sunumu · compound yüzey
        │
        ├── @tanstack/react-table   →  satır/sütun/veri STATE engine'i (headless)
        │
        └── Spar (v2 wrapper'ları üzerinden)  →  tablo İÇİNDEKİ interaktif alt-parçalar:
              Popover   (filtre paneli — legacy z-index bug'ını düzeltir)
              Checkbox/Radio (seçim + filtre UI)
              Select    (sayfa başına satır)
              Button    (sıralama/filtre tetikleyicileri, pagination)
```

**Dizin düzeni**, yerleşik wrapper anatomisini yansıtır (`base.ts` /
`context.ts` / `defaults.ts` / `types.ts` / `index.ts` + parça-başına dosyalar);
böylece Table, farklı engine'ine rağmen diğer her bileşen gibi okunur:

```
components/table/
  base.ts        # createComponentBase: alt-parça başına slot adları + tk-* class'ları
  context.ts     # createSafeContext: TanStack table instance + görsel state cascade
  defaults.ts    # DEFAULT_SIZE, DEFAULT_PAGE_SIZE, DEFAULT_HEADER_TYPE
  types.ts       # v2-owned TableOptions<TData> + TableColumnDef<TData> (Spar Pick<> YOK)
  helpers.ts     # dot-path accessor, sticky offset matematiği, (sonra) export adaptörleri
  Table.tsx               # Tier-1 root → useReactTable(options) → provider
  TableHeader.tsx  TableBody.tsx  TableRow.tsx  TableCell.tsx
  TablePagination.tsx     # Spar Select + Button kompoze eder
  TableToolbar.tsx
  index.ts       # Object.assign(Table, { Root, Header, Body, Row, Cell, Pagination, Toolbar })
```

**Görsel sözlük**, tıpkı `Select`/`Tabs` gibi `stateAttrs` → `data-*` desenini
izler: `size → data-size`, `striped → data-striped`,
`headerType → data-header-type`. Wrapper'da token import'u yok; recipe'ler
attribute'ları downstream'de tüketir.

---

## 5. Kapsam & fazlandırma (MVP-önce)

Legacy yüzeyi ~70 ayrı özellik. Hepsini bir kerede yayınlamak çok-haftalık,
yüksek-riskli, geç-feedback'li bir iştir. Fazlandırıyoruz.

| Faz         | Kapsamda                                                                                                                                                                                                                                    | Kullanılan TanStack özelliği                                                      | Üstte elle inşa edilen                                                                                                                                                                                 |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **1 — MVP** | Sütun tanımları, client/server data, multi-sort, pagination, satır seçimi (single/multi + select-all), özel hücreler, **native `<table>` markup** (§6.5), **sticky header + sol/sağ fixed sütunlar**, tam a11y, density/header-type/striped | `getSortedRowModel`, `getPaginationRowModel`, `RowSelection`, `manual*` flag'leri | native-table markup; sticky offset + scroll gölgeleri (`border-collapse: separate` + box-shadow workaround, §6.5); a11y                                                                                |
| **2**       | Sütun-başına filtreler, expandable satırlar, gruplama                                                                                                                                                                                       | `getFilteredRowModel`, `getExpandedRowModel`, `getGroupedRowModel`                | filtre **Popover** (Spar Popover — z-index fix); expand içeriği render-prop                                                                                                                            |
| **3**       | Export (CSV/PDF/Excel), inline edit, **virtualization**                                                                                                                                                                                     | `@tanstack/react-virtual`                                                         | jsPDF/exceljs adaptörleri (lazy-import); edit + ok-tuşu navigasyonu; **div/grid-override `Table.Body` render yolu** (§6.5) — native-table varsayılanını korur, windowed mod aynı contract'ın arkasında |

**Açıkça ertelendi / belki-asla:** treeview & datepicker sütun-filtre UI'ları,
PDF/Excel export engine'leri, inline düzenleme — her biri ağır veya
app-domain'dir ve bağımlılığı eklemeden önce kendi barını geçmelidir. Export
bağımlılıkları (`jsPDF`, `jspdf-autotable`, `exceljs`) **lazy/dynamic-import**
edilmelidir ki MVP bundle boyutu etkilenmesin.

Faz 1 gerçekten kullanışlı bir tablo yayınlar. Faz 2–3 ekseldir (additive) —
Faz-1 API kırılması beklenmiyor.

---

## 6. Tartılacak karşı-argümanlar

Adil bir karar, _aleyhteki_ gerekçeyi de masaya gerektirir:

- **Kataloğun ilk Spar-dışı engine'i.** Bugüne kadar her bileşen Spar'ı
  wrap'ledi. TanStack bir emsal kurar: "Spar bir primitive'den yoksunsa, v2
  üçüncü-parti bir headless engine benimseyebilir." Bu emsal, Spar'ı atlatmak
  için suistimal edilebilir (sonraki: bir charting lib'i, bir date lib'i). Bunun
  barını açıkça belirtmeliyiz (§9) — "Spar primitive'i bilinçli ve kalıcı olarak
  reddediyor" — örtük bırakmamalıyız.
- **TanStack state'i çözer, sunumu değil — zor kısımlar elle inşa edilmeye devam
  eder.** Sticky/fixed sütunlar, filtre popover'ı, export ve density styling
  hepsi bizde. TanStack bizi, yalnızca state çekirdeği bittiğinde "tablo
  neredeyse bitti" sanrısına sürükleyebilir. Faz tahminleri, görünen %50'nin
  pahalı %50 olduğunu yansıtmalı.
- **Hiç kullanılmamış bir kütüphanede, en zor bileşende öğrenme eğrisi.** Yazar
  TanStack'i kullanmadı. İnce ilk-kez hataları (`manual*` flag'leri,
  gruplama/expansion için `getSubRows`, stabil `getRowId`, row-model pipeline
  sırası) sessiz yanlış-veri bug'ları olarak yüzeye çıkma eğilimindedir. Önlem:
  Faz 1 bilinçli olarak TanStack'in çok-gidilen yoludur; egzotik modeller Faz
  2'yi bekler.
- **Yeni runtime bağımlılığı + tedarik-zinciri yüzeyi.** `@tanstack/react-table`
  (~12–15KB min+gz), wrapper paketinin Spar'ın ötesindeki ilk davranışsal
  runtime bağımlılığı olur. Repo'nun bağımlılık politikasıyla tutarlı şekilde
  pin'lenmeli ve denetlediğimiz yüzeyi genişletir.
- **Her şeyi yapmanın iki yolu (Tier 1 vs Tier 2).** Input RFC'sinin dile
  getirdiği aynı bakım-vergisi eleştirisi: prop yolu ve parça yolu davranışsal
  olarak aynı kalmalı, iki kez dökümante edilmeli, iki kez test edilmeli. Aynı
  nedenle kabul ediyoruz — taban maliyeti dramatik düşüyor — ama gerçek, sürekli
  bir maliyettir.
- **react-aria Table güvenilir bir alternatifti** ve a11y'de daha güçlü. Onu
  seçmedik çünkü collection/JSX-children-odaklı (Spar'ın kendi item-registry
  modeline daha yakın) ve bu yüzeyin ihtiyaç duyduğu zengin veri modellerini
  (multi-sort önceliği, sütun filtreleri, gruplama, manuel pagination, sütun
  boyutlandırma) **sunmuyor**. a11y desenlerini ödünç almaya değer; engine
  olarak değil.

---

## 6.5 Karar verildi: native `<table>` render et (virtualization için div kaçış yoluyla)

> **Karar (onaylandı):** Faz 1 bir **native
> `<table>`/`<thead>`/`<tbody>`/`<tr>`/`<th>`/`<td>`** render eder. ARIA grid
> rolleri + roving-tabindex, yalnızca bir hücre gerçekten interaktif olduğunda
> native elementlerin **üzerine** katmanlanır (Faz 2/3). Bir **div/grid-override
> render yolu**, aynı `Table.Body` contract'ının arkasında Faz-3 virtualization
> kaçış yolu olarak rezerve edilir — rol eklemek için native elementleri asla
> terk ederek değil.

**Neden native, `<div role="grid">` değil.** TanStack headless'tır ve hiçbirini
dayatmaz, dolayısıyla seçim bizimdir. Piyasa **tek bir** eksende bölünür — veri
hacmi ve interaktiflik, görünüm değil:

| Kütüphane               | Render eder                                                                            | Neden                                                                                   |
| ----------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| shadcn/ui, Mantine      | native `<table>`                                                                       | basitlik, ücretsiz semantik                                                             |
| **React Aria** (Adobe)  | varsayılan native `<table>`, üzerine `role="grid"`; yalnızca virtualize olunca `<div>` | "first rule of ARIA"; bu hibrit **bizim seçtiğimiz** desendir                           |
| MUI X DataGrid, AG Grid | `<div role="grid">`                                                                    | 100K+ satırın **satır/sütun virtualization'ı**; native `table-layout` windowing yapamaz |

Enterprise grid'ler **yalnızca virtualization için** div'e gitti (bir `<tr>`,
`position:absolute`'ü yok sayar; zorlarsanız paylaşılan sütun modeli +
auto-sizing bozulur) — ve bunun bedelini native tabloların hiç yaşamadığı tekrar
eden ARIA-uyumluluk bug'larıyla (MUI #8525/#8624, AG Grid #11363) öderler.
takeoff-v2 için belirleyici gerçekler:

1. **Faz 1'in ZORUNLU listesi sticky + a11y + density — virtualization _değil_**
   (o Faz 3, §5). İki faz sonra gelen bir yetenek için div vergisini (elle
   yazılmış `role=grid/row/gridcell/columnheader`, `aria-rowindex/colindex`, tam
   bir klavye modeli, manuel sütun-başına genişlik senkronu, `align-self:start`
   grid tuzağı) ödemeyiz.
2. **Erişilebilirlik birinci-sınıf bir hedef** (§3.5 a11y'yi "ilk gün" sunar;
   §2.3 legacy a11y borcunu #1 günah olarak listeler). Native `<table>` +
   `<th scope>`, ekran okuyucu tablo navigasyonunu, başlık ilişkilendirmesini ve
   satır/sütun sayımını **ücretsiz** verir, browser/AT çiftleri arasında iyi
   desteklenir. "Hücreler çoğunlukla read-only display" tablolarımızı tam tarif
   eder — statik **table** deseni, interaktif **grid** deseni değil (WAI-ARIA
   APG'ye göre).
3. **Repo-içi emsal zaten çalışıyor:** legacy `tk-table`, production'da sticky
   sol/sağ fixed sütunlarla native bir `<table>` render eder.

**Zorunlu styling-contract uyarısı.** `border-collapse: collapse` +
`position: sticky`, **doğrulanmış, hâlâ açık bir browser bug'ıdır**
(csswg-drafts #3136, WebKit 128486, Firefox 1727594/1658119/1866715): sticky
header/sütun hücreleri scroll'da border'larını kaybeder veya yanlış boyar.
Table'ın styling contract'ı, dökümante edilmiş workaround'u **mutlaka** baked-in
etmelidir — `border-collapse: separate; border-spacing: 0` ile iki-taraflı
border'lar veya `box-shadow` gölgeler (legacy zaten box-shadow varyantını
yapıyor) — artı opak sticky-hücre arka planları ve 3-katmanlı sticky z-index
sırası (body sticky-sütun < header < sol-üst köşe). Bu offset/z-index
matematiğinin sahibi `Table.Content`; reviewer'lar bunu titizlikle incelemeli.

**Bunu flip edecek tek şey** Q3'tür (§7): eğer Faz 1 — Faz 3 değil — büyük veri
setlerini **dinamik/ölçülen satır yükseklikleri veya sütun virtualization'ı**
ile virtualize etmek zorundaysa, native `table-layout` yapısal olarak
savunulamaz hale gelir ve AG Grid/MUI gibi div-first gideriz. Yani Q3 bu kararı
gate eder. Kapıyı şimdi maliyet ödemeden açık tutan önlem: `Table.Body`
contract'ını **ilk günden windowing-aware** yap ki Faz-3 div/grid-override yolu
(TanStack'in kendi "tag'leri koru, `display`'i grid/flex'e override et, sütun
genişliklerini JS'ten yeniden sür" deseni) **Faz-1 API kırılması
gerektirmesin**.

**Div'e gitmek için bir neden değil:** legacy sticky-hücre popover z-index bug'ı
([`project_table_popover_zindex`]) bir table-vs-div problemi **değil** — kök
nedeni shadow-DOM tarafından zorlanan bir `document.body` portal'ı; bu React'te
kaybolur. Gerçek bir Spar `Popover` portal'ı, tablonun markup'ından bağımsız
olarak bunu düzeltir (§2.3).

---

## 7. Açık sorular

1. **Tier-1 mount şekli** — child verilmediğinde varsayılan kompozisyonunu
   render eden `<Table>` mi, yoksa ayrı bir `<Table.Auto>` / `<DataTable>` ismi
   mi? Öne çıkan seçenek: tek `<Table>`. (§3.1)
2. **Virtualization zamanlaması** — Faz 3 mü, daha erken mi? Legacy'de yok, ama
   100K-satır çerçevesi bunun beklenir olacağını ima ediyor. Kapsama almak
   `Table.Body` contract'ını (windowed satırlar) değiştirir, dolayısıyla _sonra_
   uygulasak bile _contract'a_ şimdi karar ver. **Bu soru §6.5 markup kararını
   gate eder** — native `<table>`'ı div-first'e çevirecek tek şey, Faz 1'de
   dinamik/ölçülen-yükseklikli satırları (veya sütunları) virtualize etmektir.
3. **Export sahipliği** — export Table'a ait mi, yoksa app-domain bir konu mu —
   tablonun yalnızca `getExportRows()` sunmasıyla? Legacy bunu paketledi; sektör
   bölünmüş.
4. **`onStateChange` debounce/şekil** — tam `TableStateRequest` şekli
   (page/sort/filters) ve debounce'u tablo mu yoksa tüketici mi yapar.
5. **Sütun filtre UI'ları** — legacy'nin beşinden hangileri
   (text/checkbox/radio/ datepicker/treeview) Faz 2'de, hangileri ertelendi?
   Datepicker/treeview ağır olanlar.

---

## 8. Migrasyon & blast radius

**Mevcut bir `takeoff-v2` Table'ı yok, dolayısıyla v2 içinde migrate edilecek
tüketici yok.** "Migrasyon", şu an legacy `tk-table` web bileşeninde olan
ekipler içindir — ama bu yerinde bir yükseltme değil, **kütüphaneler-arası,
opt-in bir port'tur**; çünkü:

- Bileşen modeli farklı (Stencil web bileşeni → React).
- API bilinçli olarak korunmuyor (§2.4).

Yani _bu_ RFC'nin blast radius'u tamamen ekseldir (additive): yeni bir bileşen,
yeni bir bağımlılık, yeni bir contract kategorisi, dökümanlar ve bir changeset.
Mevcut hiçbir v2 kodu değişmez. Ayrı bir **migrasyon kılavuzu** (legacy
`tk-table` → v2 `Table`, özellik haritası + öncesi/sonrası) Faz 1 dökümanlarına
eşlik etmeli, ama bu RFC'nin kapsamı dışındadır.

---

## 9. Contract değişiklikleri (onay gerektirir)

Bu RFC'yi benimsemek
[`component-authoring-contract.md`](./component-authoring-contract.md)'yi
düzenler:

- **Yeni bileşen kategorisi — "TanStack tabanlı bileşen".** Contract bugün her
  bileşenin bir Spar primitive'ini wrap'lediğini varsayar
  ([Layer responsibilities](./component-authoring-contract.md#layer-responsibilities),
  [Upstream-first rule](./component-authoring-contract.md#upstream-first-rule)).
  Açık bir istisna ekle: bir bileşen üçüncü-parti bir headless engine
  kullanabilir **ancak ve ancak** Spar primitive'i bilinçli ve kalıcı olarak
  reddediyorsa (tablolar belirtilen örnek). Barı belirt ki bu, Spar'ı atlatmanın
  bir açığı (loophole) olmasın.
- **`Pick<>` public-type-boundary kuralı** — yalnızca **Spar-türevli** prop'lara
  uygulandığını netleştir. TanStack tabanlı bir bileşenin **`Pick<>`'lenecek bir
  Spar prop tipi yoktur**; public tipleri v2-owned'dır (engine'in generic'leri
  üzerine inşa edilir) ve `check-spar-pick.mjs` guard'ı uygulanmaz (yalnızca
  böyle bir bileşenin asla referans vermediği `extends/& Spar*Props`'u
  işaretler). Kuralın _ruhunun_ — bilinçli, yorumlu, minimal bir public sınır —
  hâlâ geçerli olduğunu, script yerine review ile zorlandığını dökümante et.
- **Upstream-first / no-adapter-hook kuralları** — karşılandığını teyit et: ağır
  formatlama/export bir wrapper hook'unun dışında kalır (lazy adaptörler, §5) ve
  TanStack davranışını fork'lamayız.
- **Imperative-method duruşu** — contract, legacy `tk-table`'ın aksine Table'ın
  state'i imperative bir `@Method` yüzeyiyle değil, controlled prop'lar +
  opsiyonel bir `table` instance ref'i ile sunduğunu belirtmeli.

---

## 10. Öneri

TanStack tabanlı yaklaşımı benimse ve **önce Faz 1'i** yayınla: TanStack'in
çok-gidilen yolunda gerçekten kullanışlı bir tablo (sort/paginate/select/
custom-cells/sticky/a11y) sunar; yazar bu sırada egzotik modellerden uzakta
öğrenme eğrisini tırmanır. Kod yazmadan önce **yeni contract kategorisini** (§9)
onayla ki ekip her PR'da "bu neden bir Spar wrapper değil" tartışmasını yeniden
açmasın. Export'u (Faz 3) ve datepicker/treeview filtrelerini, o bağımlılıkları
eklemeden önce kendi kararlarına ayır.

Markup sorusu **karara bağlandı: native `<table>`**, Faz-3 virtualization için
bir div/grid-override kaçış yoluyla (§6.5). Erkenden çözülecek tek kalan
contract-şekillendiren soru **Q3 — windowing `Table.Body` contract'ında mı** —
çünkü §6.5'i gate eder ve Faz 1'in yazdığı kodu değiştirir: virtualization'ı Faz
3'te uygulasak da `Table.Body`'yi şimdi windowing-aware yap ki div-override yolu
Faz-1 API kırılması gerektirmesin.
