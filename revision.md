---
layout: default
title: Revision
permalink: /revision/
---

# Revision: everything often asked

<p class="lead">Every gold row from the five chapter pages in one place: <span id="revision-total">all the</span> often-asked facts, for the last days before your test.</p>

- These are the rows marked **★ Often asked** on each chapter page. Most come from the official 2013 practice questions; see each chapter for how they were chosen.
- Use **Hide dates** or **Hide answers** to test yourself, then follow a section link to read the rest of that chapter.
- The test can ask about **anything** in the handbook, so this page is for a final pass, not a replacement for the chapters.

{% assign chapter_pages = site.pages | where_exp: "p", "p.chapter" | sort: "chapter" %}
<div id="revision" data-study="{{ '/assets/js/study.js' | relative_url }}?v={{ site.time | date: '%s' }}" data-pages='[{% for p in chapter_pages %}{"url": "{{ p.url | relative_url }}", "title": {{ p.title | jsonify }}}{% unless forloop.last %},{% endunless %}{% endfor %}]'>
<p class="note">Loading the chapters…</p>
</div>

<script src="{{ '/assets/js/revision.js' | relative_url }}?v={{ site.time | date: '%s' }}"></script>
