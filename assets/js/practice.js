// Practice tests: 24 questions in 45 minutes, pass mark 75% (18 of 24), like the real test.
// Questions are made from the chapter tables, and every wrong option is another row's answer
// from the same table (or the same chapter), so nothing is invented.
(function (exports) {
  var QUESTIONS = 24, MINUTES = 45, PASS = 18;
  var SKIP_ROW = /^(today|older printings|newer printings|small claims limits: sources|#)/i;
  var SKIP_HEADER = /2013 text|today \(verified\)|^pair$|^chapter$/i;
  var MAX_LEN = 170;

  var clean = function (s) {
    return s.replace(/\(?\s*older printings?:[^)|]*\)?/gi, '')
      .replace(/\s+/g, ' ').replace(/\s+([;,.)])/g, '$1').replace(/[;,]\s*$/, '').trim();
  };
  // People's names lose their (born–died) years: the test doesn't ask for them.
  var name = function (s) { return clean(s).replace(/\s*\((born |died )?\d{3,4}[^)]*\)/g, '').trim(); };
  var LABEL = { who: 'Who is this?', person: 'Who is this?', place: 'Which place is this?' };
  var key = function (s) { return s.toLowerCase().replace(/[^a-z0-9]/g, ''); };
  var years = function (s) { return (s.match(/\b1\d{3}\b|\b20\d{2}\b/g) || []); };
  var hasDigit = function (s) { return /\d/.test(s); };
  var centuries = function (s) { return (s.toLowerCase().match(/\d+(st|nd|rd|th) century/g) || []); };
  // Two dates overlap if they share a year or a century, or one contains the other ("1940", "Summer 1940").
  var overlaps = function (a, b) {
    var ka = key(a), kb = key(b);
    return ka.indexOf(kb) >= 0 || kb.indexOf(ka) >= 0 ||
      years(a).some(function (y) { return years(b).indexOf(y) >= 0; }) ||
      centuries(a).some(function (c) { return centuries(b).indexOf(c) >= 0; });
  };
  var SHORT = 40;

  var shuffle = function (list, rand) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rand() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  };

  // Pick n distinct options from pool, none equal to the answer or failing ok().
  var pick = function (pool, answer, n, rand, ok) {
    var seen = {}, out = [];
    seen[key(answer)] = true;
    shuffle(pool, rand).forEach(function (v) {
      if (out.length < n && v && !seen[key(v)] && (!ok || ok(v))) { seen[key(v)] = true; out.push(v); }
    });
    return out.length === n ? out : null;
  };

  // tables: [{page:{url,chapter,title}, section, anchor, headers:[..], rows:[{cells:[..], gold}]}]
  // columns: header (lower case) -> 'q-date' | 'q-hook' (from columns.js)
  var buildBank = function (tables, columns) {
    var bank = [];
    var listTables = tables.filter(function (t) { return t.headers[0] === '#'; });

    tables.forEach(function (t) {
      var h = t.headers.map(function (x) { return x.toLowerCase(); });
      if (h.some(function (x) { return SKIP_HEADER.test(x); })) return;
      var rows = t.rows.filter(function (r) { return r.cells[0] && !SKIP_ROW.test(r.cells[0]); });
      var where = { url: t.page.url + (t.anchor ? '#' + t.anchor : ''), chapter: t.page.chapter, title: t.page.title, section: t.section };
      var add = function (q, row) { q.where = where; q.context = t.section; q.gold = row.gold; q.chapter = t.page.chapter; bank.push(q); };

      // Chapter 1's numbered lists: "Which of these is a fundamental principle?"
      if (h[0] === '#') {
        var others = [];
        listTables.forEach(function (o) { if (o !== t) o.rows.forEach(function (r) { others.push(clean(r.cells[1])); }); });
        t.rows.forEach(function (r) {
          var wrong = pick(others, clean(r.cells[1]), 3, Math.random);
          if (wrong) add({ kind: 'choice', prompt: 'Which of these is one of the handbook\'s ' + h[1].replace(/y$/, 'ie') + 's?',
                           answer: clean(r.cells[1]), options: wrong }, r);
        });
        return;
      }

      var dateCol = h.indexOf('when');
      var answerCol = -1;
      h.forEach(function (x, i) { if (answerCol < 0 && i !== dateCol && columns[x] && x !== 'exam hook') answerCol = i; });
      var frontCol = -1;
      h.forEach(function (x, i) { if (frontCol < 0 && !columns[x]) frontCol = i; });

      // "When" questions: the event is shown, the options are dates from the same table.
      if (dateCol >= 0) {
        var subject = frontCol >= 0 ? frontCol : (answerCol >= 0 ? answerCol : -1);
        if (subject < 0) return;
        var pairs = rows.map(function (r) { return { when: clean(r.cells[dateCol] || ''), what: clean(r.cells[subject] || '') }; })
          .filter(function (p) { return hasDigit(p.when); });
        rows.forEach(function (r) {
          var when = clean(r.cells[dateCol] || ''), what = clean(r.cells[subject] || '');
          if (!hasDigit(when) || !what || what.length > MAX_LEN) return;
          if (years(when).some(function (y) { return what.indexOf(y) >= 0; })) return; // the answer is in the question
          // Wrong dates: no overlap with the right one, and not from a similarly named event
          // ("Act of Union" vs "Act of Union with Ireland").
          var pool = pairs.filter(function (p) {
            var a = key(p.what), b = key(what);
            return !overlaps(p.when, when) && a.indexOf(b) < 0 && b.indexOf(a) < 0;
          }).map(function (p) { return p.when; });
          var wrong = pick(pool, when, 3, Math.random);
          if (wrong && wrong.some(function (d, i) { return wrong.some(function (e, j) { return i !== j && overlaps(d, e); }); })) {
            wrong = pick(pool, when, 3, Math.random);  // retry once if two wrong dates overlap each other
            if (wrong && wrong.some(function (d, i) { return wrong.some(function (e, j) { return i !== j && overlaps(d, e); }); })) wrong = null;
          }
          if (wrong) {
            add({ kind: 'choice', prompt: 'When was this?', subject: what, answer: when, options: wrong }, r);
            var truth = Math.random() < 0.5;
            add({ kind: 'choice', prompt: 'True or false?', subject: what + ': ' + (truth ? when : wrong[0]),
                  answer: truth ? 'True' : 'False', options: [truth ? 'False' : 'True'] }, r);
          }
        });
      }

      // Fact questions: the name is shown, the options are other rows' facts (and the reverse).
      if (frontCol >= 0 && answerCol >= 0) {
        var answers = rows.map(function (r) { return clean(r.cells[answerCol] || ''); });
        var fronts = rows.map(function (r) { return name(r.cells[frontCol] || ''); });
        var label = h[frontCol];
        var askYesNo = /\?$/.test(t.headers[answerCol]);
        rows.forEach(function (r, i) {
          var who = fronts[i], fact = answers[i];
          if (!who || !fact || fact.length > MAX_LEN || who.length > MAX_LEN) return;
          if (askYesNo) {
            var yes = /^yes\b/i.test(fact), no = /^no\b/i.test(fact);
            if (yes || no) add({ kind: 'choice', prompt: who + ': ' + t.headers[answerCol], answer: yes ? 'Yes' : 'No', options: [yes ? 'No' : 'Yes'] }, r);
            return;
          }
          var wrong = pick(answers.filter(function (a) { return a.length <= MAX_LEN; }), fact, 3, Math.random);
          if (wrong) add({ kind: 'choice', prompt: 'Which of these matches?', subject: who, answer: fact, options: wrong }, r);
          var wrongNames = pick(fronts, who, 3, Math.random);
          if (wrongNames && key(fact).indexOf(key(who)) < 0) {
            add({ kind: 'choice', prompt: LABEL[label] || ('Which ' + label + ' matches this?'), subject: fact, answer: who, options: wrongNames }, r);
          }
          // True or false only where a swap is believable: another row's figure for a figure.
          if (hasDigit(fact) && fact.length <= SHORT) {
            var other = pick(answers.filter(function (a) { return hasDigit(a) && a.length <= SHORT; }), fact, 1, Math.random);
            if (other) {
              var truth = Math.random() < 0.5;
              add({ kind: 'choice', prompt: 'True or false?', subject: who + ': ' + (truth ? fact : other[0]),
                    answer: truth ? 'True' : 'False', options: [truth ? 'False' : 'True'] }, r);
            }
          }
        });
      }
    });
    return bank;
  };

  // Choose a test. With all chapters, follow the spread of the 390 official 2013 practice
  // questions (about 35% history, 31% society, 31% government and law, 3% chapters 1 and 2).
  // About half come from the gold "often asked" rows. One question per table row at most.
  var SPREAD = { 3: 8, 4: 7, 5: 8, intro: 1 };
  var makeTest = function (bank, chapter, rand) {
    var used = {}, test = [];
    var take = function (pool, n) {
      var gold = shuffle(pool.filter(function (q) { return q.gold; }), rand);
      var rest = shuffle(pool.filter(function (q) { return !q.gold; }), rand);
      var mixed = [];
      while (gold.length || rest.length) {
        if (gold.length) mixed.push(gold.shift());
        if (rest.length) mixed.push(rest.shift());
      }
      var got = 0;
      mixed.forEach(function (q) {
        var rowId = q.where.url + '|' + q.context + '|' + (q.subject || q.answer).split(':')[0];
        if (got < n && test.length < QUESTIONS && !used[rowId]) { used[rowId] = true; test.push(q); got++; }
      });
    };
    if (chapter) {
      take(bank.filter(function (q) { return String(q.chapter) === String(chapter); }), QUESTIONS);
    } else {
      take(bank.filter(function (q) { return q.chapter === 3; }), SPREAD[3]);
      take(bank.filter(function (q) { return q.chapter === 4; }), SPREAD[4]);
      take(bank.filter(function (q) { return q.chapter === 5; }), SPREAD[5]);
      take(bank.filter(function (q) { return q.chapter === 1 || q.chapter === 2; }), SPREAD.intro);
      take(bank, QUESTIONS);  // top up if a chapter ran short
    }
    return shuffle(test, rand).map(function (q) {
      return { q: q, options: shuffle([q.answer].concat(q.options), rand), choice: null };
    });
  };

  exports.practice = { buildBank: buildBank, makeTest: makeTest, overlaps: overlaps, QUESTIONS: QUESTIONS, MINUTES: MINUTES, PASS: PASS, clean: clean };
})(typeof module !== 'undefined' ? module.exports : window);

