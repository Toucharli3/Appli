/* =========================================================
   SoVibeS'tudio — Blog engine
   Sources d'articles :
   1. Articles PUBLIÉS  → data/articles.json
      (généré depuis content/articles/*.md, édités via le CMS en ligne)
   2. Brouillons LOCAUX → localStorage (éditeur rapide admin.html)
   + petit moteur Markdown, rendu liste / article / accueil.
   ========================================================= */
(function () {
  "use strict";

  var STORE_KEY = "svs_drafts_v1";
  var DATA_URL = "data/articles.json";

  var _published = null; // cache
  var _loading = null;

  /* ---------- Chargement des articles publiés ---------- */
  function load() {
    if (_published) return Promise.resolve(_published);
    if (_loading) return _loading;
    _loading = fetch(DATA_URL, { cache: "no-cache" })
      .then(function (r) { return r.ok ? r.json() : []; })
      .catch(function () { return []; })
      .then(function (arr) {
        _published = Array.isArray(arr) ? arr : [];
        return _published;
      });
    return _loading;
  }

  /* ---------- Brouillons locaux ---------- */
  function readStore() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }
  function writeStore(list) {
    localStorage.setItem(STORE_KEY, JSON.stringify(list));
  }

  function all() {
    var local = readStore();
    var seen = {};
    var merged = [];
    // brouillons locaux prioritaires (aperçu avant publication réelle)
    local.forEach(function (a) {
      if (a && a.slug && !seen[a.slug]) { seen[a.slug] = true; merged.push(a); }
    });
    (_published || []).forEach(function (a) {
      if (a && a.slug && !seen[a.slug]) { seen[a.slug] = true; merged.push(a); }
    });
    merged.sort(function (a, b) { return (b.date || "").localeCompare(a.date || ""); });
    return merged;
  }

  function getBySlug(slug) {
    return all().filter(function (a) { return a.slug === slug; })[0];
  }

  function upsert(article) {
    var list = readStore();
    var idx = -1;
    for (var i = 0; i < list.length; i++) {
      if (list[i].slug === article.slug) { idx = i; break; }
    }
    if (idx >= 0) list[idx] = article;
    else list.unshift(article);
    writeStore(list);
  }

  function remove(slug) {
    writeStore(readStore().filter(function (a) { return a.slug !== slug; }));
  }

  /* ---------- Helpers ---------- */
  function slugify(str) {
    return (str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "") // strip accents/diacritics
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 70);
  }

  function fmtDate(iso) {
    if (!iso) return "";
    var months = [
      "janv.", "févr.", "mars", "avr.", "mai", "juin",
      "juil.", "août", "sept.", "oct.", "nov.", "déc.",
    ];
    var d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return iso;
    return d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear();
  }

  function readTime(body) {
    var words = (body || "").split(/\s+/).length;
    return Math.max(1, Math.round(words / 200));
  }

  function esc(s) {
    return (s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  /* ---------- Markdown minimal → HTML ---------- */
  function inline(s) {
    return esc(s)
      .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1">')
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");
  }

  function markdown(md) {
    var lines = (md || "").replace(/\r\n/g, "\n").split("\n");
    var html = [];
    var i = 0;
    while (i < lines.length) {
      var line = lines[i];
      if (/^\s*$/.test(line)) { i++; continue; }

      var h = /^(#{1,3})\s+(.*)$/.exec(line);
      if (h) {
        var tag = h[1].length === 3 ? "h3" : "h2";
        html.push("<" + tag + ">" + inline(h[2]) + "</" + tag + ">");
        i++;
        continue;
      }
      if (/^\s*>\s?/.test(line)) {
        var quote = [];
        while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
          quote.push(lines[i].replace(/^\s*>\s?/, "")); i++;
        }
        html.push("<blockquote>" + inline(quote.join(" ")) + "</blockquote>");
        continue;
      }
      if (/^\s*[-*]\s+/.test(line)) {
        var ul = [];
        while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
          ul.push("<li>" + inline(lines[i].replace(/^\s*[-*]\s+/, "")) + "</li>"); i++;
        }
        html.push("<ul>" + ul.join("") + "</ul>");
        continue;
      }
      if (/^\s*\d+\.\s+/.test(line)) {
        var ol = [];
        while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
          ol.push("<li>" + inline(lines[i].replace(/^\s*\d+\.\s+/, "")) + "</li>"); i++;
        }
        html.push("<ol>" + ol.join("") + "</ol>");
        continue;
      }
      var para = [];
      while (i < lines.length && !/^\s*$/.test(lines[i]) &&
             !/^(#{1,3})\s+/.test(lines[i]) &&
             !/^\s*>\s?/.test(lines[i]) &&
             !/^\s*[-*]\s+/.test(lines[i]) &&
             !/^\s*\d+\.\s+/.test(lines[i])) {
        para.push(lines[i]); i++;
      }
      html.push("<p>" + inline(para.join(" ")) + "</p>");
    }
    return html.join("\n");
  }

  /* ---------- Rendu ---------- */
  function postCard(a) {
    var media = a.cover
      ? '<img src="' + esc(a.cover) + '" alt="' + esc(a.title) + '" loading="lazy">'
      : "";
    return (
      '<article class="post-card reveal">' +
      '<a class="post-card__media" href="article.html?slug=' + encodeURIComponent(a.slug) + '">' + media + "</a>" +
      '<div class="post-card__body">' +
      '<span class="tag">' + esc(a.category || "Article") + "</span>" +
      '<h3><a href="article.html?slug=' + encodeURIComponent(a.slug) + '">' + esc(a.title) + "</a></h3>" +
      '<p class="post-card__excerpt">' + esc(a.excerpt || "") + "</p>" +
      '<div class="post-card__meta">' +
      "<span>" + esc(a.author || "SoVibeS’tudio") + "</span>" +
      '<span class="dot"></span><span>' + fmtDate(a.date) + "</span>" +
      '<span class="dot"></span><span>' + readTime(a.body) + " min</span>" +
      "</div></div></article>"
    );
  }

  function markVisible(mount) {
    mount.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-visible"); });
  }

  function renderList(mountSel, filterSel) {
    var mount = document.querySelector(mountSel);
    if (!mount) return;
    mount.innerHTML = '<p class="muted center" style="grid-column:1/-1">Chargement des articles…</p>';
    load().then(function () {
      var articles = all();
      var cats = ["Tout"];
      articles.forEach(function (a) {
        if (a.category && cats.indexOf(a.category) === -1) cats.push(a.category);
      });
      var filterBar = document.querySelector(filterSel);
      var activeCat = "Tout";

      function draw() {
        var visible = activeCat === "Tout"
          ? articles
          : articles.filter(function (a) { return a.category === activeCat; });
        mount.innerHTML = visible.length
          ? visible.map(postCard).join("")
          : '<p class="muted center" style="grid-column:1/-1">Aucun article pour le moment.</p>';
        markVisible(mount);
      }

      if (filterBar) {
        filterBar.innerHTML = cats.map(function (c) {
          return '<button class="chip' + (c === activeCat ? " is-active" : "") + '" data-cat="' + esc(c) + '">' + esc(c) + "</button>";
        }).join("");
        filterBar.addEventListener("click", function (e) {
          var btn = e.target.closest(".chip");
          if (!btn) return;
          activeCat = btn.getAttribute("data-cat");
          filterBar.querySelectorAll(".chip").forEach(function (c) {
            c.classList.toggle("is-active", c === btn);
          });
          draw();
        });
      }
      draw();
    });
  }

  function renderArticle(mountSel) {
    var mount = document.querySelector(mountSel);
    if (!mount) return;
    load().then(function () {
      var params = new URLSearchParams(location.search);
      var slug = params.get("slug");
      var a = slug && getBySlug(slug);

      if (!a) {
        mount.innerHTML =
          '<div class="center"><h1>Article introuvable</h1>' +
          '<p class="lead">Cet article n’existe pas ou a été retiré.</p>' +
          '<a class="btn btn--primary" href="blog.html">← Retour au blog</a></div>';
        return;
      }
      document.title = a.title + " — SoVibeS’tudio";

      var related = all().filter(function (x) { return x.slug !== a.slug; }).slice(0, 3);

      mount.innerHTML =
        '<article class="article">' +
        '<div class="center" style="margin-bottom:1.6rem">' +
        '<span class="tag">' + esc(a.category || "Article") + "</span>" +
        "<h1>" + esc(a.title) + "</h1>" +
        '<p class="post-card__meta center" style="justify-content:center">' +
        "<span>Par " + esc(a.author || "SoVibeS’tudio") + "</span>" +
        '<span class="dot"></span><span>' + fmtDate(a.date) + "</span>" +
        '<span class="dot"></span><span>' + readTime(a.body) + " min de lecture</span>" +
        "</p></div>" +
        (a.cover ? '<img class="article__cover" src="' + esc(a.cover) + '" alt="' + esc(a.title) + '">' : "") +
        '<div class="article__body">' + markdown(a.body) + "</div>" +
        '<div class="divider-leaf"></div>' +
        '<div class="center"><a class="btn btn--ghost" href="blog.html">← Tous les articles</a></div>' +
        "</article>";

      var relMount = document.querySelector("[data-related]");
      if (relMount && related.length) {
        relMount.innerHTML = related.map(postCard).join("");
        markVisible(relMount);
      }
    });
  }

  function renderLatest(mountSel, n) {
    var mount = document.querySelector(mountSel);
    if (!mount) return;
    load().then(function () {
      mount.innerHTML = all().slice(0, n || 3).map(postCard).join("");
      markVisible(mount);
    });
  }

  /* ---------- Expose ---------- */
  window.Blog = {
    load: load,
    all: all,
    getBySlug: getBySlug,
    upsert: upsert,
    remove: remove,
    readStore: readStore,
    writeStore: writeStore,
    slugify: slugify,
    fmtDate: fmtDate,
    markdown: markdown,
    esc: esc,
    renderList: renderList,
    renderArticle: renderArticle,
    renderLatest: renderLatest,
    postCard: postCard,
  };
})();
