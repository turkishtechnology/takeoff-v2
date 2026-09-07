# Props and events

This is an intent map, not a v2 API reference. Read each target component skill
before editing. The scanner reports only props actually used in a consumer, so
map those first.

## Button worked example

| v1 `TkButton`                                | v2 `Button`                                               |
| -------------------------------------------- | --------------------------------------------------------- |
| `type="filled\|filledLight\|outlined\|text"` | `appearance`                                              |
| `variant`                                    | `variant`; `purple` is removed                            |
| `label`                                      | `children`                                                |
| `icon` + `iconPosition`                      | `startContent` / `endContent` with `@takeoff-icons/react` |
| `mode="link"` + `href`/`target`              | `as="a"` plus native `href`/`target`                      |
| `mode="submit\|reset"`                       | native `type`                                             |
| `onTkClick`                                  | `onClick`                                                 |
| `fullWidth`                                  | `className="w-full"`                                      |
| `animated`, `underline`, `containerStyle`    | drop or replace with documented styling layers            |
| `dataTestid`                                 | `data-testid`                                             |
| `disabled`, `loading`, `rounded`, `size`     | unchanged; verify exact v2 types                          |

## Common prop translations

| v1 shape                              | v2 intent                                                              |
| ------------------------------------- | ---------------------------------------------------------------------- |
| `label` / `title` string props        | children or the documented named part                                  |
| `options`, `items`, `columns`, `data` | compound children and semantic parts                                   |
| `containerStyle` / shadow selectors   | `className`, `classNames`, `slotProps`, documented data attributes     |
| `icon="name"`                         | JSX icon from `@takeoff-icons/react` in `startContent` or `endContent` |
| `dataTestid`                          | native `data-testid`                                                   |
| `TkToggle`                            | `Switch`                                                               |
| `TkToggleButton`                      | `Button pressed` / `onPressedChange`                                   |

## Event translation

V1 `onTk*` props are generated from custom DOM events. The callback receives a
`CustomEvent`, commonly handled as `event.detail.value`. V2 uses normal React
callbacks and passes the value directly. Map the intent, not the DOM event name,
and confirm the final callback in the target skill.

| v1 handler                           | v2 callback intent                                                       |
| ------------------------------------ | ------------------------------------------------------------------------ |
| `onTkActiveIndexChange`              | accordion active value callback                                          |
| `onTkAccordionItemSelected`          | accordion item selection callback                                        |
| `onTkActiveChange`                   | item open state callback                                                 |
| `onTkClick`                          | `onClick`                                                                |
| `onTkChange`                         | component-specific value callback (`onValueChange` where documented)     |
| `onTkRemove`                         | chip removal callback                                                    |
| `onTkOpen`, `onTkClose`              | open state callback or overlay lifecycle callback                        |
| `onTkApply`, `onTkCancel`            | picker action callback; gap components stay v1                           |
| `onTkBlur`, `onTkFocus`              | native `onBlur` / `onFocus`                                              |
| `onTkInputChange`                    | input value callback; datepicker is a gap                                |
| `onTkInvalid`                        | validation callback; datepicker is a gap                                 |
| `onTkVisibleChange`                  | dialog open state callback                                               |
| `onTkDrawerOpen`, `onTkDrawerClose`  | drawer open state callback                                               |
| `onTkDrawerEnter`, `onTkDrawerLeave` | drawer lifecycle callback                                                |
| `onTkDrawerChange`                   | drawer open state callback                                               |
| `onTkItemClick`                      | dropdown/tree item callback; tree is a gap                               |
| `onTkTaskClick`, `onTkTaskToggle`    | gantt callbacks; gap component stays v1                                  |
| `onTkClearClick`                     | input clear callback                                                     |
| `onTkNodeClick`                      | org chart callback; gap component stays v1                               |
| `onTkNextPage`, `onTkPrevPage`       | table pagination or app-local pagination; standalone pagination is a gap |
| `onTkPageChange`                     | table page callback                                                      |
| `onTkRowsPerPageChange`              | table page-size callback                                                 |
| `onTkSelectAll`                      | select all callback                                                      |
| `onTkStepChange`, `onTkStepClick`    | stepper value/click callbacks                                            |
| `onTkSelectionChange`                | table selection callback                                                 |
| `onTkRequest`                        | table data request callback                                              |
| `onTkExpandedRowsChange`             | table expanded rows callback                                             |
| `onTkCellEdit`                       | table cell edit callback                                                 |
| `onTkRowClick`                       | table row callback                                                       |
| `onTkGroupByChange`                  | table grouping callback                                                  |
| `onTkTabClick`, `onTkTabChange`      | tabs selection callback                                                  |
| `onTkInput`                          | input event callback; use only if the target skill exposes it            |
| `onTkToggle`                         | `onPressedChange`                                                        |
| `onTkExpandChange`                   | tree expand callback; tree is a gap                                      |
| `onTkFilesRejected`                  | upload rejection callback                                                |
| `onTkUpload`                         | upload callback                                                          |
| `onTkRemovedFile`                    | upload remove callback                                                   |
| `onTkDownloadFile`                   | upload download callback                                                 |

The recurring controlled-control conversion is always:
`onTkChange={(event) => setValue(event.detail.value)}` to the v2 control's
`value={value}` plus its documented direct-value callback.
