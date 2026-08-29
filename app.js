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
  },
  {
    n: 5,
    run: function () {
      // Seed lll_captures_v1 from existing cc_note_* keys AS COPIES, not
      // moves — cc_note_* stays exactly where it is, zero risk of data
      // loss. Enumeration pattern matches the existing _libExportNotes.
      var captures = _lsGet('lll_captures_v1', []);
      var keys = [];
      try {
        for (var i = 0; i < localStorage.length; i++) {
          var k = localStorage.key(i);
          if (k && k.indexOf('cc_note_') === 0 && k.indexOf('cc_note_meta_') !== 0) keys.push(k);
        }
      } catch (e) {}
      keys.forEach(function (k) {
        var text = (localStorage.getItem(k) || '').trim();
        if (!text) return;
        var conceptId = parseInt(k.replace('cc_note_', ''), 10);
        if (isNaN(conceptId)) return;
        var meta = _lsGet('cc_note_meta_' + conceptId, {});
        captures.push({
          id: 'cap_' + (meta.ts || Date.now()) + '_' + conceptId,
          text: text,
          conceptIds: [conceptId],
          words: [],
          boardId: null,
          source: 'concept',
          createdAt: meta.ts || Date.now(),
          usedInDrafts: []
        });
      });
      if (keys.length) _lsSet('lll_captures_v1', captures);
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
   #open={id}) keep using their existing load-time handlers untouched.

   Route table (§3.2) implemented so far: /today, /library[/words[/map]|
   /episodes] with query-string filters, /c/{id}, /w/{word}, /boards,
   /write, /chat. /board/{id} and /write/compose|practice are not real
   routes yet — those ship in phases 4/6/7. */

var _APP_ROUTE = '/today';
var _APP_QUERY = '';

function _routeGo(path, opts) {
  opts = opts || {};
  var full = '/' + (path || '').replace(/^\//, '');
  var qIdx = full.indexOf('?');
  var query = qIdx !== -1 ? full.slice(qIdx + 1) : '';
  var pathname = qIdx !== -1 ? full.slice(0, qIdx) : full;
  var segments = pathname.split('/').filter(Boolean);
  var top = segments[0] || 'today';
  var validTop = ['today', 'library', 'c', 'w', 'boards', 'board', 'write', 'chat'];
  if (validTop.indexOf(top) === -1) { segments = ['today']; top = 'today'; }

  var normalizedPath = '/' + segments.join('/');
  var normalized = normalizedPath + (query ? '?' + query : '');
  _APP_ROUTE = normalizedPath;
  _APP_QUERY = query;
  _lsSet('lll_route_v1', '#' + normalized);
  if (opts.replace) {
    history.replaceState(null, '', '#' + normalized);
  } else {
    history.pushState(null, '', '#' + normalized);
  }

  if (top === 'c' || top === 'w') {
    // Modal routes (§10.1): stack over whatever pane is already showing —
    // do not re-render appMain underneath. Both wait for their data
    // source, same as the Library/Boards panes — openSparkPanel silently
    // no-ops on an empty CONCEPTS array, and _buildGlobalVocabIndex
    // returns [] before episode_meta.json has loaded, so a cold
    // #/c/{id} or #/w/{word} deep-link can otherwise open nothing.
    if (top === 'c') {
      var conceptId = parseInt(segments[1], 10);
      (function openWhenReady() {
        if (!_libDataReady()) { setTimeout(openWhenReady, 200); return; }
        if (typeof openSparkPanel === 'function') openSparkPanel(conceptId);
      })();
    }
    if (top === 'w') {
      var word = decodeURIComponent(segments[1] || '');
      (function openWhenReady() {
        if (typeof EPISODE_META === 'undefined' || !EPISODE_META) {
          if (typeof _loadEpisodeMeta === 'function') { _loadEpisodeMeta().then(openWhenReady); return; }
        }
        _libOpenWordSheet(word);
      })();
    }
    return;
  }

  if (top === 'write' && segments[1] === 'practice') {
    // Reuses the existing Lexi practice overlay wholesale (§7.3 Mode C) —
    // same "trigger the legacy overlay via the router" pattern as boards.
    _setActiveRailItem('/write');
    var practiceWord = _libParseQueryString(query).w || undefined;
    if (typeof _lexiStartSession === 'function') _lexiStartSession(practiceWord);
    return;
  }

  if (top === 'board' && segments[1]) {
    // Canvas overlay owns its own full-screen display and nav mode
    // (see _cvOpen's V3 hooks) — just keep the rail's active state in sync.
    _setActiveRailItem('/boards');
    var alreadyOpenForThisBoard = typeof _CV !== 'undefined' && _CV.folderId === segments[1] &&
      document.getElementById('canvasOverlay') && document.getElementById('canvasOverlay').classList.contains('cv-open');
    if (!alreadyOpenForThisBoard) _boardOpenWhenReady(segments[1]);
    return;
  }

  _renderAppPane(segments, query);
  _setActiveRailItem('/' + top);
  _setNavMode('tabs');
}

window.addEventListener('hashchange', function () {
  var h = location.hash || '';
  if (h.indexOf('#/') !== 0) return; // not ours — leave legacy handlers alone
  _routeGo(h.slice(1), { replace: true });
});

function _renderAppPane(segments, query) {
  var main = document.getElementById('appMain');
  if (!main) return;
  var top = segments[0];
  if (top === 'today') {
    main.innerHTML = '<div class="app-pane"><div class="app-pane-title">Today</div><div class="app-pane-sub">The daily ritual and discovery rails ship in phase 8. For now, use the rail to open your library, boards, and writing tools.</div></div>';
  } else if (top === 'chat') {
    main.innerHTML = '<div class="app-pane"><div class="app-pane-title">Chat</div><div class="app-pane-sub">Grounded chat ships in phase 9, pending the phase 8 go/no-go decision (§17.3).</div></div>';
  } else if (top === 'library') {
    _renderLibraryPane(main, segments, query);
  } else if (top === 'boards') {
    _renderBoardsIndex(main);
  } else if (top === 'write') {
    _renderWritePane(main, segments, query);
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

/* ---- Board route (#/board/{id}) -----------------------------------------
   Reuses the existing _cvOpen()/_cvClose() canvas overlay unchanged — it
   already covers the full viewport at z-index 8000, which is functionally
   the "immersive" experience the doc asks for. _cvOpen/_cvClose gained a
   few surgical hooks (viewport restore/save, data-nav toggle) — see the
   phase 4 commit. This route does not attempt to convert the overlay into
   a true SPA pane; that would be a much larger, riskier rewrite of
   well-tested canvas interaction code for the same practical result. */
function _boardOpen(folderId) {
  _routeGo('/board/' + folderId);
}

/* _cvBuildStage() silently skips any card whose concept isn't in CONCEPTS
   yet (pre-existing behavior, harmless before — _cvOpen was previously
   only ever reached after the app had been open and loaded for a while).
   The router makes #/board/{id} reachable on a cold deep-link boot, which
   can race concepts.json — so this route waits for data readiness the
   same way the Library pane does, instead of silently opening an empty
   canvas. */
function _boardOpenWhenReady(folderId) {
  if (!_libDataReady()) {
    setTimeout(function () { _boardOpenWhenReady(folderId); }, 200);
    return;
  }
  if (typeof _cvOpen === 'function') _cvOpen(folderId);
}

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

/* ---- Library (Phase 3, v3.60) -------------------------------------------
   Unifies the Home drawer's Concepts/Vocab/Episodes tabs (which only ever
   showed saved/favourited subsets — see docs/v3-build-checklist.md) and
   the Read panel (#gvOverlay) into one filterable, three-lens surface.

   Deliberate scope note: legacy tab renderers (_libRenderSaved,
   _libRenderVocab, _libRenderEpisodes) and #gvOverlay are NOT deleted —
   the rail simply no longer points at them. Full removal is a follow-up
   once grep confirms no other caller, per the caution §11.1 itself uses
   for the Lexi retirement. Nothing is deleted in-flight during an
   unattended multi-phase build. */

function _libParseQueryString(q) {
  var out = {};
  (q || '').split('&').forEach(function (pair) {
    if (!pair) return;
    var kv = pair.split('=');
    out[decodeURIComponent(kv[0])] = decodeURIComponent((kv[1] || '').replace(/\+/g, ' '));
  });
  return out;
}

function _libBuildQueryString(params) {
  var parts = [];
  Object.keys(params).forEach(function (k) {
    if (params[k] === '' || params[k] == null || params[k] === false) return;
    parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(params[k]));
  });
  return parts.join('&');
}

function _libSetFilter(lens, key, value) {
  var params = _libParseQueryString(_APP_QUERY);
  if (value === '' || value === false) delete params[key];
  else params[key] = value;
  var qs = _libBuildQueryString(params);
  _routeGo('/library' + (lens !== 'concepts' ? '/' + lens : '') + (qs ? '?' + qs : ''), { replace: true });
}

function _renderLibraryPane(main, segments, query) {
  var lens = segments[1] || 'concepts';
  var sub = segments[2] || '';

  if (lens === 'words' && sub === 'map') {
    main.innerHTML = '<div class="app-pane"><div class="app-pane-title">Opening Word Map…</div></div>';
    if (typeof _openConstellationView === 'function') _openConstellationView('lexi');
    return;
  }
  if (['concepts', 'words', 'episodes'].indexOf(lens) === -1) lens = 'concepts';

  _LIB_TOKEN++;
  var token = _LIB_TOKEN;
  var params = _libParseQueryString(query);
  main.innerHTML =
    '<div class="lib-pane">' +
      '<div class="lib-header">' +
        '<div class="lib-lens-switch">' +
          '<button class="lib-lens-btn' + (lens === 'concepts' ? ' active' : '') + '" onclick="_routeGo(\'/library\')">Concepts</button>' +
          '<button class="lib-lens-btn' + (lens === 'words' ? ' active' : '') + '" onclick="_routeGo(\'/library/words\')">Words</button>' +
          '<button class="lib-lens-btn' + (lens === 'episodes' ? ' active' : '') + '" onclick="_routeGo(\'/library/episodes\')">Episodes</button>' +
        '</div>' +
        '<input class="lib-search-input" type="search" placeholder="Search ' + lens + '…" value="' + (params.q || '').replace(/"/g, '&quot;') + '" oninput="_libSetFilter(\'' + lens + '\', \'q\', this.value)">' +
      '</div>' +
      '<div class="lib-filter-row" id="libFilterRow"></div>' +
      '<div class="lib-count" id="libCount"></div>' +
      '<div class="lib-results" id="libResults"><div class="lib-loading">Loading your library…</div></div>' +
    '</div>';

  _libRenderForLens(lens, params, token);
}

function _libDataReady() {
  return !!(window.CONCEPTS && CONCEPTS.length);
}

var _LIB_TOKEN = 0;

function _libRenderForLens(lens, params, token) {
  if (!_libDataReady()) {
    setTimeout(function () { _libRenderForLens(lens, params, token); }, 200);
    return;
  }
  if (lens === 'concepts') {
    _libRenderConceptsLens(params, token);
  } else if (lens === 'words') {
    if (typeof EPISODE_META !== 'undefined' && EPISODE_META) {
      _libRenderWordsLens(params, token);
    } else if (typeof _loadEpisodeMeta === 'function') {
      _loadEpisodeMeta().then(function () { if (token === _LIB_TOKEN) _libRenderWordsLens(params, token); });
    } else {
      _libRenderWordsLens(params, token);
    }
  } else if (lens === 'episodes') {
    var colsReady = typeof COLLECTIONS_BY_ID !== 'undefined' && Object.keys(COLLECTIONS_BY_ID).length;
    if (colsReady) {
      _libRenderEpisodesLens(params, token);
    } else if (typeof loadCollections === 'function') {
      loadCollections().then(function () { if (token === _LIB_TOKEN) _libRenderEpisodesLens(params, token); });
    } else {
      _libRenderEpisodesLens(params, token);
    }
  }
}

/* ---- Concepts lens ---- */

function _libRenderConceptsLens(params, token) {
  if (token !== undefined && token !== _LIB_TOKEN) return; // navigated away before data resolved
  var filterHost = document.getElementById('libFilterRow');
  if (!filterHost) return;

  var catOptions = (typeof CATEGORIES !== 'undefined' ? CATEGORIES : [])
    .map(function (c) { return '<option value="' + c.id + '"' + (params.cat === c.id ? ' selected' : '') + '>' + c.name + '</option>'; })
    .join('');
  filterHost.innerHTML =
    '<select onchange="_libSetFilter(\'concepts\',\'cat\',this.value)"><option value="">All categories</option>' + catOptions + '</select>' +
    _libToggleChip('concepts', 'pick', params.pick, "Editor's pick") +
    _libToggleChip('concepts', 'saved', params.saved, 'Saved') +
    _libToggleChip('concepts', 'note', params.note, 'Has note') +
    _libToggleChip('concepts', 'board', params.board, 'In a board');

  var masteredTs = _lsGet('lll_mastered_ts_v1', {});
  var pinnedFolders = (typeof _foldersGet === 'function') ? _foldersGet() : [];
  var inAnyBoard = {};
  pinnedFolders.forEach(function (f) { (f.conceptIds || []).forEach(function (id) { inAnyBoard[id] = true; }); });

  var list = CONCEPTS.filter(function (c) {
    if (c.duplicate_of) return false;
    if (params.cat && c.category !== params.cat) return false;
    if (params.pick && c.editors_pick !== true) return false;
    if (params.saved && !masteredTs[c.id]) return false;
    if (params.note && !localStorage.getItem('cc_note_' + c.id)) return false;
    if (params.board && !inAnyBoard[c.id]) return false;
    if (params.q) {
      var hay = ((c.term || '') + ' ' + (c.hook || '')).toLowerCase();
      if (hay.indexOf(params.q.toLowerCase()) === -1) return false;
    }
    return true;
  });

  document.getElementById('libCount').textContent = list.length + (list.length === 1 ? ' concept' : ' concepts');
  _libChunkRender(list, function (c) {
    var cat = (typeof CATEGORIES !== 'undefined' ? CATEGORIES : []).find(function (x) { return x.id === c.category; });
    return '<button class="lib-tile" style="--cat-color:' + (cat ? cat.color : 'var(--accent)') + '" onclick="_routeGo(\'/c/' + c.id + '\')">' +
      '<div class="lib-tile-cat">' + (cat ? cat.icon : '') + '</div>' +
      '<div class="lib-tile-term">' + (c.term || '').replace(/[<>&]/g, '') + '</div>' +
      '<div class="lib-tile-hook">' + (c.hook || '').replace(/[<>&]/g, '') + '</div>' +
      '</button>';
  });
}

function _libToggleChip(lens, key, active, label) {
  return '<button class="lib-chip' + (active ? ' active' : '') + '" onclick="_libSetFilter(\'' + lens + '\',\'' + key + '\',' + (active ? 'false' : 'true') + ')">' + label + '</button>';
}

/* Chunked render: 40 tiles per animation frame, so 600+ concepts don't
   block the main thread on entry — see §6.2 performance note. */
function _libChunkRender(items, tileFn) {
  var host = document.getElementById('libResults');
  if (!host) return;
  host.innerHTML = '<div class="lib-grid" id="libGrid"></div>';
  var grid = document.getElementById('libGrid');
  if (!items.length) {
    host.innerHTML = '<div class="lib-empty">No results. <button class="lib-clear-btn" onclick="_routeGo(\'/library\')">Clear filters</button></div>';
    return;
  }
  var i = 0;
  var CHUNK = 40;
  function step() {
    if (!document.body.contains(grid)) return; // pane navigated away
    var html = '';
    var end = Math.min(i + CHUNK, items.length);
    for (; i < end; i++) html += tileFn(items[i]);
    grid.insertAdjacentHTML('beforeend', html);
    if (i < items.length) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ---- Words lens ---- */

function _libRenderWordsLens(params, token) {
  if (token !== undefined && token !== _LIB_TOKEN) return;
  var filterHost = document.getElementById('libFilterRow');
  if (!filterHost) return;
  var words = (typeof _buildGlobalVocabIndex === 'function') ? _buildGlobalVocabIndex() : [];
  var podcasts = {};
  words.forEach(function (w) { if (w.podcast) podcasts[w.podcast] = true; });
  var podcastOptions = Object.keys(podcasts).sort().map(function (p) {
    return '<option value="' + p + '"' + (params.podcast === p ? ' selected' : '') + '>' + p + '</option>';
  }).join('');

  filterHost.innerHTML =
    '<select onchange="_libSetFilter(\'words\',\'podcast\',this.value)"><option value="">All podcasts</option>' + podcastOptions + '</select>' +
    _libToggleChip('words', 'saved', params.saved, 'In my lexicon') +
    '<a class="lib-map-link" href="#/library/words/map">Map view ↗</a>';

  var lexicon = _lsGet('lll_lexicon_v1', []);
  var savedWords = {};
  (Array.isArray(lexicon) ? lexicon : []).forEach(function (item) {
    var w = (item.word || item.term || '').toLowerCase();
    if (w) savedWords[w] = true;
  });

  var list = words.filter(function (w) {
    if (params.podcast && w.podcast !== params.podcast) return false;
    if (params.saved && !savedWords[w.word.toLowerCase()]) return false;
    if (params.q && w.word.toLowerCase().indexOf(params.q.toLowerCase()) === -1) return false;
    return true;
  });

  document.getElementById('libCount').textContent = list.length + (list.length === 1 ? ' word' : ' words');
  _libChunkRender(list, function (w) {
    return '<button class="lib-tile lib-tile-word" onclick="_routeGo(\'/w/' + encodeURIComponent(w.word) + '\')">' +
      '<div class="lib-tile-term">' + w.word.replace(/[<>&]/g, '') + '</div>' +
      '<div class="lib-tile-hook">' + (w.definition || '').replace(/[<>&]/g, '') + '</div>' +
      '</button>';
  });
}

function _libOpenWordSheet(word) {
  if (document.getElementById('libWordSheet')) return;
  var words = (typeof _buildGlobalVocabIndex === 'function') ? _buildGlobalVocabIndex() : [];
  var w = words.find(function (x) { return x.word.toLowerCase() === word.toLowerCase(); });
  var sheet = document.createElement('div');
  sheet.id = 'libWordSheet';
  sheet.className = 'lib-word-sheet';
  if (!w) {
    sheet.innerHTML = '<div class="lib-word-sheet-inner"><button class="lib-sheet-close" onclick="history.back()">×</button><div>Word not found.</div></div>';
  } else {
    sheet.innerHTML =
      '<div class="lib-word-sheet-inner">' +
        '<button class="lib-sheet-close" onclick="history.back()">×</button>' +
        '<div class="lib-tile-term" style="font-size:1.3rem;">' + w.word.replace(/[<>&]/g, '') + '</div>' +
        '<div class="lib-tile-hook">' + (w.definition || '').replace(/[<>&]/g, '') + '</div>' +
        (w.podcast ? '<div class="app-pane-sub">From ' + w.podcast.replace(/[<>&]/g, '') + '</div>' : '') +
        '<div style="margin-top:16px;display:flex;gap:8px;">' +
          '<button class="app-rail-item" style="width:auto;" onclick="if(typeof _gvAddWordToLexi===\'function\')_gvAddWordToLexi(' + JSON.stringify(w.word) + ');">✦ Add to Lexi</button>' +
          '<button class="app-rail-item" style="width:auto;" onclick="_routeGo(\'/write?w=' + encodeURIComponent(w.word) + '\')">✎ Write</button>' +
        '</div>' +
      '</div>';
  }
  document.body.appendChild(sheet);
  window.addEventListener('popstate', function cleanup() {
    var el = document.getElementById('libWordSheet');
    if (el) el.remove();
    window.removeEventListener('popstate', cleanup);
  }, { once: true });
}

/* ---- Episodes lens ---- */

function _libRenderEpisodesLens(params, token) {
  if (token !== undefined && token !== _LIB_TOKEN) return;
  var filterHost = document.getElementById('libFilterRow');
  if (!filterHost) return;
  var all = (typeof COLLECTIONS_BY_ID !== 'undefined') ? Object.values(COLLECTIONS_BY_ID) : [];
  // _epGetFavs() returns an object keyed by collection id ({colId: true}), not an array.
  var favSet = (typeof _epGetFavs === 'function') ? _epGetFavs() : {};
  var recents = _lsGet('lll_recent_eps_v1', []);
  var recentSet = {}; (Array.isArray(recents) ? recents : []).forEach(function (id) { recentSet[id] = true; });

  var podcasts = {};
  all.forEach(function (c) { if (c.podcast) podcasts[c.podcast] = true; });
  var podcastOptions = Object.keys(podcasts).sort().map(function (p) {
    return '<option value="' + p + '"' + (params.podcast === p ? ' selected' : '') + '>' + p + '</option>';
  }).join('');

  filterHost.innerHTML =
    '<select onchange="_libSetFilter(\'episodes\',\'podcast\',this.value)"><option value="">All podcasts</option>' + podcastOptions + '</select>' +
    _libToggleChip('episodes', 'fav', params.fav, 'Favourited') +
    _libToggleChip('episodes', 'recent', params.recent, 'Recent');

  var list = all.filter(function (c) {
    if (params.podcast && c.podcast !== params.podcast) return false;
    if (params.fav && !favSet[c.id]) return false;
    if (params.recent && !recentSet[c.id]) return false;
    if (params.q) {
      var hay = ((c.title || '') + ' ' + (c.podcast || '')).toLowerCase();
      if (hay.indexOf(params.q.toLowerCase()) === -1) return false;
    }
    return true;
  });

  document.getElementById('libCount').textContent = list.length + (list.length === 1 ? ' episode' : ' episodes');
  _libChunkRender(list, function (col) {
    return '<button class="lib-tile lib-tile-episode" onclick="if(typeof openEpisodeDrawer===\'function\')openEpisodeDrawer(' + JSON.stringify(col.id) + ')">' +
      '<div class="lib-tile-term">' + (col.title || '').replace(/[<>&]/g, '') + '</div>' +
      '<div class="lib-tile-hook">' + (col.podcast || '').replace(/[<>&]/g, '') + '</div>' +
      '</button>';
  });
}

/* ---- Boards (Phase 4, v3.61) ---------------------------------------------
   Boards index (grid of board cards) + viewport persistence + board covers
   + user-drawn connections. Retires the Home drawer entirely — its two
   remaining "open folders tab" call sites in index.html now redirect to
   _routeGo('/boards') (see _folderPickerGoCreate, _importBoard).

   Viewport debounce: the architecture doc gives two different numbers for
   this (400ms in §6.4, 800ms in §10.4). §10.4 reasons about it explicitly
   ("debounced separately and more slowly than layout... the single
   heaviest write in the app") so 800ms — the deliberate, reasoned number —
   is what's implemented; §6.4's 400ms looks like it was copied from the
   layout-save debounce by mistake. */

var _cvViewportSaveTimer = null;
function _cvScheduleSaveViewport() {
  if (_cvViewportSaveTimer) clearTimeout(_cvViewportSaveTimer);
  _cvViewportSaveTimer = setTimeout(_cvSaveViewport, 800);
}
function _cvSaveViewport() {
  if (typeof _CV === 'undefined' || !_CV.folderId || typeof _foldersGet !== 'function') return;
  var folders = _foldersGet();
  var f = folders.find(function (x) { return x.id === _CV.folderId; });
  if (!f) return;
  f.viewport = { x: _CV.panX, y: _CV.panY, z: _CV.zoom };
  f.updatedAt = Date.now();
  _foldersSet(folders);
}

function _folderCounts(f) {
  return {
    concepts: (f.conceptIds || []).length,
    words: (f.vocabWords || []).length,
    notes: (f.noteIds || []).length
  };
}

/* Board cover: up to 4 concepts (coverIds, falling back to the first 4
   conceptIds) shown as small category-coloured dots. No spatial mini-
   render of canvasLayout — that's a materially bigger feature (a scaled
   SVG re-render of the whole canvas) than the schema's own coverIds field
   implies, and coverIds is what V3's data model actually shipped for
   this (§9.3). */
function _boardCoverHTML(f) {
  var ids = (f.coverIds && f.coverIds.length) ? f.coverIds : (f.conceptIds || []).slice(0, 4);
  if (!ids.length) return '<div class="board-cover board-cover-empty">' + (f.icon || '📚') + '</div>';
  var dots = ids.slice(0, 4).map(function (id) {
    var c = (window.CONCEPTS || []).find(function (x) { return x.id === id; });
    var cat = c && typeof CATEGORIES !== 'undefined' ? CATEGORIES.find(function (x) { return x.id === c.category; }) : null;
    return '<div class="board-cover-dot" style="background:' + (cat ? cat.color : 'var(--accent)') + '" title="' + (c ? c.term.replace(/"/g, '') : '') + '"></div>';
  }).join('');
  return '<div class="board-cover">' + dots + '</div>';
}

function _renderBoardsIndex(main) {
  main.innerHTML =
    '<div class="lib-pane">' +
      '<div class="lib-header"><div class="app-pane-title" style="font-size:1.1rem;">Boards</div></div>' +
      '<div class="boards-grid" id="boardsGrid"></div>' +
    '</div>';
  _boardsRenderGrid();
}

function _boardsRenderGrid() {
  var host = document.getElementById('boardsGrid');
  if (!host) return;
  var folders = (typeof _foldersGet === 'function') ? _foldersGet() : [];
  folders = folders.slice().sort(function (a, b) {
    if (!!b.pinned !== !!a.pinned) return b.pinned ? 1 : -1;
    return (b.updatedAt || 0) - (a.updatedAt || 0);
  });

  var cardsHtml = folders.map(function (f) {
    var counts = _folderCounts(f);
    return '<div class="board-card" data-board-id="' + f.id + '">' +
      '<div onclick="_boardOpen(\'' + f.id + '\')" style="cursor:pointer;">' +
        _boardCoverHTML(f) +
        '<div class="board-card-title"><span>' + (f.icon || '📚') + '</span>' + (f.name || '').replace(/[<>&]/g, '') + (f.pinned ? ' ★' : '') + '</div>' +
        '<div class="board-card-meta">' + counts.concepts + ' concepts · ' + counts.words + ' words · ' + counts.notes + ' notes</div>' +
      '</div>' +
      '<div class="board-card-actions">' +
        '<button onclick="_boardsEditPrompt(\'' + f.id + '\')" title="Edit">✎</button>' +
        '<button onclick="_folderDuplicate(\'' + f.id + '\');_boardsRenderGrid();" title="Duplicate">⧉</button>' +
        '<button onclick="_boardsShare(\'' + f.id + '\')" title="Share">↗</button>' +
        '<button onclick="_boardsDelete(\'' + f.id + '\')" title="Delete">🗑</button>' +
      '</div>' +
    '</div>';
  }).join('');

  host.innerHTML =
    '<button class="board-card board-card-new" onclick="_boardsNewPrompt()"><div class="board-cover board-cover-empty">＋</div><div class="board-card-title">New board</div></button>' +
    cardsHtml;
}

function _boardsNewPrompt() {
  var name = prompt('Name your new board:');
  if (!name || !name.trim()) return;
  if (typeof _folderCreate !== 'function') return;
  var f = _folderCreate(name.trim(), '📚', '#7aaf8a');
  _boardsRenderGrid();
  _boardOpen(f.id);
}

function _boardsEditPrompt(folderId) {
  var folders = _foldersGet();
  var f = folders.find(function (x) { return x.id === folderId; });
  if (!f) return;
  var name = prompt('Rename board:', f.name);
  if (name === null) return;
  if (name.trim()) f.name = name.trim();
  f.updatedAt = Date.now();
  _foldersSet(folders);
  _boardsRenderGrid();
}

function _folderDuplicate(folderId) {
  var folders = _foldersGet();
  var f = folders.find(function (x) { return x.id === folderId; });
  if (!f) return;
  var copy = JSON.parse(JSON.stringify(f));
  copy.id = 'f_' + Date.now();
  copy.name = (f.name || 'Board') + ' copy';
  copy.pinned = false;
  copy.createdAt = copy.updatedAt = Date.now();
  folders.push(copy);
  _foldersSet(folders);
}

function _boardsShare(folderId) {
  var folders = _foldersGet();
  var f = folders.find(function (x) { return x.id === folderId; });
  if (!f) return;
  try {
    var data = btoa(unescape(encodeURIComponent(JSON.stringify(f))));
    var url = location.origin + location.pathname + '?import=' + data;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url);
      alert('Share link copied to clipboard.');
    } else {
      prompt('Copy this share link:', url);
    }
  } catch (e) {
    alert('Could not create a share link for this board.');
  }
}

function _boardsDelete(folderId) {
  var folders = _foldersGet();
  var f = folders.find(function (x) { return x.id === folderId; });
  if (!f) return;
  if (!confirm('Delete "' + f.name + '"? This cannot be undone.')) return;
  if (typeof _folderDelete === 'function') _folderDelete(folderId);
  _boardsRenderGrid();
}

/* ---- Connections (user-drawn, §9.3) ---------------------------------
   Distinct from the existing automatic related_ids arrow layer (kept,
   unchanged) — these are deliberate user-drawn links between canvas
   items, one of four kinds, persisted to folder.connections[]. */

var _cvConnectMode = false;
var _cvConnectFrom = null;

function _cvToggleConnectMode() {
  _cvConnectMode = !_cvConnectMode;
  _cvConnectFrom = null;
  var btn = document.getElementById('cvConnectToggle');
  if (btn) btn.classList.toggle('cv-btn-off', !_cvConnectMode);
  var container = document.getElementById('canvasContainer');
  if (container) container.classList.toggle('cv-connecting', _cvConnectMode);
}

/* Scoped to concept cards only for this phase (not notes/labels/vocab/
   links) — those item types have their own element ids that would need
   the same treatment, a reasonable follow-on rather than blocking this.
   Called from cvCard-{id}'s pointerdown (see the one-line interception
   added there) when connect mode is armed. */
function _cvConceptRef(conceptId) { return 'c:' + conceptId; }
function _cvRefEl(ref) {
  var m = /^c:(.+)$/.exec(ref);
  return m ? document.getElementById('cvCard-' + m[1]) : null;
}
function _cvConnectPick(conceptId) {
  if (!_cvConnectMode) return false;
  var ref = _cvConceptRef(conceptId);
  if (!_cvConnectFrom) {
    _cvConnectFrom = ref;
    var el = _cvRefEl(ref);
    if (el) el.classList.add('cv-connect-from');
    return true;
  }
  if (_cvConnectFrom === ref) return true;
  _cvAddConnection(_cvConnectFrom, ref, 'plain');
  var fromEl = _cvRefEl(_cvConnectFrom);
  if (fromEl) fromEl.classList.remove('cv-connect-from');
  _cvConnectFrom = null;
  _cvToggleConnectMode();
  return true;
}

function _cvAddConnection(from, to, kind) {
  if (typeof _CV === 'undefined' || !_CV.folderId) return;
  var folders = _foldersGet();
  var f = folders.find(function (x) { return x.id === _CV.folderId; });
  if (!f) return;
  f.connections = f.connections || [];
  f.connections.push({ from: from, to: to, kind: kind || 'plain', label: '' });
  f.updatedAt = Date.now();
  _foldersSet(folders);
  if (typeof _cvScheduleArrows === 'function') _cvScheduleArrows();
}

function _cvRemoveConnection(index) {
  if (typeof _CV === 'undefined' || !_CV.folderId) return;
  var folders = _foldersGet();
  var f = folders.find(function (x) { return x.id === _CV.folderId; });
  if (!f || !f.connections) return;
  f.connections.splice(index, 1);
  f.updatedAt = Date.now();
  _foldersSet(folders);
  if (typeof _cvScheduleArrows === 'function') _cvScheduleArrows();
}

var _CV_CONNECTION_STROKE = { plain: '', causes: 'cv-conn-causes', contrasts: 'cv-conn-contrasts', supports: 'cv-conn-supports' };

/* Draws user connections into the SAME svg as the automatic related_ids
   arrows, appended after _cvDrawArrows() runs, using its exact centre-
   point math so both layers line up. Ref format 'c:{id}' matches the
   canvas item ref namespace already defined in the data model (§9.3). */
function _cvDrawConnections() {
  if (typeof _CV === 'undefined') return;
  var svg = document.getElementById('canvasArrowLayer');
  var folders = (typeof _foldersGet === 'function') ? _foldersGet() : [];
  var f = folders.find(function (x) { return x.id === _CV.folderId; });
  if (!svg || !f || !f.connections || !f.connections.length) return;

  function centerOf(ref) {
    var el = _cvRefEl(ref);
    if (!el) return null;
    return {
      x: (parseFloat(el.style.left) || 0) + el.offsetWidth / 2 + 2000,
      y: (parseFloat(el.style.top) || 0) + el.offsetHeight / 2 + 2000
    };
  }

  f.connections.forEach(function (conn, i) {
    var from = centerOf(conn.from);
    var to = centerOf(conn.to);
    if (!from || !to) return;
    var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', from.x); line.setAttribute('y1', from.y);
    line.setAttribute('x2', to.x); line.setAttribute('y2', to.y);
    line.setAttribute('class', 'cv-connection ' + (_CV_CONNECTION_STROKE[conn.kind] || ''));
    line.setAttribute('data-conn-index', i);
    line.addEventListener('dblclick', function () {
      if (confirm('Remove this connection?')) _cvRemoveConnection(i);
    });
    svg.appendChild(line);
  });
}

/* Hook into the existing arrow-scheduling loop so user connections
   redraw whenever the automatic related_ids arrows do (same rAF batch,
   same trigger points — no new listeners needed on drag/pan/zoom). */
if (typeof _cvDrawArrows === 'function') {
  var _cvDrawArrowsOriginal = _cvDrawArrows;
  _cvDrawArrows = function () {
    _cvDrawArrowsOriginal();
    _cvDrawConnections();
  };
}

/* ---- Concept detail / Spark — Phase 5, v3.62 (scoped) --------------------
   The architecture doc's §6.3/§10.3 assume the in-place-swap breadcrumb,
   inline note, and Corner all already live inside the Spark panel, and
   that it needs converting from a modal to a pane. Investigation before
   writing any code found all three assumptions wrong: the real
   breadcrumb/swap behavior lives entirely in the Library's inline detail
   row (a different DOM subtree), Corner is a structurally separate
   homepage feature (not a Spark sub-state), and the panel is already
   right-side-sliding (position:fixed, width:min(520px,100vw)) rather
   than a true full-screen modal — its z-index (1100) already sits below
   the app rail (1150), so the rail already stays visually on top and
   interactive with no changes needed.

   Given that, merging breadcrumb+note+Corner into this surface in one
   unattended pass would be a much larger, riskier multi-subsystem
   migration than "Phase 5" as scoped — not a presentational refactor.
   This phase ships only the safe, verifiable part: three new primary
   actions (Write/Board/Save) that didn't exist in the panel before. The
   existing Copy/New/Prev-Next actions are left exactly as they are,
   including their existing cs-post-prompt/cs-hidden visibility gate,
   rather than restructured into a hidden overflow menu — that gate is
   tied to an AI-reveal flow this pass didn't audit closely enough to
   safely alter.

   DEFERRED, and should be its own dedicated, carefully-tested pass:
   porting the Library's breadcrumb/in-place-swap into Spark, inline
   note-taking inside Spark, and embedding Corner as a true sub-state
   (with the scroll-lock ref-counting §10.3 calls for, which doesn't
   exist anywhere in the codebase yet and needs designing from scratch,
   not converting). */

function _spCurrentConceptId() {
  if (typeof _csConceptStack === 'undefined' || typeof _csStackIdx === 'undefined') return null;
  return _csConceptStack[_csStackIdx];
}

function _spWriteAction() {
  var id = _spCurrentConceptId();
  _routeGo('/write' + (id != null ? '?c=' + id : ''));
}

function _spBoardAction(anchorEl) {
  var id = _spCurrentConceptId();
  if (id == null) return;
  if (typeof _folderPickerOpen === 'function') _folderPickerOpen(anchorEl, id);
}

function _spSaveAction(e) {
  if (e) e.stopPropagation();
  var id = _spCurrentConceptId();
  if (id == null || typeof toggleMaster !== 'function') return;
  toggleMaster(e, id);
  _spSyncSaveBtn();
}

function _spSyncSaveBtn() {
  var btn = document.getElementById('spSaveBtn');
  var id = _spCurrentConceptId();
  if (!btn || id == null || typeof mastered === 'undefined') return;
  var isSaved = mastered.has(id);
  btn.classList.toggle('active', isSaved);
  btn.textContent = isSaved ? '✓ Saved' : '✦ Save';
}

/* _renderCSShell runs on every concept load and swap — wrap it (same
   pattern as the _cvDrawArrows hook in phase 4) to keep the Save button
   in sync without touching its internals. */
if (typeof _renderCSShell === 'function') {
  var _renderCSShellOriginal = _renderCSShell;
  _renderCSShell = function (concept) {
    _renderCSShellOriginal(concept);
    _spSyncSaveBtn();
  };
}

/* ---- Write (Phase 6, v3.63) — Capture mode + Practice re-homing --------
   Compose (Mode B) ships in phase 7; the segmented control below already
   shows all three per §7.3 ("one surface, three modes"), with Compose as
   a placeholder until then — same forward-visible-nav pattern used for
   Today/Chat in phase 2. Practice reuses the existing Lexi session
   overlay wholesale (see the router's /write/practice handling and the
   _lexiEndSession patch above). */

function _captureCreate(text, opts) {
  opts = opts || {};
  var captures = _lsGet('lll_captures_v1', []);
  var cap = {
    id: 'cap_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    text: text,
    conceptIds: opts.conceptIds || [],
    words: opts.words || [],
    boardId: opts.boardId || null,
    source: opts.source || 'quick',
    createdAt: Date.now(),
    usedInDrafts: []
  };
  captures.unshift(cap);
  _lsSet('lll_captures_v1', captures);
  return cap;
}

function _captureDelete(id) {
  var captures = _lsGet('lll_captures_v1', []).filter(function (c) { return c.id !== id; });
  _lsSet('lll_captures_v1', captures);
}

/* Always-visible capture input on the concept detail pane (§7.3 North
   Star loop). */
function _spCaptureSend() {
  var input = document.getElementById('spCaptureInput');
  if (!input || !input.value.trim()) return;
  var id = _spCurrentConceptId();
  _captureCreate(input.value.trim(), { conceptIds: id != null ? [id] : [], source: 'concept' });
  input.value = '';
  var row = document.getElementById('spCaptureRow');
  if (row) {
    row.classList.add('sp-capture-sent');
    setTimeout(function () { row.classList.remove('sp-capture-sent'); }, 600);
  }
}

/* ---- @ picker ------------------------------------------------------------
   No existing "@ mention" pattern anywhere in the codebase (checked) —
   built from scratch. Pattern-matches the trimmed-candidate shape
   _cornerGetCandidates already uses elsewhere, but implemented
   independently rather than reusing that function (it's specific to
   Corner's own throwaway Fuse instance and query tuning). */

var _atPicker = { open: false, targetInput: null, results: [], activeIndex: 0, atPos: -1 };

function _atPickerCheck(inputEl) {
  var val = inputEl.value;
  var caret = inputEl.selectionStart;
  var upToCaret = val.slice(0, caret);
  var m = /@([\w-]{0,30})$/.exec(upToCaret);
  if (!m) { _atPickerClose(); return; }
  var query = m[1];
  if (query.length < 1) { _atPickerClose(); return; }
  var results = (window.CONCEPTS || []).filter(function (c) {
    return c.term && c.term.toLowerCase().indexOf(query.toLowerCase()) !== -1;
  }).slice(0, 8);
  if (!results.length) { _atPickerClose(); return; }
  _atPicker.open = true;
  _atPicker.targetInput = inputEl;
  _atPicker.results = results;
  _atPicker.activeIndex = 0;
  _atPicker.atPos = caret - m[0].length;
  _atPickerRender();
}

function _atPickerRender() {
  var host = document.getElementById('atPickerHost');
  if (!host) {
    host = document.createElement('div');
    host.id = 'atPickerHost';
    host.className = 'at-picker';
    document.body.appendChild(host);
  }
  var input = _atPicker.targetInput;
  var r = input.getBoundingClientRect();
  host.style.left = r.left + 'px';
  host.style.top = (r.bottom + 4) + 'px';
  host.style.width = Math.min(r.width, 280) + 'px';
  host.innerHTML = _atPicker.results.map(function (c, i) {
    return '<div class="at-picker-item' + (i === _atPicker.activeIndex ? ' active' : '') + '" onmousedown="event.preventDefault();_atPickerSelect(' + i + ')">' +
      (c.term || '').replace(/[<>&]/g, '') + '</div>';
  }).join('');
  host.style.display = 'block';
}

function _atPickerClose() {
  _atPicker.open = false;
  var host = document.getElementById('atPickerHost');
  if (host) host.style.display = 'none';
}

function _atPickerKeydown(e) {
  if (!_atPicker.open) return false;
  if (e.key === 'ArrowDown') { e.preventDefault(); _atPicker.activeIndex = Math.min(_atPicker.activeIndex + 1, _atPicker.results.length - 1); _atPickerRender(); return true; }
  if (e.key === 'ArrowUp') { e.preventDefault(); _atPicker.activeIndex = Math.max(_atPicker.activeIndex - 1, 0); _atPickerRender(); return true; }
  if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); _atPickerSelect(_atPicker.activeIndex); return true; }
  if (e.key === 'Escape') { _atPickerClose(); return true; }
  return false;
}

function _atPickerSelect(i) {
  var c = _atPicker.results[i];
  var input = _atPicker.targetInput;
  if (!c || !input) { _atPickerClose(); return; }
  var val = input.value;
  var caret = input.selectionStart;
  var before = val.slice(0, _atPicker.atPos);
  var after = val.slice(caret);
  var inserted = '@' + c.term + ' ';
  input.value = before + inserted + after;
  var newCaret = (before + inserted).length;
  input.setSelectionRange(newCaret, newCaret);
  input.focus();
  var linked = input._linkedConceptIds || (input._linkedConceptIds = []);
  if (linked.indexOf(c.id) === -1) linked.push(c.id);
  _atPickerClose();
  if (typeof _writeRenderPendingLinks === 'function') _writeRenderPendingLinks();
}

/* ---- Write pane ----------------------------------------------------- */

function _renderWritePane(main, segments, query) {
  var mode = segments[1] || 'capture';
  if (['capture', 'compose'].indexOf(mode) === -1) mode = 'capture';
  var params = _libParseQueryString(query);

  main.innerHTML =
    '<div class="lib-pane">' +
      '<div class="lib-header">' +
        '<div class="lib-lens-switch">' +
          '<button class="lib-lens-btn' + (mode === 'capture' ? ' active' : '') + '" onclick="_routeGo(\'/write\')">Capture</button>' +
          '<button class="lib-lens-btn' + (mode === 'compose' ? ' active' : '') + '" onclick="_routeGo(\'/write/compose\')">Compose</button>' +
          '<button class="lib-lens-btn" onclick="_routeGo(\'/write/practice\')">Practice</button>' +
        '</div>' +
        '<button class="lib-chip" style="margin-left:auto;" onclick="_voiceOpenSettings()">🎛 Your voice</button>' +
      '</div>' +
      '<div id="writeModeHost" class="write-mode-host"></div>' +
    '</div>';

  if (mode === 'compose') {
    _renderComposeMode();
    return;
  }

  _renderCaptureMode(params);
}

/* ---- Compose (Phase 7, v3.64) ------------------------------------------
   Per §10.5: PICK_SOURCE -> PICK_FORMAT -> SEED -> GENERATING -> EDITING
   -> (FINAL). Calls the new /api/compose endpoint built this phase. Per
   this build's own decision with the user: the endpoint and this UI are
   fully built and syntax-verified, but no live Anthropic call has been
   made — api/compose.js's rate limiter is a documented best-effort
   single-instance stand-in, not the real persistent limiter §14.4 calls
   for, and there's no Anthropic spend alert configured yet. Both are the
   user's to set up before this reaches real traffic. */

var _composeState = { step: 'source', concepts: [], captures: [], format: 'note', regenCount: 0, draft: null };
const BANNED_STRINGS_CLIENT = [
  'unlock', 'leverage', 'game-changer', 'deep dive', 'needle-mover', '10x',
  'hot take', 'at the end of the day', "in today's fast-paced world",
  "here's the thing", 'let that sink in', 'the truth is',
  "most people don't realize", 'a thread', 'buckle up',
  "i'll say it louder for the people in the back"
];
const COMPOSE_FORMATS = [
  { id: 'note', label: 'Note to self', seedRequired: false },
  { id: 'explain', label: 'Explain it simply', seedRequired: false },
  { id: 'talking-point', label: 'Talking point', seedRequired: false },
  { id: 'email', label: 'Email / newsletter', seedRequired: false },
  { id: 'linkedin', label: 'LinkedIn post', seedRequired: true },
  { id: 'thread', label: 'X thread', seedRequired: true }
];

function _renderComposeMode() {
  var host = document.getElementById('writeModeHost');
  if (!host) return;
  if (!_libDataReady() && _composeState.step === 'source') {
    host.innerHTML = '<div class="lib-loading">Loading…</div>';
    setTimeout(_renderComposeMode, 200);
    return;
  }
  if (_composeState.step === 'source') _composeRenderSource(host);
  else if (_composeState.step === 'format') _composeRenderFormat(host);
  else if (_composeState.step === 'seed') _composeRenderSeed(host);
  else if (_composeState.step === 'generating') _composeRenderGenerating(host);
  else if (_composeState.step === 'editing') _composeRenderEditing(host);
  else if (_composeState.step === 'error') _composeRenderError(host);
}

function _composeRenderError(host) {
  host.innerHTML =
    '<div class="app-pane"><div class="app-pane-title">Couldn\'t generate that</div>' +
    '<div class="app-pane-sub">' + (_composeState.errorMessage || 'Something went wrong.').replace(/[<>&]/g, '') + '</div>' +
    '<button class="sp-primary-btn" style="max-width:140px;margin-top:12px;" onclick="_composeState.step=\'format\';_renderComposeMode()">← Try again</button></div>';
}

function _composeRenderSource(host) {
  var masteredTs = _lsGet('lll_mastered_ts_v1', {});
  var recentConceptIds = Object.keys(masteredTs).map(Number).sort(function (a, b) { return masteredTs[b] - masteredTs[a]; }).slice(0, 12);
  var recentConcepts = recentConceptIds.map(function (id) { return (window.CONCEPTS || []).find(function (c) { return c.id === id; }); }).filter(Boolean);
  var captures = _lsGet('lll_captures_v1', []).slice(0, 12);

  host.innerHTML =
    '<div class="app-pane-title" style="text-align:left;margin-bottom:12px;">Compose — pick a source</div>' +
    '<div class="app-pane-sub" style="text-align:left;margin-bottom:12px;">Requires at least one saved concept or capture. Max 3 concepts, 5 captures.</div>' +
    '<div class="compose-source-section">Concepts</div>' +
    '<div class="compose-source-grid">' + recentConcepts.map(function (c) {
      var active = _composeState.concepts.indexOf(c.id) !== -1;
      return '<button class="lib-chip' + (active ? ' active' : '') + '" onclick="_composeToggleConcept(' + c.id + ')">' + c.term.replace(/[<>&]/g, '') + '</button>';
    }).join('') + (!recentConcepts.length ? '<span class="app-pane-sub">Save some concepts first.</span>' : '') + '</div>' +
    '<div class="compose-source-section">Captures</div>' +
    '<div class="compose-source-grid">' + captures.map(function (c) {
      var active = _composeState.captures.indexOf(c.id) !== -1;
      return '<button class="lib-chip' + (active ? ' active' : '') + '" onclick="_composeToggleCapture(\'' + c.id + '\')">' + (c.text || '').slice(0, 40).replace(/[<>&]/g, '') + '</button>';
    }).join('') + (!captures.length ? '<span class="app-pane-sub">Nothing captured yet.</span>' : '') + '</div>' +
    '<button class="sp-primary-btn" style="margin-top:16px;max-width:200px;" onclick="_composeGoFormat()"' +
      ((_composeState.concepts.length + _composeState.captures.length) === 0 ? ' disabled' : '') + '>Next: pick a format →</button>';
}

function _composeToggleConcept(id) {
  var i = _composeState.concepts.indexOf(id);
  if (i !== -1) _composeState.concepts.splice(i, 1);
  else if (_composeState.concepts.length < 3) _composeState.concepts.push(id);
  _renderComposeMode();
}
function _composeToggleCapture(id) {
  var i = _composeState.captures.indexOf(id);
  if (i !== -1) _composeState.captures.splice(i, 1);
  else if (_composeState.captures.length < 5) _composeState.captures.push(id);
  _renderComposeMode();
}
function _composeGoFormat() {
  if (_composeState.concepts.length + _composeState.captures.length === 0) return;
  _composeState.step = 'format';
  _renderComposeMode();
}

function _composeRenderFormat(host) {
  host.innerHTML =
    '<div class="app-pane-title" style="text-align:left;margin-bottom:12px;">Pick a format</div>' +
    '<div class="compose-format-grid">' + COMPOSE_FORMATS.map(function (f) {
      return '<button class="lib-chip' + (_composeState.format === f.id ? ' active' : '') + '" onclick="_composeState.format=\'' + f.id + '\';_renderComposeMode()">' + f.label + (f.seedRequired ? ' *' : '') + '</button>';
    }).join('') + '</div>' +
    '<div class="app-pane-sub" style="text-align:left;margin:8px 0;">* requires a written seed of at least 40 words — Compose rewrites your thinking, it does not invent it (§7.6).</div>' +
    '<div style="display:flex;gap:8px;margin-top:12px;">' +
      '<button class="sp-primary-btn" style="max-width:100px;" onclick="_composeState.step=\'source\';_renderComposeMode()">← Back</button>' +
      '<button class="sp-primary-btn" style="max-width:200px;" onclick="_composeGoSeed()">Next →</button>' +
    '</div>';
}

function _composeGoSeed() {
  var format = COMPOSE_FORMATS.find(function (f) { return f.id === _composeState.format; });
  if (format && format.seedRequired) { _composeState.step = 'seed'; _renderComposeMode(); return; }
  _composeGenerate();
}

function _composeRenderSeed(host) {
  host.innerHTML =
    '<div class="app-pane-title" style="text-align:left;margin-bottom:12px;">Write your seed (40+ words)</div>' +
    '<textarea class="write-capture-ta" id="composeSeedTa" style="width:100%;min-height:120px;border:0.5px solid var(--border);border-radius:8px;padding:12px;" placeholder="What do you actually think? Compose sharpens this, it doesn\'t replace it."></textarea>' +
    '<div class="app-pane-sub" id="composeSeedCount" style="text-align:left;margin:6px 0;">0 words</div>' +
    '<div style="display:flex;gap:8px;">' +
      '<button class="sp-primary-btn" style="max-width:100px;" onclick="_composeState.step=\'format\';_renderComposeMode()">← Back</button>' +
      '<button class="sp-primary-btn" style="max-width:200px;" onclick="_composeSubmitSeed()">Generate →</button>' +
    '</div>';
  document.getElementById('composeSeedTa').addEventListener('input', function () {
    var n = this.value.trim().split(/\s+/).filter(Boolean).length;
    document.getElementById('composeSeedCount').textContent = n + ' words' + (n < 40 ? ' — need at least 40' : '');
  });
}

function _composeSubmitSeed() {
  var ta = document.getElementById('composeSeedTa');
  var n = ta.value.trim().split(/\s+/).filter(Boolean).length;
  if (n < 40) {
    // Blocked with an explanatory message, never a silently disabled
    // button (§7.3).
    document.getElementById('composeSeedCount').textContent = n + ' words — need at least 40 before this format can generate.';
    document.getElementById('composeSeedCount').style.color = 'var(--accent)';
    return;
  }
  _composeState.seedText = ta.value.trim();
  _composeGenerate();
}

function _composeGenerate() {
  _composeState.step = 'generating';
  _renderComposeMode();
  var concepts = _composeState.concepts.map(function (id) { return (window.CONCEPTS || []).find(function (c) { return c.id === id; }); }).filter(Boolean)
    .map(function (c) { return { id: c.id, term: c.term, category: c.category, hook: c.hook, plain: c.plain, analogy: c.analogy, prompt: c.prompt }; });
  var allCaptures = _lsGet('lll_captures_v1', []);
  var captures = _composeState.captures.map(function (id) { return allCaptures.find(function (c) { return c.id === id; }); }).filter(Boolean)
    .map(function (c) { return { text: c.text }; });
  var voice = _lsGet('lll_voice_v1', null);

  var controller = new AbortController();
  var timeout = setTimeout(function () { controller.abort(); }, 25000);

  fetch('/api/compose', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: controller.signal,
    body: JSON.stringify({
      mode: 'draft',
      format: _composeState.format,
      concepts: concepts,
      captures: captures,
      words: [],
      voice: voice,
      userText: _composeState.seedText || ''
    })
  }).then(function (r) {
    clearTimeout(timeout);
    if (!r.ok) return r.json().then(function (e) { throw new Error(e.error || 'Generation failed'); });
    return r.json();
  }).then(function (data) {
    _composeApplyAntiSlop(data);
  }).catch(function (e) {
    _composeState.step = 'error';
    _composeState.errorMessage = e.message || 'Something went wrong.';
    _renderComposeMode();
  });
}

/* Client-side quality gate (docs/ai-voice.md §6) — banned strings (one
   silent retry, then ship+log), em-dash/curly-quote strip (always, no
   retry), provenance check (empty sourceIds is discarded as an error,
   never shipped silently). Not exercised against a live response in
   this build pass — see the phase 7 commit note. */
function _composeApplyAntiSlop(data, isRetry) {
  if (!data.sourceIds || !data.sourceIds.length) {
    _composeState.step = 'error';
    _composeState.errorMessage = 'Draft had no traceable source — discarded rather than shown without provenance.';
    _renderComposeMode();
    return;
  }
  var body = data.body || '';
  var hasBanned = BANNED_STRINGS_CLIENT.some(function (s) { return body.toLowerCase().indexOf(s) !== -1; });
  if (hasBanned && !isRetry) {
    console.log('[compose] banned string detected, retrying once (logged per ai-voice.md §6)');
    _composeGenerate();
    return;
  }
  body = body.replace(/—/g, ', ').replace(/[‘’]/g, "'").replace(/[“”]/g, '"');
  _composeState.draft = { body: body, sourceIds: data.sourceIds, wordCount: data.wordCount, attribution: true, status: 'draft' };
  _composeState.step = 'editing';
  _renderComposeMode();
}

function _composeRenderGenerating(host) {
  host.innerHTML = '<div class="app-pane"><div class="app-pane-title">Generating…</div><div class="app-pane-sub">One draft, in your voice, grounded in what you selected.</div></div>';
}

function _composeRenderEditing(host) {
  var d = _composeState.draft;
  if (!d) { _composeState.step = 'source'; _renderComposeMode(); return; }
  var sourceTerms = d.sourceIds.map(function (id) {
    var c = (window.CONCEPTS || []).find(function (x) { return x.id === id; });
    return c ? c.term : id;
  }).join(', ');

  host.innerHTML =
    '<textarea class="write-capture-ta" id="composeDraftTa" style="width:100%;min-height:180px;border:0.5px solid var(--border);border-radius:8px;padding:12px;">' + d.body.replace(/</g, '&lt;') + '</textarea>' +
    '<div class="app-pane-sub" style="text-align:left;margin:8px 0;font-family:\'DM Mono\',monospace;">Built from ' + d.sourceIds.length + ' concept' + (d.sourceIds.length !== 1 ? 's' : '') + ' · ' + sourceTerms.replace(/[<>&]/g, '') + '</div>' +
    '<label class="app-pane-sub" style="display:flex;align-items:center;gap:6px;text-align:left;"><input type="checkbox" id="composeAttribution" ' + (d.attribution ? 'checked' : '') + '> Include attribution line when copying</label>' +
    '<div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;">' +
      '<button class="sp-primary-btn" style="max-width:140px;" onclick="_composeCopy()">Copy</button>' +
      '<button class="sp-primary-btn" style="max-width:160px;" onclick="_composeRegenerate()"' + (_composeState.regenCount >= 3 ? ' disabled title="Edit it yourself"' : '') + '>' + (_composeState.regenCount >= 3 ? 'Edit it yourself' : 'Regenerate (' + (3 - _composeState.regenCount) + ' left)') + '</button>' +
      '<button class="sp-primary-btn" style="max-width:140px;" onclick="_composeMarkFinal()">Mark final</button>' +
      '<button class="sp-primary-btn" style="max-width:100px;" onclick="_composeState.step=\'source\';_composeState.draft=null;_composeState.regenCount=0;_renderComposeMode()">New</button>' +
    '</div>';
}

function _composeRegenerate() {
  if (_composeState.regenCount >= 3) return;
  _composeState.regenCount++;
  _composeGenerate();
}

function _composeCopy() {
  var ta = document.getElementById('composeDraftTa');
  var attrChecked = document.getElementById('composeAttribution')?.checked;
  var text = ta ? ta.value : '';
  if (attrChecked) {
    var sourceTerms = _composeState.draft.sourceIds.map(function (id) {
      var c = (window.CONCEPTS || []).find(function (x) { return x.id === id; });
      return c ? c.term : id;
    }).join(', ');
    text += '\n\n(Built with Epistemic, from: ' + sourceTerms + ')';
  }
  if (navigator.clipboard) navigator.clipboard.writeText(text);
}

function _composeMarkFinal() {
  var ta = document.getElementById('composeDraftTa');
  var drafts = _lsGet('lll_drafts_v1', []);
  drafts.unshift({
    id: 'dr_' + Date.now(),
    format: _composeState.format,
    seed: _composeState.seedText || '',
    sourceIds: _composeState.draft.sourceIds,
    captureIds: _composeState.captures.slice(),
    body: ta ? ta.value : _composeState.draft.body,
    aiBody: _composeState.draft.body,
    attribution: document.getElementById('composeAttribution')?.checked !== false,
    boardId: null,
    status: 'final',
    createdAt: Date.now(),
    updatedAt: Date.now()
  });
  _lsSet('lll_drafts_v1', drafts);
  _composeState = { step: 'source', concepts: [], captures: [], format: 'note', regenCount: 0, draft: null };
  _renderComposeMode();
}

function _renderCaptureMode(params) {
  var host = document.getElementById('writeModeHost');
  if (!host) return;
  if (!_libDataReady()) {
    // Never clobber text the user may have already started typing while
    // this was retrying — only render the loading state pre-first-paint.
    var existingTa = document.getElementById('writeCaptureTa');
    if (existingTa && existingTa.value.trim()) { setTimeout(function () { _renderCaptureMode(params); }, 200); return; }
    host.innerHTML = '<div class="lib-loading">Loading…</div>';
    setTimeout(function () { _renderCaptureMode(params); }, 200);
    return;
  }
  var preConceptId = params.c != null ? parseInt(params.c, 10) : null;
  var preWord = params.w || null;
  var preConcept = preConceptId != null ? (window.CONCEPTS || []).find(function (c) { return c.id === preConceptId; }) : null;

  host.innerHTML =
    '<div class="write-capture-box">' +
      (preConcept || preWord ? '<div class="write-prelink-chip">Linked to: ' + (preConcept ? preConcept.term : preWord).replace(/[<>&]/g, '') + '</div>' : '') +
      '<textarea class="write-capture-ta" id="writeCaptureTa" placeholder="What do you want to remember? Type @ to link a concept." ' +
        'oninput="if(typeof _atPickerCheck===\'function\')_atPickerCheck(this)" ' +
        'onkeydown="if(typeof _atPickerKeydown===\'function\'&&_atPickerKeydown(event))return; if((event.metaKey||event.ctrlKey)&&event.key===\'Enter\'){event.preventDefault();_writeCaptureSubmit();}"></textarea>' +
      '<div class="write-pending-links" id="writePendingLinks"></div>' +
      '<div class="write-capture-hint">⌘Enter to save</div>' +
    '</div>' +
    '<div class="write-capture-list" id="writeCaptureList"></div>';

  if (preConceptId != null) document.getElementById('writeCaptureTa')._linkedConceptIds = [preConceptId];
  document.getElementById('writeCaptureTa')._linkedWords = preWord ? [preWord] : [];
  document.getElementById('writeCaptureTa').focus();
  _writeRenderCaptureList();
}

function _writeRenderPendingLinks() {
  var ta = document.getElementById('writeCaptureTa');
  var host = document.getElementById('writePendingLinks');
  if (!ta || !host) return;
  var ids = ta._linkedConceptIds || [];
  host.innerHTML = ids.map(function (id) {
    var c = (window.CONCEPTS || []).find(function (x) { return x.id === id; });
    return '<span class="lib-chip active">' + (c ? c.term.replace(/[<>&]/g, '') : id) + '</span>';
  }).join('');
}

function _writeCaptureSubmit() {
  var ta = document.getElementById('writeCaptureTa');
  if (!ta || !ta.value.trim()) return;
  _captureCreate(ta.value.trim(), {
    conceptIds: ta._linkedConceptIds || [],
    words: ta._linkedWords || [],
    source: (ta._linkedConceptIds || []).length ? 'concept' : 'quick'
  });
  ta.value = '';
  ta._linkedConceptIds = [];
  ta._linkedWords = [];
  _writeRenderPendingLinks();
  _writeRenderCaptureList();
  ta.focus();
}

function _writeRenderCaptureList() {
  var host = document.getElementById('writeCaptureList');
  if (!host) return;
  var captures = _lsGet('lll_captures_v1', []).slice().sort(function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });
  if (!captures.length) {
    host.innerHTML = '<div class="lib-empty">Nothing captured yet.</div>';
    return;
  }
  var groups = {};
  var order = [];
  captures.forEach(function (c) {
    var day = new Date(c.createdAt || 0).toDateString();
    if (!groups[day]) { groups[day] = []; order.push(day); }
    groups[day].push(c);
  });
  host.innerHTML = order.map(function (day) {
    var rows = groups[day].map(function (c) {
      var chips = (c.conceptIds || []).map(function (id) {
        var concept = (window.CONCEPTS || []).find(function (x) { return x.id === id; });
        return concept ? '<span class="lib-chip">' + concept.term.replace(/[<>&]/g, '') + '</span>' : '';
      }).join('');
      return '<div class="write-capture-row">' +
        '<div class="write-capture-text">' + (c.text || '').replace(/[<>&]/g, '') + '</div>' +
        (chips ? '<div class="write-capture-chips">' + chips + '</div>' : '') +
        '<button class="write-capture-del" onclick="_captureDelete(\'' + c.id + '\');_writeRenderCaptureList();" title="Delete">✕</button>' +
      '</div>';
    }).join('');
    return '<div class="write-capture-day">' + day + '</div>' + rows;
  }).join('');
}

/* ---- Voice profile settings (§7.4 Layer 2, dials only — sample-based
   extraction and edit-learning are voice-extract/voice-update API calls,
   deferred alongside the rest of live-API testing this phase). --------- */

var _VOICE_DIALS = {
  register: ['formal', 'neutral', 'casual'],
  stance: ['observational', 'personal'],
  edge: ['warm', 'direct', 'sharp'],
  length: ['short', 'mixed', 'flowing'],
  humour: ['off', 'dry', 'on']
};

function _voiceOpenSettings() {
  if (document.getElementById('voiceSettingsModal')) return;
  var v = _lsGet('lll_voice_v1', { dials: { register: 'neutral', stance: 'personal', edge: 'direct', length: 'mixed', humour: 'dry' }, firstLanguage: '' });
  var modal = document.createElement('div');
  modal.id = 'voiceSettingsModal';
  modal.className = 'lib-word-sheet';
  modal.innerHTML =
    '<div class="lib-word-sheet-inner">' +
      '<button class="lib-sheet-close" onclick="document.getElementById(\'voiceSettingsModal\').remove()">×</button>' +
      '<div class="lib-tile-term" style="font-size:1.1rem;margin-bottom:12px;">Your voice</div>' +
      Object.keys(_VOICE_DIALS).map(function (dial) {
        return '<div class="app-pane-sub" style="text-align:left;margin-top:10px;text-transform:capitalize;">' + dial + '</div>' +
          '<div class="lib-filter-row" style="padding:4px 0;">' + _VOICE_DIALS[dial].map(function (val) {
            return '<button class="lib-chip' + (v.dials[dial] === val ? ' active' : '') + '" onclick="_voiceSetDial(\'' + dial + '\',\'' + val + '\')">' + val + '</button>';
          }).join('') + '</div>';
      }).join('') +
      '<div class="app-pane-sub" style="text-align:left;margin-top:10px;">First language (optional)</div>' +
      '<input class="lib-search-input" id="voiceFirstLang" value="' + (v.firstLanguage || '').replace(/"/g, '') + '" placeholder="e.g. Hungarian" style="margin-top:4px;" onchange="_voiceSetFirstLanguage(this.value)">' +
    '</div>';
  document.body.appendChild(modal);
}

function _voiceSetDial(dial, val) {
  var v = _lsGet('lll_voice_v1', { dials: {}, firstLanguage: '' });
  v.dials = v.dials || {};
  v.dials[dial] = val;
  _lsSet('lll_voice_v1', v);
  document.getElementById('voiceSettingsModal').remove();
  _voiceOpenSettings();
}

function _voiceSetFirstLanguage(val) {
  var v = _lsGet('lll_voice_v1', { dials: {}, firstLanguage: '' });
  v.firstLanguage = val;
  _lsSet('lll_voice_v1', v);
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
