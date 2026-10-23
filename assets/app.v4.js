(function () {
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Nav achtergrond bij scroll ---- */
  var nav = document.getElementById('nav');
  function onScroll() { nav.classList.toggle('is-stuck', window.scrollY > 40); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Schermvullend mobiel menu. */
  var burger = document.getElementById('burger');
  var links = document.querySelector('.nav__links');
  if (burger && links) {
    links.id = 'mobile-menu';
    burger.setAttribute('aria-controls', links.id);
    burger.setAttribute('aria-label', 'Menu openen');
    links.insertAdjacentHTML('afterbegin', '<span class="mobile-menu__label">Menu</span><a class="nav__link mobile-menu__only" href="index.html">Home</a>');
    links.insertAdjacentHTML('beforeend', '<a class="nav__link mobile-menu__only" href="contact.html">Contact</a><div class="mobile-menu__contact"><span>Even kennismaken?</span><a href="mailto:info@home11.nl">info@home11.nl</a><a href="tel:+31612292812">+31 6 12 29 28 12</a></div>');
    var mobile = window.matchMedia('(max-width: 760px)');
    var inertBefore = new Map();
    function setMenu(open, focus) {
      open = open && mobile.matches;
      nav.classList.toggle('is-menu-open', open);
      document.documentElement.classList.toggle('mobile-menu-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Menu sluiten' : 'Menu openen');
      if (open) {
        document.querySelectorAll('main, footer, .conversation-widget, .conversation-options').forEach(function (el) {
          if (!inertBefore.has(el)) inertBefore.set(el, el.inert);
          el.inert = true;
        });
      } else {
        inertBefore.forEach(function(value,el){el.inert=value;}); inertBefore.clear();
      }
      if (focus) burger.focus();
    }
    burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true', false); });
    links.addEventListener('click', function (event) { if(event.target.closest('a')) setMenu(false, false); });
    document.addEventListener('keydown', function (event) {
      if (burger.getAttribute('aria-expanded') !== 'true') return;
      if (event.key === 'Escape') { event.preventDefault(); setMenu(false, true); }
      if (event.key === 'Tab') {
        var focusable = Array.from(nav.querySelectorAll('a, button')).filter(function(el){return el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden';});
        var first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
    mobile.addEventListener('change', function () { setMenu(false, false); });
  }

  /* Navigatie volgt de pagina, niet de secties op de homepage. */
  var page = location.pathname.split('/').pop() || 'index.html';
  var parentPages = {'speler-profiel.html':'spelers.html', 'nieuws-artikel.html':'nieuws.html'};
  page = parentPages[page] || page;
  document.querySelectorAll('.nav__link').forEach(function (link) {
    var active = new URL(link.href, location.href).pathname.split('/').pop() === page;
    link.classList.toggle('is-active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });

  /* ---- Tabs: Wat we doen ---- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('.panel'));
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('is-active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('is-active'); tab.setAttribute('aria-selected', 'true');
      panels.forEach(function (p) { p.classList.toggle('is-active', p.getAttribute('data-panel') === tab.getAttribute('data-tab')); });
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
  });

  /* ---- Slider: onze eigen plek ---- */
  var placesTrack = document.getElementById('placesTrack');
  var placesTabs = Array.prototype.slice.call(document.querySelectorAll('.places__tab'));
  var placesBar = document.getElementById('placesBar');
  if (placesTrack) {
    var slides = Array.prototype.slice.call(placesTrack.children);
    placesTabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () {
        slides[i].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      });
    });
    placesTrack.addEventListener('scroll', function () {
      var max = placesTrack.scrollWidth - placesTrack.clientWidth;
      var ratio = max > 0 ? placesTrack.scrollLeft / max : 0;
      if (placesBar) placesBar.style.width = (33 + ratio * 67) + '%';
      var center = placesTrack.scrollLeft + placesTrack.clientWidth / 2;
      var active = 0, best = Infinity;
      slides.forEach(function (s, i) {
        var mid = s.offsetLeft + s.offsetWidth / 2;
        var d = Math.abs(mid - center);
        if (d < best) { best = d; active = i; }
      });
      placesTabs.forEach(function (t, i) { t.classList.toggle('is-active', i === active); });
    }, { passive: true });
    /* middelste kaart gecentreerd bij laden */
    var centerSlide = function (i) {
      var s = slides[i]; if (!s) return;
      placesTrack.scrollLeft = s.offsetLeft - (placesTrack.clientWidth - s.offsetWidth) / 2;
    };
    requestAnimationFrame(function () { centerSlide(1); });
    window.addEventListener('resize', function () { centerSlide(1); });
  }

  /* ---- Slider: spelers ---- */
  var playersTrack = document.getElementById('playersTrack');
  var playersBar = document.getElementById('playersBar');
  if (playersTrack) {
    var step = function () { var c = playersTrack.querySelector('.player-card'); return c ? c.offsetWidth + 24 : 320; };
    var prev = document.getElementById('playersPrev');
    var next = document.getElementById('playersNext');
    if (prev) prev.addEventListener('click', function () { playersTrack.scrollBy({ left: -step(), behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function () { playersTrack.scrollBy({ left: step(), behavior: 'smooth' }); });
    playersTrack.addEventListener('scroll', function () {
      var max = playersTrack.scrollWidth - playersTrack.clientWidth;
      var ratio = max > 0 ? playersTrack.scrollLeft / max : 0;
      if (playersBar) playersBar.style.width = (25 + ratio * 75) + '%';
    }, { passive: true });
  }

  /* ---- Formulier ---- */
  var form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = document.getElementById('formNote');
      if (!form.checkValidity()) {
        note.textContent = 'Vul je naam, een geldig e-mailadres en je rol in, dan nemen we contact met je op.';
        note.style.color = 'var(--accent-hi)';
        return;
      }
      note.textContent = 'Bedankt, we hebben je bericht ontvangen en nemen snel contact met je op.';
      note.style.color = 'var(--ink)';
      form.reset();
    });
  }

  document.getElementById('year').textContent = new Date().getFullYear();

  /* Tekst verschijnt direct, zonder splitsen of in-scrollanimatie. */

})();

/* Carrière-tabs: muis en toetsenbord. */
document.querySelectorAll('[data-career-tabs]').forEach(function (group) {
  var tabs = Array.from(group.querySelectorAll('[role="tab"]'));
  function activate(tab, focus) {
    tabs.forEach(function (item) {
      var selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
      document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
    });
    if (focus) tab.focus();
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  }
  tabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () { activate(tab, false); });
    tab.addEventListener('keydown', function (event) {
      var next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); activate(tabs[next], true); }
    });
  });
});



document.querySelectorAll('[data-steps-carousel]').forEach(function (carousel) {
  var track = carousel.querySelector('.steps-carousel__track');
  track.scrollLeft = 0;
  var prev = carousel.querySelector('[data-step-prev]');
  var next = carousel.querySelector('[data-step-next]');
  function update() {
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
  }
  function move(direction) {
    var card = track.querySelector('article');
    var gap = parseFloat(getComputedStyle(track).columnGap) || 24;
    track.scrollBy({left: direction * (card.getBoundingClientRect().width + gap), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
  }
  prev.addEventListener('click', function () { move(-1); });
  next.addEventListener('click', function () { move(1); });
  track.addEventListener('scroll', update, {passive: true});
  window.addEventListener('resize', update);
  update();
});

/* Sticky routes: scrollen wisselt de inhoud; klikken en toetsen blijven werken. */
(function () {
  var section = document.querySelector('[data-route-scroll]');
  if (!section) return;
  var frame = section.querySelector('.route-scroll__frame');
  var tabs = Array.from(section.querySelectorAll('[role="tab"]'));
  var panels = Array.from(section.querySelectorAll('[role="tabpanel"]'));
  var compact = window.matchMedia('(max-width: 899px), (max-height: 650px)');
  var active = -1, scheduled = false;
  function activate(index) {
    if (active === index) return;
    active = index;
    section.classList.toggle('is-route-b', index === 1);
    tabs.forEach(function (tab, i) {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      panels[i].hidden = i !== index;
      if (i === index && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        panels[i].animate([{opacity:0, transform:'translateY(12px)'},{opacity:1, transform:'translateY(0)'}], {duration:450,easing:'ease-out'});
      }
    });
  }
  function update() {
    scheduled = false;
    if (compact.matches) return;
    var travel = section.offsetHeight - frame.offsetHeight;
    var top = parseFloat(getComputedStyle(frame).top) || 0;
    var progress = travel > 0 ? (top - section.getBoundingClientRect().top) / travel : 0;
    activate(progress >= .5 ? 1 : 0);
  }
  function choose(index, focus) {
    activate(index);
    if (focus) tabs[index].focus();
    if (!compact.matches) {
      var top = parseFloat(getComputedStyle(frame).top) || 0;
      var start = window.scrollY + section.getBoundingClientRect().top - top;
      var travel = section.offsetHeight - frame.offsetHeight;
      window.scrollTo({top: start + travel * (index ? .75 : .15), behavior: 'instant'});
    }
  }
  tabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () { choose(index, false); });
    tab.addEventListener('keydown', function (event) {
      var next;
      if (['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'].includes(event.key)) next = 1 - index;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = 1;
      if (next !== undefined) { event.preventDefault(); choose(next, true); }
    });
  });
  window.addEventListener('scroll', function () {
    if (!scheduled) { scheduled = true; requestAnimationFrame(update); }
  }, {passive: true});
  window.addEventListener('resize', update);
  function hashRoute() {
    if (location.hash === '#afgevallen') choose(1, false);
    else if (location.hash === '#doorgroeien') choose(0, false);
  }
  window.addEventListener('hashchange', hashRoute);
  window.addEventListener('load', function () { update(); hashRoute(); });
  activate(0);
  update();
  hashRoute();
})();

