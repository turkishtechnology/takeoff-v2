---
'@takeoff-ui/react-spar': patch
---

Bump `@takeoff-icons/react` to `^0.5.0`, which brings the latest Figma icon sync
(1252 icons total) into the icon set available through react-spar. The chevron
and arrow glyphs used by Accordion, Select, Calendar, Table, Breadcrumb and
Input were redrawn upstream and now render larger. Accordion, Select, Breadcrumb
and the Table pagination arrows use smaller icon boxes to offset the larger
chevrons, and the Table sort and filter icons move to 20px (see the tokens
changeset).
