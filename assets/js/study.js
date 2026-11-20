// Study tools for chapter pages: self-test mode, the "On this page" rail and back-to-top.
(function () {
  var content = document.querySelector('.content');
  if (!content) return;

  // Self-test: blur the date column or the exam-hook column; tap a cell to reveal it.
  // Columns are found by their header text, so new chapters work if they use the same headers.
  var COLUMNS = { 'when': 'q-date', 'exam hook': 'q-hook', 'what': 'q-hook', 'tell them apart': 'q-hook' };
  var MODES = [['off', 'Off'], ['dates', 'Hide dates'], ['hooks', 'Hide hooks']];
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
