(function() {
  if (window.__mreoSmartEconomyV186) return;
  window.__mreoSmartEconomyV186 = true;

  const VIP_SERIES = ['АМР', 'ЕКХ', 'ООО', 'ММР', 'ВОР', 'КМР', 'ААА', 'ВВВ', 'МММ', 'ССС', 'ХХХ', 'ТТТ', 'ККК', 'ННН', 'РРР', 'УУУ', 'ЕЕЕ'];

  function findSaveKey() {
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
      const raw = localStorage.getItem(findSaveKey());
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return null;
  }

  function saveSt(st) {
    if (window.__mreoBridge && typeof window.__mreoBridge.save === 'function') {
      window.__mreoBridge.save();
      return;
    }
    try { localStorage.setItem(findSaveKey(), JSON.stringify(st)); } catch (_) {}
  }

  // Определяем, является ли номер блатным/редким по комбинации букв и цифр
  function getPlatePrestigeTier(p) {
    const f = String(p.f || p.a || '').toUpperCase();
    const t = String(p.t || p.b || '').toUpperCase();
    const d = String(p.d || p.num || '');
    const letters = f + t;

    const isAllSameDigits = d.length === 3 && d === d[1] && d[1] === d[2]; // 777, 888, 000
    const isMirrorDigits = d.length === 3 && d === d[2] && !isAllSameDigits; // 808, 707, 505
    const isFirstTen = d === '001' || d === '007' || d === '009' || d === '100';
    const isVipLetters = VIP_SERIES.includes(letters) || (letters.length === 3 && letters === letters[1] && letters[1] === letters[2]);

    if (isVipLetters && (isAllSameDigits || isFirstTen)) return 'legend';
    if (isVipLetters || isAllSameDigits) return 'epic';
    if (isMirrorDigits || isFirstTen) return 'rare';
    return 'common';
  }

  function getMaxPlateCapByLevel(lvl, tier) {
    if (tier === 'legend') return Math.max(320000, lvl * 120000);
    if (tier === 'epic') return Math.max(145000, lvl * 65000);
    if (tier === 'rare') return Math.max(68000, lvl * 32000);

    // Обычные номера на старте не дают мгновенного миллиона
    if (lvl <= 1) return 18000;
    if (lvl === 2) return 32000;
    if (lvl === 3) return 58000;
    if (lvl <= 5) return 120000;
    return 450000;
  }

  function balancePlatesValuation() {
    const st = getSt();
    if (!st || !Array.isArray(st.plates)) return;
    const lvl = Math.max(1, Number(st.lvl) || 1);
    let changed = false;

    for (let i = 0; i < st.plates.length; i++) {
      const p = st.plates[i];
      if (!p || typeof p.val !== 'number') continue;
      if (String(p.id || '').startsWith('vip_')) continue;

      const tier = getPlatePrestigeTier(p);
      const cap = getMaxPlateCapByLevel(lvl, tier);

      // Поднимаем несправедливо заниженную цену у блатных номеров (например, О 808 ОО или В 707 ОР)
      if (tier === 'legend' && p.val < 240000) {
        p.val = 265000;
        p.rar = 'spec';
        changed = true;
      } else if (tier === 'epic' && p.val < 95000) {
        p.val = 115000;
        p.rar = 'epic';
        changed = true;
      } else if (tier === 'rare' && p.val < 42000) {
        p.val = 48000;
        p.rar = 'rare';
        changed = true;
      } else if (p.val > cap) {
        p.val = Math.max(3500, Math.round((cap * (0.7 + Math.random() * 0.3)) / 500) * 500);
        changed = true;
      }
    }

    if (changed) saveSt(st);
  }

  document.addEventListener('click', function() {
    setTimeout(balancePlatesValuation, 60);
  }, true);

  window.addEventListener('DOMContentLoaded', balancePlatesValuation);
  setTimeout(balancePlatesValuation, 200);
})();