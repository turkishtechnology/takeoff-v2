# Accordion API Compatibility Matrix

| takeoff-ui/core                   | takeoff-spar React                              | Status                  | Notes                                                                                                                           |
| --------------------------------- | ----------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `tk-accordion`                    | `Accordion`                                     | Compatible              | React wrapper preserves the product-facing Accordion root concept and uses Spar for behavior.                                   |
| `activeIndex`                     | `activeIndex`                                   | Compatible              | Controlled active item identity. Core supports number/string/array; React forwards number/string/array to Spar.                 |
| `allowMultiple`                   | `allowMultiple`                                 | Compatible              | Same meaning. Spar normalizes scalar activeIndex to array in multi mode.                                                        |
| `arrowPosition`                   | `arrowPosition`                                 | Compatible              | Same `left`/`right` vocabulary; React reflects it as `data-arrow-position`.                                                     |
| `expandIcon`                      | `expandIcon`                                    | React Renamed           | Same prop name, but React accepts `ReactNode`; Core accepts string/icon options for `tk-icon`.                                  |
| `collapseIcon`                    | `collapseIcon`                                  | React Renamed           | Same prop name, React payload is `ReactNode` instead of Core icon config.                                                       |
| `hideArrows`                      | `hideArrows`                                    | Compatible              | Same meaning; React omits the internal arrow span.                                                                              |
| `type="grouped" \| "divided"`     | `type="grouped" \| "divided"`                   | Compatible              | Visual grouping vocabulary is preserved.                                                                                        |
| `type="compact"`                  | `mode="compact"`                                | Deprecated              | React keeps `type="compact"` only as a warning alias for `(type="grouped", mode="compact")`.                                    |
| `mode="default" \| "compact"`     | `mode="default" \| "compact"`                   | Compatible              | Same visual density vocabulary.                                                                                                 |
| `tk-accordion-item`               | `Accordion.Item`                                | Compatible              | React exposes item as a compound part.                                                                                          |
| `itemKey`                         | `Accordion.Item itemKey`                        | Compatible              | React requires it at TypeScript level so `activeIndex` targets stable item identity.                                            |
| keyless item index fallback       | `itemKey` required                              | Intentionally Different | Core falls back to DOM index; React requires explicit `itemKey` to avoid unstable dynamic-child state.                          |
| `active` on `tk-accordion-item`   | Not exposed                                     | Intentionally Different | React keeps active state on the root via `activeIndex/defaultActiveIndex/onActiveIndexChange`.                                  |
| `header` prop                     | `Accordion.Header` + `Accordion.Trigger`        | Intentionally Different | React uses compound children instead of flat item string props.                                                                 |
| `slot="header"`                   | `Accordion.Header` + `Accordion.Trigger`        | React Renamed           | Slot mechanics become semantic compound components.                                                                             |
| `slot="content"`                  | `Accordion.Content`                             | React Renamed           | Slot mechanics become compound content.                                                                                         |
| `size` on `tk-accordion-item`     | `size` on `Accordion`                           | Intentionally Different | React cascades size from root visual context so all items share the same Takeoff recipe variant.                                |
| `icon` on `tk-accordion-item`     | Missing                                         | Missing                 | Not part of the requested Accordion P0 contract; adding item leading/trailing icon API needs a separate source-backed contract. |
| `tk-active-index-change`          | `onActiveIndexChange`                           | React Renamed           | React callback replaces Web Component custom event.                                                                             |
| `tk-accordion-item-selected`      | Not exposed                                     | Deprecated              | Core marks it deprecated; React does not expose a duplicate per-item selection event. Use `onActiveIndexChange`.                |
| `tk-active-change` on item        | Not exposed                                     | Not Applicable          | Internal item event in Core; React delegates toggle behavior to Spar.                                                           |
| `.tk-accordion`                   | `.tk-accordion`                                 | Compatible              | Root canonical class.                                                                                                           |
| `.tk-accordion-item`              | `.tk-accordion-item`                            | Compatible              | Item canonical class.                                                                                                           |
| `.header`                         | `.tk-accordion-item-header`                     | React Renamed           | takeoff-design light-DOM recipe uses the explicit canonical trigger class.                                                      |
| `.title`                          | `.tk-accordion-item-title`                      | React Renamed           | takeoff-design light-DOM recipe uses the explicit title class.                                                                  |
| Core arrow `tk-icon`              | `.tk-accordion-item-arrow`                      | React Renamed           | React keeps arrow internal but gives it a stable decorative class and `aria-hidden`.                                            |
| `.content`                        | `.tk-accordion-item-content`                    | React Renamed           | takeoff-design light-DOM recipe uses the explicit content class.                                                                |
| `.open` modifier                  | `.open` modifier + `data-open`                  | Compatible              | React emits both Core modifier class compatibility and takeoff-design data hook.                                                |
| `.grouped` / `.divided` modifiers | `.grouped` / `.divided` modifiers + `data-type` | Compatible              | React emits Core-compatible item classes and recipe data attributes.                                                            |
| `.base` / `.large` modifiers      | `.base` / `.large` modifiers + `data-size`      | Compatible              | React emits Core-compatible item classes and recipe data attributes.                                                            |
| `.compact` modifier               | `.compact` modifier + `data-mode="compact"`     | Compatible              | React emits Core-compatible item class and recipe data attribute.                                                               |
| no Core `data-open`               | `data-open`                                     | Intentionally Different | Required by takeoff-design light-DOM recipe.                                                                                    |
| no Core root `data-orientation`   | `data-orientation`                              | Not Applicable          | Spar keyboard contract exposes orientation for headless styling/testing.                                                        |
| no Core `disabled` prop           | `disabled`                                      | Intentionally Different | React/Spar supports disabled root/item behavior; wrapper should reflect it with `data-disabled`.                                |

## Migration Impact

- Web Component consumers migrate from custom events to React callbacks:
  `tk-active-index-change` becomes `onActiveIndexChange`.
- Item `header`/`content` slots migrate to compound anatomy: `Accordion.Item`,
  `Accordion.Header`, `Accordion.Trigger`, and `Accordion.Content`.
- `tk-accordion-item-selected` is intentionally not exposed because it is
  deprecated upstream and duplicates the root active-index change.
- React consumers must pass `itemKey`; index-based keyless items are not a
  stable React contract for dynamic children.
- Custom Core icon option objects do not map directly to React; pass React nodes
  to `expandIcon` and `collapseIcon`.
