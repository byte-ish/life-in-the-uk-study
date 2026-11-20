---
layout: default
title: Practice test
permalink: /practice/
study_tools: true
---

# Practice test

<p class="lead">24 questions in 45 minutes, with a pass mark of 75% (18 out of 24), the same format as the real test. Every question comes from the chapter tables on this site.</p>

{% assign chapter_pages = site.pages | where_exp: "p", "p.chapter" | sort: "chapter" %}
<div id="pt-app" data-pages='[{% for p in chapter_pages %}{"url": "{{ p.url | relative_url }}", "chapter": {{ p.chapter }}, "title": {{ p.nav_title | jsonify }}}{% unless forloop.last %},{% endunless %}{% endfor %}]'>
<p class="note">Loading the questions…</p>
</div>

### How it works

- A test with **all chapters** follows the spread of the official practice questions: about a third each from history, society, and government and law, plus one from Chapters 1 and 2. About half the questions come from the **★ often asked** rows.
- Wrong options are real facts from the handbook that belong to other rows, so read each one carefully.
- At the end you see your score, whether you passed, and every question you got wrong, with a link to the section to revise.
- Keys: <kbd>1</kbd> to <kbd>4</kbd> pick an answer, <kbd>←</kbd> <kbd>→</kbd> move between questions.
- These are practice questions made from these notes, not official test questions. Your scores are saved in this browser only.

<script src="{{ '/assets/js/practice.js' | relative_url }}?v={{ site.time | date: '%s' }}"></script>
