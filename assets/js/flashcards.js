// Flashcards: every table row on the chapter pages becomes a card. The answer columns
// (columns.js) go on the back and the other columns on the front. "Got it" marks a card
// as learned in this browser; "Again" puts it back a few cards later.
(function () {
  var root = document.getElementById('fc-app');
  if (!root) return;
  var pages = JSON.parse(root.dataset.pages);
  var COLUMNS = window.ANSWER_COLUMNS || {};
  var AGAIN_GAP = 3;

  var store = {
    get: function (key, fallback) {
      try { var v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); } catch (e) { return fallback; }
    },
    set: function (key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
    }
  };
  var learned = {};
  store.get('fc-learned', []).forEach(function (id) { learned[id] = true; });
  var saveLearned = function () { store.set('fc-learned', Object.keys(learned)); };

  var load = function (page) {
    return fetch(page.url)
      .then(function (r) { return r.text(); })
      .then(function (html) {
        return { page: page, doc: new DOMParser().parseFromString(html, 'text/html') };
      });
  };

  // The section a table belongs to: the nearest h2 or h3 above it.
  var sectionFor = function (table) {
    for (var el = table.previousElementSibling; el; el = el.previousElementSibling) {
      if (/^H[23]$/.test(el.tagName)) return el.textContent.replace(/^\d+\.\s*/, '').trim();
    }
    return '';
  };

  var cardsFrom = function (res) {
    var main = res.doc.querySelector('.content');
    if (!main) return [];
    var cards = [];
    main.querySelectorAll('table').forEach(function (table) {
      var heads = Array.prototype.map.call(table.querySelectorAll('thead th'), function (th) {
        return th.textContent.trim();
      });
      var front = [], back = [];
      heads.forEach(function (h, i) {
        if (h === '#') return;
        (COLUMNS[h.toLowerCase()] ? back : front).push(i);
      });
      // Tables like "# | Principle | Exam hook" have no question column: ask from the hook instead.
      if (!front.length && back.length > 1) front.push(back.pop());
      if (!front.length || !back.length) return;
      var section = sectionFor(table);
      table.querySelectorAll('tbody tr').forEach(function (tr) {
        var side = function (idx) {
          return idx.map(function (i) {
            var td = tr.children[i];
            return td && td.textContent.trim() ? { label: heads[i], html: td.innerHTML } : null;
          }).filter(Boolean);
        };
        var f = side(front), b = side(back);
        if (!f.length || !b.length) return;
        cards.push({
          id: res.page.url + '|' + f.map(function (x) { return x.label + ':' + x.html.replace(/<[^>]+>/g, ''); }).join('|'),
          page: res.page,
          section: section,
          gold: !!tr.querySelector('.hy'),
          front: f,
          back: b
        });
      });
    });
    return cards;
  };

  var shuffle = function (list) {
    for (var i = list.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = list[i]; list[i] = list[j]; list[j] = t;
    }
    return list;
  };

  var render = function (all) {
    var deck = store.get('fc-deck', 'all');
    var goldOnly = store.get('fc-gold', true);
    var queue = [];
    var flipped = false;

    root.innerHTML =
      '<div class="fc-controls">' +
        '<label class="fc-select">Deck <select></select></label>' +
        '<button type="button" class="only-hy fc-gold"><span class="long">★ Often asked only</span><span class="short">★ Gold</span></button>' +
      '</div>' +
      '<div class="fc-progress"><p class="fc-count"></p><div class="fc-bar" aria-hidden="true"><span></span></div></div>' +
      '<section class="fc-card" aria-live="polite" tabindex="-1"></section>' +
      '<p class="fc-foot"><button type="button" class="fc-reset">Reset progress for this deck</button></p>';

    var select = root.querySelector('select');
    var goldBtn = root.querySelector('.fc-gold');
    var count = root.querySelector('.fc-count');
    var bar = root.querySelector('.fc-bar span');
    var card = root.querySelector('.fc-card');
    var reset = root.querySelector('.fc-reset');

    select.innerHTML = '<option value="all">All chapters</option>' + pages.map(function (p) {
      return '<option value="' + p.url + '">' + p.chapter + '. ' + p.title + '</option>';
    }).join('');
    if (!pages.some(function (p) { return p.url === deck; })) deck = 'all';
    select.value = deck;

    var inDeck = function () {
      return all.filter(function (c) {
        return (deck === 'all' || c.page.url === deck) && (!goldOnly || c.gold);
      });
    };

    var updateProgress = function () {
      var cards = inDeck();
      var done = cards.filter(function (c) { return learned[c.id]; }).length;
      count.textContent = done + ' of ' + cards.length + ' cards learned';
      bar.style.width = (cards.length ? 100 * done / cards.length : 0) + '%';
    };

    var side = function (items) {
      return items.map(function (x) {
        return '<div class="fc-field"><span class="fc-label">' + x.label + '</span><div class="fc-value">' + x.html + '</div></div>';
      }).join('');
    };

    var show = function () {
      flipped = false;
      updateProgress();
      var c = queue[0];
      if (!c) {
        var left = inDeck().length;
        card.className = 'fc-card fc-done';
        card.innerHTML = left
          ? '<p class="fc-done-title">Deck learned</p><p>You marked every card in this deck as learned.</p>' +
            '<p><button type="button" class="fc-btn fc-review">Review them again</button></p>'
          : '<p>No cards in this deck.</p>';
        var review = card.querySelector('.fc-review');
        if (review) review.addEventListener('click', function () { start(true); });
        return;
      }
      card.className = 'fc-card';
      card.innerHTML =
        '<p class="fc-context"><a href="' + c.page.url + '">' + c.page.chapter + '. ' + c.page.title + '</a>' +
          (c.section ? ' · ' + c.section : '') + (c.gold ? ' <span class="fc-star">★ Often asked</span>' : '') + '</p>' +
        '<div class="fc-front">' + side(c.front) + '</div>' +
        '<div class="fc-back" hidden>' + side(c.back) + '</div>' +
        '<div class="fc-actions">' +
          '<button type="button" class="fc-btn fc-flip">Show answer</button>' +
          '<button type="button" class="fc-btn fc-again" hidden>Again</button>' +
          '<button type="button" class="fc-btn fc-got" hidden>Got it</button>' +
        '</div>';
      card.querySelector('.fc-flip').focus({ preventScroll: true });
    };

    var flip = function () {
      if (!queue[0] || flipped) return;
      flipped = true;
      card.querySelector('.fc-back').hidden = false;
      card.querySelector('.fc-flip').hidden = true;
      card.querySelector('.fc-again').hidden = false;
      card.querySelector('.fc-got').hidden = false;
      // Focus the card, not a button, so the key that flipped it can't also press "Got it".
      card.focus({ preventScroll: true });
    };

    var answer = function (knew) {
      if (!queue[0] || !flipped) return;
      var c = queue.shift();
      if (knew) {
        learned[c.id] = true;
        saveLearned();
      } else {
        queue.splice(Math.min(AGAIN_GAP, queue.length), 0, c);
      }
      show();
    };

    // includeLearned: review a finished deck without clearing its progress.
    var start = function (includeLearned) {
      queue = shuffle(inDeck().filter(function (c) { return includeLearned || !learned[c.id]; }));
      goldBtn.setAttribute('aria-pressed', String(goldOnly));
      show();
    };

    card.addEventListener('click', function (e) {
      if (e.target.closest('.fc-flip')) flip();
      else if (e.target.closest('.fc-again')) answer(false);
      else if (e.target.closest('.fc-got')) answer(true);
    });
    document.addEventListener('keydown', function (e) {
      if (e.target.matches('select, input, textarea') || e.metaKey || e.ctrlKey || e.altKey) return;
      // A focused button or link handles Space and Enter itself.
      if ((e.key === ' ' || e.key === 'Enter') && e.target.closest('button, a')) return;
      if ((e.key === ' ' || e.key === 'Enter') && !flipped && queue[0]) { e.preventDefault(); flip(); }
      else if (e.key === '1' && flipped) answer(false);
      else if (e.key === '2' && flipped) answer(true);
    });
    select.addEventListener('change', function () {
      deck = select.value;
      store.set('fc-deck', deck);
      start(false);
    });
    goldBtn.addEventListener('click', function () {
      goldOnly = !goldOnly;
      store.set('fc-gold', goldOnly);
      start(false);
    });

    // Two taps to reset, so one stray tap can't wipe the progress.
    var armed = null;
    reset.addEventListener('click', function () {
      if (!armed) {
        reset.textContent = 'Tap again to reset this deck';
        armed = setTimeout(function () { armed = null; reset.textContent = 'Reset progress for this deck'; }, 4000);
        return;
      }
      clearTimeout(armed);
      armed = null;
      reset.textContent = 'Reset progress for this deck';
      inDeck().forEach(function (c) { delete learned[c.id]; });
      saveLearned();
      start(false);
    });

    start(false);
  };

  Promise.all(pages.map(load)).then(function (results) {
    var all = [];
    results.forEach(function (res) { all = all.concat(cardsFrom(res)); });
    render(all);
  }).catch(function () {
    root.innerHTML = '<p class="note">The chapters could not be loaded. Check your connection and refresh the page.</p>';
  });
})();
