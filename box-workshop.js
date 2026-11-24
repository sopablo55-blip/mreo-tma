(function() {
  if (window.__mreoBoxWorkshopV207) return;
  window.__mreoBoxWorkshopV207 = true;

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
    try { const r = localStorage.getItem(getSaveKey()); if (r) return JSON.parse(r); } catch (_) {}
    return { cash: 50000, plates: [] };
  }

  function saveSt(st, doRender) {
    if (window.__mreoBridge && typeof window.__mreoBridge.save === 'function') {
      window.__mreoBridge.save();
      if (doRender && typeof window.__mreoBridge.render === 'function') window.__mreoBridge.render();
      return;
    }
    try { localStorage.setItem(getSaveKey(), JSON.stringify(st)); } catch (_) {}
  }

  function toast(m) {
    if (window.__mreoBridge && typeof window.__mreoBridge.toast === 'function') window.__mreoBridge.toast(m);
  }

  function fmtPlate(p) {
    if (!p) return '—';
    return (p.f || p.a || '') + ' ' + (p.d || p.num || '') + ' ' + (p.t || p.b || '') + ' ' + (p.reg || '');
  }

  function renderWorkshop() {
    const view = document.getElementById('view');
    if (!view) return;
    const txt = view.textContent || '';
    const activeTab = document.querySelector('.dock-item.active, nav .active');
    const tabTxt = activeTab ? (activeTab.textContent || '') : '';

    if (!txt.includes('Мой бокс') && !txt.includes('Бокс номеров') && !tabTxt.includes('Бокс')) return;

    let card = document.getElementById('mreo-box-workshop-card');
    if (!card) {
      card = document.createElement('section');
      card.className = 'panel mreo-ext-card';
      card.id = 'mreo-box-workshop-card';
      card.style.cssText = 'width:100% !important;box-sizing:border-box !important;margin:0 0 12px 0 !important;padding:13px !important;background:linear-gradient(135deg,#1a2234,#10141f) !important;border:1px solid rgba(56,189,248,0.34) !important;';
      view.insertAdjacentElement('afterbegin', card);
    }

    const st = getSt() || {};
    const plates = Array.isArray(st.plates) ? st.plates : [];
    const topPlate = plates[0] || null;
    const canMerge = plates.length >= 3;

    card.innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:center;width:100%;margin-bottom:10px;">' +
        '<span style="font-size:12px;font-weight:900;color:#38bdf8;letter-spacing:0.03em;">МАСТЕРСКАЯ БОКСА · ТЮНИНГ ГРЗ</span>' +
        '<span class="mreo-ext-badge" style="margin-left:auto;">В боксе: ' + plates.length + '</span>' +
      '</div>' +
      '<div style="font-size:11.5px;color:#cbd5e1;margin-bottom:9px;">Активный номер: <b style="color:#fff;">' + (topPlate ? fmtPlate(topPlate) + ' (' + Number(topPlate.val || 0).toLocaleString('ru-RU') + ' ₽)' : 'нет номеров') + '</b></div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">' +
        '<button type="button" class="btn small primary" style="width:100%;" data-ws-polish="1">Полировка (+35% · 8 000 ₽)</button>' +
        '<button type="button" class="btn small" style="width:100%;border-color:rgba(250,204,21,0.35);color:#fde047;" data-ws-rebind="1">Регион 77/97 (15 000 ₽)</button>' +
      '</div>' +
      '<button type="button" class="btn small" style="width:100%;' + (canMerge ? 'border-color:rgba(74,222,128,0.45);color:#4ade80;' : 'opacity:0.55;') + '" data-ws-merge="1">Слияние 3 номеров → 1 Элитный номер (×2.6 цены)</button>';
  }

  document.addEventListener('pointerdown', function(e) {
    if (!e.target || !e.target.closest) return;

    if (e.target.closest('[data-ws-polish]')) {
      e.preventDefault(); e.stopImmediatePropagation();
      const st = getSt();
      const plates = Array.isArray(st.plates) ? st.plates : [];
      if (plates.length === 0) { toast('В Боксе нет номеров!'); return; }
      if ((Number(st.cash) || 0) < 8000) { toast('Нужно 8 000 ₽ для полировки!'); return; }
      const p = plates[0];
      if (p._polished) { toast('Этот номер уже отполирован по ГОСТ!'); return; }
      st.cash = (Number(st.cash) || 0) - 8000;
      p.val = Math.round(((Number(p.val) || 10000) * 1.35) / 500) * 500;
      p._polished = true;
      saveSt(st, true);
      renderWorkshop();
      toast('Полировка завершена! Новая цена ' + fmtPlate(p) + ': ' + p.val.toLocaleString('ru-RU') + ' ₽');
      return;
    }

    if (e.target.closest('[data-ws-rebind]')) {
      e.preventDefault(); e.stopImmediatePropagation();
      const st = getSt();
      const plates = Array.isArray(st.plates) ? st.plates : [];
      if (plates.length === 0) { toast('В Боксе нет номеров!'); return; }
      if ((Number(st.cash) || 0) < 15000) { toast('Нужно 15 000 ₽ для перебивки региона!'); return; }
      const p = plates[0];
      st.cash = (Number(st.cash) || 0) - 15000;
      p.reg = Math.random() < 0.5 ? '77' : '97';
      p.val = Math.round(((Number(p.val) || 10000) * 1.25) / 500) * 500;
      saveSt(st, true);
      renderWorkshop();
      toast('Регион обновлён: ' + fmtPlate(p) + ' (' + p.val.toLocaleString('ru-RU') + ' ₽)');
      return;
    }

    if (e.target.closest('[data-ws-merge]')) {
      e.preventDefault(); e.stopImmediatePropagation();
      const st = getSt();
      const plates = Array.isArray(st.plates) ? st.plates : [];
      if (plates.length < 3) { toast('Для слияния нужно минимум 3 номера в Боксе!'); return; }
      const taken = plates.splice(0, 3);
      const sumVal = taken.reduce((acc, x) => acc + (Number(x.val) || 10000), 0);
      const newVal = Math.round((sumVal * 0.9 + 35000) / 500) * 500;
      const digits = ['777', '888', '001', '999', '555'][Math.floor(Math.random() * 5)];
      const vipPlate = { id: 'merge_' + Date.now(), f: 'А', d: digits, t: 'МР', reg: '97', val: newVal, rar: 'epic' };
      plates.unshift(vipPlate);
      saveSt(st, true);
      renderWorkshop();
      toast('Слияние 3→1 успешно! Получен спецномер ' + fmtPlate(vipPlate) + ' (' + newVal.toLocaleString('ru-RU') + ' ₽)');
    }
  }, true);

  function boot() {
    renderWorkshop();
    setInterval(renderWorkshop, 600);
  }
  if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', boot);
  else boot();
})();