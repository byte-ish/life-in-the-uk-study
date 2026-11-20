"""Turn a copy of the handbook into plain text, one paragraph per line, in reading order.

Usage:
    python3 -I tools/handbook_text.py <book.epub | page.html | unpacked-epub-folder> <out.txt>

Works with an EPUB (zipped or unpacked) or a single HTML page such as the 2013 text at
law.resource.org. The output is for comparing printings and checking facts. It is Crown
copyright text, so keep it in work/ (git-ignored) and never commit it.
"""
import html
import os
import re
import sys
import tempfile
import zipfile
from html.parser import HTMLParser


class Paragraphs(HTMLParser):
    BLOCK = {'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'li', 'td', 'th', 'div', 'tr', 'br'}

    def __init__(self):
        super().__init__()
        self.out, self.buf = [], []

    def flush(self):
        text = re.sub(r'\s+', ' ', ''.join(self.buf)).strip()
        if text:
            self.out.append(text)
        self.buf = []

    def handle_starttag(self, tag, attrs):
        if tag in self.BLOCK:
            self.flush()

    def handle_endtag(self, tag):
        if tag in self.BLOCK:
            self.flush()

    def handle_data(self, data):
        self.buf.append(data)


def paragraphs(markup):
    p = Paragraphs()
    p.feed(markup)
    p.flush()
    return p.out


def epub_paragraphs(root):
    """Paragraphs from an unpacked EPUB, following the spine order in its .opf file."""
    container = open(os.path.join(root, 'META-INF', 'container.xml'), encoding='utf-8').read()
    opf_path = os.path.join(root, re.search(r'full-path="([^"]+)"', container).group(1))
    opf = open(opf_path, encoding='utf-8').read()
    items = {}
    for tag in re.findall(r'<item\b[^>]*>', opf):
        ident, href = re.search(r'id="([^"]+)"', tag), re.search(r'href="([^"]+)"', tag)
        if ident and href:
            items[ident.group(1)] = href.group(1)
    out = []
    for ref in re.findall(r'<itemref\b[^>]*idref="([^"]+)"', opf):
        href = items.get(ref, '')
        if href.endswith(('html', 'htm', 'xhtml')):
            path = os.path.join(os.path.dirname(opf_path), href)
            out += paragraphs(open(path, encoding='utf-8', errors='replace').read())
    return out


def main(src, dest):
    if os.path.isdir(src):
        lines = epub_paragraphs(src)
    elif zipfile.is_zipfile(src):
        with tempfile.TemporaryDirectory() as tmp:
            zipfile.ZipFile(src).extractall(tmp)
            lines = epub_paragraphs(tmp)
    else:
        lines = paragraphs(open(src, encoding='utf-8', errors='replace').read())
    lines = [html.unescape(line) for line in lines]
    with open(dest, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    imprint = next((line for line in lines if re.search(r'impression', line, re.I)), 'no impression line found')
    print(f'{len(lines)} paragraphs -> {dest}')
    print(f'Imprint: {imprint[:160]}')


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
