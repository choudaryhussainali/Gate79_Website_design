/* Gate79 — main.js (classic script, deferred; runs from file:// and http(s)) */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  var doc = document;
  var root = doc.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var $ = function (sel, ctx) { return (ctx || doc).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); };

  /* ---------------- header: hairline + hide on scroll down ---------------- */
  var header = $('[data-header]');
  var lastY = window.scrollY;
  var headerTick = false;
  var updateHeader = function () {
    headerTick = false;
    var y = window.scrollY;
    if (!header.classList.contains('site-header--inset')) {
      header.classList.toggle('is-scrolled', y > 80);
      if (y > lastY && y > 240 && !root.classList.contains('menu-open')) {
        header.classList.add('is-hidden');
      } else {
        header.classList.remove('is-hidden');
      }
    }
    lastY = y;
    toTopUpdate();
    updateProgress();
  };
  window.addEventListener('scroll', function () {
    if (!headerTick) { headerTick = true; window.requestAnimationFrame(updateHeader); }
  }, { passive: true });

  /* ---------------- back to top ---------------- */
  var toTop = $('[data-to-top]');
  var toTopUpdate = function () {
    if (!toTop) return;
    toTop.classList.toggle('is-visible', window.scrollY > 640);
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var pct = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    toTop.style.setProperty('--scroll', (pct * 100).toFixed(2) + '%');
  };
  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    });
    toTopUpdate();
  }

  /* ---------------- mobile menu ---------------- */
  var navToggle = $('[data-nav-toggle]');
  var menu = $('[data-menu]');
  var menuOpen = false;
  var menuLastFocus = null;

  var focusablesIn = function (el) {
    return $$('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])', el)
      .filter(function (n) { return n.offsetParent !== null; });
  };

  var openMenu = function () {
    if (!menu || menuOpen) return;
    menuOpen = true;
    menuLastFocus = doc.activeElement;
    menu.hidden = false;
    root.classList.add('menu-open');
    $$('[data-nav-toggle]').forEach(function (t) { t.setAttribute('aria-expanded', 'true'); });
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () { menu.classList.add('is-open'); });
    });
    var first = focusablesIn(menu)[0];
    if (first) { first.focus(); }
  };
  var closeMenu = function () {
    if (!menu || !menuOpen) return;
    menuOpen = false;
    menu.classList.remove('is-open');
    root.classList.remove('menu-open');
    $$('[data-nav-toggle]').forEach(function (t) { t.setAttribute('aria-expanded', 'false'); });
    var done = function () {
      menu.hidden = true;
      if (menuLastFocus) { menuLastFocus.focus(); }
    };
    if (reduceMotion.matches) { done(); }
    else {
      var t = setTimeout(done, 380);
      menu.addEventListener('transitionend', function () { clearTimeout(t); done(); }, { once: true });
    }
  };
  if (menu) {
    $$('[data-nav-toggle]').forEach(function (t) {
      t.addEventListener('click', function () {
        if (menuOpen) { closeMenu(); } else { openMenu(); }
      });
    });
    doc.addEventListener('keydown', function (e) {
      if (!menuOpen) return;
      if (e.key === 'Escape') { closeMenu(); return; }
      if (e.key === 'Tab') {
        var items = focusablesIn(menu);
        if (!items.length) return;
        var first = items[0];
        var last = items[items.length - 1];
        if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    $$('a', menu).forEach(function (a) {
      a.addEventListener('click', function () { closeMenu(); });
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1024 && menuOpen) { closeMenu(); }
    });
  }

  /* mobile services accordion */
  $$('.mm-acc__btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      var panel = doc.getElementById(btn.getAttribute('aria-controls'));
      if (panel) { panel.hidden = expanded; }
    });
  });

  /* ---------------- desktop dropdowns ---------------- */
  var navItems = $$('.site-nav__item');
  var desktopNav = window.matchMedia('(min-width: 1024px)');
  var closeAllDropdowns = function (except) {
    navItems.forEach(function (item) {
      if (item !== except) {
        item.classList.remove('is-open');
        var b = $('.nav-drop', item);
        var p = $('.dd', item);
        if (b) { b.setAttribute('aria-expanded', 'false'); }
        if (p) { p.hidden = true; }
      }
    });
  };
  navItems.forEach(function (item) {
    var btn = $('.nav-drop', item);
    var panel = $('.dd', item);
    if (!btn || !panel) return;
    var open = function () {
      closeAllDropdowns(item);
      item.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
      panel.hidden = false;
    };
    var close = function () {
      item.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      panel.hidden = true;
    };
    btn.addEventListener('click', function () {
      if (item.classList.contains('is-open')) { close(); } else { open(); }
    });
    var hoverTimer = null;
    item.addEventListener('pointerenter', function (e) {
      if (e.pointerType !== 'mouse' || !desktopNav.matches) return;
      clearTimeout(hoverTimer);
      open();
    });
    item.addEventListener('pointerleave', function (e) {
      if (e.pointerType !== 'mouse' || !desktopNav.matches) return;
      hoverTimer = setTimeout(close, 180);
    });
    item.addEventListener('focusout', function (e) {
      if (!item.contains(e.relatedTarget)) { close(); }
    });
  });
  doc.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeAllDropdowns(null); }
  });
  doc.addEventListener('click', function (e) {
    if (!e.target.closest('.site-nav__item')) { closeAllDropdowns(null); }
  });

  /* ---------------- scroll reveals ---------------- */
  var revealEls = $$('[data-reveal]');
  var observed = revealEls.slice();
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px 15% 0px', threshold: 0 });
    revealEls.forEach(function (el) { io.observe(el); });
    $$('[data-reveal-group]').forEach(function (group) {
      $$(':scope > *', group).forEach(function (child, i) {
        child.style.setProperty('--d', (i * 60) + 'ms');
        if (!child.hasAttribute('data-reveal')) { child.setAttribute('data-reveal', ''); }
        observed.push(child);
        io.observe(child);
      });
    });
    setTimeout(function () {
      observed.forEach(function (el) {
        if (el.classList.contains('is-in')) { return; }
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) { el.classList.add('is-in'); }
      });
    }, 1500);
  } else {
    observed.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------------- count-ups (hero strip + results band only) ---------------- */
  var counters = $$('[data-count]');
  counters.forEach(function (el) { el.setAttribute('data-final', el.textContent); });
  var setFinal = function (el) { el.textContent = el.getAttribute('data-final'); };
  var finishAll = function () { counters.forEach(setFinal); };
  var runCounter = function (el) {
    var finalText = el.getAttribute('data-final');
    var target = parseFloat(el.getAttribute('data-count'));
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    if (isNaN(target) || target < 10 || reduceMotion.matches) { setFinal(el); return; }
    var fmt = new Intl.NumberFormat('en-GB', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    var width = el.getBoundingClientRect().width;
    if (width) { el.style.minWidth = width + 'px'; }
    var from = target * 0.6;
    var start = null;
    var dur = 900;
    var step = function (ts) {
      if (document.visibilityState === 'hidden') { setFinal(el); el.style.minWidth = ''; return; }
      if (start === null) { start = ts; }
      var t = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = prefix + fmt.format(from + (target - from) * eased) + suffix;
      if (t < 1) { window.requestAnimationFrame(step); }
      else { setFinal(el); el.style.minWidth = ''; }
    };
    window.requestAnimationFrame(step);
  };
  var animated = counters.filter(function (el) { return el.hasAttribute('data-animate'); });
  if ('IntersectionObserver' in window && animated.length) {
    var nio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && entry.target.getAttribute('data-running') !== 'true') {
          entry.target.setAttribute('data-running', 'true');
          runCounter(entry.target);
        } else if (!entry.isIntersecting && entry.target.getAttribute('data-running') === 'true'
                   && entry.target.textContent !== entry.target.getAttribute('data-final')) {
          setFinal(entry.target);
        }
      });
    }, { threshold: 0.7 });
    animated.forEach(function (c) { nio.observe(c); });
  }
  window.addEventListener('beforeprint', finishAll);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') { finishAll(); }
  });

  /* ---------------- tabs ---------------- */
  $$('[data-tabs]').forEach(function (wrap) {
    var tabs = $$('[role="tab"]', wrap);
    var select = function (tab, setFocus) {
      tabs.forEach(function (t) {
        var selected = t === tab;
        t.setAttribute('aria-selected', selected ? 'true' : 'false');
        t.tabIndex = selected ? 0 : -1;
        var panel = doc.getElementById(t.getAttribute('aria-controls'));
        if (panel) { panel.hidden = !selected; }
      });
      if (setFocus) { tab.focus(); }
    };
    tabs.forEach(function (tab, idx) {
      tab.addEventListener('click', function () { select(tab, false); });
      tab.addEventListener('keydown', function (e) {
        var dir = 0;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { dir = 1; }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { dir = -1; }
        if (dir) {
          e.preventDefault();
          var n = (idx + dir + tabs.length) % tabs.length;
          select(tabs[n], true);
        }
      });
    });
  });

  /* ---------------- work filters ---------------- */
  var filterWrap = $('[data-filters]');
  if (filterWrap) {
    var chips = $$('.chip', filterWrap);
    var grid = $('[data-filter-grid]');
    var items = grid ? $$('.case-row', grid) : [];
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'); });
        var f = chip.getAttribute('data-filter');
        var apply = function () {
          items.forEach(function (item) {
            var cats = (item.getAttribute('data-cats') || '').split(' ');
            item.hidden = !(f === 'all' || cats.indexOf(f) !== -1);
          });
          grid.classList.remove('is-fading');
        };
        if (reduceMotion.matches) { apply(); }
        else {
          grid.classList.add('is-fading');
          setTimeout(apply, 160);
        }
      });
    });
  }

  /* ---------------- jump pills scrollspy ---------------- */
  var jump = $('[data-jump]');
  if (jump && 'IntersectionObserver' in window) {
    var jPills = $$('.jump__pill', jump);
    var sections = jPills.map(function (l) { return doc.getElementById((l.getAttribute('href') || '').slice(1)); }).filter(Boolean);
    var jio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          jPills.forEach(function (l) {
            var on = l.getAttribute('href') === '#' + entry.target.id;
            if (on) { l.setAttribute('aria-current', 'true'); } else { l.removeAttribute('aria-current'); }
          });
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    sections.forEach(function (s) { jio.observe(s); });
  }

  /* ---------------- insights search ---------------- */
  var searchInput = $('[data-search]');
  if (searchInput) {
    var cards = $$('[data-search-item]');
    searchInput.addEventListener('input', function () {
      var q = searchInput.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var hit = !q || card.textContent.toLowerCase().indexOf(q) !== -1;
        card.hidden = !hit;
      });
    });
  }

  /* ---------------- before/after sliders ---------------- */
  $$('.ba__range').forEach(function (range) {
    var ba = range.closest('.ba');
    var set = function () {
      ba.style.setProperty('--ba', range.value + '%');
      range.setAttribute('aria-valuetext', range.value + '% before shown');
    };
    range.addEventListener('input', set);
    set();
  });

  /* ---------------- pricing estimator ---------------- */
  var estimator = $('[data-estimator]');
  if (estimator) {
    var steps = $$('.fstep', estimator);
    var fill = $('.steps-card__fill', estimator);
    var meta = $('[data-estimator-meta]', estimator);
    var back = $('[data-estimator-back]', estimator);
    var next = $('[data-estimator-next]', estimator);
    var result = $('[data-estimator-result]', estimator);
    var idx = 0;
    var answers = { revenue: '', marketplaces: [], problem: '', spend: '' };

    var recommend = function () {
      var r = answers.revenue;
      var tier = 'Growth';
      var tierWhy = 'a full-channel retainer with one team and one report';
      if (r.indexOf('Under') === 0) { tier = 'Launch'; tierWhy = 'a focused start: audit, listings and core campaigns'; }
      else if (r.indexOf('£15k') === 0) { tier = 'Launch'; tierWhy = 'audit, listing rebuilds and Sponsored campaigns to build rank'; }
      else if (r.indexOf('£150k') === 0) { tier = 'Scale'; tierWhy = 'multi-marketplace management with DSP and a named senior lead'; }
      var svc = 'advertising';
      if (answers.problem === 'conversions') { svc = 'listing optimisation'; }
      if (answers.problem === 'creative') { svc = 'creative and A+ Content'; }
      if (answers.problem === 'operations') { svc = 'account management'; }
      if (answers.problem === 'protection') { svc = 'Brand Store and Registry'; }
      if (answers.problem === 'launch') { svc = 'launch and expansion'; }
      var mp = answers.marketplaces.length > 1 ? ' Across your marketplaces we would run one plan, not one per country.' : '';
      return {
        tier: tier,
        html: '<p class="fstep__hint">Based on your answers we would start the conversation at</p>' +
          '<p class="estimator-result__tier"><span>' + tier + '</span>, most likely with ' + svc + ' first.</p>' +
          '<p class="fstep__hint">' + tierWhy.charAt(0).toUpperCase() + tierWhy.slice(1) + '.' + mp + ' The audit confirms it in writing.</p>'
      };
    };
    var paint = function () {
      steps.forEach(function (s, i) { s.hidden = i !== idx; });
      if (fill) { fill.style.inlineSize = Math.round(((idx + 1) / (steps.length + 1)) * 100) + '%'; }
      if (meta) { meta.textContent = 'STEP ' + (idx + 1) + ' OF ' + steps.length; }
      if (back) { back.hidden = idx === 0; }
      if (next) { next.textContent = idx === steps.length - 1 ? 'See the recommendation' : 'Next'; }
    };
    var collect = function () {
      var step = steps[idx];
      var checked = $$('input:checked', step);
      checked.forEach(function (input) {
        var name = input.name;
        if (name === 'marketplaces') {
          answers.marketplaces = $$('input[name="marketplaces"]:checked', step).map(function (i2) { return i2.value; });
        } else if (answers.hasOwnProperty(name)) {
          answers[name] = input.value;
        }
      });
    };
    if (next) {
      next.addEventListener('click', function () {
        if (idx < steps.length - 1) { collect(); idx += 1; paint(); }
        else {
          collect();
          var rec = recommend();
          if (result) {
            result.hidden = false;
            result.innerHTML = rec.html;
            var link = $('a', result);
            if (link) {
              var q = new URLSearchParams();
              if (answers.revenue) { q.set('revenue', answers.revenue); }
              if (answers.problem) { q.set('goal', answers.problem); }
              if (answers.spend) { q.set('spend', answers.spend); }
              if (answers.marketplaces.length) { q.set('marketplaces', answers.marketplaces.join(',')); }
              link.setAttribute('href', 'contact.html?' + q.toString());
            }
          }
          steps.forEach(function (s) { s.hidden = true; });
          if (back) { back.hidden = true; }
          if (next) { next.hidden = true; }
          if (fill) { fill.style.inlineSize = '100%'; }
          if (meta) { meta.textContent = 'DONE'; }
        }
      });
    }
    if (back) {
      back.addEventListener('click', function () {
        if (idx > 0) { idx -= 1; paint(); }
      });
    }
    paint();
  }

  /* ---------------- contact prefill from estimator ---------------- */
  var contactForm = $('[data-form]');
  if (contactForm && window.location.search) {
    var params = new URLSearchParams(window.location.search);
    var revenue = params.get('revenue');
    var goal = params.get('goal');
    var spend = params.get('spend');
    var marketplaces = params.get('marketplaces');
    var revSel = $('#cf-revenue');
    var goalSel = $('#cf-goal');
    if (revenue && revSel) {
      $$('option', revSel).forEach(function (o) { if (o.value === revenue || o.text === revenue) { revSel.value = o.value || o.text; } });
      if (!revSel.value) {
        var opt = doc.createElement('option');
        opt.textContent = revenue;
        opt.selected = true;
        revSel.appendChild(opt);
      }
    }
    if (goal && goalSel) { goalSel.value = goal; }
    if (marketplaces) {
      marketplaces.split(',').forEach(function (m) {
        var box = $('input[name="marketplace"][value="' + m + '"]', contactForm);
        if (box) { box.checked = true; }
      });
    }
    if ((revenue || spend) && $('#cf-message')) {
      var bits = [];
      if (revenue) { bits.push('Estimator: monthly Amazon revenue around ' + revenue + '.'); }
      if (spend) { bits.push('Current monthly ad spend: ' + spend.replace('spend-', '') + '.'); }
      $('#cf-message').value = bits.join(' ') + '\n';
    }
  }

  /* ---------------- forms ---------------- */
  var emailOk = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); };
  $$('[data-form]').forEach(function (form) {
    var success = $('[data-form-success]', form.parentElement) || $('[data-form-success]', form);
    var validateField = function (field) {
      var input = $('.field__input, .field__select, .field__textarea, .checkbox__input', field);
      if (!input) return true;
      var wrap = input.closest('.field') || field;
      var errEl = $('.field__error', wrap);
      var msg = '';
      var v = (input.value || '').trim();
      if (input.type === 'checkbox') {
        if (input.required && !input.checked) { msg = input.getAttribute('data-msg') || 'Please tick this box to continue.'; }
      } else if (input.required && !v) {
        msg = input.getAttribute('data-msg') || 'This field is required.';
      } else if (v && input.type === 'email' && !emailOk(v)) {
        msg = 'Enter a valid email address, like name@brand.com.';
      } else if (v && input.type === 'url') {
        var candidate = v.indexOf('http') === 0 ? v : 'https://' + v;
        if (!/^https?:\/\/[^\s]+\.[^\s]+/.test(candidate)) { msg = 'Enter a valid URL, like brand.com.'; }
      }
      wrap.classList.toggle('field--invalid', !!msg);
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (errEl) {
        var t = $('.field__error-text', errEl);
        if (t) { t.textContent = msg; }
        if (msg) { input.setAttribute('aria-describedby', errEl.id || ''); }
      }
      return !msg;
    };
    $$('.field, .checkbox', form).forEach(function (field) {
      var input = $('input, select, textarea', field);
      if (!input) return;
      input.addEventListener('blur', function () { validateField(field); });
      input.addEventListener('change', function () { if (field.classList.contains('field--invalid')) { validateField(field); } });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fields = $$('.field, .checkbox', form);
      var allOk = true;
      var firstBad = null;
      fields.forEach(function (field) {
        var ok = validateField(field);
        if (!ok && !firstBad) { firstBad = field; }
        allOk = allOk && ok;
      });
      if (!allOk) {
        var bad = $('input, select, textarea', firstBad);
        if (bad) { bad.focus(); }
        return;
      }
      var btn = $('[type="submit"]', form);
      if (btn) { btn.setAttribute('data-loading', 'true'); btn.setAttribute('aria-busy', 'true'); }
      /* Placeholder submission — wire to the real endpoint later. */
      setTimeout(function () {
        if (btn) { btn.removeAttribute('data-loading'); btn.removeAttribute('aria-busy'); }
        form.hidden = true;
        if (success) {
          success.hidden = false;
          success.setAttribute('tabindex', '-1');
          success.focus();
        }
      }, 900);
    });
  });

  /* newsletter */
  $$('[data-newsletter]').forEach(function (form) {
    var input = $('input[type="email"]', form);
    var status = $('[data-newsletter-status]', form.parentElement) || $('[data-newsletter-status]', form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = (input.value || '').trim();
      var ok = emailOk(v);
      if (status) { status.textContent = ok ? 'Thanks, you are on the list. One email a month.' : 'Enter a valid email address.'; }
      if (ok) { input.value = ''; }
    });
  });

  /* ---------------- cookie notice ---------------- */
  var cookie = $('[data-cookie]');
  if (cookie) {
    var KEY = 'gate79-consent';
    var stored = null;
    try { stored = JSON.parse(window.localStorage.getItem(KEY)); } catch (err) { stored = null; }
    if (!stored) {
      setTimeout(function () {
      cookie.hidden = false;
      document.body.classList.add('cookie-live');
    }, 1200);
    }
    var acceptBtn = $('[data-cookie-accept]', cookie);
    var settingsBtn = $('[data-cookie-settings]', cookie);
    var saveBtn = $('[data-cookie-save]', cookie);
    var panel = $('[data-cookie-panel]', cookie);
    var analytics = $('[data-cookie-analytics]', cookie);
    var store = function (value) {
      try { window.localStorage.setItem(KEY, JSON.stringify(value)); } catch (err) { /* private mode */ }
      cookie.hidden = true;
      document.body.classList.remove('cookie-live');
    };
    if (acceptBtn) { acceptBtn.addEventListener('click', function () { store({ essential: true, analytics: true, at: Date.now() }); }); }
    if (settingsBtn && panel) {
      settingsBtn.addEventListener('click', function () { panel.classList.toggle('is-open'); });
    }
    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        store({ essential: true, analytics: analytics ? analytics.checked : false, at: Date.now() });
      });
    }
  }

  /* ---------------- reading progress + toc ---------------- */
  var progress = $('[data-progress]');
  var updateProgress = function () {
    if (!progress) return;
    var h = doc.documentElement;
    var max = h.scrollHeight - window.innerHeight;
    var r = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    progress.style.transform = 'scaleX(' + r + ')';
  };
  updateProgress();

  var tocLinks = $$('.toc__link');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var heads = tocLinks.map(function (l) { return doc.getElementById(l.getAttribute('href').slice(1)); }).filter(Boolean);
    var hio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          tocLinks.forEach(function (l) {
            l.setAttribute('aria-current', l.getAttribute('href') === '#' + entry.target.id ? 'true' : 'false');
          });
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    heads.forEach(function (h) { hio.observe(h); });
  }

  /* ---------------- accordions (animated details) ---------------- */
  if (!reduceMotion.matches) {
    $$('.faq').forEach(function (details) {
      var summary = $('.faq__q', details);
      var body = $('.faq__a', details);
      if (!summary || !body) return;
      summary.addEventListener('click', function (e) {
        e.preventDefault();
        if (details.open) {
          body.style.height = body.scrollHeight + 'px';
          body.offsetHeight;
          body.style.height = '0px';
          var finish = function () {
            details.removeAttribute('open');
            body.style.height = '';
            body.removeEventListener('transitionend', finish);
          };
          body.addEventListener('transitionend', finish);
        } else {
          details.setAttribute('open', '');
          body.style.height = '0px';
          body.offsetHeight;
          body.style.height = body.scrollHeight + 'px';
          var done = function () {
            body.style.height = '';
            body.removeEventListener('transitionend', done);
          };
          body.addEventListener('transitionend', done);
        }
      });
    });
    $$('.faq__a').forEach(function (body) {
      body.style.transition = 'height 300ms cubic-bezier(.16, 1, .3, 1)';
    });
  }

  /* ---------------- mega menu keyboard navigation ---------------- */
  doc.addEventListener('keydown', function (e) {
    var item = e.target.closest('.dd--mega .mega__item, .dd--mega .mega__all, .dd--mega .mega__foot-link');
    if (!item) return;
    var panel = item.closest('.dd--mega');
    var links = $$('.mega__item, .mega__all, .mega__foot-link', panel);
    var idx = links.indexOf(item);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      var dir = e.key === 'ArrowDown' ? 1 : -1;
      links[(idx + dir + links.length) % links.length].focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      links[0].focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      links[links.length - 1].focus();
    }
  });
})();
