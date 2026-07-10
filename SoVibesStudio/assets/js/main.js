/* =========================================================
   SoVibeS'tudio — Shared UI (nav, header/footer, animations)
   ========================================================= */
(function () {
  "use strict";

  var NAV = [
    { href: "index.html", label: "Accueil" },
    { href: "bien-etre.html", label: "Bien-être & coaching" },
    { href: "soins-energetiques.html", label: "Soins énergétiques" },
    { href: "cours-en-ligne.html", label: "Cours en ligne" },
    { href: "blog.html", label: "Blog" },
    { href: "contact.html", label: "Contact" },
  ];

  var current = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  if (current === "" ) current = "index.html";
  // article.html / admin.html highlight blog
  var activeMap = { "article.html": "blog.html", "brouillon.html": "blog.html" };
  var activeHref = activeMap[current] || current;

  function buildHeader() {
    var links = NAV.map(function (n) {
      var active = n.href === activeHref ? ' class="is-active"' : "";
      return '<li><a href="' + n.href + '"' + active + ">" + n.label + "</a></li>";
    }).join("");

    return (
      '<header class="site-header" id="siteHeader">' +
      '<div class="container nav">' +
      '<a class="brand" href="index.html">' +
      '<span class="brand__mark">✦</span>' +
      'SoVibe<em>S</em>’tudio' +
      "</a>" +
      '<button class="nav__toggle" id="navToggle" aria-label="Menu" aria-expanded="false"><span></span></button>' +
      '<ul class="nav__links" id="navLinks">' +
      links +
      '<li class="nav__cta"><a class="btn btn--primary btn--sm" href="cours-en-ligne.html">Vidéothèque</a></li>' +
      "</ul>" +
      "</div>" +
      "</header>"
    );
  }

  function buildFooter() {
    var year = new Date().getFullYear();
    return (
      '<footer class="site-footer">' +
      '<div class="container">' +
      '<div class="footer-grid">' +
      "<div>" +
      '<div class="footer-brand">SoVibe<em>S</em>’tudio</div>' +
      '<p style="color:var(--sage-300);font-size:.95rem;max-width:34ch;">Yoga danse, yog’hiit, soins énergétiques & coaching bien-être. Se découvrir pour s’aimer tel que l’on est.</p>' +
      '<div class="socials">' +
      '<a href="https://www.instagram.com/vibes_studio/" target="_blank" rel="noopener" aria-label="Instagram">◎</a>' +
      '<a href="https://www.facebook.com/sovibesstudio/" target="_blank" rel="noopener" aria-label="Facebook">f</a>' +
      '<a href="https://www.youtube.com/@vibesstudio5668" target="_blank" rel="noopener" aria-label="YouTube">▷</a>' +
      "</div>" +
      "</div>" +
      "<div><h4>Le studio</h4><ul>" +
      '<li><a href="bien-etre.html">Bien-être & coaching</a></li>' +
      '<li><a href="soins-energetiques.html">Soins énergétiques</a></li>' +
      '<li><a href="cours-en-ligne.html">Cours en ligne</a></li>' +
      '<li><a href="blog.html">Blog & articles</a></li>' +
      "</ul></div>" +
      "<div><h4>Infos</h4><ul>" +
      '<li><a href="contact.html">Contact</a></li>' +
      '<li><a href="admin/">Espace rédaction (blog)</a></li>' +
      '<li><a href="mentions-legales.html">Mentions légales</a></li>' +
      "</ul></div>" +
      "<div><h4>Me contacter</h4><ul>" +
      '<li><a href="tel:+33677831045">06 77 83 10 45</a></li>' +
      '<li><a href="mailto:sovibesstudio@gmail.com">sovibesstudio@gmail.com</a></li>' +
      '<li><span style="color:var(--sage-300)">33 Hent Kerminalou<br>29170 Fouesnant</span></li>' +
      "</ul></div>" +
      "</div>" +
      '<div class="footer-bottom">' +
      "<span>© " + year + " SoVibeS’tudio — Anne-Sophie Maquinghem. Tous droits réservés.</span>" +
      '<span>Fait avec ❤ en Bretagne</span>' +
      "</div>" +
      "</div>" +
      "</footer>"
    );
  }

  function mount() {
    var h = document.querySelector("[data-header]");
    if (h) h.outerHTML = buildHeader();
    var f = document.querySelector("[data-footer]");
    if (f) f.outerHTML = buildFooter();

    // Mobile nav toggle
    var toggle = document.getElementById("navToggle");
    var links = document.getElementById("navLinks");
    if (toggle && links) {
      toggle.addEventListener("click", function () {
        var open = links.classList.toggle("is-open");
        toggle.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", String(open));
      });
      links.addEventListener("click", function (e) {
        if (e.target.tagName === "A") {
          links.classList.remove("is-open");
          toggle.classList.remove("is-open");
        }
      });
    }

    // Scroll progress bar
    var progress = document.createElement("div");
    progress.className = "scroll-progress";
    document.body.appendChild(progress);

    // Header shadow + progress on scroll
    var header = document.getElementById("siteHeader");
    var onScroll = function () {
      if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      progress.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();

    // Reveal on scroll
    var reveals = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window && reveals.length) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) {
              en.target.classList.add("is-visible");
              io.unobserve(en.target);
            }
          });
        },
        { threshold: 0.12 }
      );
      reveals.forEach(function (el) {
        io.observe(el);
      });
    } else {
      reveals.forEach(function (el) {
        el.classList.add("is-visible");
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }

  // Expose a tiny toast helper
  window.SVS = window.SVS || {};
  window.SVS.toast = function (msg) {
    var t = document.getElementById("svsToast");
    if (!t) {
      t = document.createElement("div");
      t.className = "toast";
      t.id = "svsToast";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    requestAnimationFrame(function () {
      t.classList.add("is-visible");
    });
    clearTimeout(t._timer);
    t._timer = setTimeout(function () {
      t.classList.remove("is-visible");
    }, 2600);
  };
})();
