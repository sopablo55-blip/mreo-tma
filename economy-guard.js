(function() {
  if (window.__mreoHardEconomyV138) return;
  window.__mreoHardEconomyV138 = true;

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

  // Жёсткий потолок цены одного номера в зависимости от уровня игрока (защита от 1кк на старте)
  function getMaxPlateCapByLevel(lvl) {
    if (lvl <= 1) return 16000;
    if (lvl === 2) return 28000;
    if (lvl === 3) return 52000;
    if (lvl === 4) return 95000;
    if (lvl <= 6) return 210000;
    if (lvl <= 8) return 480000;
    return 2500000;
  }

  function clampNewPlates() {
    const st = getSt();
    if (!st || !Array.isArray(st.plates)) return;
    const lvl = Math.max(1, Number(st.lvl) || 1);
    const cap = getMaxPlateCapByLevel(lvl);
    let changed = false;

    for (let i = 0; i < st.plates.length; i++) {
      const p = st.plates[i];
      if (!p || typeof p.val !== 'number') continue;
      // Не режем только донатные/спецномера, выданные из VIP-наборов
      if (String(p.id || '').startsWith('vip_')) continue;
      if (p.val > cap) {
        p.val = Math.max(2500, Math.round((cap * (0.65 + Math.random() * 0.35)) / 500) * 500);
        if (p.rar === 'spec' || p.rar === 'legend' || p.rar === 'epic') {
          p.rar = lvl >= 4 ? 'rare' : 'common';
        }
        changed = true;
      }
    }

    if (changed) {
      if (window.__mreoBridge && typeof window.__mreoBridge.save === 'function') {
        window.__mreoBridge.save();
      } else {
        try { localStorage.setItem(findSaveKey(), JSON.stringify(st)); } catch (_) {}
      }
    }
  }

  // Проверяем после каждого клика (выдача номера, открытие кейса, покупка)
  document.addEventListener('click', function() {
    setTimeout(clampNewPlates, 60);
  }, true);

  window.addEventListener('DOMContentLoaded', clampNewPlates);
  setTimeout(clampNewPlates, 200);
})();
