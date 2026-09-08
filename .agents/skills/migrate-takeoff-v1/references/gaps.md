# Coverage gaps

These 16 v1 exports have no shipped v2 target in the current release. This is a
temporary coverage gap, not a permanent product boundary: the areas below are
expected to close incrementally in future v2 releases as their React API,
accessibility behavior, token recipes, and documentation are completed. Decide
per screen whether to keep the v1 component beside v2, build an app-local
replacement, or defer the screen. Revisit the decision when a corresponding v2
component and skill ship, and record the decision in the migration issue so
package removal remains safe.

| v1 component                   | Guidance                                                                                                 |
| ------------------------------ | -------------------------------------------------------------------------------------------------------- |
| `TkAvatar`, `TkAvatarGroup`    | Keep v1 or use an app-local image/initials composition.                                                  |
| `TkCarousel`                   | Keep v1 or adopt an app-owned carousel library with an accessibility review.                             |
| `TkChart`                      | Keep v1 or retain the existing charting library.                                                         |
| `TkColorPicker`                | Keep v1; do not substitute a plain input without preserving keyboard and format behavior.                |
| `TkCurrencyInput`              | Keep v1 or build a domain-specific controlled input with locale tests.                                   |
| `TkDatepicker`                 | Keep v1 for now. It is contracted but not shipped; calendar tokens and the root contracts are available. |
| `TkEditor`                     | Keep v1 or retain the current editor integration.                                                        |
| `TkGanttChart`, `TkOrgChart`   | Keep v1 or use the domain library already used by the application.                                       |
| `TkPagination`                 | Keep it for standalone pagination. `Table` includes built-in pagination for migrated tables.             |
| `TkPhoneInput`                 | Keep v1 or build an app-local phone field with parsing and locale tests.                                 |
| `TkRating`                     | Keep v1 or build a small app-local control with keyboard semantics.                                      |
| `TkTimeline`, `TkTimelineItem` | Keep v1 or compose app-local semantic list markup.                                                       |
| `TkTreeView`                   | Keep v1 or use an app-owned accessible tree implementation.                                              |

Raw custom-element usage and direct DOM event listeners are also blockers even
when a React wrapper has a mapping. Migrate those call sites separately.

When a gap closes, update the explicit mapping in `component-map.md` and use the
new component's `takeoff-<name>` skill as the API authority. The generated v2
coverage section only detects newly shipped components; it intentionally does
not invent a compatibility mapping.
