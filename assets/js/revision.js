// Builds the Revision page: every gold ("often asked") row from the chapter pages,
// grouped by chapter and section, then loads the usual study tools for self-testing.
(function () {
  var root = document.getElementById('revision');
  if (!root) return;
  var pages = JSON.parse(root.dataset.pages);

  var load = function (page) {
    return fetch(page.url)
      .then(function (r) { return r.text(); })
      .then(function (html) {
        return { page: page, doc: new DOMParser().parseFromString(html, 'text/html') };
      });
  };

  // The section heading a table belongs to: the nearest h2 or h3 above it.
  var headingFor = function (table) {
    for (var el = table.previousElementSibling; el; el = el.previousElementSibling) {
      if (/^H[23]$/.test(el.tagName)) return el;
    }
    return null;
  };

  Promise.all(pages.map(load)).then(function (results) {
    root.innerHTML = '';
    var total = 0;
    results.forEach(function (res) {
      var main = res.doc.querySelector('.content');
      if (!main) return;
      var block = document.createElement('section');
      var h2 = document.createElement('h2');
      h2.textContent = res.page.title.replace(/ cheat sheet$/, '');
      block.appendChild(h2);
      var count = 0;
      var lastHeading = null;
      main.querySelectorAll('table').forEach(function (table) {
        var rows = Array.prototype.filter.call(table.querySelectorAll('tbody tr'), function (tr) {
          return tr.querySelector('.hy');
        });
        if (!rows.length) return;
        var heading = headingFor(table);
        if (heading && heading !== lastHeading) {
          var h3 = document.createElement('h3');
          var a = document.createElement('a');
          a.href = res.page.url + '#' + heading.id;
          a.textContent = heading.textContent.replace(/^\d+\.\s*/, '');
          h3.appendChild(a);
          block.appendChild(h3);
          lastHeading = heading;
        }
        var copy = document.createElement('table');
        copy.appendChild(table.querySelector('thead').cloneNode(true));
        var body = document.createElement('tbody');
        rows.forEach(function (tr) { body.appendChild(tr.cloneNode(true)); });
        copy.appendChild(body);
        block.appendChild(copy);
        count += rows.length;
      });
      var note = document.createElement('p');
      note.className = 'note';
      note.textContent = count + ' often-asked rows. ';
      var link = document.createElement('a');
      link.href = res.page.url;
      link.textContent = 'Open the full chapter';
      note.appendChild(link);
      h2.after(note);
      total += count;
      root.appendChild(block);
    });
    var summary = document.getElementById('revision-total');
    if (summary) summary.textContent = total;

    var script = document.createElement('script');
    script.src = root.dataset.study;
    document.body.appendChild(script);
  }).catch(function () {
    root.innerHTML = '<p class="note">The chapters could not be loaded. Check your connection and refresh the page.</p>';
  });
})();
