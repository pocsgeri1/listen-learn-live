/* ==========================================================================
   Epistemic V3 — app shell script (Phase 2, v3.59)
   New code only — see docs/v3-architecture.md §17.1 and §2/§3/§10.1.

   Scope for this phase: shell toggle, router skeleton, left rail + mobile
   tab bar, migrations 1-2, and the _lsSet() safety helper. Rail items for
   Library/Boards/Write open the EXISTING legacy overlays unchanged —
   those surfaces don't get real routed panes until phases 3-6.
   ========================================================================== */

/* ---- Safe storage helpers --------------------------------------------- */

function _lsSet(key, value) {
  try {
    var v = (typeof value === 'string') ? value : JSON.stringify(value);
    localStorage.setItem(key, v);
    return true;
  } catch (e) {
    console.error('_lsSet failed for', key, e);
    _lsShowQuotaModal();
    return false;
  }
}

function _lsGet(key, fallback) {
  try {
    var raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    try { return JSON.parse(raw); } catch (e2) { return raw; }
  } catch (e) {
    return fallback;
  }
}

function _lsHasAnyEpistemicKey() {
  try {
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k && k.indexOf('lll_') === 0) return true;
    }
  } catch (e) {}
  return false;
}

function _lsShowQuotaModal() {
  if (document.getElementById('appQuotaModal')) return;
  var m = document.createElement('div');
  m.id = 'appQuotaModal';
  m.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;';
  m.innerHTML =
    '<div style="background:var(--bg);color:var(--text);border:1px solid var(--border);border-radius:12px;padding:24px;max-width:320px;font-family:\'DM Sans\',sans-serif;">' +
      '<div style="font-size:1rem;margin-bottom:8px;">Storage is full</div>' +
      '<div style="font-size:0.85rem;opacity:0.7;margin-bottom:16px;">Your browser would not save that change. Export a backup now so nothing is lost, then free up space.</div>' +
      '<button onclick="_lsExportAll();document.getElementById(\'appQuotaModal\').remove();" style="width:100%;padding:10px;border-radius:8px;border:none;background:var(--accent);color:var(--bg);cursor:pointer;margin-bottom:8px;">Export backup</button>' +
      '<button onclick="document.getElementById(\'appQuotaModal\').remove();" style="width:100%;padding:10px;border-radius:8px;border:1px solid var(--border);background:none;color:var(--text);cursor:pointer;">Dismiss</button>' +
    '</div>';
  document.body.appendChild(m);
}

/* ---- Export / import (pulled forward from phase 11 per §14.1 —
   "the seatbelt", should exist before V3 asks users to invest more) --- */

function _lsExportAll() {
  var dump = {};
  try {
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k && (k.indexOf('lll_') === 0 || k.indexOf('ep_') === 0 || k.indexOf('cc_note') === 0)) {
        dump[k] = localStorage.getItem(k);
      }
    }
  } catch (e) {}
  var blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  var date = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = 'epistemic-backup-' + date + '.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
}

