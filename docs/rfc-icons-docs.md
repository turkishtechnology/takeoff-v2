# RFC / Plan — takeoff-v2 docs sitesinde takeoff-icons dokümantasyonu

**Durum:** Önerildi **Yazar:** (sen) **Tarih:** 2026-06-21 **Alınan kararlar:**

- Aynı site, ikinci `plugin-content-docs` instance'ı + otomatik üretilen ikon
  galerisi & API.
- **Bağımlılık yöntemi: Seçenek A** — yayınlanmış `@takeoff-icons/*` paketleri
  (§3).
- **Galeri render: Hibrit** — grid'de SVG-string, kopyala-yapıştır örneklerinde
  gerçek React component'leri (§4.6).

---

## 1. Hedef

`takeoff-icons`'u, mevcut "Takeoff Spar" dokümantasyonuna dokunmadan
[apps/docs](../apps/docs) altındaki mevcut Docusaurus sitesinde dokümante etmek.
İkon bölümü, ikon kütüphanesinin kendi metadata'sından **otomatik üretilmeli**
(galeri grid'i + paket bazlı API); böylece bir ikon eklemek/çıkarmak hiçbir
zaman dokümanların elle düzenlenmesini gerektirmez.

Kullanıcıya yansıyan sonuç: navbar'da yeni bir **Icons** sekmesi → `/icons/...`,
kendi sidebar'ıyla (Genel Bakış, Kurulum, Galeri, framework bazlı kullanım:
react / web-component / font), aranabilir/filtrelenebilir bir ikon galerisi ve
üretilmiş kullanım + API içeriği.

---

## 2. Bu yaklaşım neden (kararın özeti)

Docusaurus'un "çoklu paket dokümantasyonu" yeteneği,
**`@docusaurus/plugin-content-docs`'un birden fazla instance'ı** demektir.
Classic preset zaten bir instance çalıştırıyor (Spar docs, id `default`). Biz
_ikinci_ bir instance ekliyoruz, id `icons`; kendi `path`, `routeBasePath` ve
`sidebarPath`'iyle. Tek build, tek deploy, tek Algolia index, Spar docs
içeriğinde sıfır değişiklik.

Bu repoya uyuyor çünkü veri zaten makine-okunabilir durumda:

- `@takeoff-icons/core`, `iconMetadata` (name, category, tags, aliases,
  variants), `categories`, `iconNames`, `searchIndex` ve yardımcı fonksiyonları
  sağlar — hepsi `icons-svg/metadata/icons.meta.yaml`'dan otomatik üretilir.
  Doğruluk kaynağı:
  [icons-core/src/metadata.ts](../../takeoff-icons/packages/icons-core/src/metadata.ts),
  [search-index.ts](../../takeoff-icons/packages/icons-core/src/search-index.ts),
  [types.ts](../../takeoff-icons/packages/icons-core/src/types.ts).
- `@takeoff-icons/react`, ikon başına bir subpath export eder
  (`@takeoff-icons/react/<icon-name>`); her variant için isimli export'larla,
  örn. `AddIconOutlinedRounded`. Her biri, `SVGProps` kabul eden bir
  `forwardRef` SVG'dir (`width`/`height` varsayılan `1em`, renk `currentColor`
  üzerinden). Yani MDX içinde canlı render etmek çok kolay.

Mevcut `gen:api` deseni (marker'lar arasında MDX'i yeniden yazan, config-tabanlı
bir prebuild script'i —
[generate-api-mdx.mjs](../apps/docs/scripts/generate-api-mdx.mjs))
`generate-icons.mjs` için taklit edeceğimiz şablondur.

---

## 3. ASIL engelleyici karar — repolar arası bağımlılık

Kod yazmadan önce çözülmesi gereken tek şey budur; çünkü `takeoff-icons` **ayrı
bir repo ve ayrı bir pnpm workspace**'tir. `takeoff-v2/pnpm-workspace.yaml`
yalnızca `apps/*` ve `packages/*`'ı glob'lar; `@takeoff-icons/*`'tan haberi
yoktur. Docs uygulaması şu an yalnızca repo-içi workspace paketlerini tüketiyor
(`@takeoff-ui/react-spar`, `@takeoff-design/*`).

`apps/docs`'un `@takeoff-icons/core`'u (build sırasında metadata için) ve
`@takeoff-icons/react`'i (canlı render için) import edebilmesi için desteklenen
bir yola ihtiyacımız var.

