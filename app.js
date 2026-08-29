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
    // do not re-render appMain underneath.
    if (top === 'c' && typeof openSparkPanel === 'function') openSparkPanel(parseInt(segments[1], 10));
    if (top === 'w') _libOpenWordSheet(decodeURIComponent(segments[1] || ''));
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
