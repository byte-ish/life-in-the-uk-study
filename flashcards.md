---
layout: default
title: Flashcards
permalink: /flashcards/
study_tools: true
---

# Flashcards

<p class="lead">One fact at a time, made from the rows of the chapter tables. Answer in your head, flip the card, then say whether you knew it.</p>

- **Got it** marks a card as learned, and it leaves the deck. **Again** brings it back a few cards later.
- Start with **★ Often asked only**, then turn it off to work through every row.
- Keys: <kbd>Space</kbd> flips the card, <kbd>1</kbd> = Again, <kbd>2</kbd> = Got it.
- Your progress is saved in this browser only, so it won't follow you to another device.

{% assign chapter_pages = site.pages | where_exp: "p", "p.chapter" | sort: "chapter" %}
<div id="flashcards" data-pages='[{% for p in chapter_pages %}{"url": "{{ p.url | relative_url }}", "chapter": {{ p.chapter }}, "title": {{ p.nav_title | jsonify }}}{% unless forloop.last %},{% endunless %}{% endfor %}]'>
<p class="note">Loading the cards…</p>
</div>

<script src="{{ '/assets/js/flashcards.js' | relative_url }}?v={{ site.time | date: '%s' }}"></script>