### Seçenek A — Yayınlanmış npm paketleri (SEÇİLDİ ✓)

`@takeoff-icons/core` ve `@takeoff-icons/react`'i, `apps/docs`'un normal
versiyonlu bağımlılıkları olarak ekle (örn. `"^0.1.1"`); icons reposunun zaten
yayın yaptığı registry'den kurulur.

- **Artıları:** Temiz repo sınırı; her diğer tüketicinin ikonları kullandığı
  şekille aynı; tekrarlanabilir build'ler; iki repo arasında yol bağımlılığı
  yok; CI'da özel bir şey gerekmez. Zaten var olan repo-ayrımına saygı duyar.
- **Eksileri:** Docs, bir version bump'a kadar ikon release'lerinin gerisinde
  kalır; CI'da registry erişimi gerekir (icons yayınlanıyorsa zaten gerekli).
- **Ne zaman en iyisi:** icons, docs build'inin erişebileceği bir registry'ye
  yayınlanıyorsa (veya yayınlanacaksa). Her iki repo da `@takeoff-icons/*@0.1.1`
  sevk ettiğine göre, beklenen kararlı durum budur.

### Seçenek B — Yerel file/link bağımlılığı

Yan yandaki checkout'a `"file:../../../takeoff-icons/packages/..."` veya pnpm
`link:` ile referans ver.

- **Artıları:** Her zaman en güncel, yayın gerekmez; yerel iterasyon için iyi.
- **Eksileri:** Her iki reponun sabit göreli yollarda yan yana checkout
  edildiğini varsayar; CI/Docker'da kırılgan ([Dockerfile](../Dockerfile)'ın
  context'inde icons reposu olması gerekir); gerçek bir bağımlılık grafiği
  değil. **Commit'lenen config için önerilmez.**

### Seçenek C — Vendored metadata snapshot'ı

Küçük bir script, `icons.meta.yaml`'ı (ya da build'lenmiş `metadata.js`'i)
`apps/docs` içine checked-in/üretilmiş bir artifact olarak kopyalar; ama canlı
render için yine de react paketi gerekir, yani bu yalnızca _metadata_ yarısını
çözer.

- **Artıları:** Build hermetik olur, docs-build zamanında icons bağımlılığı yok.
- **Eksileri:** Snapshot drift'i; canlı React render'ını çözmez; ekstra senkron
  adımı.
- **Ne zaman en iyisi:** docs build'inin ikon kurulumlarından bağımsız olmasını
  açıkça istediğinde.

> **KARAR: Seçenek A.** Yayınlanmış `@takeoff-icons/core` +
> `@takeoff-icons/react` paketlerini kullan. Yerel iterasyon hızı önemliyse, bir
> geliştirici commit'lenen config'i değiştirmeden yerelde `pnpm link` yapabilir.

---

## 4. Dosya-dosya uygulama planı

Aksi belirtilmedikçe tüm yollar `takeoff-v2/apps/docs/` altındadır.

### 4.1 Bağımlılıklar — `package.json`

- Ekle (§3 kararına göre, Seçenek A gösteriliyor):
  - `"@takeoff-icons/core": "^0.1.1"`
  - `"@takeoff-icons/react": "^0.1.1"`
- İkon metadata'sının her build'den önce güncel olması için prebuild zincirini
  genişlet:
  - `"gen:icons": "node scripts/generate-icons.mjs"`
  - `predev`/`prebuild`: mevcut `gen:api`'den sonra `&& pnpm run gen:icons`
    ekle. (Bugün: `build:tokens && build:react-spar && gen:api`.)

### 4.2 İkinci docs instance'ı — `docusaurus.config.ts`

- Preset'ten yeni bir şey import etme; classic preset'in `docs` bloğu `default`
  (Spar) instance'ı olarak kalır.
- `plugins: [...]` içine ekle:
  ```ts
  ['@docusaurus/plugin-content-docs', {
    id: 'icons',
    path: 'icons',              // yeni içerik dizini: apps/docs/icons/
    routeBasePath: 'icons',     // /icons/... altında sunulur
    sidebarPath: './sidebars.icons.ts',
    sidebarCollapsed: false,
  }],
  ```
- Bir navbar item'ı ekle:
  ```ts
  { type: 'docSidebar', sidebarId: 'iconsSidebar', docsPluginId: 'icons',
    position: 'left', label: 'Icons' },
  ```
  Mevcut "Docs" / "Changelog" item'larının yanına yerleştir.