/* Laat schuine randen dezelfde achtergrond dragen als de volgende sectie. */
(function () {
  function matchDividers() {
    document.querySelectorAll('main > section > .section-divider').forEach(function (divider) {
      var next = divider.parentElement.nextElementSibling;
      if (!next || next.tagName !== 'SECTION') return;
      var style = getComputedStyle(next);
      // Donkere secties gebruiken soms de bodykleur en hebben zelf geen vulkleur.
      // Een overgang moet die kleur wel expliciet en volledig dekkend krijgen.
      var color = style.backgroundColor;
      if (color === 'transparent' || /rgba\([^)]*,\s*0\s*\)/.test(color)) {
        color = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#0e0e0c';
      }
      divider.style.backgroundColor = color;
      divider.style.backgroundImage = style.backgroundImage;
      divider.style.backgroundSize = next.clientWidth + 'px ' + next.offsetHeight + 'px';
      divider.style.backgroundPosition = 'center top';
      var paper = next.querySelector(':scope > .section-paper');
      var copy = divider.querySelector('.section-paper');
      if (paper && !copy) { copy = paper.cloneNode(false); divider.appendChild(copy); }
      if (!paper && copy) copy.remove();
      if (paper) {
        var texture = getComputedStyle(paper);
        ['filter', 'opacity', 'mixBlendMode'].forEach(function (key) { copy.style[key] = texture[key]; });
        copy.style.backgroundSize = next.clientWidth + 'px ' + next.offsetHeight + 'px';
        copy.style.backgroundPosition = 'center top';
      }
    });
  }
  matchDividers();
  window.addEventListener('load', matchDividers);
  window.addEventListener('resize', matchDividers);
})();

