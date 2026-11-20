#!/bin/sh
# Check that every outside link on the site still loads.
# Usage: sh tools/check_links.sh
# 200 = fine. 403 often means the site blocks scripts but works in a browser: open it by
# hand, and prefer an official page that loads for both. 000 = timed out. 404 = gone:
# find a replacement source that says the same thing, and check it says it before linking.
cd "$(dirname "$0")/.." || exit 1
UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'
git grep -h -o -E 'https?://[^ )"<>]+' -- '*.md' '*.html' ':!README.md' ':!MAINTAINING.md' ':!CLAUDE.md' ':!prompts/*' ':!LICENSE*' \
  | grep -v 'byte-ish.github.io' | sort -u | while read -r url; do
    code=$(curl -sS -L -o /dev/null --max-time 40 -A "$UA" -w '%{http_code}' "$url" 2>/dev/null)
    echo "$code $url"
  done | sort