- Algolia `contextualSearch: true` zaten açık, yani icons instance'ı kendi arama
  context'ini otomatik alır (index değişikliği gerekmez).

### 4.3 Sidebar — `sidebars.icons.ts` (yeni)

```ts
const sidebars = {
  iconsSidebar: [
    {
      type: 'category',
      label: 'Getting started',
      collapsed: false,
      items: ['intro', 'installation'],
    },
    'gallery',
    {
      type: 'category',
      label: 'Usage',
      collapsed: false,
      items: ['usage/react', 'usage/web-component', 'usage/font'],
    },
    'metadata', // categories, tags, aliases, variants referansı
  ],
};
export default sidebars;
```

### 4.4 İçerik dizini — `icons/` (yeni, `docs/`'un kardeşi)

Elle yazılmış kabuklar (küçük, kararlı):

- `icons/intro.md` — kütüphanenin ne olduğu, variant modeli (`outlined|filled` ×
  `rounded|sharp|bevel|tk`), boyut/renk kuralları.
- `icons/installation.mdx` — paket bazında: `@takeoff-icons/react`, `/wc`,
  `/font`, `/svg`, `/sprite`, `/core`. Üretilen install snippet'leri opsiyonel.
- `icons/usage/react.mdx`, `usage/web-component.mdx`, `usage/font.mdx` — canlı
  demolarla kullanım (react olanı galeri component'ini / `LiveCode`'u kullanır).

Üretilen (marker'lar arasında, `gen:icons` tarafından):

- `icons/gallery.mdx` — `<IconGallery />` browser component'ini gömer.
- `icons/metadata.mdx` — kategori tablosu, variant kapsamı, alias listesi,
  sayımlar.

### 4.5 Üretici (generator) — `scripts/generate-icons.mjs` (yeni)

`generate-api-mdx.mjs`'in yapısını/marker'larını taklit eder:

- `@takeoff-icons/core/metadata`'dan
  `{ iconMetadata, categories, iconNames }`'i,
  `@takeoff-icons/core/search-index`'ten `searchIndex`'i import et.
- İki artifact üret:
  1. Statik bir veri modülü `src/data/icons.generated.ts` (galeri component'inin
     tükettiği tam aranabilir index — name, category, tags, variants). Veriyi
     inline MDX yerine üretilmiş bir TS modülünde tutmak galeriyi hızlı, MDX'i
     küçük tutar.
  2. `icons/metadata.mdx` içine marker ile enjekte edilen bölümler (kategori
     başına sayımlar, variant kapsamı, deprecated/alias tabloları) — API
     üreticisiyle aynı `{/* icons:start ... */}` / `{/* icons:end */}`
     kuralıyla, böylece başlıklar TOC'ta kalır.
- Idempotent + prettier-formatlı, tıpkı mevcut script gibi.

### 4.6 Galeri component'i — `src/components/IconGallery/index.tsx` (yeni)

- Client component'i (ikonlar tarayıcıda render edildiği için
  `@docusaurus/BrowserOnly` veya `useIsBrowser` ile koru).
- `src/data/icons.generated.ts`'i okur; bir arama kutusu (`searchIndex` metniyle
  eşleşir), kategori filtresi ve variant toggle'ı (style + type dropdown'ları)
  render eder.
- **Render stratejisi: Hibrit (KARAR VERİLDİ).**
  - **Grid:** her hücreyi `@takeoff-icons/core` ikon verisindeki **SVG
    string**'inden render et — ikon başına React import'u yok, en hafif bundle,
    yüzlerce ikonluk bir grid için hızlı. (react paketinin kendisinin kullandığı
    `dangerouslySetInnerHTML`/`viewBox` şekliyle aynı biçimde enjekte et.)
  - **Kopyala-yapıştır örnekleri / canlı demolar:**
    `@takeoff-icons/react/<name>`'den gelen **gerçek React component'i** kullan
    (örn. `AddIconOutlinedRounded`); böylece örnekler gerçek component
    pariteliğinde ve `LiveCode`'da çalıştırılabilir olur.
- Tıkla-kopyala: import adı (`AddIconOutlinedRounded`) ve/veya
  `<Icon name="add" />` biçimi.
- Stillendirme, mevcut Tailwind plugin'i üzerinden (zaten bağlı:
  [plugins/tailwind.ts](../apps/docs/plugins/tailwind.ts)) + bir CSS modülü,
  diğer `src/components/*` ile aynı şekilde.

