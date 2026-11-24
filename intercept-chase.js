(function() {
  if (window.__mreoInterceptV163) return;
  window.__mreoInterceptV163 = true;

  let lock = false;
  let gameLoop = null;
  let state = null;

  const LANES = ['Левая полоса', 'Центр', 'Правая полоса'];
  const TARGETS = [
    { type: 'speeder', label: 'Тонированный седан', tag: 'НАРУШИТЕЛЬ', pts: 15, color: '#fde047', bg: 'rgba(250,204,21,0.16)', border: 'rgba(250,204,21,0.45)' },
    { type: 'fake', label: 'Блатняк без учёта', tag: 'РОЗЫСК ×2', pts: 35, color: '#4ade80', bg: 'rgba(74,222,128,0.18)', border: 'rgba(74,222,128,0.5)' },
    { type: 'cortege', label: 'Спецкортеж с маяком', tag: 'НЕ ТРОГАТЬ!', pts: -40, color: '#f87171', bg: 'rgba(248,113,113,0.18)', border: 'rgba(248,113,113,0.5)' }
  ];

  function getSaveKey() {
    for (const k of ['mreo_tma_save_v2', 'mreo_tma_save', 'mreo_v1', 'mreo_save']) {
      if (localStorage.getItem(k)) return k;
    }
    return 'mreo_tma_save_v2';
  }

  function getSt() {
    if (window.__mreoBridge && typeof window.__mreoBridge.getS === 'function') {
      const s = window.__mreoBridge.getS();
      if (s) return s;
    }
    try {
      const raw = localStorage.getItem(getSaveKey());
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return { cash: 50000, plates: [] };
  }

  function saveSt(st) {
    if (window.__mreoBridge && typeof window.__mreoBridge.save === 'function') {
      window.__mreoBridge.save();
      return;
    }
    try { localStorage.setItem(getSaveKey(), JSON.stringify(st)); } catch (_) {}
  }

  function notify(msg) {
    if (window.__mreoBridge && typeof window.__mreoBridge.toast === 'function') window.__mreoBridge.toast(msg);
  }

  function rollLanes() {
    const res = [];
    for (let i = 0; i < 3; i++) {
      if (Math.random() < 0.25) {
        res.push(null);
      } else {
        const r = Math.random();
        if (r < 0.48) res.push(TARGETS[0]);
        else if (r < 0.76) res.push(TARGETS[1]);
        else res.push(TARGETS[2]);
      }
    }
    if (!res.some(x => x && x.pts > 0)) {
      res[Math.floor(Math.random() * 3)] = TARGETS[0];
    }
    return res;
  }

  function finishChase() {
    if (gameLoop) {
      clearInterval(gameLoop);
      gameLoop = null;
    }
    if (!state) return;
    const score = Math.max(0, state.score);
    const hits = state.hits;
    const fines = state.fines;
    state = null;

    const st = getSt();
    const cashWin = score * 240;
    st.cash = (Number(st.cash) || 0) + cashWin;

    let trophyMsg = '';
    if (score >= 120) {
      const pool = [
        { f: 'К', d: '707', t: 'МР', reg: '76', val: 48000 },
        { f: 'А', d: '505', t: 'АМ', reg: '77', val: 56000 },
        { f: 'О', d: '808', t: 'ОО', reg: '97', val: 62000 }
      ];
      const pick = pool[Math.floor(Math.random() * pool.length)];
      if (!Array.isArray(st.plates)) st.plates = [];
      st.plates.unshift({
        id: 'chase_' + Date.now() + '_' + Math.floor(Math.random() * 999),
        f: pick.f, d: pick.d, t: pick.t, reg: pick.reg,
        val: pick.val, rar: 'rare'
      });
      trophyMsg = ' + Конфискат ' + pick.f + ' ' + pick.d + ' ' + pick.t + ' ' + pick.reg + ' в Бокс!';
    }

    saveSt(st);
    renderChaseCard();
    notify('Перехват окончен! Очки: ' + score + ' · Премия: +' + cashWin.toLocaleString('ru-RU') + ' ₽' + trophyMsg);
  }

  function startChase() {
    if (gameLoop) clearInterval(gameLoop);
    state = {
      endsAt: Date.now() + 15000,
      score: 0,
      hits: 0,
      fines: 0,
      lanes: rollLanes()
    };
    renderChaseCard();

    gameLoop = setInterval(function() {
      if (!state) return;
      if (Date.now() >= state.endsAt) {
        finishChase();
        return;
      }
      state.lanes = rollLanes();
      renderChaseCard();
    }, 1050);
  }

  function tapLane(laneIdx) {
    if (!state) return;
    const target = state.lanes[laneIdx];
    if (!target) return;

    state.score = Math.max(0, state.score + target.pts);
    if (target.pts > 0) {
      state.hits += 1;
    } else {
      state.fines += 1;
      const st = getSt();
      st.cash = Math.max(0, (Number(st.cash) || 0) - 5000);
      saveSt(st);
      notify('Вы зацепили кортеж с мигалкой! Штраф -5 000 ₽ и -40 очков.');
    }
    state.lanes[laneIdx] = null;
    renderChaseCard();
  }

  function renderChaseCard() {
    const card = document.getElementById('mreo-intercept-card');
    if (!card) return;

    if (!state) {
      card.innerHTML =
        '<div style="display:table;width:100%;margin-bottom:8px;">' +
          '<span style="display:table-cell;text-align:left;vertical-align:middle;font-size:12px;font-weight:900;color:#facc15;letter-spacing:0.03em;">ПЕРЕХВАТ · НОЧНОЙ РЕЙД ДПС</span>' +
          '<span style="display:table-cell;text-align:right;vertical-align:middle;"><span style="display:inline-block;background:rgba(74,222,128,0.16);color:#4ade80;font-size:11px;font-weight:800;padding:2px 8px;border-radius:999px;">Трофей от 120 очк.</span></span>' +
        '</div>' +
        '<div style="font-size:12px;color:#cbd5e1;margin-bottom:10px;line-height:1.4;">15 секунд погони по 3 полосам! Жмите на <b>Нарушителей (+15)</b> и <b>Блатняки (+35)</b>, но не трогайте <b>Спецкортеж (-40 и штраф)</b>.</div>' +
        '<button type="button" class="btn primary" style="width:100%;" data-chase-start="1">Включить люстру · Начать перехват (15 сек)</button>';
      return;
    }

    const secLeft = Math.max(0, Math.ceil((state.endsAt - Date.now()) / 1000));
    const lanesHtml = state.lanes.map((item, idx) => {
      if (!item) {
        return (
          '<div style="padding:10px 12px;border-radius:12px;background:rgba(15,23,42,0.55);border:1px dashed rgba(255,255,255,0.08);display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">' +
            '<span style="font-size:11.5px;color:#64748b;">' + LANES[idx] + ' — чисто</span>' +
            '<span style="font-size:11px;color:#475569;">—</span>' +
          '</div>'
        );
      }
      return (
        '<button type="button" data-chase-lane="' + idx + '" style="width:100%;text-align:left;padding:10px 12px;border-radius:12px;background:' + item.bg + ';border:1px solid ' + item.border + ';display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;cursor:pointer;">' +
          '<div>' +
            '<div style="font-size:11px;font-weight:900;color:' + item.color + ';">' + LANES[idx] + ' · ' + item.tag + '</div>' +
            '<div style="font-size:13px;font-weight:900;color:#fff;margin-top:1px;">' + item.label + '</div>' +
          '</div>' +
          '<span style="font-size:13px;font-weight:900;color:' + item.color + ';flex-shrink:0;">' + (item.pts > 0 ? ('+' + item.pts) : item.pts) + '</span>' +
        '</button>'
      );
    }).join('');

    card.innerHTML =
      '<div style="display:table;width:100%;margin-bottom:8px;">' +
        '<span style="display:table-cell;text-align:left;vertical-align:middle;font-size:12px;font-weight:900;color:#facc15;">ОЧКИ: ' + state.score + ' · ЦЕЛЬ: 120</span>' +
        '<span style="display:table-cell;text-align:right;vertical-align:middle;"><span style="display:inline-block;background:rgba(248,113,113,0.2);color:#f87171;font-size:11.5px;font-weight:900;padding:2px 9px;border-radius:999px;">00:' + String(secLeft).padStart(2, '0') + '</span></span>' +
      '</div>' +
      lanesHtml;
  }

  function injectChaseCard() {
    if (lock) return;
    const view = document.getElementById('view');
    if (!view || document.getElementById('mreo-intercept-card')) return;
    const txt = view.textContent || '';
    const activeTab = document.querySelector('.dock-item.active, nav .active');
    const tabTxt = activeTab ? (activeTab.textContent || '') : '';

    if (!txt.includes('Мини-игры') && !txt.includes('СТАВКИ МРЭО') && !tabTxt.includes('Игры')) return;

    lock = true;
    try {
      const panel = document.createElement('section');
      panel.className = 'panel';
      panel.id = 'mreo-intercept-card';
      panel.style.cssText = 'width:100% !important;box-sizing:border-box !important;margin:0 0 12px 0 !important;padding:13px !important;background:linear-gradient(135deg,#231a2e 0%,#11151f 100%) !important;border:1px solid rgba(250,204,21,0.32) !important;';
      view.insertAdjacentElement('afterbegin', panel);
      renderChaseCard();
    } finally {
      lock = false;
    }
  }

  document.addEventListener('pointerdown', function(e) {
    if (!e.target || !e.target.closest) return;
    if (e.target.closest('[data-chase-start]')) {
      e.preventDefault();
      e.stopImmediatePropagation();
      startChase();
      return;
    }
    const laneBtn = e.target.closest('[data-chase-lane]');
    if (laneBtn) {
      e.preventDefault();
      e.stopImmediatePropagation();
      tapLane(Number(laneBtn.getAttribute('data-chase-lane')));
    }
  }, true);

  function boot() {
    injectChaseCard();
    setInterval(injectChaseCard, 350);
  }

  if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', boot);
  else boot();
})();