/* Rustige tekstintroducties en onderbreekbare accordionbewegingen. */
(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!reduced.matches && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
      });
    }, {threshold: .08, rootMargin: '0px 0px -24px 0px'});
    document.querySelectorAll('main .title, main .label, main p').forEach(function (el) {
      if (el.closest('details, .route-scroll, .review-marquee, .step-card, .place-slide, .hero, .page-hero')) return;
      el.classList.add('motion-enter'); observer.observe(el);
    });
    reduced.addEventListener('change', function () {
      if (reduced.matches) { observer.disconnect(); document.querySelectorAll('.motion-enter').forEach(function(el){el.classList.add('is-visible');}); }
    });
  }
  var items = Array.from(document.querySelectorAll('details'));
  var states = new Map();
  items.forEach(function (item) {
    states.set(item, {group:item.getAttribute('name'), animation:null, target:item.open});
    // Zelf de groep sluiten zodat ook het uitklappen terug vloeiend verloopt.
    item.removeAttribute('name');
    var summary = item.querySelector('summary');
    if (!summary) return;
    summary.addEventListener('click', function (event) {
      event.preventDefault();
      var state = states.get(item), next = !state.target;
      if (next && state.group) items.forEach(function (other) {
        if (other !== item && states.get(other).group === state.group && states.get(other).target) toggle(other, false);
      });
      toggle(item, next);
    });
  });
  function toggle(item, open) {
    var state = states.get(item), start = item.getBoundingClientRect().height;
    state.target = open;
    if (state.animation) { state.animation.cancel(); state.animation = null; }
    item.style.height = ''; item.style.overflow = '';
    item.open = open;
    var end = item.getBoundingClientRect().height;
    if (reduced.matches || !item.animate) return;
    item.open = true;
    item.style.overflow = 'hidden';
    var animation = item.animate([{height:start+'px'},{height:end+'px'}], {duration:360,easing:'cubic-bezier(.22,1,.36,1)'});
    state.animation = animation;
    animation.onfinish = function () {
      if (state.animation !== animation) return;
      item.open = state.target; item.style.overflow = ''; state.animation = null;
    };
  }
})();

/* Contactkeuze: sluiten met Escape of een klik buiten de widget. */
(function () {
  function init() {
    var button = document.querySelector('.conversation-widget');
    var panel = document.getElementById('conversation-options');
    if (!button || !panel) return;
    function setOpen(open, restoreFocus) {
      panel.hidden = !open;
      button.setAttribute('aria-expanded', String(open));
      if (open && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        panel.animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}], {duration:220,easing:'ease-out'});
      }
      if (restoreFocus) button.focus();
    }
    button.addEventListener('click', function () { setOpen(panel.hidden, false); });
    button.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowUp') { event.preventDefault(); setOpen(true, false); panel.querySelector('a').focus(); }
    });
    document.addEventListener('click', function (event) {
      if (!button.contains(event.target) && !panel.contains(event.target)) setOpen(false, false);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !panel.hidden) setOpen(false, true);
    });
    panel.addEventListener('click', function (event) { if (event.target.closest('a')) setOpen(false, false); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
