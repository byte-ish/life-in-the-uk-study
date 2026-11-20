# Life in the UK study notes: instructions for Claude

Before changing any content, read [MAINTAINING.md](MAINTAINING.md). For the yearly update, follow
[prompts/annual-review.md](prompts/annual-review.md).

- **Source of truth**: the current printing of *Life in the United Kingdom: A guide for new residents* (TSO,
  for the Home Office). Never write facts from your own memory. Check anything not in the handbook on an
  official or primary source, open the page to confirm it, and link it on the row.
- **Changes between printings**: give the current figure and say what older printings said. TSO's "List of
  amendments in latest impression" PDF (linked from its paperback page) says what changed in each printing.
- **Wording**: write for any reader. Say "the current printing" and "older printings", never "your printed copy"
  or "my notes". Plain, short sentences.
- **Before deleting a fact**, check the meaning, not just the exact words, against the handbook.
- **Never commit handbook text, EPUBs or PDFs.** Use `work/` (git-ignored). The tools in `tools/` read them from there.
- **Design**: light theme only (white background). Diagrams are inline SVG; text must fit inside its boxes.
  Section colours `era-1` to `era-10` run in increasing order down each page.
- **Publishing**: push to `main`, then confirm the GitHub Pages build finished for that commit, and check the live
  page (see MAINTAINING.md). Check every outside link loads before publishing (`sh tools/check_links.sh`).
