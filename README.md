# Life in the UK study notes

Cheat sheets, timelines and memory diagrams for the Life in the UK test, based on the official handbook *Life in the United Kingdom: A guide for new residents* (3rd edition). Published with GitHub Pages.

## Structure

| Path | What it is |
| --- | --- |
| `index.md` | Home page: the list of chapters |
| `chapters/0N-<name>.md` | One cheat sheet per handbook chapter, diagrams drawn inline as SVG |
| `revision.md` | Revision page: every often-asked row in one place |
| `flashcards.md` | Flashcards made from every table row |
| `_layouts/default.html`, `assets/css/style.css` | Page layout and styling (light theme) |
| `_includes/chapter-nav.html` | Previous / next links between chapter pages |
| `assets/js/study.js` | Self-test mode, "On this page" menu and back-to-top on chapter pages |
| `assets/js/columns.js` | Which table columns are answers; shared by the self-test and the flashcards |

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
2. Draw diagrams as inline SVG inside `<figure class="diagram">` (no blank lines inside),
   using the `.diagram` text and box classes; see `chapters/03-history.md`. Give each a unique
   `dN-title` / `dN-desc` id pair. The site is light-only, so keep a white background.
   Each one gets a frame whose top edge takes the section's era colour.
3. Add `{: .hook}` on the line after a paragraph to show it as a highlighted memory hook
   (the box adds its own "Memory hook" label, so don't start the text with one).
   Use `{: .note}` for a plain caption under a diagram.
4. Name table columns `When`, `Event`, `Exam hook` so self-test mode can blur the
   `When` or `Exam hook` column. `What` and `Tell them apart` also count as answers; the full list is
   in `assets/js/columns.js`. Flashcards put the answer columns on the back of the card.
   To mark a row as often asked (gold, with a ★ label), add `{: .hy}` straight after its bold date,
   e.g. `| **1066**{: .hy} | ... |`. Keep it to the dates practice tests ask most, about a quarter of the rows.
5. Colour each numbered section by adding `{: .era-1}` to `{: .era-10}` on the line after its `##`
   heading; `{: .era-none}` goes back to the default blue. Use the classes in increasing order down the page
   (era-1 before era-2 ... before era-none), as each one only overrides the classes listed before it in the CSS.
   Add `nav_title: <Short name>` to the front matter for the header link.
6. In `index.md`, turn that chapter's `card soon` into an `a.card` link with a `Ready` chip
   (copy the Chapter 3 card).

## Study features

- **Self-test bar** on chapter pages: Hide dates, Hide answers, and **★ Often asked only**, which hides every row that isn't gold.
- **Revision page** (`revision.md`, `assets/js/revision.js`): collects every gold row from all chapter pages at load time, so new gold rows appear there automatically.
- **Flashcards** (`flashcards.md`, `assets/js/flashcards.js`): one card per table row, built at load time. Answer columns go on the back. Got it / Again, with learned cards saved in the browser's localStorage.

## Publishing

Settings → Pages → Build and deployment → Source: **Deploy from a branch**, branch `main`, folder `/ (root)`. Pages on a private repository needs GitHub Pro, Team or Enterprise.

## Licence

- **Notes and diagrams:** CC BY-NC 4.0, excluding quoted handbook material, which stays © Crown copyright 2013. See [LICENSE-CONTENT.md](LICENSE-CONTENT.md).
- **Site code** (`_layouts/`, `_includes/`, `assets/css/`, `assets/js/`, `_config.yml`): MIT. See [LICENSE](LICENSE).

The handbook's own terms allow reproduction for private research and study, if it is accurate, credited as Crown copyright with the title, and not presented as official. So keep quotes short and accurate, never use the Home Office crest or the handbook's cover design, and keep the footer's Crown copyright line.