function _lsImportPrompt() {
  var input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  input.onchange = function () {
    var file = input.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(reader.result);
        Object.keys(data).forEach(function (k) { _lsSet(k, data[k]); });
        alert('Backup restored. Reloading…');
        location.reload();
      } catch (e) {
        alert('That file could not be read as an Epistemic backup.');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

/* ---- Migrations ---------------------------------------------------------
   Numbered, idempotent, guarded by lll_migrations_v1. See
   docs/v3-build-checklist.md for the full ledger — only migrations shipped
   in the current phase are listed here; later phases append to this array. */

var _MIGRATIONS = [
  {
    n: 1,
    run: function () {
      if (!localStorage.getItem('lll_user_id')) {
        var uuid = (crypto.randomUUID ? crypto.randomUUID() :
          'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          }));
        _lsSet('lll_user_id', uuid);
      }
    }
  },
  {
    n: 2,
    run: function () {
      var folders = _lsGet('lll_folders_v1', []);
      if (!Array.isArray(folders) || !folders.length) return;
      var changed = false;
      folders.forEach(function (f) {
        if (f.schema) return;
        f.viewport = f.viewport || { x: 0, y: 0, z: 1 };
        f.connections = f.connections || [];
        f.captureIds = f.captureIds || [];
        f.draftIds = f.draftIds || [];
        f.coverIds = f.coverIds || [];
        f.tagIds = f.tagIds || [];
        f.chatThreadId = f.chatThreadId || null;
        f.schema = 3;
        changed = true;
      });
      if (changed) _lsSet('lll_folders_v1', folders);
    }
  }
];

function _runMigrations() {
  var applied = _lsGet('lll_migrations_v1', []);
  if (!Array.isArray(applied)) applied = [];
  var didWork = false;
  _MIGRATIONS.forEach(function (m) {
    if (applied.indexOf(m.n) === -1) {
      m.run();
      applied.push(m.n);
      didWork = true;
    }
  });
  if (didWork) _lsSet('lll_migrations_v1', applied);
}

/* ---- Router -------------------------------------------------------------
   Router owns hash routes (#/...) only. Legacy hashes (#home, #canvas-{id},
   #open={id}) keep using their existing load-time handlers untouched. */

var _APP_ROUTE = '/today';

function _routeGo(path, opts) {
  opts = opts || {};
  var valid = ['/today', '/library', '/boards', '/write', '/chat'];
  var base = '/' + (path || '').replace(/^\//, '').split('/')[0];
  if (valid.indexOf(base) === -1) base = '/today';
  _APP_ROUTE = base;
  _lsSet('lll_route_v1', '#' + base);
  if (opts.replace) {
    history.replaceState(null, '', '#' + base);
  } else {
    history.pushState(null, '', '#' + base);
  }
  _renderAppPane(base);
  _setActiveRailItem(base);
  if (base === '/board' || base === '/write/practice') {
    _setNavMode('immersive');
  } else {
    _setNavMode('tabs');
  }
}

window.addEventListener('hashchange', function () {
  var h = location.hash || '';
  if (h.indexOf('#/') !== 0) return; // not ours — leave legacy handlers alone
  _routeGo(h.slice(1), { replace: true });
});

function _renderAppPane(route) {
  var main = document.getElementById('appMain');
  if (!main) return;
  if (route === '/today') {
    main.innerHTML = '<div class="app-pane"><div class="app-pane-title">Today</div><div class="app-pane-sub">The daily ritual and discovery rails ship in phase 8. For now, use the rail to open your library, boards, and writing tools.</div></div>';
  } else if (route === '/chat') {
    main.innerHTML = '<div class="app-pane"><div class="app-pane-title">Chat</div><div class="app-pane-sub">Grounded chat ships in phase 9, pending the phase 8 go/no-go decision (§17.3).</div></div>';
  } else if (route === '/library') {
    main.innerHTML = '<div class="app-pane"><div class="app-pane-title">Library</div><div class="app-pane-sub">Opening your library…</div></div>';
    if (typeof openLibrary === 'function') openLibrary('concepts');
  } else if (route === '/boards') {
    main.innerHTML = '<div class="app-pane"><div class="app-pane-title">Boards</div><div class="app-pane-sub">Opening your boards…</div></div>';
    if (typeof openLibrary === 'function') openLibrary('folders');
  } else if (route === '/write') {
    main.innerHTML = '<div class="app-pane"><div class="app-pane-title">Write</div><div class="app-pane-sub">Opening…</div></div>';
    if (typeof openLexiconPanel === 'function') openLexiconPanel();
  } else {
    main.innerHTML = '<div class="app-pane"><div class="app-pane-title">Opening…</div></div>';
  }
}

/* ---- Rail item actions -------------------------------------------------
   All routes (rail click, deep link, or reload) go through _routeGo so
   the legacy overlay opens consistently regardless of entry point. */

function _railToday() { _routeGo('/today'); }
function _railChat() { _routeGo('/chat'); }
function _railLibrary() { _routeGo('/library'); }
function _railBoards() { _routeGo('/boards'); }
function _railWrite() { _routeGo('/write'); }

function _setActiveRailItem(route) {
  document.querySelectorAll('.app-rail-item[data-route], .app-tab-item[data-route]').forEach(function (el) {
    el.classList.toggle('active', el.getAttribute('data-route') === route);
  });
}

/* ---- Pinned boards (rail) ---------------------------------------------
   "The highest-value part of the rail... do not cut it" — §3.1. Reads the
   existing lll_folders_v1 store; a folder must be pinned to show here. */

function _renderPinnedBoards() {
  var folders = (typeof _foldersGet === 'function') ? _foldersGet() : [];
  var pinned = folders.filter(function (f) { return f.pinned; }).slice(0, 5);
  var html = pinned.map(function (f) {
    var count = (f.conceptIds || []).length;
    return '<button class="app-rail-item" onclick="if(typeof _cvOpen===\'function\')_cvOpen(\'' + f.id + '\')">' +
      '<span class="app-rail-item-glyph">' + (f.icon || '📚') + '</span>' +
      '<span class="app-rail-item-label">' + (f.name || '').replace(/[<>&]/g, '') + '</span>' +
      '<span style="margin-left:auto;opacity:.5;font-size:.75rem;">' + count + '</span>' +
      '</button>';
  }).join('');
  ['appRailBoards', 'appDrawerBoards'].forEach(function (id) {
    var host = document.getElementById(id);
    if (host) host.innerHTML = html;
  });
}

function _folderTogglePin(folderId) {
  var arr = (typeof _foldersGet === 'function') ? _foldersGet() : [];
  var f = arr.find(function (x) { return x.id === folderId; });
  if (!f) return;
  f.pinned = !f.pinned;
  if (typeof _foldersSet === 'function') _foldersSet(arr);
  var btn = document.querySelector('.folder-item-pin-btn[data-folder-id="' + folderId + '"]');
  if (btn) btn.classList.toggle('pinned', f.pinned);
  _renderPinnedBoards();
}

/* ---- Rail collapse ------------------------------------------------------ */

function _railToggleCollapse() {
  var collapsed = document.body.getAttribute('data-rail') === 'collapsed';
  document.body.setAttribute('data-rail', collapsed ? '' : 'collapsed');
  var ui = _lsGet('lll_ui_v1', {});
  ui.railCollapsed = !collapsed;
  _lsSet('lll_ui_v1', ui);
}

/* ---- Mobile nav modes (tabs | drawer | immersive) --------------------- */

function _setNavMode(mode) {
  document.body.setAttribute('data-nav', mode);
}

function _appOpenDrawer() { _setNavMode('drawer'); }
function _appCloseDrawer() { _setNavMode('tabs'); }

/* ---- Shell escape hatches (history.pushState — no reload, per §2) ---- */

function _appEnterFromSite() {
  document.body.setAttribute('data-shell', 'app');
  _routeGo('/today', { replace: true });
}

function _appReturnToSite() {
  document.body.setAttribute('data-shell', 'site');
  history.pushState(null, '', location.pathname);
}

/* ---- Boot ---------------------------------------------------------------
   The initial data-shell attribute is already set synchronously inline
   (before <nav>) to avoid a flash — this just brings the rest of the app
   shell online for that boot state. */

(function _appBoot() {
  _runMigrations();
  if (document.body.getAttribute('data-shell') !== 'app') return;
  _renderPinnedBoards();
  var hash = location.hash || '';
  var initial = (hash.indexOf('#/') === 0) ? hash.slice(1) : '/today';
  _routeGo(initial, { replace: true });
})();
