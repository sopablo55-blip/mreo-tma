(function() {
  if (window.__mreoBoxWorkshopV120) return;
  window.__mreoBoxWorkshopV120 = true;

  let boxLock = false;
  const ELITE_REGS = ['77', '97', '99', '777', '95', '78', '198', '05'];

  function findSaveKey() {
    for (const k of ['mreo_tma_save_v2', 'mreo_tma_save', 'mreo_v1', 'mreo_save']) {
      if (localStorage.getItem(k)) return k;
    }
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      const raw = localStorage.getItem(k) || '';
      if (raw.includes('"cash"') && raw.includes('"plates"')) return k;
    }
    return 'mreo_tma_save_v2';
  }
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.toLowerCase().includes('mreo')) {
        const raw = localStorage.getItem(k) || '';
        if (raw.includes('"plates"')) return k;
      }
    }
    return 'mreo_tma_save_v2';
  }

  function getSt() {
    if (window.__mreoBridge && typeof window.__mreoBridge.getS === 'function') {
      const s = window.__mreoBridge.getS();
      if (s) return s;
    }
    try {
      const raw = localStorage.getItem(findSaveKey());
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return null;
  }

  function saveAndRefresh(st) {
    if (window.__mreoBridge && typeof window.__mreoBridge.save === 'function') {
      window.__mreoBridge.save();
      if (typeof window.__mreoBridge.render === 'function') window.__mreoBridge.render();
      return;
    }
    try {
      localStorage.setItem(findSaveKey(), JSON.stringify(st));
    } catch (_) {}
    location.reload();
  }

  function notify(msg) {
    if (window.__mreoBridge && typeof window.__mreoBridge.toast === 'function') {
      window.__mreoBridge.toast(msg);
    } else {
      alert(msg);
    }
  }

  function formatPlateCode(p) {
    if (!p) return '—';
    return (p.f || p.a || '') + ' ' + (p.d || p.num || '') + ' ' + (p.t || p.b || '') + ' ' + (p.reg || '');
  }

  function ensureBoxContract(st) {
    if (st.boxContract && st.boxContract.title) return st.boxContract;
    const templates = [
      { id: 'c_elite_reg', title: 'Заказ: Блатной регион (77 / 97 / 95 / 78)', mult: 1.28, bonus: 4500 },
      { id: 'c_rare_plus', title: 'Заказ: Редкий номер или выше', mult: 1.32, bonus: 6500 },
      { id: 'c_any_polished', title: 'Заказ: Отполированный номер в кортеж', mult: 1.25, bonus: 3500 }
    ];
    const pick = templates[Math.floor(Math.random() * templates.length)];
    st.boxContract = { id: pick.id, title: pick.title, mult: pick.mult, bonus: pick.bonus };
    return st.boxContract;
  }

  function matchesContract(contract, p) {
    if (!contract || !p) return false;
    if (contract.id === 'c_elite_reg') return ELITE_REGS.includes(String(p.reg || ''));
    if (contract.id === 'c_rare_plus') {
      const r = String(p.rar || p.tier || '');
      return r === 'rare' || r === 'epic' || r === 'spec' || r === 'legend';
    }
    if (contract.id === 'c_any_polished') return Boolean(p.polished);
    return false;
  }

  window.boxPolishBestPlate = function() {
    const st = getSt();
    if (!st || !Array.isArray(st.plates) || st.plates.length === 0) {
      notify('В боксе нет номеров для полировки!');
      return;
    }
    const target = st.plates.find(p => p && !p.polished);
    if (!target) {
      notify('Все номера в боксе уже отполированы!');
      return;
    }
    const cost = Math.max(3500, Math.round((Number(target.val) || 10000) * 0.12));
    if ((Number(st.cash) || 0) < cost) {
      notify('Не хватает ' + (cost - Number(st.cash)).toLocaleString('ru-RU') + ' ₽ на полировку');
      return;
    }
    st.cash -= cost;
    target.polished = true;
    target.val = Math.round(((Number(target.val) || 10000) * 1.25) / 500) * 500;
    notify('Номер ' + formatPlateCode(target) + ' отполирован! Новая цена: ' + target.val.toLocaleString('ru-RU') + ' ₽');
    saveAndRefresh(st);
  };

  window.boxRerollRegion = function() {
    const st = getSt();
    if (!st || !Array.isArray(st.plates) || st.plates.length === 0) {
      notify('В боксе пусто!');
      return;
    }
    const target = st.plates.find(p => p && !ELITE_REGS.includes(String(p.reg || ''))) || st.plates[0];
    const cost = 12000;
    if ((Number(st.cash) || 0) < cost) {
      notify('Для перебивки региона нужно 12 000 ₽');
      return;
    }
    st.cash -= cost;
    const newReg = ELITE_REGS[Math.floor(Math.random() * ELITE_REGS.length)];
    target.reg = newReg;
    target.val = Math.round(((Number(target.val) || 10000) * 1.38) / 500) * 500;
    notify('Регион перебит на ' + newReg + '! Номер ' + formatPlateCode(target) + ' подорожал до ' + target.val.toLocaleString('ru-RU') + ' ₽');
    saveAndRefresh(st);
  };

  window.boxFuseCommonPlates = function() {
    const st = getSt();
    if (!st || !Array.isArray(st.plates)) return;
    const commons = st.plates.filter(p => p && (function(x){ const r = String(x.rar || x.tier || 'common').toLowerCase(); return r === 'common' || r === 'обычный' || r === 'std' || r === 'base'; })(p));
    if (commons.length < 3) {
      notify('Нужно минимум 3 обычных номера в боксе (сейчас: ' + commons.length + ' шт.)');
      return;
    }
    const three = commons.slice(0, 3);
    const toRemoveIds = new Set(three.map(p => p.id));
    const sumVal = three.reduce((acc, p) => acc + (Number(p.val) || 5000), 0);
    st.plates = st.plates.filter(p => !toRemoveIds.has(p.id));

    const rarePool = [
      { f: 'К', d: '444', t: 'МР', reg: '77' },
      { f: 'О', d: '707', t: 'ОО', reg: '78' },
      { f: 'В', d: '888', t: 'ОР', reg: '97' },
      { f: 'А', d: '333', t: 'АМ', reg: '95' }
    ];
    const pick = rarePool[Math.floor(Math.random() * rarePool.length)];
    const newVal = Math.round((sumVal * 1.45) / 500) * 500;
    st.plates.unshift({
      id: 'fuse_' + Date.now() + '_' + Math.floor(Math.random() * 999),
      f: pick.f, d: pick.d, t: pick.t, reg: pick.reg,
      val: newVal, rar: 'rare'
    });
    notify('Слияние 3→1 успешно! Получен редкий номер ' + pick.f + ' ' + pick.d + ' ' + pick.t + ' ' + pick.reg + ' (' + newVal.toLocaleString('ru-RU') + ' ₽)');
    saveAndRefresh(st);
  };

  window.boxCompleteContract = function() {
    const st = getSt();
    if (!st || !Array.isArray(st.plates) || st.plates.length === 0) {
      notify('В боксе нет номеров для сдачи по контракту!');
      return;
    }
    const contract = ensureBoxContract(st);
    const matchIdx = st.plates.findIndex(p => matchesContract(contract, p));
    if (matchIdx === -1) {
      notify('В боксе пока нет номера под этот заказ! Доработайте номер в мастерской ниже.');
      return;
    }
    const sold = st.plates.splice(matchIdx, 1)[0];
    const payout = Math.round((Number(sold.val) || 10000) * contract.mult) + contract.bonus;
    st.cash = (Number(st.cash) || 0) + payout;
    delete st.boxContract;
    ensureBoxContract(st);
    notify('VIP-заказ выполнен! Выручка: +' + payout.toLocaleString('ru-RU') + ' ₽');
    saveAndRefresh(st);
  };

  function isBoxTabActive() {
    if (window.__forceBoxTabFlag) return true;
    const activeBtns = Array.from(document.querySelectorAll('.active'));
    if (activeBtns.some(el => (el.textContent || '').includes('Бокс'))) return true;
    const view = document.getElementById('view');
    const txt = view ? (view.textContent || '') : '';
    return txt.includes('ГОСНОМЕРА') || txt.includes('Хранилище') || txt.includes('Сортировка') || txt.includes('В боксе');
  }

  function injectBoxWorkshop() {
    if (boxLock) return;
    const view = document.getElementById('view');
    if (!view || document.getElementById('mreo-box-workshop-panel')) return;
    if (!isBoxTabActive()) return;

    const st = getSt() || { cash: 0, plates: [] };

    boxLock = true;
    try {
      const contract = ensureBoxContract(st);
      const plates = Array.isArray(st.plates) ? st.plates : [];
      const hasMatch = plates.some(p => matchesContract(contract, p));
      const commonCount = plates.filter(p => p && (function(x){ const r = String(x.rar || x.tier || 'common').toLowerCase(); return r === 'common' || r === 'обычный' || r === 'std' || r === 'base'; })(p)).length;
      const nextPolish = plates.find(p => p && !p.polished);
      const polishCost = nextPolish ? Math.max(3500, Math.round((Number(nextPolish.val) || 10000) * 0.12)) : 0;

      const panel = document.createElement('section');
      panel.className = 'panel';
      panel.id = 'mreo-box-workshop-panel';
      panel.style.cssText = 'padding:13px !important;margin-bottom:12px !important;background:linear-gradient(135deg,#1b2232 0%,#121620 100%) !important;border:1px solid rgba(250,204,21,0.28) !important;';

      const cardStyle = 'background:rgba(15,23,42,0.85);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:10px 12px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;gap:10px;';

      panel.innerHTML =
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">' +
          '<span style="font-size:12px;font-weight:900;color:#facc15;letter-spacing:0.04em;">МАСТЕРСКАЯ И VIP-ЗАКАЗЫ БОКСА</span>' +
          '<span style="font-size:11px;font-weight:800;color:#7dd3fc;">Номеров: ' + plates.length + ' шт.</span>' +
        '</div>' +

        '<div style="background:rgba(15,23,42,0.92);border:1px solid ' + (hasMatch ? 'rgba(74,222,128,0.45)' : 'rgba(255,255,255,0.08)') + ';border-radius:14px;padding:10px 12px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;gap:10px;">' +
          '<div style="min-width:0;">' +
            '<div style="font-size:13px;font-weight:900;color:#fff;">' + contract.title + '</div>' +
            '<div style="font-size:11.5px;color:#4ade80;margin-top:2px;">Оплата: ×' + contract.mult + ' к цене + ' + contract.bonus.toLocaleString('ru-RU') + ' ₽ премия</div>' +
          '</div>' +
          '<button type="button" class="btn small ' + (hasMatch ? 'primary' : '') + '" style="flex-shrink:0;" data-box-action="contract">' + (hasMatch ? 'Сдать заказ' : 'Нет авто') + '</button>' +
        '</div>' +

        '<div style="' + cardStyle + '">' +
          '<div style="min-width:0;">' +
            '<div style="font-size:13px;font-weight:900;color:#fff;">Полировка ГОСТ (+25% к цене)</div>' +
            '<div class="muted" style="font-size:11px;margin-top:2px;">' + (nextPolish ? ('Номер: ' + formatPlateCode(nextPolish)) : 'Все номера отполированы') + '</div>' +
          '</div>' +
          '<button type="button" class="btn small primary" style="flex-shrink:0;" data-box-action="polish">' + (nextPolish ? (polishCost.toLocaleString('ru-RU') + ' ₽') : 'Готово') + '</button>' +
        '</div>' +

        '<div style="' + cardStyle + '">' +
          '<div style="min-width:0;">' +
            '<div style="font-size:13px;font-weight:900;color:#fff;">Перебить регион на 77/97/95 (+38%)</div>' +
            '<div class="muted" style="font-size:11px;margin-top:2px;">Поднимает стоимость и подходит под VIP-заказы</div>' +
          '</div>' +
          '<button type="button" class="btn small primary" style="flex-shrink:0;" data-box-action="reroll">12 000 ₽</button>' +
        '</div>' +

        '<div style="' + cardStyle + 'margin-bottom:0;">' +
          '<div style="min-width:0;">' +
            '<div style="font-size:13px;font-weight:900;color:#fff;">Слияние 3 обычных → 1 редкий</div>' +
            '<div class="muted" style="font-size:11px;margin-top:2px;">Доступно обычных: ' + commonCount + ' / 3 шт. (+45% к сумме)</div>' +
          '</div>' +
          '<button type="button" class="btn small primary" style="flex-shrink:0;" data-box-action="fuse">Слить 3→1</button>' +
        '</div>';

      view.insertAdjacentElement('afterbegin', panel);
} finally {
boxLock = false;
}
}

  function fixYourPlatesContainer() {
    const view = document.getElementById('view');
    if (!view) return;
    const panels = Array.from(view.querySelectorAll('section.panel, .panel'));
    const p = panels.find(el => (el.textContent || '').toUpperCase().includes('ВАШИ ГОСНОМЕРА'));
    if (!p) return;
    const listWrap = p.lastElementChild;
    if (listWrap && listWrap.children && listWrap.children.length > 0) {
      listWrap.style.setProperty('display', 'flex', 'important');
      listWrap.style.setProperty('flex-direction', 'column', 'important');
      listWrap.style.setProperty('gap', '10px', 'important');
      listWrap.style.setProperty('width', '100%', 'important');
      Array.from(listWrap.children).forEach(card => {
        card.style.setProperty('width', '100%', 'important');
        card.style.setProperty('max-width', '100%', 'important');
        card.style.setProperty('min-width', '0', 'important');
      });
    }
  }

  function startBoxObserver() {
const view = document.getElementById('view');
if (!view) return;
injectBoxWorkshop(); fixYourPlatesContainer();
const obs = new MutationObserver(function() {
if (!boxLock) injectBoxWorkshop(); fixYourPlatesContainer();
});
obs.observe(view, { childList: true });
document.addEventListener('pointerup', function(e) { const t = e.target && e.target.closest ? e.target.closest('button, .dock-item') : null; if (t && (t.textContent || '').includes('Бокс')) { window.__forceBoxTabFlag = true; } else if (t && (t.textContent || '').trim().length > 0) { window.__forceBoxTabFlag = false; } setTimeout(injectBoxWorkshop, 60); }, true);
    document.addEventListener('click', function() {
setTimeout(injectBoxWorkshop, 40);
}, true);
}

  document.addEventListener('pointerdown', function(e) {
    const actBtn = e.target && e.target.closest ? e.target.closest('[data-box-action]') : null;
    if (!actBtn) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    const act = actBtn.getAttribute('data-box-action');
    if (act === 'contract' && typeof window.boxCompleteContract === 'function') window.boxCompleteContract();
    if (act === 'polish' && typeof window.boxPolishBestPlate === 'function') window.boxPolishBestPlate();
    if (act === 'reroll' && typeof window.boxRerollRegion === 'function') window.boxRerollRegion();
    if (act === 'fuse' && typeof window.boxFuseCommonPlates === 'function') window.boxFuseCommonPlates();
  }, true);

  if (document.readyState === 'loading') {
window.addEventListener('DOMContentLoaded', startBoxObserver);
} else {
startBoxObserver();
}
})();
