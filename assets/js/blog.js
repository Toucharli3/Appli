/* =========================================================
   SoVibeS'tudio — Blog engine
   - Seed articles (bundled, always visible)
   - Locally published articles (localStorage) that anyone can
     write in the "Espace rédaction" (admin.html)
   - Tiny Markdown renderer, list/article/admin rendering
   ========================================================= */
(function () {
  "use strict";

  var STORE_KEY = "svs_articles_v1";

  /* ---------- Seed content (editable in assets/js/blog.js) ---------- */
  var SEED = [
    {
      slug: "respirer-pour-mieux-vivre",
      title: "Respirer pour mieux vivre : 3 exercices pour apaiser le mental",
      category: "Sérénité",
      author: "Anne-Sophie",
      date: "2026-06-28",
      cover:
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
      excerpt:
        "La respiration est notre premier outil de bien-être — gratuit, disponible partout. Voici trois pratiques simples pour retrouver le calme en quelques minutes.",
      body:
        "On l'oublie souvent : **respirer consciemment** est le chemin le plus court vers le calme. Le souffle est le seul système automatique du corps que l'on peut aussi piloter volontairement. C'est une porte d'entrée directe vers le système nerveux parasympathique — celui du repos et de la digestion.\n\n## 1. La cohérence cardiaque (3·6·5)\n\nInspirez 5 secondes, expirez 5 secondes, pendant 5 minutes, 3 fois par jour. Ce rythme régulier synchronise le cœur et la respiration et fait baisser le cortisol.\n\n> Rien à acheter, rien à télécharger. Juste vous, votre souffle et cinq minutes.\n\n## 2. La respiration abdominale\n\nUne main sur le ventre, une sur la poitrine. On gonfle le ventre à l'inspiration, on le relâche à l'expiration. Seule la main du bas doit bouger.\n\n## 3. Le soupir physiologique\n\nDeux inspirations courtes par le nez, puis une longue expiration par la bouche. En deux ou trois cycles, la tension retombe.\n\nEssayez d'en glisser un dans votre journée dès aujourd'hui — au réveil, avant un rendez-vous, ou le soir avant de dormir. Le corps apprend vite.",
    },
    {
      slug: "yoga-danse-le-mouvement-qui-libere",
      title: "Yoga danse : le mouvement qui libère le corps et le cœur",
      category: "Yoga danse",
      author: "Anne-Sophie",
      date: "2026-06-12",
      cover:
        "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80",
      excerpt:
        "À mi-chemin entre le yoga et la danse intuitive, le yoga danse réconcilie souplesse, énergie et lâcher-prise. Découvrez cette pratique joyeuse.",
      body:
        "Le **yoga danse** est né de l'envie de sortir le yoga du tapis figé pour l'ouvrir au mouvement libre. On enchaîne des postures fluides, portées par la musique, avec des temps de danse intuitive où le corps s'exprime sans jugement.\n\n## Pour qui ?\n\nPour toutes et tous. Aucune souplesse ni aucun sens du rythme n'est requis — il suffit d'accepter de bouger.\n\n## Ce que ça apporte\n\n- Une meilleure conscience du corps et de sa respiration\n- Un défoulement doux qui évacue les tensions\n- De la joie, tout simplement\n\n## Comment débuter\n\nCommencez par 15 minutes chez vous, pieds nus, avec une playlist qui vous porte. Fermez les yeux sur un morceau et laissez une partie du corps mener — une main, une hanche, la tête. Le reste suivra.\n\nDans la vidéothèque, les séances de yoga danse sont classées du plus doux au plus tonique : vous avancez à votre rythme.",
    },
    {
      slug: "chakras-comprendre-vos-centres-energetiques",
      title: "Les 7 chakras : comprendre vos centres d'énergie",
      category: "Énergie",
      author: "Anne-Sophie",
      date: "2026-05-30",
      cover:
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80",
      excerpt:
        "Racine, sacré, plexus, cœur, gorge, troisième œil, couronne : petit guide clair pour se familiariser avec les sept chakras et ce qu'ils symbolisent.",
      body:
        "Dans la tradition yogique, les **chakras** sont sept centres énergétiques répartis le long de la colonne. Chacun est associé à une couleur, un élément et un domaine de vie.\n\n## Un tour rapide\n\n1. **Racine (rouge)** — sécurité, ancrage\n2. **Sacré (orange)** — créativité, émotions\n3. **Plexus solaire (jaune)** — confiance, volonté\n4. **Cœur (vert)** — amour, compassion\n5. **Gorge (bleu)** — expression, vérité\n6. **Troisième œil (indigo)** — intuition\n7. **Couronne (violet)** — connexion, conscience\n\n## En pratique\n\nLors d'un soin énergétique, on prend le temps d'écouter chacun de ces centres et de rééquilibrer ce qui en a besoin. Entre deux séances, quelques minutes de respiration en visualisant chaque couleur, de la base au sommet, entretiennent l'équilibre.\n\nCe guide est une porte d'entrée : rien à croire, tout à ressentir.",
    },
    {
      slug: "alimentation-intuitive-se-reconcilier-avec-son-corps",
      title: "Alimentation intuitive : se réconcilier avec son corps",
      category: "Vitalité",
      author: "Anne-Sophie",
      date: "2026-05-14",
      cover:
        "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80",
      excerpt:
        "Et si l'on cessait de compter pour recommencer à écouter ? L'alimentation intuitive propose de renouer avec ses sensations de faim et de satiété.",
      body:
        "Les régimes stricts échouent le plus souvent parce qu'ils coupent du corps. L'**alimentation intuitive** propose l'inverse : réapprendre à écouter ses signaux.\n\n## Trois repères simples\n\n- **Manger quand j'ai faim**, pas quand l'horloge le dit.\n- **Ralentir** : poser la fourchette entre deux bouchées.\n- **M'arrêter à satiété**, sans culpabilité ni excès.\n\n> Le corps sait. Il faut surtout lui laisser reprendre la parole.\n\n## Ce n'est pas magique\n\nC'est un chemin, parfois inconfortable au début, surtout après des années de contrôle. Le coaching bien-être sert justement à avancer en douceur, sans se juger.",
    },
  ];

  /* ---------- Store ---------- */
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

  function allArticles() {
    var local = readStore();
    var localSlugs = {};
    local.forEach(function (a) {
      localSlugs[a.slug] = true;
    });
    // Local overrides seed with same slug
    var seed = SEED.filter(function (a) {
      return !localSlugs[a.slug];
    });
    var merged = local.concat(seed);
    merged.sort(function (a, b) {
      return (b.date || "").localeCompare(a.date || "");
    });
    return merged;
  }

  function getBySlug(slug) {
    return allArticles().filter(function (a) {
      return a.slug === slug;
    })[0];
  }

  function upsert(article) {
    var list = readStore();
    var idx = -1;
    for (var i = 0; i < list.length; i++) {
      if (list[i].slug === article.slug) {
        idx = i;
        break;
      }
    }
    if (idx >= 0) list[idx] = article;
    else list.unshift(article);
    writeStore(list);
  }

  function remove(slug) {
    writeStore(
      readStore().filter(function (a) {
        return a.slug !== slug;
      })
    );
  }

  function isLocal(slug) {
    return readStore().some(function (a) {
      return a.slug === slug;
    });
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

  /* ---------- Minimal Markdown → HTML ---------- */
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

      // Headings: # and ## -> h2 (section), ### -> h3 (sub-section)
      var h = /^(#{1,3})\s+(.*)$/.exec(line);
      if (h) {
        var tag = h[1].length === 3 ? "h3" : "h2";
        html.push("<" + tag + ">" + inline(h[2]) + "</" + tag + ">");
        i++;
        continue;
      }

      // Blockquote
      if (/^\s*>\s?/.test(line)) {
        var quote = [];
        while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
          quote.push(lines[i].replace(/^\s*>\s?/, ""));
          i++;
        }
        html.push("<blockquote>" + inline(quote.join(" ")) + "</blockquote>");
        continue;
      }

      // Unordered list
      if (/^\s*[-*]\s+/.test(line)) {
        var ul = [];
        while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
          ul.push("<li>" + inline(lines[i].replace(/^\s*[-*]\s+/, "")) + "</li>");
          i++;
        }
        html.push("<ul>" + ul.join("") + "</ul>");
        continue;
      }

      // Ordered list
      if (/^\s*\d+\.\s+/.test(line)) {
        var ol = [];
        while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
          ol.push("<li>" + inline(lines[i].replace(/^\s*\d+\.\s+/, "")) + "</li>");
          i++;
        }
        html.push("<ol>" + ol.join("") + "</ol>");
        continue;
      }

      // Paragraph (gather until blank)
      var para = [];
      while (i < lines.length && !/^\s*$/.test(lines[i]) &&
             !/^(#{1,3})\s+/.test(lines[i]) &&
             !/^\s*>\s?/.test(lines[i]) &&
             !/^\s*[-*]\s+/.test(lines[i]) &&
             !/^\s*\d+\.\s+/.test(lines[i])) {
        para.push(lines[i]);
        i++;
      }
      html.push("<p>" + inline(para.join(" ")) + "</p>");
    }
    return html.join("\n");
  }

  /* ---------- Renderers ---------- */
  function postCard(a) {
    return (
      '<article class="post-card reveal">' +
      '<a class="post-card__media" href="article.html?slug=' + encodeURIComponent(a.slug) + '">' +
      '<img src="' + esc(a.cover || "") + '" alt="' + esc(a.title) + '" loading="lazy">' +
      "</a>" +
      '<div class="post-card__body">' +
      '<span class="tag">' + esc(a.category || "Article") + "</span>" +
      '<h3><a href="article.html?slug=' + encodeURIComponent(a.slug) + '">' + esc(a.title) + "</a></h3>" +
      '<p class="post-card__excerpt">' + esc(a.excerpt || "") + "</p>" +
      '<div class="post-card__meta">' +
      "<span>" + esc(a.author || "SoVibeS’tudio") + "</span>" +
      '<span class="dot"></span><span>' + fmtDate(a.date) + "</span>" +
      '<span class="dot"></span><span>' + readTime(a.body) + " min</span>" +
      "</div>" +
      "</div>" +
      "</article>"
    );
  }

  function renderList(mountSel, filterSel) {
    var mount = document.querySelector(mountSel);
    if (!mount) return;
    var articles = allArticles();

    // Build category chips
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
        : '<p class="muted center" style="grid-column:1/-1">Aucun article dans cette catégorie pour le moment.</p>';
      // re-trigger reveal
      mount.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-visible"); });
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
  }

  function renderArticle(mountSel) {
    var mount = document.querySelector(mountSel);
    if (!mount) return;
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

    var related = allArticles().filter(function (x) {
      return x.slug !== a.slug;
    }).slice(0, 3);

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
      relMount.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-visible"); });
    }
  }

  /* ---------- Expose ---------- */
  window.Blog = {
    all: allArticles,
    getBySlug: getBySlug,
    upsert: upsert,
    remove: remove,
    isLocal: isLocal,
    readStore: readStore,
    writeStore: writeStore,
    slugify: slugify,
    fmtDate: fmtDate,
    markdown: markdown,
    esc: esc,
    renderList: renderList,
    renderArticle: renderArticle,
    postCard: postCard,
  };
})();
