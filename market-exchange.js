(function() {
  if (window.__mreoMarketExchangeV124) return;
  window.__mreoMarketExchangeV124 = true;

  let mktLock = false;

  const TRENDS = [
    { id: 'tr_msk', label: 'Бум на Москву (77 / 97 / 99)', bonusPct: 28, regFilter: ['77', '97', '99', '777'] },
    { id: 'tr_spb', label: 'Спрос на Питер (78 / 98 / 198)', bonusPct: 24, regFilter: ['78', '98', '198'] },
    { id: 'tr_kavkaz', label: 'Охота за 05 и 95 регионом', bonusPct: 30, regFilter: ['05', '95'] },
    { id: 'tr_dip', label: 'Распродажа перекупов (-20% на выкуп)', bonusPct: -20, regFilter: [] }
  ];

  function findSaveKey() {
    for (const k of ['mreo_tma_save_v2', 'mreo_tma_save', 'mreo_v1']) {
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
    if (window.__mreoBridge && typeof window.__mreoBridge.toast === 'function') window.__mreoBridge.toast(msg);
    else alert(msg);
  }

  function getCurrentTrend() {
    const slot = Math.floor(Date.now() / 180000);
    return TRENDS[slot % TRENDS.length];
  }

  function ensureHotDeal(st) {
    if (st.marketHotDeal && st.marketHotDeal.code) return st.marketHotDeal;
    const deals = [
      { f: 'К', d: '505', t: 'МР', reg: '77', marketVal: 145000, buyPrice: 94000, rar: 'rare' },
      { f: 'О', d: '303', t: 'ОО', reg: '78', marketVal: 165000, buyPrice: 108000, rar: 'rare' },
      { f: 'В', d: '707', t: 'ОР', reg: '97', marketVal: 210000, buyPrice: 138000, rar: 'epic' },
      { f: 'А', d: '808', t: 'АМ', reg: '95', marketVal: 190000, buyPrice: 124000, rar: 'rare' },
      { f: 'М', d: '404', t: 'ММ', reg: '77', marketVal: 260000, buyPrice: 172000, rar: 'epic' }
    ];
    const pick = deals[Math.floor(Math.random() * deals.length)];
    st.marketHotDeal = {
      code: pick.f + ' ' + pick.d + ' ' + pick.t + ' ' + pick.reg,
      f: pick.f, d: pick.d, t: pick.t, reg: pick.reg,
      marketVal: pick.marketVal,
      buyPrice: pick.buyPrice,
      rar: pick.rar,
      haggled: false
    };
    return st.marketHotDeal;
  }

  // 1. Сбить цену у продавца (-15% с шансом 65%)
  window.marketHaggleHotDeal = function() {
    const st = getSt();
    if (!st) return;
    const deal = ensureHotDeal(st);
    if (deal.haggled) {
      notify('Вы уже торговались по этому лоту!');
      return;
    }
    deal.haggled = true;
    if (Math.random() < 0.65) {
      deal.buyPrice = Math.round((deal.buyPrice * 0.85) / 500) * 500;
      notify('Продавец уступил! Новая цена: ' + deal.buyPrice.toLocaleString('ru-RU') + ' ₽');
    } else {
      notify('Продавец отказался скидывать цену, лот и так ниже рынка!');
    }
    saveAndRefresh(st);
  };

  // 2. Выкупить инсайдерский лот в Бокс с выгодой
  window.marketBuyHotDeal = function() {
    const st = getSt();
    if (!st) return;
    const deal = ensureHotDeal(st);
    const bal = Number(st.cash) || 0;
    if (bal < deal.buyPrice) {
      notify('Не хватает ' + (deal.buyPrice - bal).toLocaleString('ru-RU') + ' ₽ для выкупа лота!');
      return;
    }
    st.cash = bal - deal.buyPrice;
    if (!Array.isArray(st.plates)) st.plates = [];
    st.plates.unshift({
      id: 'mkt_' + Date.now() + '_' + Math.floor(Math.random() * 999),
      f: deal.f, d: deal.d, t: deal.t, reg: deal.reg,
      val: deal.marketVal, rar: deal.rar
    });
    const profitEst = deal.marketVal - deal.buyPrice;
    delete st.marketHotDeal;
    ensureHotDeal(st);
    notify('Выкуплено в Бокс! Потенциальная прибыль: +' + profitEst.toLocaleString('ru-RU') + ' ₽');
    saveAndRefresh(st);
  };

  // 3. Обновить инсайдерский лот за 5 000 ₽
  window.marketRefreshHotDeal = function() {
    const st = getSt();
    if (!st) return;
    const bal = Number(st.cash) || 0;
    if (bal < 5000) {
      notify('Для поиска нового предложения нужно 5 000 ₽');
      return;
    }
    st.cash = bal - 5000;
    delete st.marketHotDeal;
    ensureHotDeal(st);
    notify('Найдено новое предложение от перекупа!');
    saveAndRefresh(st);
  };

  function isMarketTabActive() {
    const activeBtns = Array.from(document.querySelectorAll('.active'));
    if (activeBtns.some(el => (el.textContent || '').includes('Рынок'))) return true;
    const view = document.getElementById('view');
    const txt = view ? (view.textContent || '') : '';
    return txt.includes('Биржа номеров РФ') || txt.includes('Выкупить с биржи');
  }

  function injectMarketExchange() {
    if (mktLock) return;
    const view = document.getElementById('view');
    if (!view || document.getElementById('mreo-market-terminal')) return;
    if (!isMarketTabActive()) return;

    const st = getSt() || { cash: 0, plates: [] };
    mktLock = true;
    try {
      const trend = getCurrentTrend();
      const deal = ensureHotDeal(st);
      const profit = deal.marketVal - deal.buyPrice;

      const panel = document.createElement('section');
      panel.className = 'panel';
      panel.id = 'mreo-market-terminal';
      panel.style.cssText = 'padding:13px !important;margin-bottom:12px !important;background:linear-gradient(135deg,#182234 0%,#11151f 100%) !important;border:1px solid rgba(56,189,248,0.32) !important;';

      panel.innerHTML =
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
          '<span style="font-size:12px;font-weight:900;color:#38bdf8;letter-spacing:0.04em;">ПУЛЬС БИРЖИ И СРОЧНЫЙ ВЫКУП</span>' +
          '<button type="button" class="btn small" style="padding:4px 9px;font-size:11px;" onclick="window.marketRefreshHotDeal()">Обновить · 5к</button>' +
        '</div>' +

        '<div style="background:rgba(15,23,42,0.85);border:1px solid rgba(250,204,21,0.25);border-radius:12px;padding:8px 11px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;font-size:12px;">' +
          '<span style="font-weight:800;color:#fde047;">' + trend.label + '</span>' +
          '<span style="font-weight:900;color:' + (trend.bonusPct > 0 ? '#4ade80' : '#38bdf8') + ';">' + (trend.bonusPct > 0 ? ('+' + trend.bonusPct + '% к оценке') : (trend.bonusPct + '% цена')) + '</span>' +
        '</div>' +

        '<div style="background:rgba(15,23,42,0.92);border:1px solid rgba(74,222,128,0.35);border-radius:14px;padding:11px 12px;">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">' +
            '<span style="font-size:11px;font-weight:900;color:#4ade80;">СРОЧНЫЙ ЛОТ НИЖЕ РЫНКА (-35%)</span>' +
            '<span style="font-size:11px;color:#94a3b8;">Рынок: <s>' + deal.marketVal.toLocaleString('ru-RU') + ' ₽</s></span>' +
          '</div>' +
          '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">' +
            '<div>' +
              '<div style="font-size:17px;font-weight:900;color:#fff;letter-spacing:0.03em;">' + deal.code + '</div>' +
              '<div style="font-size:11.5px;color:#4ade80;margin-top:2px;">Чистая выгода: +' + profit.toLocaleString('ru-RU') + ' ₽</div>' +
            '</div>' +
            '<div style="display:flex;flex-direction:column;gap:5px;flex-shrink:0;">' +
              '<button type="button" class="btn small primary" onclick="window.marketBuyHotDeal()">Выкупить · ' + deal.buyPrice.toLocaleString('ru-RU') + ' ₽</button>' +
              '<button type="button" class="btn small" style="font-size:11px;padding:4px 8px;" onclick="window.marketHaggleHotDeal()">' + (deal.haggled ? 'Торг проведён' : 'Сбить цену (-15%)') + '</button>' +
            '</div>' +
          '</div>' +
        '</div>';

      view.insertAdjacentElement('afterbegin', panel);
    } finally {
      mktLock = false;
    }
  }

  function startMarketObserver() {
    const view = document.getElementById('view');
    if (!view) return;
    injectMarketExchange();
    const obs = new MutationObserver(function() {
      if (!mktLock) injectMarketExchange();
    });
    obs.observe(view, { childList: true });
    document.addEventListener('pointerup', function() {
      setTimeout(injectMarketExchange, 60);
    }, true);
  }

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', startMarketObserver);
  } else {
    startMarketObserver();
  }
})();
