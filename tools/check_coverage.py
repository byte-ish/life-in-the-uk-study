"""Check that the facts behind official practice answers appear on the study site.

Usage:
    python3 -I tools/check_coverage.py <answers.html | answers.txt> [site folder, default .]

The official 2013 practice answers are at
https://law.resource.org/pub/uk/life/gov.uk.life.test.2013/gov.uk.life.answers.2013.html
(each answer has a one-sentence explanation and names its chapter). Use a newer official
practice set instead if one is published.

For every explanation, the script pulls out years, numbers and capitalised names, and
lists those the site never mentions. The output is a list to review by hand, not a
verdict: a name can be missing for good reasons (a different spelling, or the fact has
changed in a newer printing). Pairs such as "Seamus Heaney and Harold Pinter" are split
before checking.
"""
import glob
import html
import os
import re
import sys

CHAPTERS = ('The values and principles of the UK', 'What is the UK', 'A long and illustrious history',
            'A modern, thriving society', 'The UK government, the law and your role')
STOP = set("""The A An In On At Of And Or For To From By With As It Its This That These He She They There When
Where Which Who What If Some Many Most Each Every All During After Before Since Under Over Between About
Although However Today Also Such One Two Three Four Five Six Seven Eight Nine Ten First Second Third Not No
Yes UK Britain British England English Scotland Scottish Wales Welsh Ireland Irish Northern London Queen King
People Parliament Government Church Christian Christians Members Getting Traditionally Popular Several""".split())


def plain(markup):
    text = re.sub(r'<(br|/p|/tr|/li|/h\d)[^>]*>', '\n', markup)
    return html.unescape(re.sub(r'<[^>]+>', ' ', text))


def explanations(path):
    raw = open(path, encoding='utf-8', errors='replace').read()
    lines = [l.strip() for l in (plain(raw) if path.endswith('html') else raw).splitlines() if l.strip()]
    rows, texts = [], set()
    for i, line in enumerate(lines):
        if line in CHAPTERS and i and lines[i - 1] not in texts:
            texts.add(lines[i - 1])
            rows.append((line, lines[i - 1]))
    return rows


def terms(sentence):
    s = sentence.replace('’', "'").replace('‘', "'")
    out = set(re.findall(r'\b(?:1[0-9]{3}|20[0-9]{2}|AD \d+|\d+ BC)\b', s))
    for m in re.finditer(r"\b([A-Z][a-zA-Z'-]+(?:\s+(?:of|the|de|upon|on)?\s*[A-Z][a-zA-Z'-]+)*)", s):
        words = re.sub(r"'s$", '', m.group(1)).split()
        while words and words[0] in STOP:
            words = words[1:]
        name = ' '.join(words)
        if len(name) >= 4 and name not in STOP:
            out.add(name)
    return out


def main(answers, site_dir):
    site = ' '.join(open(f, encoding='utf-8').read() for f in glob.glob(os.path.join(site_dir, 'chapters', '*.md')))
    site = re.sub(r'\s+', ' ', re.sub(r'[*_`{}|]', ' ', plain(site).replace('’', "'"))).lower()
    rows = explanations(answers)
    gaps = 0
    for chapter, text in rows:
        missing = sorted(t for t in terms(text) if t.lower() not in site)
        if missing:
            gaps += 1
            print(f'[{chapter}] missing {missing}\n    {text}\n')
    print(f'{len(rows)} explanations checked, {gaps} with something the site never mentions', file=sys.stderr)


if __name__ == '__main__':
    if len(sys.argv) not in (2, 3):
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2] if len(sys.argv) == 3 else '.')
