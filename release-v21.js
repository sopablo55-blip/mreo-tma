(function() {
  if (window.__mreoRelV21) return;
  window.__mreoRelV21 = true;
  const PATCH = 'v2.1';
  const TIERS = [
    { lvl: 1, xp: 40, name: 'Этап 1 · Стартовый капитал', rew: '+15 000 ₽', cash: 15000 },
    { lvl: 2, xp: 120, name: 'Этап 2 · Талоны инспектора', rew: '+3 талона', free: 3 },
    { lvl: 3, xp: 250, name: 'Этап 3 · Премия отдела', rew: '+40 000 ₽ и +5 репутации', cash: 40000, rep: 5 },
    { lvl: 4, xp: 450, name: 'Этап 4 · Резервный фонд', rew: '+90 000 ₽', cash: 90000 },
    { lvl: 5, xp: 750, name: 'Этап 5 · Спецрезерв РФ', rew: '+250 000 ₽ и В 777 ОР 77', cash: 250000, plate: true }
  ];

  function getKey() {
    for (const k of ['mreo_tma_save_v2', 'mreo_tma_save', 'mreo_v1', 'mreo_save']) {
      if (localStorage.getItem(k)) return k;
    }
    return 'mreo_tma_save_v2';
  }
  function getSt() {
    if (window.__mreoBridge && window.__mreoBridge.getS) return window.__mreoBridge.getS();
    try { const r = localStorage.getItem(getKey()); if (r) return JSON.parse(r); } catch (_) {}
    return { cash: 50000, plates: [] };
  }
  function saveSt(st) {
    if (window.__mreoBridge && window.__mreoBridge.save) { window.__mreoBridge.save(); return; }
    try { localStorage.setItem(getKey(), JSON.stringify(st)); } catch (_) {}
  }
  function toast(m) {
    if (window.__mreoBridge && window.__mreoBridge.toast) window.__mreoBridge.toast(m);
  }

  function showModal() {
    const st = getSt() || {};
    if (st.seenPatch === PATCH || document.getElementById('mreo-patch-modal')) return;
    const d = document.createElement('div');
    d.id = 'mreo-patch-modal';
    d.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(6,10,18,0.88);display:flex;align-items:center;justify-content:center;padding:16px;';
    d.innerHTML =
      '<div style="width:100%;max-width:380px;background:linear-gradient(145deg,#1d2436,#10141f);border:1px solid rgba(250,204,21,0.45);border-radius:20px;padding:18px;color:#fff;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
          '<span style="font-size:11px;font-weight:900;color:#facc15;">ОБНОВЛЕНИЕ ' + PATCH + '</span>' +
          '<span style="background:rgba(74,222,128,0.18);color:#4ade80;font-size:10.5px;font-weight:800;padding:2px 8px;border-radius:999px;">Прогресс сохранён</span>' +
        '</div>' +
        '<div style="font-size:16px;font-weight:900;margin-bottom:8px;">Сезонный пропуск и Госзаказ РФ</div>' +
        '<div style="font-size:12px;color:#cbd5e1;line-height:1.45;margin-bottom:14px;">' +
          '<div>• Все деньги, авто, номера, репутация и доли перенесены без потерь.</div>' +
          '<div style="margin-top:4px;">• В Профиле открыт <b>Сезонный пропуск МРЭО</b> с наградами до 250 000 ₽ и номером <b>В 777 ОР 77</b>.</div>' +
        '</div>' +
        '<button type="button" class="btn primary" style="width:100%;padding:12px;" data-claim-v21="1">Забрать бонус обновления (+25 000 ₽ и +2 талона)</button>' +
      '</div>';
    document.body.appendChild(d);
  }

  function renderPass() {
    const card = document.getElementById('mreo-season-pass-card');
    if (!card) return;
    const st = getSt() || {};
    const xp = Number(st.seasonXp) || 0;
    const cl = Array.isArray(st.seasonClaimed) ? st.seasonClaimed : [];
    const rows = TIERS.map(t => {
      const done = cl.includes(t.lvl);
      const can = !done && xp >= t.xp;
      return '<div class="mreo-ext-row' + (can ? ' is-mine' : '') + '">' +
        '<div><b style="font-size:12.5px;color:#fff;">' + t.name + '</b>' +
        '<div style="font-size:11px;color:#94a3b8;">' + t.rew + ' · ' + t.xp + ' XP</div></div>' +
        (done ? '<span style="font-size:11px;color:#64748b;">Получено</span>' :
         (can ? '<button type="button" class="btn small primary" data-pass-get="' + t.lvl + '">Забрать</button>' :
          '<span style="font-size:11px;color:#94a3b8;">' + Math.min(100, Math.floor((xp / t.xp) * 100)) + '%</span>')) +
      '</div>';
    }).join('');
    card.innerHTML =
      '<div class="mreo-ext-head"><span class="mreo-ext-title">СЕЗОННЫЙ ПРОПУСК · ' + PATCH + '</span><span class="mreo-ext-badge">' + xp + ' XP</span></div>' +
      '<div class="mreo-ext-list">' + rows + '</div>';
  }

  function injectPass() {
    const view = document.getElementById('view');
    if (!view || document.getElementById('mreo-season-pass-card')) return;
    const txt = view.textContent || '';
    if (!txt.includes('Инкогнито') && !txt.includes('Реферал') && !txt.includes('Статистика')) return;
    const p = document.createElement('section');
    p.className = 'panel mreo-ext-card';
    p.id = 'mreo-season-pass-card';
    p.style.cssText = 'width:100% !important;box-sizing:border-box !important;margin:0 0 12px 0 !important;padding:13px !important;background:linear-gradient(135deg,#1e1b2e,#11151f) !important;border:1px solid rgba(250,204,21,0.34) !important;';
    const biz = document.getElementById('mreo-business-hub-card');
    if (biz) biz.insertAdjacentElement('afterend', p);
    else view.appendChild(p);
    renderPass();
  }

  document.addEventListener('pointerdown', function(e) {
    if (!e.target || !e.target.closest) return;
    if (e.target.closest('[data-claim-v21]')) {
      e.preventDefault(); e.stopImmediatePropagation();
      const st = getSt() || {};
      st.seenPatch = PATCH;
      st.cash = (Number(st.cash) || 0) + 25000;
      st.free = (Number(st.free) || 0) + 2;
      st.seasonXp = (Number(st.seasonXp) || 0) + 30;
      saveSt(st);
      const m = document.getElementById('mreo-patch-modal');
      if (m) m.remove();
      renderPass();
      toast('Бонус обновления v2.1 получен: +25 000 ₽ и +2 талона!');
      return;
    }
    const g = e.target.closest('[data-pass-get]');
    if (g) {
      e.preventDefault(); e.stopImmediatePropagation();
      const lvl = Number(g.getAttribute('data-pass-get'));
      const t = TIERS.find(x => x.lvl === lvl);
      const st = getSt();
      if (!t || !st) return;
      if (!Array.isArray(st.seasonClaimed)) st.seasonClaimed = [];
      if (st.seasonClaimed.includes(lvl) || (Number(st.seasonXp) || 0) < t.xp) return;
      st.seasonClaimed.push(lvl);
      if (t.cash) st.cash = (Number(st.cash) || 0) + t.cash;
      if (t.free) st.free = (Number(st.free) || 0) + t.free;
      if (t.rep) st.bizRep = Math.min(100, (Number(st.bizRep) || 40) + t.rep);
      if (t.plate) {
        if (!Array.isArray(st.plates)) st.plates = [];
        st.plates.unshift({ id: 'p21_' + Date.now(), f: 'В', d: '777', t: 'ОР', reg: '77', val: 650000, rar: 'epic' });
      }
      saveSt(st);
      renderPass();
      toast('Награда получена: ' + t.rew);
      return;
    }
    if (e.target.closest('button.primary, [data-tender-run], [data-biz-collect-rent], [data-auc-bid]')) {
      setTimeout(() => {
        const st = getSt();
        if (st) { st.seasonXp = (Number(st.seasonXp) || 0) + 12; saveSt(st); renderPass(); }
      }, 150);
    }
  }, true);

  function boot() {
    setTimeout(showModal, 400);
    injectPass();
    setInterval(injectPass, 400);
  }
  if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', boot);
  else boot();
})();