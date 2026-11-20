"""Compare two printings of the handbook sentence by sentence and list the real changes.

Usage:
    python3 -I tools/diff_printings.py <older.txt> <newer.txt> > work/changes.txt

Both inputs come from tools/handbook_text.py. Changes that only touch punctuation,
quote marks, spacing or page references are left out, so what remains is wording,
names and numbers. Each change is listed as CHANGED (old and new wording), ADDED or
REMOVED. Photo credits and other front matter show up too; skip those.
"""
import difflib
import re
import sys


def norm(s):
    for a, b in (('’', "'"), ('‘', "'"), ('“', '"'), ('”', '"'), ('–', '-'), ('—', '-')):
        s = s.replace(a, b)
    return re.sub(r'\s+', ' ', s).strip()


def sentences(path):
    out = []
    for para in open(path, encoding='utf-8').read().split('\n'):
        for s in re.split(r'(?<=[.!?])\s+(?=[A-Z0-9‘"(])', norm(para)):
            if len(s) > 25:
                out.append(s)
    return out


def key(s):
    return re.sub(r'[^a-z0-9]', '', s.lower())


def word_changes(old, new):
    ow, nw = re.findall(r"[\w'£%.,-]+", old), re.findall(r"[\w'£%.,-]+", new)
    sm = difflib.SequenceMatcher(None, ow, nw)
    return [(' '.join(ow[i1:i2]), ' '.join(nw[j1:j2]))
            for op, i1, i2, j1, j2 in sm.get_opcodes() if op != 'equal']


def trivial(changes):
    """Only punctuation, or only page-reference numbers, changed."""
    return all(key(a) == key(b) or (re.fullmatch(r'[\d ,-]*', a) and re.fullmatch(r'[\d ,-]*', b))
               for a, b in changes)


def main(old_path, new_path):
    old, new = sentences(old_path), sentences(new_path)
    old_set, new_set = set(old), set(new)
    gone = [s for s in old if s not in new_set]
    added = [s for s in new if s not in old_set]
    matched = set()
    counts = {'CHANGED': 0, 'ADDED': 0, 'REMOVED': 0}
    for s in added:
        best = difflib.get_close_matches(s, gone, n=1, cutoff=0.55)
        if best:
            matched.add(best[0])
            changes = word_changes(best[0], s)
            if key(best[0]) == key(s) or trivial(changes):
                continue
            counts['CHANGED'] += 1
            print('CHANGED')
            print('  old: ' + best[0])
            print('  new: ' + s)
            print('  diff: ' + '; '.join(f'[{a}] -> [{b}]' for a, b in changes))
        else:
            counts['ADDED'] += 1
            print('ADDED\n  new: ' + s)
        print()
    for s in gone:
        if s not in matched:
            counts['REMOVED'] += 1
            print('REMOVED\n  old: ' + s + '\n')
    print(counts, file=sys.stderr)


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
