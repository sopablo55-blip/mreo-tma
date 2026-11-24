(function() {
  if (window.__mreoGarageProV127) return;
  window.__mreoGarageProV127 = true;

  let garLock = false;
  let dragTimer = null;
  let dragGreenAt = 0;
  let dragActive = false;

  function findSaveKey() {
    for (const k of ['mreo_tma_save_v2', 'mreo_tma_save', 'mreo_v1', 'mreo_save']) {
      if (localStorage.getItem(k)) return k;
    }
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      const raw = localStorage.getItem(k) || '';
      if (raw.includes('"cash"') && (raw.includes('"plates"') || raw.includes('"cars"'))) return k;
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
    // Фоллбэк: читаем текущий баланс прямо из шапки, если localStorage пуст
    const topCashEl = document.getElementById('cash') || document.querySelector('.top-bar button, .pill-cash');
    const parsedCash = topCashEl ? Number(String(topCashEl.textContent || '').replace(/[^0-9]/g, '')) : 0;
    return { cash: parsedCash || 50000, cars: ['Lada Vesta'], plates: [] };
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
    const statusEl = document.getElementById('mreo-drag-status');
    if (statusEl) {
      statusEl.innerHTML = '<b style="color:#fde047;">' + msg + '</b>';
    }
    if (window.__mreoBridge && typeof window.__mreoBridge.toast === 'function') {
      window.__mreoBridge.toast(msg);
    }
  }

  function getEquippedPlateObj(st) {
    if (!st || !st.equippedPlate || !Array.isArray(st.plates)) return null;
    return st.plates.find(p => p && p.id === st.equippedPlate) || null;
  }

  function formatPlate(p) {
    if (!p) return '';
    return (p.f || p.a || '') + ' ' + (p.d || p.num || '') + ' ' + (p.t || p.b || '') + ' ' + (p.reg || '');
  }

  function getGarageStats(st) {
    const carsCount = Array.isArray(st.cars) ? Math.max(1, st.cars.length) : 1;
    const platesCount = Array.isArray(st.plates) ? st.plates.length : 0;
    const ceramicLvl = Number(st.garCeramic) || 0;
    const exhaustLvl = Number(st.garExhaust) || 0;
    const tintInstalled = Boolean(st.garTint);
    const radarInstalled = Boolean(st.garRadar);
    const eqPlate = getEquippedPlateObj(st);

    const eqMult = eqPlate ? 1.35 : 1.0;
    const tintMult = tintInstalled ? 1.15 : 1.0;
    const ratePerMin = Math.round((carsCount * 320 + platesCount * 65) * (1 + ceramicLvl * 0.2 + exhaustLvl * 0.25) * eqMult * tintMult);

    const lastCollect = Number(st.garLastCollect) || Date.now();
    if (!st.garLastCollect) st.garLastCollect = lastCollect;
    const minsPassed = Math.min(240, Math.max(0, (Date.now() - lastCollect) / 60000));
    const accumulated = Math.floor(minsPassed * ratePerMin);

    return { carsCount, ceramicLvl, exhaustLvl, tintInstalled, radarInstalled, eqPlate, ratePerMin, accumulated };
  }

  window.garageCollectIncome = function() {
    const st = getSt();
    if (!st) return;
    const info = getGarageStats(st);
    if (info.accumulated < 100) {
      notify('Выручка автопарка ещё копится (' + info.ratePerMin.toLocaleString('ru-RU') + ' ₽/мин)');
      return;
    }
    st.cash = (Number(st.cash) || 0) + info.accumulated;
    st.garLastCollect = Date.now();
    notify('Выручка автопарка собрана: +' + info.accumulated.toLocaleString('ru-RU') + ' ₽!');
    saveAndRefresh(st);
  };

  window.garageUpgradeCeramic = function() {
    const st = getSt();
    if (!st) return;
    const lvl = Number(st.garCeramic) || 0;
    if (lvl >= 5) { notify('Керамика кузова на максимуме (5/5)!'); return; }
    const cost = Math.round(18000 * Math.pow(1.65, lvl));
    if ((Number(st.cash) || 0) < cost) { notify('Не хватает ' + (cost - Number(st.cash)).toLocaleString('ru-RU') + ' ₽'); return; }
    st.cash -= cost;
    st.garCeramic = lvl + 1;
    notify('Керамика Ур. ' + (lvl + 1) + '/5 установлена! Доход парка +20%');
    saveAndRefresh(st);
  };

  window.garageUpgradeExhaust = function() {
    const st = getSt();
    if (!st) return;
    const lvl = Number(st.garExhaust) || 0;
    if (lvl >= 5) { notify('Выхлоп на максимуме (5/5)!'); return; }
    const cost = Math.round(24000 * Math.pow(1.7, lvl));
    if ((Number(st.cash) || 0) < cost) { notify('Не хватает ' + (cost - Number(st.cash)).toLocaleString('ru-RU') + ' ₽'); return; }
    st.cash -= cost;
    st.garExhaust = lvl + 1;
    notify('Выхлоп Stage ' + (lvl + 1) + '/5 установлен! Доход парка +25%');
    saveAndRefresh(st);
  };

  window.garageBuyGadget = function(type) {
    const st = getSt();
    if (!st) return;
    if (type === 'tint') {
      if (st.garTint) { notify('Тонировка в круг уже установлена!'); return; }
      if ((Number(st.cash) || 0) < 35000) { notify('Нужно 35 000 ₽ на тонировку'); return; }
      st.cash -= 35000;
      st.garTint = true;
      notify('Тонировка в круг установлена! +15% к престижу и выручке парка');
    } else if (type === 'radar') {
      if (st.garRadar) { notify('Антирадар уже установлен!'); return; }
      if ((Number(st.cash) || 0) < 48000) { notify('Нужно 48 000 ₽ на антирадар'); return; }
      st.cash -= 48000;
      st.garRadar = true;
      notify('Антирадар установлен! Защита от постов ДПС на заездах');
    }
    saveAndRefresh(st);
  };

  // Интерактивный Драг-заезд на 402 метра прямо в Гараже
  window.garageStartDragRace = function() {
    const st = getSt();
    if (!st) return;
    const btn = document.getElementById('mreo-drag-btn');
    const statusEl = document.getElementById('mreo-drag-status');
    if (!btn || !statusEl) return;

    if (!dragActive) {
      const bet = 20000;
      if ((Number(st.cash) || 0) < bet) {
        notify('Для старта на 402м нужно 20 000 ₽');
        return;
      }
      st.cash -= bet;
      if (window.__mreoBridge && typeof window.__mreoBridge.save === 'function') window.__mreoBridge.save();

      dragActive = true;
      dragGreenAt = 0;
      btn.textContent = 'ЖДИ ЗЕЛЁНЫЙ... (НЕ ЖМИ РАНЬШЕ!)';
      btn.style.background = '#dc2626';
      btn.style.color = '#fff';
      statusEl.innerHTML = 'Светофор: <b style="color:#f87171;">ВНИМАНИЕ, ПРОГРЕВ РЕЗИНЫ...</b>';

      const delay = 1400 + Math.floor(Math.random() * 1900);
      dragTimer = setTimeout(function() {
        dragGreenAt = performance.now();
        btn.textContent = 'ЖМИ ГАЗ СЕЙЧАС!';
        btn.style.background = '#16a34a';
        btn.style.color = '#fff';
        statusEl.innerHTML = 'Светофор: <b style="color:#4ade80;">ЗЕЛЁНЫЙ! ГАЗ В ПОЛ!</b>';
      }, delay);
      return;
    }

    // Игрок нажал кнопку во время заезда
    clearTimeout(dragTimer);
    dragActive = false;

    if (!dragGreenAt) {
      notify('ФАЛЬСТАРТ! Вы тронулись на красный (-20 000 ₽)');
      saveAndRefresh(st);
      return;
    }

    const reactionMs = Math.round(performance.now() - dragGreenAt);
    const info = getGarageStats(st);
    const maxWindow = 520 + info.exhaustLvl * 45 + (info.radarInstalled ? 70 : 0);

    if (reactionMs <= maxWindow) {
      const mult = reactionMs <= 260 ? 2.6 : 2.05;
      const winSum = Math.round(14500 * mult * (1 + info.ceramicLvl * 0.08));
      st.cash = (Number(st.cash) || 0) + winSum;
      notify('ФИНИШ! Реакция ' + reactionMs + ' мс · Выигрыш: +' + winSum.toLocaleString('ru-RU') + ' ₽!');
    } else {
      notify('Поздний старт (' + reactionMs + ' мс)! Соперник ушёл вперёд (-20 000 ₽)');
    }
    saveAndRefresh(st);
  };

  function isGarageTabActive() {
    const activeBtns = Array.from(document.querySelectorAll('.active'));
    if (activeBtns.some(el => (el.textContent || '').includes('Гараж'))) return true;
    const view = document.getElementById('view');
    const txt = view ? (view.textContent || '') : '';
    return txt.includes('VIP-ГАРАЖ') || txt.includes('Автосалон (');
  }

  function injectGarageStudio() {
    if (garLock) return;
    const view = document.getElementById('view');
    if (!view || document.getElementById('mreo-garage-studio')) return;
    if (!isGarageTabActive()) return;

    const st = getSt() || { cash: 0, cars: [], plates: [] };
    garLock = true;
    try {
      const info = getGarageStats(st);
      const cerCost = Math.round(18000 * Math.pow(1.65, info.ceramicLvl));
      const exhCost = Math.round(24000 * Math.pow(1.7, info.exhaustLvl));
      const plateBadge = info.eqPlate
        ? ('<span style="background:rgba(74,222,128,0.18);color:#4ade80;padding:2px 8px;border-radius:999px;font-weight:900;">' + formatPlate(info.eqPlate) + ' (+35%)</span>')
        : ('<span style="background:rgba(250,204,21,0.16);color:#fde047;padding:2px 8px;border-radius:999px;font-weight:800;">Наденьте номер ниже (+35%)</span>');

      const boxStyle = 'background:rgba(15,23,42,0.88);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:10px 12px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;gap:10px;';

      const panel = document.createElement('section');
      panel.className = 'panel';
      panel.id = 'mreo-garage-studio';
      panel.style.cssText = 'padding:13px !important;margin-bottom:12px !important;background:linear-gradient(135deg,#1d1f2e 0%,#12151f 100%) !important;border:1px solid rgba(250,204,21,0.3) !important;';

      panel.innerHTML =
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:4px;">' +
          '<span style="font-size:12px;font-weight:900;color:#facc15;letter-spacing:0.04em;">ТЮНИНГ-АТЕЛЬЕ И ПАРКОВКА VIP</span>' +
          '<span style="font-size:11px;font-weight:800;color:#4ade80;">+' + info.ratePerMin.toLocaleString('ru-RU') + ' ₽/мин</span>' +
        '</div>' +

        '<div style="' + boxStyle + 'border-color:rgba(74,222,128,0.35);">' +
          '<div style="min-width:0;">' +
            '<div style="font-size:11.5px;color:#94a3b8;margin-bottom:3px;">Касса автопарка · ' + plateBadge + '</div>' +
            '<div style="font-size:18px;font-weight:900;color:#fde047;">' + info.accumulated.toLocaleString('ru-RU') + ' ₽</div>' +
          '</div>' +
          '<button type="button" class="btn small primary" style="flex-shrink:0;" onclick="window.garageCollectIncome()">Забрать</button>' +
        '</div>' +

        '<div style="' + boxStyle + '">' +
          '<div style="min-width:0;">' +
            '<div style="font-size:13px;font-weight:900;color:#fff;">Керамика кузова (' + info.ceramicLvl + '/5)</div>' +
            '<div class="muted" style="font-size:11px;margin-top:2px;">Увеличивает пассивный доход парка на +20%</div>' +
          '</div>' +
          '<button type="button" class="btn small primary" style="flex-shrink:0;" onclick="window.garageUpgradeCeramic()">' + (info.ceramicLvl >= 5 ? 'МАКС' : (cerCost.toLocaleString('ru-RU') + ' ₽')) + '</button>' +
        '</div>' +

        '<div style="' + boxStyle + '">' +
          '<div style="min-width:0;">' +
            '<div style="font-size:13px;font-weight:900;color:#fff;">Спортивный выхлоп (' + info.exhaustLvl + '/5)</div>' +
            '<div class="muted" style="font-size:11px;margin-top:2px;">Доход парка +25% и расширение окна старта</div>' +
          '</div>' +
          '<button type="button" class="btn small primary" style="flex-shrink:0;" onclick="window.garageUpgradeExhaust()">' + (info.exhaustLvl >= 5 ? 'МАКС' : (exhCost.toLocaleString('ru-RU') + ' ₽')) + '</button>' +
        '</div>' +

        '<div style="' + boxStyle + '">' +
          '<div style="min-width:0;">' +
            '<div style="font-size:13px;font-weight:900;color:#fff;">Тонировка в круг</div>' +
            '<div class="muted" style="font-size:11px;margin-top:2px;">Престиж и выручка автопарка +15%</div>' +
          '</div>' +
          '<button type="button" class="btn small ' + (info.tintInstalled ? '' : 'primary') + '" style="flex-shrink:0;" onclick="window.garageBuyGadget(\'tint\')">' + (info.tintInstalled ? 'Готово' : '35 000 ₽') + '</button>' +
        '</div>' +

        '<div style="' + boxStyle + '">' +
          '<div style="min-width:0;">' +
            '<div style="font-size:13px;font-weight:900;color:#fff;">Антирадар ДПС</div>' +
            '<div class="muted" style="font-size:11px;margin-top:2px;">+70 мс к окну идеального старта на 402м</div>' +
          '</div>' +
          '<button type="button" class="btn small ' + (info.radarInstalled ? '' : 'primary') + '" style="flex-shrink:0;" onclick="window.garageBuyGadget(\'radar\')">' + (info.radarInstalled ? 'Готово' : '48 000 ₽') + '</button>' +
        '</div>' +

        '<div style="background:rgba(15,23,42,0.9);border:1px solid rgba(56,189,248,0.28);border-radius:14px;padding:10px 12px;margin-top:2px;">' +
          '<div id="mreo-drag-status" style="font-size:11.5px;color:#cbd5e1;margin-bottom:8px;">Драг-рейсинг 402м: жми старт, дождись <b style="color:#4ade80;">ЗЕЛЁНОГО</b> и бей рекорд!</div>' +
          '<button id="mreo-drag-btn" type="button" class="btn primary" style="width:100%;" data-drag-btn="1">Старт заезда на 402м · 20 000 ₽</button>' +
        '</div>';

      // Вставляем строго перед блоком "Ваши госномера" (без учёта регистра CSS text-transform)
      const panels = Array.from(view.querySelectorAll('section.panel, .panel'));
      const platesPanel = panels.find(p => (p.textContent || '').toLowerCase().includes('ваши госномера') || (p.textContent || '').toLowerCase().includes('госномера ('));
      if (platesPanel) {
        platesPanel.insertAdjacentElement('beforebegin', panel);
      } else if (panels.length > 0) {
        panels.insertAdjacentElement('afterend', panel);
      } else {
        view.appendChild(panel);
      }
    } finally {
      garLock = false;
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

  function startGarageObserver() {
const view = document.getElementById('view');
if (!view) return;
injectGarageStudio(); fixYourPlatesContainer();
const obs = new MutationObserver(function() {
if (!garLock) injectGarageStudio(); fixYourPlatesContainer();
});
obs.observe(view, { childList: true });
document.addEventListener('pointerup', function() {
setTimeout(injectGarageStudio, 60);
}, true);
}

  document.addEventListener('pointerdown', function(e) {
    const dragBtn = e.target && e.target.closest ? e.target.closest('#mreo-drag-btn, [data-drag-btn]') : null;
    if (dragBtn) {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (typeof window.garageStartDragRace === 'function') window.garageStartDragRace();
    }
  }, true);

  if (document.readyState === 'loading') {
window.addEventListener('DOMContentLoaded', startGarageObserver);
} else {
startGarageObserver();
}
})();
