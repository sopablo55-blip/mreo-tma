(function() {
  if (window.__mreoStateTendersV175) return;
  window.__mreoStateTendersV175 = true;

  let tenderLock = false;

  const TENDERS = [
    {
      id: 't_yar_76',
      title: 'Лот №1 · Автопарк Департамента (Ярославль, 76)',
      desc: 'Комплектация служебных машин для регионального управления. Списывает 1 номер из Бокса.',
      basePayout: 320000,
      minRep: 35,
      minPlates: 2,
      minShares: 0,
      needEquipped: false,
      rewardPlate: null
    },
    {
      id: 't_spb_78',
      title: 'Лот №2 · Управление спецсвязи (Санкт-Петербург, 78)',
      desc: 'Поставка спецсерий для колонны сопровождения. Требуется доля в Деловом контуре.',
      basePayout: 780000,
      minRep: 55,
      minPlates: 3,
      minShares: 1,
      needEquipped: false,
      rewardPlate: null
    },
    {
      id: 't_msk_77',
      title: 'Лот №3 · Федеральный резерв (Москва, 77)',
      desc: 'Закрытый контракт для ведомственного гаража. Нужен надетый номер на авто и репутация 70+.',
      basePayout: 1650000,
      minRep: 70,
      minPlates: 4,
      minShares: 2,
      needEquipped: true,
      rewardPlate: null
    },
    {
      id: 't_gov_01',
      title: 'Лот №4 · Кортеж Управления делами РФ',
      desc: 'Высший государственный подряд. Выплата 3.4 млн ₽ и ведомственный спецномер А 001 МР 97.',
      basePayout: 3400000,
      minRep: 85,
      minPlates: 5,
      minShares: 3,
      needEquipped: true,
      rewardPlate: { f: 'А', d: '001', t: 'МР', reg: '97', val: 1450000, rar: 'spec' }
    }
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

  function checkRequirements(st, tender) {
    const rep = Math.min(100, Math.max(0, Number(st.bizRep) || 40));
    const plates = Array.isArray(st.plates) ? st.plates : [];
    const assets = (st.bizAssets && typeof st.bizAssets === 'object') ? st.bizAssets : {};
    const shares = Object.values(assets).reduce((a, b) => a + (Number(b) || 0), 0);
    const hasEquipped = Boolean(st.equippedPlate);

    const missing = [];
    if (rep < tender.minRep) missing.push('Репутация ' + tender.minRep + '+ (сейчас ' + rep + ')');
    if (plates.length < tender.minPlates) missing.push('Номеров в Боксе: ' + tender.minPlates + ' (сейчас ' + plates.length + ')');
    if (shares < tender.minShares) missing.push('Долей в Деловом контуре: ' + tender.minShares + ' (сейчас ' + shares + ')');
    if (tender.needEquipped && !hasEquipped) missing.push('Наденьте номер на авто в Гараже');

    return { ok: missing.length === 0, missing };
  }

  function executeTender(tenderId, mode) {
    const st = getSt();
    const tender = TENDERS.find(t => t.id === tenderId);
    if (!tender) return;

    const check = checkRequirements(st, tender);
    if (!check.ok) {
      notify('Условия не выполнены: ' + check.missing.join(' · '));
      return;
    }

    const plates = Array.isArray(st.plates) ? st.plates : [];
    if (plates.length === 0) {
      notify('В Боксе нет номеров для передачи по контракту!');
      return;
    }

    let lowestIdx = 0;
    for (let i = 1; i < plates.length; i++) {
      if ((Number(plates[i].val) || 0) < (Number(plates[lowestIdx].val) || 0)) lowestIdx = i;
    }
    plates.splice(lowestIdx, 1);

    const completedCount = Number(st.tendersDone) || 0;
    const supplierBonus = 1 + completedCount * 0.05;

    if (mode === 'admin') {
      if (Math.random() < 0.25) {
        const fine = Math.round(tender.basePayout * 0.15);
        st.cash = Math.max(0, (Number(st.cash) || 0) - fine);
        st.bizRep = Math.max(0, (Number(st.bizRep) || 40) - 8);
        saveSt(st, false);
        renderTendersPanel();
        notify('Проверка Счётной палаты! Контракт заморожен: штраф -' + fine.toLocaleString('ru-RU') + ' ₽ и -8 репутации.');
        return;
      }
      const payout = Math.round(tender.basePayout * 1.35 * supplierBonus);
      st.cash = (Number(st.cash) || 0) + payout;
      st.tendersDone = completedCount + 1;
      st.bizRep = Math.min(100, (Number(st.bizRep) || 40) + 4);
      if (st.myClubId) st.clubPts = (Number(st.clubPts) || 0) + 180;
      if (tender.rewardPlate) {
        plates.unshift({
          id: 'vip_gov_' + Date.now(),
          f: tender.rewardPlate.f, d: tender.rewardPlate.d, t: tender.rewardPlate.t, reg: tender.rewardPlate.reg,
          val: tender.rewardPlate.val, rar: tender.rewardPlate.rar
        });
      }
      saveSt(st, false);
      renderTendersPanel();
      notify('Тендер закрыт через админресурс! Выплата: +' + payout.toLocaleString('ru-RU') + ' ₽');
    } else {
      const payout = Math.round(tender.basePayout * supplierBonus);
      st.cash = (Number(st.cash) || 0) + payout;
      st.tendersDone = completedCount + 1;
      st.bizRep = Math.min(100, (Number(st.bizRep) || 40) + 6);
      if (st.myClubId) st.clubPts = (Number(st.clubPts) || 0) + 120;
      if (tender.rewardPlate) {
        plates.unshift({
          id: 'vip_gov_' + Date.now(),
          f: tender.rewardPlate.f, d: tender.rewardPlate.d, t: tender.rewardPlate.t, reg: tender.rewardPlate.reg,
          val: tender.rewardPlate.val, rar: tender.rewardPlate.rar
        });
      }
      saveSt(st, false);
      renderTendersPanel();
      notify('Госзаказ выполнен по регламенту! Выплата: +' + payout.toLocaleString('ru-RU') + ' ₽ (+6 репутации)');
    }
  }

  function renderTendersPanel() {
    const card = document.getElementById('mreo-state-tenders-card');
    if (!card) return;
    const st = getSt();
    const done = Number(st.tendersDone) || 0;
    const bonusPct = done * 5;

    const helpHtml = window.__mreoTendersHelpOpen
      ? '<div id="mreo-tenders-help-drawer" style="background:rgba(15,23,42,0.94);border:1px solid rgba(250,204,21,0.32);border-radius:12px;padding:10px 12px;margin-bottom:10px;font-size:11.5px;line-height:1.45;color:#e2e8f0;">' +
          '<div style="font-weight:900;color:#fde047;margin-bottom:4px;">Как устроен Госзаказ РФ:</div>' +
          '<div>• <b>Комплектация:</b> для участия нужны номера в Боксе, репутация и коммерческие доли из Профиля. При закрытии 1 номер передаётся на баланс ведомства.</div>' +
          '<div>• <b>По регламенту:</b> 100% надёжная сделка, стандартная выплата и +6 к репутации.</div>' +
          '<div>• <b>Админресурс (×1.35):</b> повышенная маржа +35%, но 25% риск проверки со штрафом.</div>' +
          '<div>• <b>Ранг поставщика:</b> каждый выполненный тендер навсегда даёт +5% ко всем будущим выплатам.</div>' +
        '</div>'
      : '';

    const itemsHtml = TENDERS.map(t => {
      const check = checkRequirements(st, t);
      const payoutStd = Math.round(t.basePayout * (1 + done * 0.05));
      const payoutAdm = Math.round(payoutStd * 1.35);

      const reqBadges = [
        'Реп. ' + t.minRep + '+',
        'Бокс ' + t.minPlates + '+ шт.',
        t.minShares > 0 ? ('Долей ' + t.minShares + '+') : null,
        t.needEquipped ? 'Номер на авто' : null
      ].filter(Boolean).map(r => '<span style="font-size:10.5px;padding:2px 7px;border-radius:6px;background:rgba(255,255,255,0.06);color:#cbd5e1;">' + r + '</span>').join(' ');

      const actionArea = check.ok
        ? ('<div style="display:flex;flex-direction:column;gap:6px;margin-top:9px;">' +
            '<button type="button" class="btn small primary" style="width:100%;" data-tender-run="' + t.id + '" data-tender-mode="reg">По регламенту · ' + payoutStd.toLocaleString('ru-RU') + ' ₽</button>' +
            '<button type="button" class="btn small" style="width:100%;border-color:rgba(250,204,21,0.35);color:#fde047;" data-tender-run="' + t.id + '" data-tender-mode="admin">Админресурс · ' + payoutAdm.toLocaleString('ru-RU') + ' ₽</button>' +
          '</div>')
        : ('<div style="font-size:11px;color:#f87171;margin-top:7px;">Недоступно: ' + check.missing.join(' · ') + '</div>');

      return (
        '<div style="background:rgba(15,23,42,0.88);border:1px solid ' + (check.ok ? 'rgba(74,222,128,0.38)' : 'rgba(255,255,255,0.07)') + ';border-radius:14px;padding:11px 12px;margin-bottom:8px;">' +
          '<div style="font-size:13px;font-weight:900;color:#fff;">' + t.title + '</div>' +
          '<div style="font-size:11.5px;color:#94a3b8;margin-top:2px;line-height:1.38;">' + t.desc + '</div>' +
          '<div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:7px;">' + reqBadges + '</div>' +
          actionArea +
        '</div>'
      );
    }).join('');

    card.innerHTML =
      helpHtml +
      '<div style="display:flex !important;justify-content:space-between !important;align-items:center !important;width:100% !important;margin-bottom:10px !important;">' +
        '<span style="font-size:12px;font-weight:900;color:#facc15 !important;letter-spacing:0.03em;">ГОСЗАКАЗ РФ · ТЕНДЕРЫ <span data-tenders-help="1" style="display:inline-flex !important;align-items:center !important;justify-content:center !important;width:20px !important;height:20px !important;margin-left:5px !important;border-radius:50% !important;border:1px solid rgba(250,204,21,0.6) !important;background:rgba(250,204,21,0.18) !important;color:#fde047 !important;font-size:11px !important;font-weight:900 !important;cursor:pointer !important;vertical-align:middle !important;">?</span></span>' +
        '<span style="margin-left:auto !important;flex-shrink:0 !important;"><span style="display:inline-block !important;background:rgba(56,189,248,0.16) !important;color:#7dd3fc !important;font-size:11px !important;font-weight:800 !important;padding:3px 9px !important;border-radius:999px !important;white-space:nowrap !important;">Контрактов: ' + done + ' (+' + bonusPct + '%)</span></span>' +
      '</div>' +
      '<div class="mreo-ext-list">' + itemsHtml + '</div>';
}
function injectTenders() {
if (tenderLock) return;
const view = document.getElementById('view');
if (!view || document.getElementById('mreo-state-tenders-card')) return;
const txt = view.textContent || '';
const activeTab = document.querySelector('.dock-item.active, nav .active');
const tabTxt = activeTab ? (activeTab.textContent || '') : '';
if (!txt.includes('Биржа номеров') && !txt.includes('АУКЦИОН КОНФИСКАТА') && !tabTxt.includes('Рынок')) return;
tenderLock = true;
try {
const panel = document.createElement('article');
panel.className = 'mreo-ext-card';
panel.id = 'mreo-state-tenders-card';
panel.style.cssText = 'display:block !important;width:100% !important;box-sizing:border-box !important;margin:0 0 12px 0 !important;padding:13px !important;border-radius:18px !important;background:linear-gradient(135deg,#192234 0%,#11151f 100%) !important;border:1px solid rgba(250,204,21,0.32) !important;';
const aucCard = document.getElementById('mreo-confiscate-auction');
if (aucCard) {
aucCard.insertAdjacentElement('afterend', panel);
} else {
view.insertAdjacentElement('afterbegin', panel);
}
renderTendersPanel();
} finally {
tenderLock = false;
}
}
document.addEventListener('pointerdown', function(e) {
if (!e.target || !e.target.closest) return;
if (e.target.closest('[data-tenders-help]')) {
e.preventDefault();
e.stopImmediatePropagation();
window.__mreoTendersHelpOpen = !window.__mreoTendersHelpOpen;
renderTendersPanel();
return;
}
const runBtn = e.target.closest('[data-tender-run]');
if (runBtn) {
e.preventDefault();
e.stopImmediatePropagation();
const tid = runBtn.getAttribute('data-tender-run');
const mode = runBtn.getAttribute('data-tender-mode');
executeTender(tid, mode);
}
}, true);
function bootTenders() {
injectTenders();
setInterval(injectTenders, 400);
}
if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', bootTenders);
else bootTenders();
})();