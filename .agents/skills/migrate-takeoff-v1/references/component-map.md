# v1 component map

The v1 export list is from
`takeoff-ui/packages/react/lib/components/stencil-generated/components.ts`. The
v2 target is a route, not an API description: open the target skill before
writing code.

## Direct mappings

| v1 export    | v2 target  | Migration note                                                                  |
| ------------ | ---------- | ------------------------------------------------------------------------------- |
| `TkButton`   | `Button`   | Rename props; `label` becomes children.                                         |
| `TkAlert`    | `Alert`    | Check v2 variant and children API.                                              |
| `TkBadge`    | `Badge`    | Check v2 content and variant API.                                               |
| `TkCheckbox` | `Checkbox` | Controlled value/event API changes.                                             |
| `TkChips`    | `Chip`     | Singular target; map each chip to children.                                     |
| `TkDivider`  | `Divider`  | Check orientation and label slots.                                              |
| `TkInput`    | `Input`    | Use the v2 value callback directly.                                             |
| `TkTextarea` | `Input`    | Render `Input.Field as="textarea"`; pass `rows` and native textarea attributes. |
| `TkSlider`   | `Slider`   | Check single vs range value shape.                                              |
| `TkSpinner`  | `Spinner`  | Check size and label API.                                                       |
| `TkToggle`   | `Switch`   | v1 toggle maps to the v2 switch control.                                        |

## Compound rewrites

| v1 export(s)                       | v2 target    | Structural change                                        |
| ---------------------------------- | ------------ | -------------------------------------------------------- |
| `TkAccordion`, `TkAccordionItem`   | `Accordion`  | `items` and labels become compound children.             |
| `TkBreadcrumb`, `TkBreadcrumbItem` | `Breadcrumb` | Render breadcrumb items as children.                     |
| `TkCard`                           | `Card`       | Move heading/body/footer props into parts or children.   |
| `TkDialog`                         | `Dialog`     | Move header/footer and body content into compound parts. |
| `TkDrawer`                         | `Drawer`     | Move title/content/actions into children.                |
| `TkDropdown`                       | `Dropdown`   | Move menu data into trigger/content/item children.       |
| `TkPopover`                        | `Popover`    | Move trigger and panel content into children.            |
| `TkRadio`, `TkRadioGroup`          | `Radio`      | Use the v2 group/control composition and value callback. |
| `TkSelect`                         | `Select`     | Replace `options` with option children.                  |
| `TkStep`, `TkStepper`              | `Stepper`    | Render step children and map active state.               |
| `TkTable`                          | `Table`      | Replace `columns`/`data` with v2 table anatomy.          |
| `TkTabs`, `TkTabsItem`             | `Tabs`       | Render tab triggers and panels as children.              |
| `TkTooltip`                        | `Tooltip`    | Use the v2 trigger/content composition.                  |
| `TkUpload`                         | `Upload`     | Map file handling to the v2 browse/dropzone API.         |

## Special mappings

| v1 export             | v2 approach                                                                        |
| --------------------- | ---------------------------------------------------------------------------------- |
| `TkIcon`              | Not a v2 component. Import the named JSX icon from `@takeoff-icons/react/<name>`.  |
| `TkToggleButton`      | `Button` with `pressed` and `onPressedChange`.                                     |
| `TkToggleButtonGroup` | `Button` instances with the v2 pressed state; preserve group behavior in app code. |

## v1-only gaps

`TkAvatar`, `TkAvatarGroup`, `TkCarousel`, `TkChart`, `TkColorPicker`,
`TkCurrencyInput`, `TkDatepicker`, `TkEditor`, `TkGanttChart`, `TkOrgChart`,
`TkPagination`, `TkPhoneInput`, `TkRating`, `TkTimeline`, `TkTimelineItem`,
`TkTreeView` have no shipped v2 target. See [references/gaps.md](gaps.md) before
changing them.

## v2 opportunities

`Field`, `Label`, `Progress`, `Skeleton`, and `Toast` have no v1 export. They
are migration opportunities when v1 applications contain hand-rolled labels,
loading states, progress indicators, skeletons, or notifications.

<!-- BEGIN GENERATED V2 COMPONENT COVERAGE -->
<!-- END GENERATED V2 COMPONENT COVERAGE -->
