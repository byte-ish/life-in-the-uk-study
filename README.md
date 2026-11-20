# Life in the UK study notes

Cheat sheets, timelines and memory diagrams for the Life in the UK test, based on the official handbook *Life in the United Kingdom: A guide for new residents* (3rd edition). Published with GitHub Pages.

## Structure

| Path | What it is |
| --- | --- |
| `index.md` | Home page: the list of chapters |
| `chapters/03-history.md` | Chapter 3 history timeline cheat sheet (served at `/history/`) |
| `assets/img/<chapter>/` | Diagram images for each chapter |
| `_layouts/default.html`, `assets/css/style.css` | Page layout and styling (light and dark mode) |

## Adding a chapter

1. Create `chapters/0N-<name>.md` with this front matter:
   ```yaml
   ---
   layout: default
   title: "Chapter N: <title>"
   permalink: /<short-name>/
   ---
   ```
2. Put any diagrams in `assets/img/<short-name>/` and link them as
   `![alt text]({{ '/assets/img/<short-name>/file.png' | relative_url }})`.
3. Add `{: .hook}` on the line after a paragraph to show it as a highlighted memory hook.
4. Swap the "coming soon" line for that chapter in `index.md` for a link.

## Publishing

Settings → Pages → Build and deployment → Source: **Deploy from a branch**, branch `main`, folder `/ (root)`. Pages on a private repository needs GitHub Pro, Team or Enterprise.
