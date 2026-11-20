# Prompt: yearly review of the study notes

Copy everything below the line into Claude Code, run from the repo folder. Fill in the optional line
if you have a newer copy of the handbook.

---

You are maintaining the Life in the UK study notes in this repo (published with GitHub Pages at
https://byte-ish.github.io/life-in-the-uk-study/). Read `CLAUDE.md` and `MAINTAINING.md` first, and follow
them exactly.

Do the yearly review in `MAINTAINING.md`:

1. Check whether a new edition of *Life in the United Kingdom: A guide for new residents* has been announced.
   If it has, stop and tell me before changing anything.
2. Download TSO's latest "List of amendments in latest impression" and find every amendment newer than the
   one recorded under **Current state**. Apply each one. Where the list doesn't give the new figure, find it on an
   official or primary source, open the page to confirm it, and link it on the row. Where you can't confirm it,
   keep the old figure, flag the row as updated in the current printing, and add it to the gaps list.
3. Optional, only if filled in: I have a newer copy of the handbook at `<path to EPUB or PDF>`. Compare it with
   the previous text using the tools, check its impression line, and apply every change to names, numbers,
   dates and facts. It may also fill in rows on the gaps list.
4. Re-check every "Today (not in the handbook)" row, Chapter 1's test facts against GOV.UK, and every outside
   link (`sh tools/check_links.sh`).
5. Run the coverage check against the official practice answers and add any real gaps from the handbook text.
6. Commit, push, confirm the Pages build finished for the new commit, and check the live pages.
7. Update **Current state** and the **Review log** in `MAINTAINING.md`, and commit that too.

Rules: never use facts from memory; every non-handbook fact needs an official source you have opened; write
for any reader ("the current printing", "older printings"), never about my own copy; keep handbook text out of
the repo (use `work/`).

When you finish, tell me in plain words:
- what changed and where;
- which sources you used;
- what you couldn't confirm, and what you need from me (for example, photos of specific pages).
