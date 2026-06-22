import { useEffect, useState } from 'react';

import { DEFAULT_VARIANT, type IconGalleryEntry, type IconVariantSvg } from '@site/src/data/icons.generated';

/**
 * Lazily fetch a whole variant's SVG map. The default variant is inlined in the
 * data module; every other variant is ONE static JSON file under
 * `/icon-svg/<style>-<type>.json` (emitted by `gen:icons`) — a map of
 * `{ [iconName]: { viewBox, svg } }` — fetched once the first time the user
 * switches to that variant, then served from cache for every cell. We fetch a
 * static file rather than dynamically importing from `@takeoff-icons/core`
 * because the package's `exports` map blocks webpack's dynamic-import context
 * module. Each variant's fetch promise is memoized so concurrent cells share it.
 */
type VariantMap = Record<string, IconVariantSvg>;
const variantCache = new Map<string, Promise<VariantMap>>();

function loadVariantMap(baseUrl: string, variant: string): Promise<VariantMap> {
  const cached = variantCache.get(variant);
  if (cached) return cached;
  const fileName = `${variant.replace('/', '-')}.json`;
  const promise = fetch(`${baseUrl}${fileName}`)
    .then(res => (res.ok ? (res.json() as Promise<VariantMap>) : {}))
    .catch(() => ({}) as VariantMap);
  variantCache.set(variant, promise);
  return promise;
}

/**
 * Resolve the preview SVG for one icon entry at the given variant. Returns the
 * inlined default immediately; for other variants it returns `null` until the
 * variant's JSON map loads (or stays `null` if the icon lacks that variant).
 */
export function useVariantSvg(entry: IconGalleryEntry, variant: string, svgBaseUrl: string): IconVariantSvg | null {
  const isDefault = variant === DEFAULT_VARIANT;
  const [svg, setSvg] = useState<IconVariantSvg | null>(isDefault ? entry.defaultSvg : null);

  useEffect(() => {
    if (isDefault) {
      setSvg(entry.defaultSvg);
      return;
    }
    if (!entry.variants.includes(variant)) {
      setSvg(null);
      return;
    }
    let active = true;
    void loadVariantMap(svgBaseUrl, variant).then(map => {
      if (active) setSvg(map[entry.name] ?? null);
    });
    return () => {
      active = false;
    };
  }, [entry, variant, isDefault, svgBaseUrl]);

  return svg;
}