### 4.7 (Opsiyonel) MDX global'leri — `src/theme/MDXComponents` / Root

`<IconGallery />`'yi dosya başına import etmeden MDX içinde kullanılabilir
yapmak istersek, global olarak kaydet (repoda zaten bir `src/theme/Root.tsx`
var). Aksi halde doğrudan `gallery.mdx` içinde import et. Birçok sayfada tekrar
kullanılmadıkça açık (explicit) import tercih et.

---

## 5. Fazlama (MVP-first, ev tarzına uygun)

Her faz bağımsız olarak sevk edilebilir, gözden geçirilebilir ve tek başına bir
PR olabilir. Aşağıda her faz için **ne yapılır → hangi dosyalar → nasıl test
edilir → bitti kriteri (DoD)** ayrı ayrı verilmiştir.

### Faz 1 — Yürüyen iskelet (statik)

**Amaç:** "Icons" sekmesi gerçekten açılıyor ve ikonlar görünüyor —
çoklu-instance bağlantısı ve repolar arası bağımlılık (§3) uçtan uca kanıtlanmış
oluyor. **Henüz yok:** arama, filtre, kod üretimi (her şey elle/statik).

- **Dokunulan/oluşturulan dosyalar:**
  - `package.json` — `@takeoff-icons/core` + `@takeoff-icons/react`
    dependency'leri (§4.1).
  - `docusaurus.config.ts` — ikinci `plugin-content-docs` instance'ı + navbar
    item'ı (§4.2).
  - `sidebars.icons.ts` (yeni) — minimal sidebar (§4.3).
  - `icons/intro.md`, `icons/installation.mdx` (yeni, elle) (§4.4).
  - `icons/gallery.mdx` (yeni) — basit bir `<IconGallery />` çağrısı.
  - `src/components/IconGallery/index.tsx` (yeni) — **statik sürüm:**
    `iconMetadata`'yı doğrudan import eder, tüm ikonları sabit bir variant'ta
    (örn. `outlined/rounded`) grid'de render eder. Arama/filtre yok.
- **Nasıl test edilir:** `pnpm --filter docs dev` → `/icons` açılıyor, navbar'da
  "Icons" sekmesi var, grid tüm ikonları gösteriyor; `pnpm --filter docs build`
  hata vermeden geçiyor (`onBrokenLinks: 'throw'` dahil).
- **DoD:** Üretim build'i yeşil; Spar docs'ta hiçbir regresyon yok; `/icons`
  sayfasında ikonlar görünüyor.

### Faz 2 — İnteraktif galeri (üretim devreye girer)

**Amaç:** Galeri kullanılabilir bir araç olur (ara, filtrele, variant değiştir,
kopyala) ve ikon listesi **otomatik üretilir** — artık elle güncelleme yok.
**Faz 1'den farkı:** statik `IconGallery` yerini, üretilmiş veriyi tüketen
interaktif bir component'e bırakır.

- **Dokunulan/oluşturulan dosyalar:**
  - `scripts/generate-icons.mjs` (yeni) — `@takeoff-icons/core`'dan okur,
    `src/data/icons.generated.ts`'i üretir (§4.5, 1. artifact).
    `generate-api-mdx.mjs` desenini taklit eder: idempotent + prettier-formatlı.
  - `package.json` — `gen:icons` script'i + `predev`/`prebuild` zincirine ekleme
    (§4.1).
  - `src/data/icons.generated.ts` (üretilmiş) — name/category/tags/variants
    index'i.
  - `src/components/IconGallery/index.tsx` — interaktif hale getirilir: arama
    kutusu (`searchIndex` metniyle), kategori filtresi, variant toggle (style +
    type), tıkla-kopyala (import adı + `<Icon>` biçimi). `BrowserOnly`/
    `useIsBrowser` ile SSR-güvenli (§6).
  - `src/components/IconGallery/styles.module.css` (yeni) — grid + kontrol
    stilleri.
- **Nasıl test edilir:** Bir ikon ara → liste daralıyor; kategori seç →
  filtreleniyor; variant değiştir → tüm grid o variant'ı gösteriyor; bir ikona
  tıkla → import adı panoya kopyalanıyor. `gen:icons` çalıştırılınca
  `icons.generated.ts` deterministik (ikinci çalıştırma diff üretmiyor).
- **DoD:** Galeri tamamen üretilmiş veriden besleniyor; yeni bir ikon eklenince
  sadece `gen:icons` koşturmak yeterli (MDX elle düzenlenmiyor);
  arama/filtre/kopyala çalışıyor.