// ---------- The page ----------
(function () {
  if (typeof document === 'undefined') return;
  var root = document.getElementById('pt-app');
  if (!root) return;
  var P = window.practice;
  var pages = JSON.parse(root.dataset.pages);
  var COLUMNS = window.ANSWER_COLUMNS || {};
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  var esc = function (s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  };

  var tablesFrom = function (page, doc) {
    var main = doc.querySelector('.content');
    if (!main) return [];
    var out = [];
    main.querySelectorAll('table').forEach(function (table) {
      var heading = null;
      for (var el = table.previousElementSibling; el; el = el.previousElementSibling) {
        if (/^H[23]$/.test(el.tagName)) { heading = el; break; }
      }
      out.push({
        page: page,
        section: heading ? heading.textContent.replace(/^\d+\.\s*/, '').trim() : '',
        anchor: heading ? heading.id : '',
        headers: Array.prototype.map.call(table.querySelectorAll('thead th'), function (th) { return th.textContent.trim(); }),
        rows: Array.prototype.map.call(table.querySelectorAll('tbody tr'), function (tr) {
          return {
            cells: Array.prototype.map.call(tr.children, function (td) { return td.textContent.replace(/\s+/g, ' ').trim(); }),
            gold: !!tr.querySelector('.hy')
          };
        })
      });
    });
    return out;
  };

  var bank = [], test = [], current = 0, deadline = 0, timer = null, chapter = '';

  var fmt = function (ms) {
    var s = Math.max(0, Math.round(ms / 1000));
    return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2);
  };

  var showSetup = function () {
    clearInterval(timer);
    var history = store.get('pt-history', []);
    root.innerHTML =
      '<div class="pt-setup">' +
        '<label class="fc-select">Questions from <select class="pt-chapter"><option value="">All chapters (like the real test)</option>' +
        pages.map(function (p) { return '<option value="' + p.chapter + '">' + p.chapter + '. ' + esc(p.title) + ' only</option>'; }).join('') +
        '</select></label>' +
        '<p class="pt-facts"><strong>' + P.QUESTIONS + '</strong> questions · <strong>' + P.MINUTES + '</strong> minutes · pass mark <strong>' + P.PASS + '</strong> (75%)</p>' +
        '<button type="button" class="fc-btn fc-flip pt-start">Start a practice test</button>' +
        '<p class="pt-bank">' + bank.length + ' possible questions, made from the chapter tables. Each test is a new random set.</p>' +
      '</div>' +
      (history.length ? '<h2 class="pt-h">Your recent scores</h2><table class="pt-history"><thead><tr><th>Date</th><th>Questions from</th><th>Score</th><th>Result</th></tr></thead><tbody>' +
        history.slice(-8).reverse().map(function (h) {
          return '<tr><td>' + esc(h.date) + '</td><td>' + esc(h.from) + '</td><td>' + h.score + ' / ' + h.total + '</td><td>' + (h.pass ? 'Pass' : 'Not yet') + '</td></tr>';
        }).join('') + '</tbody></table>' : '');
    var sel = root.querySelector('.pt-chapter');
    sel.value = store.get('pt-chapter', '');
    sel.addEventListener('change', function () { store.set('pt-chapter', sel.value); });
    root.querySelector('.pt-start').addEventListener('click', function () { start(sel.value); });
  };

  var start = function (ch) {
    chapter = ch;
    test = P.makeTest(bank, ch, Math.random);
    current = 0;
    deadline = Date.now() + P.MINUTES * 60000;
    root.innerHTML =
      '<div class="pt-top"><span class="pt-count"></span><span class="pt-timer" aria-live="off"></span></div>' +
      '<div class="pt-nav" aria-label="Questions"></div>' +
      '<section class="fc-card pt-card" tabindex="-1"></section>' +
      '<div class="pt-actions"><button type="button" class="fc-btn pt-prev">Previous</button><button type="button" class="fc-btn pt-next">Next</button>' +
      '<button type="button" class="fc-btn pt-submit">Finish test</button></div>';
    var nav = root.querySelector('.pt-nav');
    nav.innerHTML = test.map(function (_, i) { return '<button type="button" data-i="' + i + '">' + (i + 1) + '</button>'; }).join('');
    nav.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { current = +b.dataset.i; show(); } });
    root.querySelector('.pt-prev').addEventListener('click', function () { if (current > 0) { current--; show(); } });
    root.querySelector('.pt-next').addEventListener('click', function () { if (current < test.length - 1) { current++; show(); } });
    var submit = root.querySelector('.pt-submit'), armed = null;
    submit.addEventListener('click', function () {
      var left = test.filter(function (t) { return t.choice === null; }).length;
      if (left && !armed) {
        submit.textContent = left + ' unanswered: tap again to finish';
        armed = setTimeout(function () { armed = null; submit.textContent = 'Finish test'; }, 4000);
        return;
      }
      finish();
    });
    timer = setInterval(tick, 1000);
    tick();
    show();
  };

  var tick = function () {
    var left = deadline - Date.now();
    var el = root.querySelector('.pt-timer');
    if (el) {
      el.textContent = fmt(left) + ' left';
      el.classList.toggle('pt-low', left < 5 * 60000);
    }
    if (left <= 0) finish();
  };

  var show = function () {
    var item = test[current], q = item.q;
    root.querySelector('.pt-count').textContent = 'Question ' + (current + 1) + ' of ' + test.length;
    root.querySelectorAll('.pt-nav button').forEach(function (b, i) {
      b.classList.toggle('pt-done', test[i].choice !== null);
      b.setAttribute('aria-current', i === current ? 'step' : 'false');
    });
    var card = root.querySelector('.pt-card');
    card.innerHTML =
      (q.context ? '<p class="pt-context">' + q.chapter + '. ' + esc(q.where.title) + ' · ' + esc(q.context) + '</p>' : '') +
      '<p class="pt-q">' + esc(q.prompt) + '</p>' +
      (q.subject ? '<p class="pt-subject">' + esc(q.subject) + '</p>' : '') +
      '<div class="pt-options" role="radiogroup" aria-label="Answers">' +
      item.options.map(function (o, i) {
        return '<button type="button" role="radio" aria-checked="' + (item.choice === o) + '" data-o="' + i + '">' +
          '<span class="pt-letter">' + 'ABCD'.charAt(i) + '</span><span>' + esc(o) + '</span></button>';
      }).join('') + '</div>';
    card.querySelector('.pt-options').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      item.choice = item.options[+b.dataset.o];
      show();
    });
    root.querySelector('.pt-prev').disabled = current === 0;
    root.querySelector('.pt-next').disabled = current === test.length - 1;
  };

  var finish = function () {
    clearInterval(timer);
    var score = test.filter(function (t) { return t.choice === t.q.answer; }).length;
    var need = Math.ceil(test.length * 0.75);  // 18 of 24, or 75% of a shorter single-chapter test
    var passed = score >= need;
    var from = chapter ? 'Chapter ' + chapter : 'All chapters';
    var history = store.get('pt-history', []);
    history.push({ date: new Date().toISOString().slice(0, 10), from: from, score: score, total: test.length, pass: passed });
    store.set('pt-history', history.slice(-50));
    var wrong = test.filter(function (t) { return t.choice !== t.q.answer; });
    root.innerHTML =
      '<div class="pt-result ' + (passed ? 'pt-pass' : 'pt-fail') + '">' +
        '<p class="pt-score">' + score + ' / ' + test.length + '</p>' +
        '<p class="pt-verdict">' + (passed ? 'Pass: you reached the 75% pass mark.' : 'Not yet: the pass mark is ' + need + ' out of ' + test.length + '.') + '</p>' +
      '</div>' +
      (wrong.length ? '<h2 class="pt-h">What to revise (' + wrong.length + ')</h2><ol class="pt-review">' +
        wrong.map(function (t) {
          return '<li><p class="pt-q">' + esc(t.q.prompt) + (t.q.subject ? ' <strong>' + esc(t.q.subject) + '</strong>' : '') + '</p>' +
            '<p>Your answer: ' + (t.choice === null ? '<em>none</em>' : esc(t.choice)) + '</p>' +
            '<p class="pt-right">Correct: <strong>' + esc(t.q.answer) + '</strong></p>' +
            '<p class="pt-where"><a href="' + esc(t.q.where.url) + '">' + t.q.where.chapter + '. ' + esc(t.q.where.title) + (t.q.where.section ? ' · ' + esc(t.q.where.section) : '') + '</a></p></li>';
        }).join('') + '</ol>' : '<p>Every answer was right.</p>') +
      '<p><button type="button" class="fc-btn fc-flip pt-again">Take another test</button></p>';
    root.querySelector('.pt-again').addEventListener('click', showSetup);
    window.scrollTo(0, 0);
  };

  document.addEventListener('keydown', function (e) {
    if (!test.length || !root.querySelector('.pt-card') || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target.matches('select, input, textarea')) return;
    var n = '1234'.indexOf(e.key);
    var item = test[current];
    if (n >= 0 && item.options[n] !== undefined) { item.choice = item.options[n]; show(); }
    else if (e.key === 'ArrowRight' && current < test.length - 1) { current++; show(); }
    else if (e.key === 'ArrowLeft' && current > 0) { current--; show(); }
  });

  Promise.all(pages.map(function (p) {
    return fetch(p.url).then(function (r) { return r.text(); }).then(function (html) {
      return tablesFrom(p, new DOMParser().parseFromString(html, 'text/html'));
    });
  })).then(function (all) {
    bank = P.buildBank([].concat.apply([], all), COLUMNS);
    showSetup();
  }).catch(function () {
    root.innerHTML = '<p class="note">The chapters could not be loaded. Check your connection and refresh the page.</p>';
  });
})();
