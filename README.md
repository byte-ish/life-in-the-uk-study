# Life in the UK study notes

Cheat sheets, timelines and memory diagrams for the Life in the UK test, based on the official handbook *Life in the United Kingdom: A guide for new residents* (3rd edition). Published with GitHub Pages.

## Structure

| Path | What it is |
| --- | --- |
| `index.md` | Home page: the list of chapters |
| `chapters/03-history.md` | Chapter 3 history timeline cheat sheet (served at `/history/`) |
| `assets/img/<chapter>/` | Diagram images for each chapter |
| `_layouts/default.html`, `assets/css/style.css` | Page layout and styling (light theme) |
| `_includes/chapter-nav.html` | Previous / next links between chapter pages |
| `assets/js/study.js` | Self-test mode, "On this page" menu and back-to-top on chapter pages |

## Adding a chapter

1. Create `chapters/0N-<name>.md` with this front matter:
   ```yaml
   ---
   layout: default
   title: "Chapter N: <title>"
   permalink: /<short-name>/
   chapter: N
   nav_title: <Short name>
   ---
   ```
2. Put any diagrams in `assets/img/<short-name>/` and link them as
   `![alt text]({{ '/assets/img/<short-name>/file.png' | relative_url }})`.
   The site is light-only, so diagrams should have a white or transparent background.
   Each one gets a frame whose top edge takes the section's era colour.
3. Add `{: .hook}` on the line after a paragraph to show it as a highlighted memory hook
   (the box adds its own "Memory hook" label, so don't start the text with one).
   Use `{: .note}` for a plain caption under a diagram.
4. Name table columns `When`, `Event`, `Exam hook` so self-test mode can blur the
   `When` or `Exam hook` column. `What` and `Tell them apart` also count as answers.
   To mark a row as often asked (gold, with a ★ label), add `{: .hy}` straight after its bold date,
   e.g. `| **1066**{: .hy} | ... |`. Keep it to the dates practice tests ask most, about a quarter of the rows.
5. Optional: colour a section by adding `{: .era-1}` to `{: .era-6}` on the line after its `##`
   heading; `{: .era-none}` goes back to the default blue. Use the classes in increasing order down the page
   (era-1 before era-2 ... before era-none), as each one only overrides the classes listed before it in the CSS.
   Add `nav_title: <Short name>` to the front matter for the header link.
7. Diagrams for new chapters: inline SVG inside `<figure class="diagram">` (no blank lines inside),
   using the `.diagram` text and box classes; see `chapters/01-values.md`.
6. In `index.md`, turn that chapter's `card soon` into an `a.card` link with a `Ready` chip
   (copy the Chapter 3 card).

## Publishing

Settings → Pages → Build and deployment → Source: **Deploy from a branch**, branch `main`, folder `/ (root)`. Pages on a private repository needs GitHub Pro, Team or Enterprise.

## Licence

- **Notes and diagrams:** CC BY-NC 4.0, excluding quoted handbook material, which stays © Crown copyright 2013. See [LICENSE-CONTENT.md](LICENSE-CONTENT.md).
- **Site code** (`_layouts/`, `_includes/`, `assets/css/`, `assets/js/`, `_config.yml`): MIT. See [LICENSE](LICENSE).

The handbook's own terms allow reproduction for private research and study, if it is accurate, credited as Crown copyright with the title, and not presented as official. So keep quotes short and accurate, never use the Home Office crest or the handbook's cover design, and keep the footer's Crown copyright line.
