(function() {
  if (window.__mreoEcosystemSynergyV172) return;
  window.__mreoEcosystemSynergyV172 = true;

  const CLUB_REG_MAP = {
    c77: ['77', '97', '99', '777'],
    c95: ['95'],
    c78: ['78', '98', '198'],
    c05: ['05'],
    c76: ['76'],
    c23: ['23', '93', '123']
  };

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
    return null;
  }

  function saveSt(st) {
    if (window.__mreoBridge && typeof window.__mreoBridge.save === 'function') {
      window.__mreoBridge.save();
      return;
    }
    try { localStorage.setItem(getSaveKey(), JSON.stringify(st)); } catch (_) {}
  }

  // Глобальный калькулятор взаимосвязей (доступен всем модулям)
  window.getMreoEcosystemBonuses = function() {
    const st = getSt() || {};
    const clubId = st.myClubId || '';
    const clubRegs = CLUB_REG_MAP[clubId] || [];
    const rep = Math.min(100, Math.max(0, Number(st.bizRep) || 40));
    const hasEquipped = Boolean(st.equippedPlate);
    const assets = (st.bizAssets && typeof st.bizAssets === 'object') ? st.bizAssets : {};
    const totalShares = Object.values(assets).reduce((a, b) => a + (Number(b) || 0), 0);

    // 1. Синергия клуба и коммерческих долей региона
    let clubAssetSynergy = false;
    if (clubId === 'c76' && (Number(assets.ast_76) || 0) > 0) clubAssetSynergy = true;
    if (clubId === 'c77' && (Number(assets.ast_77) || 0) > 0) clubAssetSynergy = true;
    if (clubId === 'c78' && (Number(assets.ast_78) || 0) > 0) clubAssetSynergy = true;

    // 2. Множитель ренты от оснащённого номера (+15%) и синергии с клубом (+25%)
    const rentMult = (1 + (hasEquipped ? 0.15 : 0) + (clubAssetSynergy ? 0.25 : 0));

    // 3. Условия ломбарда от деловой репутации
    const pawnLtv = rep >= 50 ? 0.80 : 0.70;
    const pawnRateShort = rep >= 50 ? 1.04 : 1.08;
    const pawnRateLong = rep >= 50 ? 1.10 : 1.18;

    return {
      clubId,
      clubRegs,
      rep,
      hasEquipped,
      totalShares,
      clubAssetSynergy,
      rentMult: Number(rentMult.toFixed(2)),
      pawnLtv,
      pawnRateShort,
      pawnRateLong
    };
  };

  // Применяем региональный бонус Автоклуба (+20%) к номерам своего региона в Боксе
  function applyCrossModuleSync() {
    const st = getSt();
    if (!st) return;
    const eco = window.getMreoEcosystemBonuses();
    let changed = false;

    if (eco.clubRegs.length > 0 && Array.isArray(st.plates)) {
      for (let i = 0; i < st.plates.length; i++) {
        const p = st.plates[i];
        if (!p || p._clubBoostApplied) continue;
        if (eco.clubRegs.includes(String(p.reg || ''))) {
          p.val = Math.round(((Number(p.val) || 5000) * 1.20) / 500) * 500;
          p._clubBoostApplied = true;
          changed = true;
        }
      }
    }

    if (changed) saveSt(st);
  }

  // Начисляем очки в Битву регионов при активности в других модулях (полировка, слияние, ставки, рента)
  document.addEventListener('pointerdown', function(e) {
    if (!e.target || !e.target.closest) return;
    const actionEl = e.target.closest('[data-box-action], [data-auc-bid], [data-fut-bet], [data-biz-collect-rent], [data-biz-buy-asset], [data-drag-btn]');
    if (!actionEl) return;

    setTimeout(function() {
      const st = getSt();
      if (!st) return;
      if (st.myClubId) {
        st.clubPts = (Number(st.clubPts) || 0) + 15;
      }
      st.bizRep = Math.min(100, (Number(st.bizRep) || 40) + 1);
      applyCrossModuleSync();
      saveSt(st);
    }, 120);
  }, true);

  // Отображаем живую строку активных связок внутри карточки "ИНДЕКС ВЛИЯНИЯ МРЭО"
  function renderEcosystemFooter() {
    const synCard = document.getElementById('mreo-synergy-card');
    if (!synCard) return;
    const eco = window.getMreoEcosystemBonuses();

    let bar = document.getElementById('mreo-eco-link-bar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'mreo-eco-link-bar';
      bar.style.cssText = 'margin-top:8px;padding-top:7px;border-top:1px solid rgba(255,255,255,0.08);display:flex;justify-content:space-between;align-items:center;font-size:11px;color:#94a3b8;flex-wrap:wrap;gap:4px;';
      synCard.appendChild(bar);
    }

    const clubTag = eco.clubRegs.length > 0 ? ('Регион +' + 20 + '%') : 'Нет клуба';
    const repTag = 'Репутация: ' + eco.rep + '/100';
    const rentTag = 'Рента: ×' + eco.rentMult;

    bar.innerHTML =
      '<span>Связка: <b style="color:#fde047;">' + clubTag + '</b> · <b style="color:#38bdf8;">' + repTag + '</b></span>' +
      '<span>Доход долей: <b style="color:#4ade80;">' + rentTag + '</b></span>';
  }

  function bootEco() {
    applyCrossModuleSync();
    renderEcosystemFooter();
    setInterval(function() {
      applyCrossModuleSync();
      renderEcosystemFooter();
    }, 1200);
  }

  if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', bootEco);
  else bootEco();
})();