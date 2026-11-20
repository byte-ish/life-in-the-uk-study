# Maintaining the study notes

How to keep this site in step with the official handbook, using only the handbook and official
records. Do a review **once a year**, and also whenever TSO publishes a new printing or a new
edition is announced. A ready-made prompt for Claude is in [prompts/annual-review.md](prompts/annual-review.md).

## Rules that never change

1. **The handbook is the only source of truth.** That means *Life in the United Kingdom: A guide for new residents*,
   published by TSO for the Home Office, in its **current printing**. Never add a fact from memory (yours or an AI's).
2. **Anything not in the handbook must be checked online first**, on an official or primary source, and linked
   where it appears. Examples are test logistics, "Today" changes and the specific figures behind TSO's amendment notes.
   Open the page and confirm it says what you claim. A search snippet is not a source.
3. **Write for any reader.** Never say "your printed copy" or "my notes". Say "the current printing" and
   "older printings", and "if your copy differs from this sheet, follow your copy".
4. **Show old and new together.** When a figure changes, give the current figure and add what older printings
   said (e.g. "Older printings: 70%, 2009 Citizenship Survey"), because people revise from different printings.
5. **Check meaning, not just exact words, before deleting.** A phrase can be missing from the handbook while
   the fact is there in other words. An earlier audit removed the "Tudor rose" this way, although the handbook
   describes the symbol and the practice questions test it.
6. **No handbook text in the repo.** Short quotes in context are fine (it is Crown copyright, reproduced for
   private study). Extracted text, EPUBs and PDFs go in `work/`, which git ignores.

## Where the facts come from

| What | Source |
| --- | --- |
| The handbook, and TSO's notice that the EU and Queen Elizabeth II sections were removed | [TSO: 3rd edition](https://tsoshop.co.uk/article/636421/Life-in-the-United-Kingdom-A-Guide-for-New-Residents-3rd-Edition) |
| **What changed in each printing** | TSO's "List of amendments in latest impression" PDF, linked from the [paperback page](https://tsoshop.co.uk/product/9780113413409/Society/Life-in-the-UK/Life-in-the-United-Kingdom-A-Guide-for-New-Residents-Paperback). Last checked: [list dated 5 January 2026](https://tsoshop.co.uk/gempdf/Life_in_the_UK_latest_impression_amendments%20050126.pdf), impressions 23 to 28 |
| The 2013 text (first printing), for comparison | [law.resource.org](https://law.resource.org/pub/uk/life/uk.tso.life.2013/uk.tso.life.2013.html) |
| Official 2013 practice answers (chooses the gold "often asked" rows; checks coverage) | [law.resource.org](https://law.resource.org/pub/uk/life/gov.uk.life.test.2013/gov.uk.life.answers.2013.html) |
| The test: length, pass mark, fee, booking, ID, centres, exemptions | [GOV.UK: Life in the UK Test](https://www.gov.uk/life-in-the-uk-test) |
| Settlement and citizenship rules | GOV.UK (Home Office pages) |
| "Today" facts | The official body: gov.uk, legislation.gov.uk, nidirect.gov.uk, mygov.scot, senedd.wales, parliament.uk, royal.uk, coe.int (or eeas.europa.eu) and so on. Use reputable news only when no official page says it |

TSO's site is sometimes slow or returns 502 errors to scripts. Retry, or open it in a browser.

## Current state

| Item | Status |
| --- | --- |
| Printing the site follows | 3rd edition, **28th impression** (2026) |
| How | Full text of the **19th impression (2019)** compared with the 2013 text, plus TSO's amendment list for impressions 23 to 28, with each new figure checked online |
| Last full review | 20 November 2026 |
| Gaps | 1. Ten rows that TSO says the current printing changed now show **today's position from official sources**, marked "checked online": Chapter 4: ski centres, National Eisteddfod, Turner Prize venues, TV licences, National Trust volunteers. Chapter 5: contacting your MP, the electoral register, polling stations (photo ID), visiting the Scottish Parliament, the National Insurance number. The printing's own wording for these hasn't been seen. 2. **Printings 20 to 22** (2019–2022): no public list of changes was found. A copy of the current printing (eBook/PDF) run through `tools/diff_printings.py` against the 2019 text would close both |

## The yearly review

Work in a `work/` folder (git-ignored) for downloads and extracted text.

### 1. Has a new edition been announced?

Check [GOV.UK: Life in the UK Test](https://www.gov.uk/life-in-the-uk-test), the TSO pages above, and Home Office
announcements. A **4th edition** would mean rebuilding every chapter from the new book, not patching. If there is
one, stop and plan that separately.

### 2. What changed in the latest printing?

1. Open the paperback page and download the current "List of amendments" PDF into `work/`.
2. Compare it with the list in **Current state** above. Note every amendment for impressions newer than the last one recorded.
3. For each amendment, find the affected rows (`git grep -n -i "<keyword>" chapters/`) and decide:
   - **The list states the new wording** (e.g. "2021 Just over 67 million"): apply it.
   - **The list names the change but not the figure** (e.g. "number of times David Weir has won the London
     Marathon updated"): find the figure on an official or primary source, check the page says it, apply it
     and link the source.
   - **Can't be found:** keep the old figure, say "Older printings: …; the current printing updates this",
     and add it to the gaps list.

### 3. If you have a newer copy of the handbook

A purchased EPUB is the best source. It lets you compare printings word for word.

```sh
python3 -I tools/handbook_text.py work/book.epub work/new.txt     # prints the impression line: check it
python3 -I tools/handbook_text.py work/old.epub  work/old.txt     # or the 2013 HTML page
python3 -I tools/diff_printings.py work/old.txt work/new.txt > work/changes.txt
```

Go through `work/changes.txt`. Ignore photo credits, phone numbers and web addresses unless the site
shows them. Apply every change to names, numbers, dates and facts. Check the impression line: a file that
looks new can be an older printing.

### 4. Re-check everything not in the handbook

- Every row marked **Today (not in the handbook)** and every "Today" note. Has it changed again? Has the
  handbook now absorbed it? If so, turn it into a normal row with an "Older printings" note.
- Chapter 1's test facts against GOV.UK: 45 minutes, 24 questions, 75% to pass, the fee, booking notice,
  the number of centres, ID rules and exemptions.
- Run `sh tools/check_links.sh`. For a 404, find a new official source and confirm it says the same thing. A
  403 or 429 is often a block on scripts only: open the link in a browser.

### 5. Check coverage

```sh
curl -sSL -o work/answers.html https://law.resource.org/pub/uk/life/gov.uk.life.test.2013/gov.uk.life.answers.2013.html
python3 -I tools/check_coverage.py work/answers.html . > work/coverage.txt
```

Review each missing name by hand. Most are wording differences (e.g. "William of Normandy" vs "William,
Duke of Normandy"). Add the ones that are real gaps, from the handbook text. If an official practice set
for the current printing is published, use that instead.

### 6. Publish and verify

1. Commit with a message that says what changed and from which source, then push to `main`.
2. Check the Pages build: `gh api repos/byte-ish/life-in-the-uk-study/pages/builds/latest --jq '.status+" "+.commit'`.
   If the latest commit isn't building after a minute, trigger it:
   `gh api -X POST repos/byte-ish/life-in-the-uk-study/pages/builds`.
3. Check the live pages: every table renders (no raw `|` text), new content is there, diagrams fit, and
   Revision and Flashcards still load (they rebuild themselves from the chapter tables).
4. Update **Current state** above and add a line to the **Review log**.
5. If you keep a separate copy of a chapter elsewhere (e.g. a document of Chapter 3), update it too.

## How the pages are built

- One page per chapter in `chapters/`; see the README for front matter and features.
- **Tables**: answer columns are listed in `assets/js/columns.js` (When, Exam hook, Handbook says, …). The
  self-test blurs them, and the flashcards put them on the back of the card. New tables should reuse those headers.
- **Gold rows** (`{: .hy}` after a bold term) mark facts the official practice questions ask about, about a
  quarter of rows. Don't mark facts that newer printings removed.
- **Section colours**: `{: .era-1}` to `{: .era-10}` after each numbered `##` heading, in increasing order down
  the page; `{: .era-none}` (blue) for "Commonly confused". Some diagrams use the same colours on purpose.
- **Diagrams** are inline SVG in `<figure class="diagram">` with no blank lines inside, a unique
  `dN-title`/`dN-desc` id pair, and the `.diagram` text classes. Keep text inside its boxes. At 13.5 px,
  allow about 6.8 px per character. Light theme only.
- **Notes**: `{: .note}` for plain notes, `{: .hook}` for memory hooks.

## Review log

| Date | What changed | Sources |
| --- | --- | --- |
| 2026-11-20 | All chapters moved from the 2013 text to the current printing: religion (2011 Census), no dates of birth or death in the test, settlement rules, history to 2016, 2021 population, sport and arts updates, Senedd, Council of Europe, police complaints, vehicle tax, jury age, NCS removed, small claims limits | 2019 EPUB; TSO amendments list (5 Jan 2026); official sources linked on each row |
| 2026-11-20 | Coverage check against all 390 official 2013 practice answers; missing tested facts added | law.resource.org practice answers |
| 2026-11-20 | The ten rows TSO flags as updated, without wording in its list, filled with today's position from official sources ("checked online") | GOV.UK, VisitScotland, Visit Wales, Tate, National Trust annual report 2024–25, Parliament, parliament.scot |
