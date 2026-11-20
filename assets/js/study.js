// Study tools for chapter pages: self-test mode, the "On this page" rail and back-to-top.
(function () {
  var content = document.querySelector('.content');
  if (!content) return;

  // Number badges on era headings: "2. The Middle Ages" gets a coloured circle with 2.
  content.querySelectorAll('h2[class*="era-"]').forEach(function (h) {
    var m = h.firstChild && h.firstChild.nodeType === 3 && h.firstChild.nodeValue.match(/^(\d+)\.\s*/);
    if (!m) return;
    h.firstChild.nodeValue = h.firstChild.nodeValue.slice(m[0].length);
    var num = document.createElement('span');
    num.className = 'num';
    num.textContent = m[1];
    h.prepend(num);
  });

  // PNG diagrams shrink on phones: tapping one opens it full size in a new tab.
  content.querySelectorAll('img').forEach(function (img) {
    var link = document.createElement('a');
    link.className = 'zoom';
    link.href = img.src;
    link.target = '_blank';
    link.rel = 'noopener';
    img.parentNode.insertBefore(link, img);
    link.appendChild(img);
  });

  // Column labels for the stacked phone layout of tables, and a frame that scrolls sideways.
  content.querySelectorAll('table').forEach(function (table) {
    var wrap = document.createElement('div');
    wrap.className = 'table-wrap';
    table.parentNode.insertBefore(wrap, table);
    wrap.appendChild(table);
    var labels = Array.prototype.map.call(table.querySelectorAll('thead th'), function (th) {
      return th.textContent.trim();
    });
    table.querySelectorAll('tbody tr').forEach(function (tr) {
      Array.prototype.forEach.call(tr.children, function (td, i) {
        if (!td.textContent.trim()) td.classList.add('empty');
        else if (labels[i]) td.dataset.label = labels[i];
      });
    });
  });

  // Self-test: blur the date column or the answer columns; tap a cell to reveal it.
  // Columns are found by their header text, so new chapters work if they use the same headers.
  var COLUMNS = {
    'when': 'q-date',
    'exam hook': 'q-hook', 'what': 'q-hook', 'tell them apart': 'q-hook', 'handbook says': 'q-hook',
    'principle': 'q-hook', 'responsibility': 'q-hook', 'freedom': 'q-hook',
    'in the uk?': 'q-hook', 'in great britain?': 'q-hook', 'examples': 'q-hook',
    'population': 'q-hook', 'share': 'q-hook', 'where': 'q-hook', 'country': 'q-hook', 'age': 'q-hook',
    'responsible for': 'q-hook', 'england, wales and northern ireland': 'q-hook', 'scotland': 'q-hook',
    'today (verified)': 'q-hook'
  };
  var MODES = [['off', 'Off'], ['dates', 'Hide dates'], ['hooks', 'Hide answers']];
  var cells = [];

  content.querySelectorAll('table').forEach(function (table) {
    table.querySelectorAll('thead th').forEach(function (th, i) {
      var cls = COLUMNS[th.textContent.trim().toLowerCase()];
      if (!cls) return;
      table.querySelectorAll('tbody tr').forEach(function (tr) {
        var td = tr.children[i];
        if (td && td.textContent.trim()) {
          td.classList.add('q', cls);
          cells.push(td);
        }
      });
    });
  });

  if (cells.length) {
    var bar = document.createElement('div');
    bar.className = 'study-bar';
    bar.innerHTML = '<span class="label">Test yourself</span>' +
      '<span class="seg" role="group" aria-label="Test yourself"></span>' +
      '<span class="hint">Tap a blurred cell to reveal it, tap again to hide it</span>';
    var seg = bar.querySelector('.seg');
    var hint = bar.querySelector('.hint');
    // Only offer a mode if the page has columns for it (Chapter 1 has no dates).
    MODES = MODES.filter(function (m) {
      return m[0] === 'off' || content.querySelector(m[0] === 'dates' ? '.q-date' : '.q-hook');
    });
    MODES.forEach(function (m) {
      var b = document.createElement('button');
      b.type = 'button';
      b.dataset.mode = m[0];
      b.textContent = m[1];
      seg.appendChild(b);
    });

    var setMode = function (mode) {
      var hiddenClass = mode === 'dates' ? 'q-date' : 'q-hook';
      document.body.dataset.quiz = mode;
      seg.querySelectorAll('button').forEach(function (b) {
        b.setAttribute('aria-pressed', String(b.dataset.mode === mode));
      });
      hint.hidden = mode === 'off';
      cells.forEach(function (td) {
        td.classList.remove('shown');
        if (mode !== 'off' && td.classList.contains(hiddenClass)) td.tabIndex = 0;
        else td.removeAttribute('tabindex');
      });
      try { localStorage.setItem('quiz-mode', mode); } catch (e) {}
    };

    seg.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (b) setMode(b.dataset.mode);
    });
    var toggle = function (e) {
      var td = e.target.closest('td.q[tabindex]');
      if (td) td.classList.toggle('shown');
    };
    content.addEventListener('click', toggle);
    content.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('td.q[tabindex]')) {
        e.preventDefault();
        toggle(e);
      }
    });

    (document.getElementById('markdown-toc') || content.querySelector('h1')).after(bar);

    var saved = 'off';
    try { saved = localStorage.getItem('quiz-mode') || 'off'; } catch (e) {}
    setMode(MODES.some(function (m) { return m[0] === saved; }) ? saved : 'off');
  }

  // "On this page" rail: a copy of the kramdown TOC that highlights the section in view.
  var links = [];
  var toc = document.getElementById('markdown-toc');
  var rail = document.querySelector('.rail');
  if (toc && rail) {
    var nav = document.createElement('nav');
    nav.innerHTML = '<p class="rail-title">On this page</p>';
    var list = toc.cloneNode(true);
    list.removeAttribute('id');
    list.querySelectorAll('[id]').forEach(function (el) { el.removeAttribute('id'); });
    nav.appendChild(list);
    rail.appendChild(nav);

    list.querySelectorAll('a').forEach(function (a) {
      var heading = document.getElementById(decodeURIComponent(a.hash.slice(1)));
      if (!heading) return;
      var era = getComputedStyle(heading).getPropertyValue('--era').trim();
      if (era) a.style.setProperty('--era', era);
      if (/\bera-\d/.test(heading.className)) a.classList.add('era-dot');
      links.push({ a: a, heading: heading });
    });
  }

  var toTop = document.createElement('a');
  toTop.className = 'to-top';
  toTop.href = '#';
  toTop.textContent = '↑ Top';
  toTop.setAttribute('aria-label', 'Back to top');
  toTop.addEventListener('click', function (e) {
    e.preventDefault();
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });
  document.body.appendChild(toTop);

  var ticking = false;
  var onScroll = function () {
    ticking = false;
    toTop.classList.toggle('visible', window.scrollY > 1200);
    var current = links[0];
    links.forEach(function (l) {
      if (l.heading.getBoundingClientRect().top < 120) current = l;
    });
    links.forEach(function (l) { l.a.classList.toggle('active', l === current); });
  };
  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  onScroll();
})();
