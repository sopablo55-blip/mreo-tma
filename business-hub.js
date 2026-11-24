(function() {
  if (window.__mreoBusinessHubV166) return;
  window.__mreoBusinessHubV166 = true;

  function toggleBizHelpDrawer(e) {
    const btn = e.target && e.target.closest ? e.target.closest('[data-biz-help]') : null;
    if (!btn) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    window.__mreoBizHelpOpen = !window.__mreoBizHelpOpen;
    const card = document.getElementById('mreo-business-hub-card');
    if (!card) return;
    let drawer = document.getElementById('mreo-biz-help-drawer');
    if (window.__mreoBizHelpOpen) {
      if (!drawer) {
        drawer = document.createElement('div');
        drawer.id = 'mreo-biz-help-drawer';
        drawer.style.cssText = 'background:rgba(15,23,42,0.94);border:1px solid rgba(250,204,21,0.32);border-radius:12px;padding:10px 12px;margin-bottom:10px;font-size:11.5px;line-height:1.45;color:#e2e8f0;';
        drawer.innerHTML =
          '<div style="font-weight:900;color:#fde047;margin-bottom:4px;">Как работает Деловой контур:</div>' +
          '<div>• <b>Ломбард (70%)</b> — выдаёт деньги под залог лучшего номера из Бокса. Успейте выкупить до конца таймера (+8 репутации), иначе актив уйдёт в счёт долга (-15).</div>' +
          '<div>• <b>Закрытый реестр (60+ реп.)</b> — прямая продажа номеров по ставке ×1.18 без налога биржи (0%).</div>' +
          '<div>• <b>Коммерческие доли</b> — приносят почасовую ренту с учётом 15% операционного налога и укрепляют репутацию.</div>';
        card.insertAdjacentElement('afterbegin', drawer);
      }
    } else if (drawer) {
      drawer.remove();
    }
  }
  document.addEventListener('pointerdown', toggleBizHelpDrawer, true);
  

  let bizLock = false;

  const ASSETS = [
    { id: 'ast_76', name: 'Узел М-8 · Ярославль (76)', cost: 65000, rateHr: 2800 },
    { id: 'ast_77', name: 'Терминал Рублёвка · Москва (77)', cost: 240000, rateHr: 11500 },
    { id: 'ast_78', name: 'Порт Балтика · Питер (78)', cost: 520000, rateHr: 26000 }
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

  function saveSt(st, doRender) {
    if (window.__mreoBridge && typeof window.__mreoBridge.save === 'function') {
      window.__mreoBridge.save();
      if (doRender && typeof window.__mreoBridge.render === 'function') window.__mreoBridge.render();
      return;
    }
    try { localStorage.setItem(getSaveKey(), JSON.stringify(st)); } catch (_) {}
    if (doRender) location.reload();
  }

  function notify(msg) {
    if (window.__mreoBridge && typeof window.__mreoBridge.toast === 'function') window.__mreoBridge.toast(msg);
  }

  function fmtPlate(p) {
    if (!p) return '—';
    return (p.f || p.a || '') + ' ' + (p.d || p.num || '') + ' ' + (p.t || p.b || '') + ' ' + (p.reg || '');
  }

  function ensureBizState(st) {
    if (typeof st.bizRep !== 'number') st.bizRep = 40;
    if (!st.bizAssets || typeof st.bizAssets !== 'object') st.bizAssets = {};
    if (!st.bizRentAt) st.bizRentAt = Date.now();

    if (st.bizPawn && st.bizPawn.dueAt && Date.now() > st.bizPawn.dueAt) {
      const lostCode = st.bizPawn.code;
      st.bizPawn = null;
      st.bizRep = Math.max(0, st.bizRep - 15);
      saveSt(st, false);
      notify('Срок залога истёк! Номер ' + lostCode + ' реализован ломбардом. Репутация -15.');
    }
  }

  function getHourlyRent(st) {
    let total = 0;
    for (const a of ASSETS) {
      const shares = Number(st.bizAssets[a.id]) || 0;
      total += shares * a.rateHr;
    }
    return total;
  }

  function getAccruedRent(st) {
    const hr = getHourlyRent(st);
    if (hr <= 0) return 0;
    const hours = Math.min(24, Math.max(0, (Date.now() - Number(st.bizRentAt || Date.now())) / 3600000));
    const gross = Math.floor(hours * hr);
    const ecoMult = (typeof window.getMreoEcosystemBonuses === 'function') ? window.getMreoEcosystemBonuses().rentMult : 1; return Math.floor(gross * 0.85 * ecoMult);
  }

  function formatTimer(msLeft) {
    const totalSec = Math.max(0, Math.floor(msLeft / 1000));
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }

  function renderBusinessHub() {
    const card = document.getElementById('mreo-business-hub-card');
    if (!card) return;
    const st = getSt();
    ensureBizState(st);

    const rep = Math.min(100, Math.max(0, Number(st.bizRep) || 40));
    const plates = Array.isArray(st.plates) ? st.plates : [];
    const sortedPlates = plates.slice().sort((a, b) => (Number(b.val) || 0) - (Number(a.val) || 0));
    const bestPlate = sortedPlates[0] || null;

    let pawnHtml = '';
    if (st.bizPawn) {
      const leftMs = Math.max(0, st.bizPawn.dueAt - Date.now());
      pawnHtml =
        '<div class="mreo-ext-row is-mine" style="margin-bottom:8px;">' +
          '<div style="min-width:0;">' +
            '<div style="font-size:11px;font-weight:900;color:#fde047;">АКТИВНЫЙ ЗАЛОГ · ОСТАЛОСЬ ' + formatTimer(leftMs) + '</div>' +
            '<div style="font-size:13.5px;font-weight:900;color:#fff;margin-top:2px;">' + st.bizPawn.code + '</div>' +
            '<div style="font-size:11px;color:#94a3b8;margin-top:2px;">К возврату с %: <b style="color:#f87171;">' + st.bizPawn.repay.toLocaleString('ru-RU') + ' ₽</b></div>' +
          '</div>' +
          '<button type="button" class="btn small primary" style="flex-shrink:0;" data-biz-repay="1">Выкупить</button>' +
        '</div>';
    } else if (bestPlate) {
      const val = Number(bestPlate.val) || 10000;
      const loan = Math.round((val * 0.70) / 500) * 500;
      const repayShort = Math.round((loan * 1.08) / 500) * 500;
      const repayLong = Math.round((loan * 1.18) / 500) * 500;
      pawnHtml =
        '<div style="background:rgba(15,23,42,0.85);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:10px 11px;margin-bottom:8px;">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;gap:8px;">' +
            '<span style="font-size:12px;font-weight:900;color:#fff;">Ломбард · Залог: ' + fmtPlate(bestPlate) + '</span>' +
            '<span style="font-size:11px;color:#4ade80;font-weight:800;flex-shrink:0;">70%: ' + loan.toLocaleString('ru-RU') + ' ₽</span>' +
          '</div>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
            '<button type="button" class="btn small primary" style="width:100%;" data-biz-pawn="short">30 мин · ' + repayShort.toLocaleString('ru-RU') + ' ₽</button>' +
            '<button type="button" class="btn small" style="width:100%;" data-biz-pawn="long">3 часа · ' + repayLong.toLocaleString('ru-RU') + ' ₽</button>' +
          '</div>' +
        '</div>';
    } else {
      pawnHtml = '<div style="font-size:11.5px;color:#64748b;margin-bottom:8px;">Ломбард: в Боксе нет свободных номеров для залога.</div>';
    }

    const registryUnlocked = rep >= 60;
    let regHtml = '';
    if (!registryUnlocked) {
      regHtml =
        '<div class="mreo-ext-row" style="margin-bottom:8px;">' +
          '<div>' +
            '<b style="font-size:12.5px;color:#94a3b8;">Закрытый реестр прямых сделок (0% налог)</b>' +
            '<div style="font-size:11px;color:#64748b;margin-top:2px;">Доступ откроется при деловой репутации 60+ (сейчас: ' + rep + '/60)</div>' +
          '</div>' +
          '<span class="mreo-ext-badge">Закрыто</span>' +
        '</div>';
    } else if (bestPlate) {
      const directPrice = Math.round(((Number(bestPlate.val) || 10000) * 1.18) / 500) * 500;
      regHtml =
        '<div class="mreo-ext-row is-mine" style="margin-bottom:8px;">' +
          '<div style="min-width:0;">' +
            '<b style="font-size:12.5px;color:#fde047;">Закрытый реестр · Прямой выкуп (×1.18)</b>' +
            '<div style="font-size:11px;color:#cbd5e1;margin-top:2px;">Лот: ' + fmtPlate(bestPlate) + ' → <b style="color:#4ade80;">' + directPrice.toLocaleString('ru-RU') + ' ₽</b></div>' +
          '</div>' +
          '<button type="button" class="btn small primary" style="flex-shrink:0;" data-biz-direct="1">Продать</button>' +
        '</div>';
    }

    const hrRent = getHourlyRent(st);
    const accrued = getAccruedRent(st);

    const assetsRows = ASSETS.map(a => {
      const cnt = Number(st.bizAssets[a.id]) || 0;
      const nextCost = Math.round(a.cost * Math.pow(1.35, cnt));
      return (
        '<div class="mreo-ext-row">' +
          '<div style="min-width:0;">' +
            '<b style="font-size:12.5px;color:#fff;">' + a.name + ' · Долей: ' + cnt + '</b>' +
            '<div style="font-size:11px;color:#94a3b8;margin-top:2px;">Рента: <b style="color:#4ade80;">+' + a.rateHr.toLocaleString('ru-RU') + ' ₽/ч</b></div>' +
          '</div>' +
          '<button type="button" class="btn small primary" style="flex-shrink:0;" data-biz-buy-asset="' + a.id + '">' + nextCost.toLocaleString('ru-RU') + ' ₽</button>' +
        '</div>'
      );
    }).join('');

    const rentBar =
      '<div class="mreo-ext-row" style="background:rgba(56,189,248,0.08) !important;border-color:rgba(56,189,248,0.28) !important;margin-bottom:8px;">' +
        '<div>' +
          '<div style="font-size:11.5px;color:#94a3b8;">Рента активов (' + hrRent.toLocaleString('ru-RU') + ' ₽/ч · налог 15% учтён)</div>' +
          '<div style="font-size:16px;font-weight:900;color:#fde047;margin-top:2px;">' + accrued.toLocaleString('ru-RU') + ' ₽</div>' +
        '</div>' +
        '<button type="button" class="btn small primary" style="flex-shrink:0;" data-biz-collect-rent="1">Снять ренту</button>' +
      '</div>';

    const helpBox = window.__mreoBizHelpOpen
      ? '<div style="background:rgba(15,23,42,0.92);border:1px solid rgba(250,204,21,0.28);border-radius:12px;padding:9px 11px;margin-bottom:10px;font-size:11.5px;line-height:1.42;color:#e2e8f0;"><div style="font-weight:900;color:#fde047;margin-bottom:4px;">Как работает Деловой контур:</div><div>• <b>Ломбард (70%)</b> — выдаёт деньги под залог лучшего номера из Бокса. Успейте выкупить до конца таймера (+8 репутации), иначе актив уйдёт в счёт долга (-15).</div><div>• <b>Закрытый реестр (60+ реп.)</b> — прямая продажа номеров по ставке ×1.18 без налога биржи (0%).</div><div>• <b>Коммерческие доли</b> — приносят почасовую ренту с учётом 15% операционного налога и укрепляют репутацию.</div></div>'
      : '';

    card.innerHTML =
      (window.__mreoBizHelpOpen ? '<div style="background:rgba(15,23,42,0.92);border:1px solid rgba(250,204,21,0.28);border-radius:12px;padding:9px 11px;margin-bottom:10px;font-size:11.5px;line-height:1.42;color:#e2e8f0;"><div style="font-weight:900;color:#fde047;margin-bottom:4px;">Как работает Деловой контур:</div><div>• <b>Ломбард (70%)</b> — выдаёт деньги под залог лучшего номера из Бокса. Успейте выкупить до конца таймера (+8 репутации), иначе актив уйдёт в счёт долга (-15).</div><div>• <b>Закрытый реестр (60+ реп.)</b> — прямая продажа номеров по ставке ×1.18 без налога биржи (0%).</div><div>• <b>Коммерческие доли</b> — приносят почасовую ренту с учётом 15% операционного налога и укрепляют репутацию.</div></div>' : '') +
      '<div class="mreo-ext-head">' +
        '<span class="mreo-ext-title" style="display:inline-flex;align-items:center;gap:6px;">ДЕЛОВОЙ КОНТУР <button type="button" data-biz-help="1" style="width:24px;height:24px;border-radius:50%;border:1px solid rgba(250,204,21,0.55);background:rgba(250,204,21,0.16);color:#fde047;font-weight:900;font-size:11px;line-height:1;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;padding:0;flex-shrink:0;">?</button></span>' +
        '<span class="mreo-ext-badge">Репутация: ' + rep + '/100</span>' +
      '</div>' +
      pawnHtml +
      regHtml +
      rentBar +
      '<div class="mreo-ext-list">' + assetsRows + '</div>';
  }

  function injectBusinessHub() {
    if (bizLock) return;
    const view = document.getElementById('view');
    if (!view || document.getElementById('mreo-business-hub-card')) return;
    const txt = view.textContent || '';
    const activeTab = document.querySelector('.dock-item.active, nav .active');
    const tabTxt = activeTab ? (activeTab.textContent || '') : '';

    if (!txt.includes('Инкогнито') && !txt.includes('Реферал') && !txt.includes('Напарник') && !txt.includes('Статистика') && !tabTxt.includes('Профиль')) return;

    bizLock = true;
    try {
      const panel = document.createElement('section');
      panel.className = 'panel mreo-ext-card';
      panel.id = 'mreo-business-hub-card';
      panel.style.cssText = 'width:100% !important;box-sizing:border-box !important;margin:0 0 12px 0 !important;padding:13px !important;background:linear-gradient(135deg,#182030 0%,#11151f 100%) !important;border:1px solid rgba(56,189,248,0.3) !important;';

      const clubsCard = document.getElementById('mreo-region-clubs-card');
const panels = Array.from(view.querySelectorAll('section.panel, .panel'));
const tasksPanel = panels.find(p => (p.textContent || '').toUpperCase().includes('ГОСЗАДАНИЯ'));
if (clubsCard) {
clubsCard.insertAdjacentElement('afterend', panel);
} else if (tasksPanel) {
tasksPanel.insertAdjacentElement('afterend', panel);
} else {
view.appendChild(panel);
}
renderBusinessHub();
} finally {
bizLock = false;
}
}
document.addEventListener('pointerdown', function(e) {
if (!e.target || !e.target.closest) return;
const pawnBtn = e.target.closest('[data-biz-pawn]');
if (pawnBtn) {
e.preventDefault(); e.stopImmediatePropagation();
const st = getSt();
ensureBizState(st);
if (st.bizPawn) { notify('У вас уже есть активный залог!'); return; }
const plates = Array.isArray(st.plates) ? st.plates : [];
if (plates.length === 0) { notify('В Боксе нет номеров для залога!'); return; }
let bestIdx = 0;
for (let i = 1; i < plates.length; i++) {
if ((Number(plates[i].val) || 0) > (Number(plates[bestIdx].val) || 0)) bestIdx = i;
}
const takenArr = plates.splice(bestIdx, 1);
const taken = takenArr[0];
const val = Number(taken.val) || 10000;
const loan = Math.round((val * 0.70) / 500) * 500;
const mode = pawnBtn.getAttribute('data-biz-pawn');
const mult = mode === 'short' ? 1.08 : 1.18;
const durationMs = mode === 'short' ? 1800000 : 10800000;
st.cash = (Number(st.cash) || 0) + loan;
st.bizPawn = {
plate: taken,
code: fmtPlate(taken),
repay: Math.round((loan * mult) / 500) * 500,
dueAt: Date.now() + durationMs
};
saveSt(st, false);
renderBusinessHub();
notify('Залог оформлен! На счёт зачислено +' + loan.toLocaleString('ru-RU') + ' ₽');
return;
}
if (e.target.closest('[data-biz-repay]')) {
e.preventDefault(); e.stopImmediatePropagation();
const st = getSt();
ensureBizState(st);
if (!st.bizPawn) return;
const bal = Number(st.cash) || 0;
if (bal < st.bizPawn.repay) {
notify('Для выкупа залога не хватает ' + (st.bizPawn.repay - bal).toLocaleString('ru-RU') + ' ₽');
return;
}
st.cash = bal - st.bizPawn.repay;
if (!Array.isArray(st.plates)) st.plates = [];
st.plates.unshift(st.bizPawn.plate);
const code = st.bizPawn.code;
st.bizPawn = null;
st.bizRep = Math.min(100, (Number(st.bizRep) || 40) + 8);
saveSt(st, false);
renderBusinessHub();
notify('Залог погашен! Номер ' + code + ' возвращён в Бокс (+8 репутации).');
return;
}
if (e.target.closest('[data-biz-direct]')) {
e.preventDefault(); e.stopImmediatePropagation();
const st = getSt();
ensureBizState(st);
if ((Number(st.bizRep) || 0) < 60) { notify('Нужна репутация от 60 баллов!'); return; }
const plates = Array.isArray(st.plates) ? st.plates : [];
if (plates.length === 0) { notify('В Боксе нет номеров для прямой продажи!'); return; }
let bestIdx = 0;
for (let i = 1; i < plates.length; i++) {
if ((Number(plates[i].val) || 0) > (Number(plates[bestIdx].val) || 0)) bestIdx = i;
}
const soldArr = plates.splice(bestIdx, 1);
const sold = soldArr[0];
const payout = Math.round(((Number(sold.val) || 10000) * 1.18) / 500) * 500;
st.cash = (Number(st.cash) || 0) + payout;
st.bizRep = Math.min(100, (Number(st.bizRep) || 40) + 4);
saveSt(st, false);
renderBusinessHub();
notify('Прямая сделка закрыта без комиссии! Выручка: +' + payout.toLocaleString('ru-RU') + ' ₽');
return;
}
const buyAstBtn = e.target.closest('[data-biz-buy-asset]');
if (buyAstBtn) {
e.preventDefault(); e.stopImmediatePropagation();
const st = getSt();
ensureBizState(st);
const astId = buyAstBtn.getAttribute('data-biz-buy-asset');
const asset = ASSETS.find(x => x.id === astId);
if (!asset) return;
const cnt = Number(st.bizAssets[astId]) || 0;
const cost = Math.round(asset.cost * Math.pow(1.35, cnt));
const bal = Number(st.cash) || 0;
if (bal < cost) {
notify('Для покупки доли не хватает ' + (cost - bal).toLocaleString('ru-RU') + ' ₽');
return;
}
st.cash = bal - cost;
st.bizAssets[astId] = cnt + 1;
st.bizRep = Math.min(100, (Number(st.bizRep) || 40) + 3);
saveSt(st, false);
renderBusinessHub();
notify('Приобретена доля: ' + asset.name + ' (+' + asset.rateHr.toLocaleString('ru-RU') + ' ₽/ч)');
return;
}
if (e.target.closest('[data-biz-collect-rent]')) {
e.preventDefault(); e.stopImmediatePropagation();
const st = getSt();
ensureBizState(st);
const accrued = getAccruedRent(st);
if (accrued < 50) {
notify('Рента ещё накапливается. Купите доли в регионах для ускорения.');
return;
}
st.cash = (Number(st.cash) || 0) + accrued;
st.bizRentAt = Date.now();
saveSt(st, false);
renderBusinessHub();
notify('Рента снята на счёт (налог 15% удержан): +' + accrued.toLocaleString('ru-RU') + ' ₽');
}
}, true);
function bootBiz() {
injectBusinessHub();
setInterval(injectBusinessHub, 350);
setInterval(function() {
if (document.getElementById('mreo-business-hub-card')) renderBusinessHub();
}, 1000);
}
if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', bootBiz);
else bootBiz();
})();