### Faz 3 — Üretilen referans + framework kullanımı

**Amaç:** İkon dokümantasyonunu "galeri"den "tam referans"a taşımak: makine
üretimli reference tabloları + her framework için kullanım rehberleri.

- **Dokunulan/oluşturulan dosyalar:**
  - `scripts/generate-icons.mjs` — genişletilir (§4.5, 2. artifact):
    `icons/metadata.mdx` içine marker arası bölümler enjekte eder — kategori
    başına sayımlar, variant kapsam tablosu, alias listesi, deprecated ikonlar.
  - `icons/metadata.mdx` (yeni, marker'lı) — üretilen reference içeriğinin kabı.
  - `icons/usage/react.mdx` (yeni) — `@takeoff-icons/react` ile canlı demolu
    kullanım (`LiveCode` + gerçek React component'leri, §4.6).
  - `icons/usage/web-component.mdx`, `icons/usage/font.mdx` (yeni) — kapsam
    §7'deki karara bağlı (hepsi mi, önce react mi).
  - `icons/installation.mdx` — kurulum snippet'leri paket listesinden
    üretilebilir (opsiyonel iyileştirme).
- **Nasıl test edilir:** `gen:icons` → `metadata.mdx` tabloları güncel; sayımlar
  gerçek ikon sayısıyla tutuyor; usage sayfalarındaki canlı demolar
  `LiveCode`'da render oluyor; tüm çapraz linkler geçerli
  (`onBrokenLinks: 'throw'` geçiyor).
- **DoD:** Reference tabloları otomatik ve doğru; en az react kullanım sayfası
  canlı demolarla tamam; build yeşil.

> **Özet akış:** Faz 1 _bağlantıyı_ kanıtlar (sekme + statik ikonlar) → Faz 2
> _otomasyonu + etkileşimi_ ekler (üretici + interaktif galeri) → Faz 3
> _derinliği_ ekler (üretilen referans + kullanım rehberleri). Faz 2 ve 3'ün
> hepsi, Faz 1'in kurduğu instance + dependency temeli üzerine biner; o yüzden
> Faz 1 olmadan diğerleri başlamaz, ama Faz 1'den sonra 2 ve 3 bağımsız ilerler.

---

## 6. Riskler / dikkat edilecekler

- **Repolar arası bağımlılık (§3)** — tek gerçek mimari karar; kod yazmadan önce
  Seçenek A'yı onayla. Aşağı akıştaki her şey mekanik.
- **Build maliyeti** — tek grid'de yüzlerce ikon: lazy / virtualize render et,
  ya da bundle'ı ve DOM'u makul tutmak için SVG-string stratejisini (§4.6)
  kullan.
- **`onBrokenLinks: 'throw'`** açık — üretilen çapraz bağlantılar geçerli
  olmalı, yoksa build başarısız olur (bu iyi; sadece üreticinin doğru olması
  gerektiği anlamına gelir).
- **SSR** — ikon grid'i tarayıcıda render edilir; hydration uyuşmazlıklarını
  önlemek için `BrowserOnly`/`useIsBrowser` ile sar.
- **Version pill / markalama** — navbar'da Spar `v0.0.1` pill'i ve "Takeoff
  Spar" başlığı görünüyor. Icons sekmesinin de icons paket versiyonunu gösterip
  göstermeyeceğine karar ver (kozmetik; engelleyici değil).
- **Design/isim-pariteliği kısıtı burada geçerli değil** (o politika Spar
  wrapper API'siyle ilgili, dokümanlarla değil), yani icons bilgi mimarisini
  doğal şekilde kurmakta serbestiz.

---

## 7. Sana açık sorular

Çözüldü:

- ~~Bağımlılık yöntemi (§3)~~ → **Seçenek A, yayınlanmış paketler.**
- ~~Galeri render stratejisi (§4.6)~~ → **Hibrit: SVG-string grid,
  React-component örnekleri.**

Hâlâ açık (Faz 1'i engellemiyor):

1. **Kullanım sayfalarının kapsamı:** react/wc/font/svg/sprite'ın hepsi mi,
   yoksa önce sadece react ile başlayıp sonra genişletmek mi?
2. **Grid'de gösterilen varsayılan variant:** önizleme için kanonik varsayılan
   hangi `style/type` çifti (örn. `outlined/rounded`)?
