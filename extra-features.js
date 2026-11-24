(function() {
  if (window.__mreoExtraV159) return;
  window.__mreoExtraV159 = true;

  let lock = false;
  let roundData = null;

  const BOTS = ['Перекуп_77', 'Кортеж_95', 'Спецбат_78', 'Агент_МРЭО', 'Инсайдер_05'];
  const LOTS = [
    { f: 'К', d: '707', t: 'МР', reg: '77', start: 42000, market: 135000, rar: 'rare' },
    { f: 'О', d: '555', t: 'ОО', reg: '78', start: 58000, market: 175000, rar: 'epic' },
    { f: 'А', d: '909', t: 'АМ', reg: '95', start: 64000, market: 195000, rar: 'epic' },
    { f: 'В', d: '333', t: 'ОР', reg: '97', start: 49000, market: 150000, rar: 'rare' }
  ];

  const RANKS = [
    { min: 0, name: 'Стажёр МРЭО', bonusPct: 0 },
    { min: 5, name: 'Младший инспектор', bonusPct: 10 },
    { min: 15, name: 'Инспектор ДПС', bonusPct: 22 },
    { min: 30, name: 'Старший инспектор', bonusPct: 35 },
    { min: 55, name: 'Капитан спецбатальона', bonusPct: 50 },
    { min: 90, name: 'Начальник отдела МРЭО', bonusPct: 75 }
  ];
  const VALID_CHARS = ['А', 'В', 'Е', 'К', 'М', 'Н', 'О', 'Р', 'С', 'Т', 'У', 'Х'];
  const FAKE_CHARS = ['Q', 'W', 'Z', 'Г', 'Д', 'Ж', 'И', 'Ф', 'Я', 'Л'];

  const CLUBS = [
    { id: 'c77', reg: '77', name: 'Автоклуб 77 · Москва', basePts: 14200 },
    { id: 'c95', reg: '95', name: 'Автоклуб 95 · Грозный', basePts: 13850 },
    { id: 'c78', reg: '78', name: 'Автоклуб 78 · Санкт-Петербург', basePts: 12900 },
    { id: 'c05', reg: '05', name: 'Автоклуб 05 · Дагестан', basePts: 12400 },
    { id: 'c76', reg: '76', name: 'Автоклуб 76 · Ярославль', basePts: 11600 },
    { id: 'c23', reg: '23', name: 'Автоклуб 23 · Краснодар', basePts: 11200 }
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

  function ensureAuctionLot(st) {
    const now = Date.now();
    if (st.confAuc && st.confAuc.endsAt && st.confAuc.endsAt > now) return st.confAuc;
    if (st.confAuc && st.confAuc.leader === 'Вы' && !st.confAuc.claimed) {
      st.confAuc.claimed = true;
      if (!Array.isArray(st.plates)) st.plates = [];
      st.plates.unshift({
        id: 'auc_' + now + '_' + Math.floor(Math.random() * 999),
        f: st.confAuc.f, d: st.confAuc.d, t: st.confAuc.t, reg: st.confAuc.reg,
        val: st.confAuc.market, rar: st.confAuc.rar
      });
      notify('Вы выиграли конфискат ' + st.confAuc.code + '! Номер отправлен в Бокс.');
    }
    const pick = LOTS[Math.floor(Math.random() * LOTS.length)];
    st.confAuc = {
      code: pick.f + ' ' + pick.d + ' ' + pick.t + ' ' + pick.reg,
      f: pick.f, d: pick.d, t: pick.t, reg: pick.reg,
      bid: pick.start, step: 6500, market: pick.market, rar: pick.rar,
      leader: BOTS[Math.floor(Math.random() * BOTS.length)],
      endsAt: now + 45000, claimed: false
    };
    saveSt(st, false);
    return st.confAuc;
  }

  function updateAuctionUI() {
    const box = document.getElementById('mreo-confiscate-auction');
    if (!box) return;
    const st = getSt();
    const lot = ensureAuctionLot(st);
    const secLeft = Math.max(0, Math.ceil((lot.endsAt - Date.now()) / 1000));
    const isMe = lot.leader === 'Вы';
    const nextBid = lot.bid + lot.step;

    box.innerHTML =
      '<div style="display:table;width:100%;margin-bottom:10px;">' +
        '<span style="display:table-cell;text-align:left;vertical-align:middle;font-size:12px;font-weight:900;color:#facc15;letter-spacing:0.03em;">АУКЦИОН КОНФИСКАТА МРЭО</span>' +
        '<span style="display:table-cell;text-align:right;vertical-align:middle;"><span style="display:inline-block;background:rgba(248,113,113,0.18);color:#f87171;font-size:11px;font-weight:900;padding:2px 8px;border-radius:999px;">00:' + String(secLeft).padStart(2, '0') + '</span></span>' +
      '</div>' +
      '<div style="background:rgba(15,23,42,0.9);border:1px solid ' + (isMe ? 'rgba(74,222,128,0.45)' : 'rgba(255,255,255,0.08)') + ';border-radius:14px;padding:11px 12px;display:flex;justify-content:space-between;align-items:center;gap:10px;">' +
        '<div style="min-width:0;">' +
          '<div style="font-size:17px;font-weight:900;color:#fff;letter-spacing:0.03em;">' + lot.code + '</div>' +
          '<div style="font-size:11.5px;color:#94a3b8;margin-top:2px;">Лидер: <b style="color:' + (isMe ? '#4ade80' : '#fde047') + ';">' + lot.leader + '</b> · Рынок: ' + lot.market.toLocaleString('ru-RU') + ' ₽</div>' +
          '<div style="font-size:12px;color:#38bdf8;margin-top:2px;">Текущая ставка: <b>' + lot.bid.toLocaleString('ru-RU') + ' ₽</b></div>' +
        '</div>' +
        '<button type="button" class="btn small ' + (isMe ? '' : 'primary') + '" style="flex-shrink:0;" data-auc-bid="1">' + (isMe ? 'Вы лидер' : ('Перебить · ' + nextBid.toLocaleString('ru-RU') + ' ₽')) + '</button>' +
      '</div>';
  }

  function getCurrentRank(st) {
    const wins = Number(st.dpsWins) || 0;
    let cur = RANKS;
    for (const r of RANKS) if (wins >= r.min) cur = r;
    return { wins, rank: cur };
  }

  function makeValidPlate() {
    const r = () => VALID_CHARS[Math.floor(Math.random() * VALID_CHARS.length)];
    const num = String(Math.floor(100 + Math.random() * 899));
    const regs = ['77', '97', '78', '95', '05', '76', '23', '198'];
    return r() + ' ' + num + ' ' + r() + r() + ' ' + regs[Math.floor(Math.random() * regs.length)];
  }

  function makeFakePlate() {
    const r = () => VALID_CHARS[Math.floor(Math.random() * VALID_CHARS.length)];
    const bad = FAKE_CHARS[Math.floor(Math.random() * FAKE_CHARS.length)];
    const num = String(Math.floor(100 + Math.random() * 899));
    const regs = ['77', '97', '78', '95', '05', '76'];
    const pos = Math.floor(Math.random() * 3);
    const c1 = pos === 0 ? bad : r();
    const c2 = pos === 1 ? bad : r();
    const c3 = pos === 2 ? bad : r();
    return { code: c1 + ' ' + num + ' ' + c2 + c3 + ' ' + regs[Math.floor(Math.random() * regs.length)], badChar: bad };
  }

  function renderDpsCard() {
    const card = document.getElementById('mreo-dps-patrol-card');
    if (!card) return;
    const st = getSt();
    const wins = Number(st.dpsWins) || 0;

    let bodyHtml = '';
    if (!roundData) {
      bodyHtml =
        '<div style="font-size:12px;color:#cbd5e1;margin-bottom:10px;line-height:1.45;">Закрытые котировки теневого рынка. Выберите серию спецномеров, чей индекс пойдёт вверх в ближайшие 10 секунд, и заберите ×1.85 от ставки.</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">' +
          '<button type="button" class="btn small primary" style="width:100%;justify-content:center;" data-fut-bet="АМР 97">АМР 97</button>' +
          '<button type="button" class="btn small primary" style="width:100%;justify-content:center;" data-fut-bet="ЕКХ 77">ЕКХ 77</button>' +
          '<button type="button" class="btn small primary" style="width:100%;justify-content:center;" data-fut-bet="ООО 78">ООО 78</button>' +
        '</div>' +
        '<div style="font-size:11px;color:#94a3b8;margin-top:8px;text-align:center;">Фиксированный лот: <b>25 000 ₽</b> · Выплата при точном прогнозе: <b>46 250 ₽</b></div>';
    } else {
      const sec = Math.max(0, Math.ceil((roundData.endsAt - Date.now()) / 1000));
      bodyHtml =
        '<div style="background:rgba(15,23,42,0.9);border:1px solid rgba(56,189,248,0.35);border-radius:12px;padding:12px;text-align:center;">' +
          '<div style="font-size:11.5px;color:#94a3b8;">Позиция открыта: <b style="color:#fde047;">' + roundData.series + '</b> (ставка 25 000 ₽)</div>' +
          '<div style="font-size:18px;font-weight:900;color:#38bdf8;margin:6px 0;">Идёт фиксация спроса: 00:' + String(sec).padStart(2, '0') + '</div>' +
          '<div style="font-size:11px;color:#64748b;">Ожидаем закрытие торгов по инсайду...</div>' +
        '</div>';
    }

    card.innerHTML =
      '<div class="mreo-ext-head">' +
        '<span class="mreo-ext-title" style="color:#38bdf8 !important;">ТЕНЕВЫЕ КОТИРОВКИ · ФЬЮЧЕРСЫ РФ</span>' +
        '<span class="mreo-ext-badge">Сделок: ' + wins + '</span>' +
      '</div>' + bodyHtml;
  }

  function renderClubsPanel() {
    const card = document.getElementById('mreo-region-clubs-card');
    if (!card) return;
    const st = getSt();
    const myId = st.myClubId || '';
    const myPts = Number(st.clubPts) || 0;

    const sorted = CLUBS.map(c => ({ ...c, totalPts: c.basePts + (c.id === myId ? myPts : 0) })).sort((a, b) => b.totalPts - a.totalPts);

    const rowsHtml = sorted.map((c, idx) => {
      const isMine = c.id === myId;
      return (
        '<div class="mreo-ext-row' + (isMine ? ' is-mine' : '') + '">' +
          '<div><b style="font-size:12.5px;color:#fff;">#' + (idx + 1) + ' ' + c.name + '</b>' +
          '<div style="font-size:11px;color:#94a3b8;margin-top:2px;">Очки региона: <b style="color:#4ade80;">' + c.totalPts.toLocaleString('ru-RU') + '</b></div></div>' +
          (isMine
            ? '<span style="font-size:11px;font-weight:900;color:#fde047;flex-shrink:0;">ВАШ КЛУБ</span>'
            : '<button type="button" class="btn small primary" style="flex-shrink:0;" data-club-join="' + c.id + '">Вступить</button>'
          ) +
        '</div>'
      );
    }).join('');

    const actionsHtml = myId
      ? ('<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px;">' +
          '<button type="button" class="btn small primary" style="width:100%;" data-club-donate="1">В общак · 25 000 ₽</button>' +
          '<button type="button" class="btn small" style="width:100%;" data-club-claim="1">Бонус клуба (+18к)</button>' +
        '</div>')
      : '<div style="font-size:11.5px;color:#94a3b8;margin-top:8px;">Выберите свой регион, чтобы участвовать в Битве регионов РФ и получать бонусы.</div>';

    card.innerHTML =
      '<div class="mreo-ext-head">' +
        '<span class="mreo-ext-title">АВТОКЛУБЫ · БИТВА РЕГИОНОВ</span>' +
        '<span class="mreo-ext-badge">Вклад: ' + myPts + ' очк.</span>' +
      '</div>' +
      '<div class="mreo-ext-list">' + rowsHtml + '</div>' +
      actionsHtml;
  }

  function injectAll() {
if (lock) return;
const view = document.getElementById('view');
if (!view) return;
const txt = view.textContent || '';
const activeTab = document.querySelector('.dock-item.active, nav .active');
const tabTxt = activeTab ? (activeTab.textContent || '') : '';
lock = true;
try {
if ((txt.includes('Биржа номеров') || tabTxt.includes('Рынок')) && !document.getElementById('mreo-confiscate-auction')) {
const panel = document.createElement('section');
panel.className = 'panel';
panel.id = 'mreo-confiscate-auction';
panel.style.cssText = 'width:100% !important;box-sizing:border-box !important;margin:0 0 12px 0 !important;padding:13px !important;background:linear-gradient(135deg,#241c2c 0%,#12151f 100%) !important;border:1px solid rgba(250,204,21,0.32) !important;';
view.insertAdjacentElement('afterbegin', panel);
updateAuctionUI();
}
if ((txt.includes('Мини-игры') || txt.includes('СТАВКИ МРЭО') || tabTxt.includes('Игры')) && !document.getElementById('mreo-dps-patrol-card')) {
const panel = document.createElement('section');
panel.className = 'panel';
panel.id = 'mreo-dps-patrol-card';
panel.style.cssText = 'width:100% !important;box-sizing:border-box !important;margin:0 0 12px 0 !important;padding:13px !important;background:linear-gradient(135deg,#152236 0%,#11151f 100%) !important;border:1px solid rgba(56,189,248,0.32) !important;';
view.insertAdjacentElement('afterbegin', panel);
renderDpsCard();
}
if ((txt.includes('Инкогнито') || txt.includes('Реферал') || txt.includes('Напарник') || txt.includes('Статистика') || tabTxt.includes('Профиль')) && !document.getElementById('mreo-region-clubs-card')) {
const panel = document.createElement('section');
panel.className = 'panel';
panel.id = 'mreo-region-clubs-card';
panel.style.cssText = 'width:100% !important;box-sizing:border-box !important;margin:0 0 12px 0 !important;padding:13px !important;background:linear-gradient(135deg,#1d1f2e 0%,#12151f 100%) !important;border:1px solid rgba(250,204,21,0.28) !important;';
const panels = Array.from(view.querySelectorAll('section.panel, .panel')); const tasksPanel = panels.find(p => (p.textContent || '').toUpperCase().includes('ГОСЗАДАНИЯ')); if (tasksPanel) { tasksPanel.insertAdjacentElement('afterend', panel); } else { view.appendChild(panel); }
renderClubsPanel();
}
} finally {
lock = false;
}
}
document.addEventListener('pointerdown', function(e) {
if (!e.target || !e.target.closest) return;
if (e.target.closest('[data-auc-bid]')) {
e.preventDefault(); e.stopImmediatePropagation();
const st = getSt();
const lot = ensureAuctionLot(st);
const nextBid = lot.bid + lot.step;
const bal = Number(st.cash) || 0;
if (bal < nextBid) { notify('Не хватает ' + (nextBid - bal).toLocaleString('ru-RU') + ' ₽ для ставки!'); return; }
if (lot.leader === 'Вы') { notify('Ваша ставка уже лидирует!'); return; }
st.cash = bal - nextBid;
lot.bid = nextBid;
lot.leader = 'Вы';
lot.endsAt = Math.max(lot.endsAt, Date.now() + 9000);
saveSt(st, false);
updateAuctionUI();
notify('Ставка принята: ' + nextBid.toLocaleString('ru-RU') + ' ₽!');
return;
}
const futBtn = e.target.closest('[data-fut-bet]');
    if (futBtn && !roundData) {
      e.preventDefault(); e.stopImmediatePropagation();
      const st = getSt();
      const bal = Number(st.cash) || 0;
      if (bal < 25000) { notify('Для входа в сделку нужно 25 000 ₽'); return; }
      st.cash = bal - 25000;
      saveSt(st, false);
      const chosen = futBtn.getAttribute('data-fut-bet');
      roundData = { series: chosen, endsAt: Date.now() + 7000 };
      renderDpsCard();

      const tmr = setInterval(function() {
        if (!roundData) { clearInterval(tmr); return; }
        if (Date.now() >= roundData.endsAt) {
          clearInterval(tmr);
          const allSeries = ['АМР 97', 'ЕКХ 77', 'ООО 78'];
          const winner = allSeries[Math.floor(Math.random() * allSeries.length)];
          const won = (winner === roundData.series) || (Math.random() < 0.18);
          roundData = null;
          const stNow = getSt();
          if (won) {
            stNow.dpsWins = (Number(stNow.dpsWins) || 0) + 1;
            stNow.cash = (Number(stNow.cash) || 0) + 46250;
            saveSt(stNow, false);
            notify('Инсайд сработал! Серия ' + chosen + ' выросла. Профит: +46 250 ₽');
          } else {
            notify('Рынок развернулся: в топ вышла серия ' + winner + '. Сделка закрыта в минус.');
          }
          renderDpsCard();
        } else {
          renderDpsCard();
        }
      }, 500);
      return;
    }

    const jBtn = e.target.closest('[data-club-join]');
if (jBtn) {
e.preventDefault(); e.stopImmediatePropagation();
const st = getSt();
st.myClubId = jBtn.getAttribute('data-club-join');
st.clubPts = (Number(st.clubPts) || 0) + 150;
saveSt(st, false);
renderClubsPanel();
const c = CLUBS.find(x => x.id === st.myClubId);
if (c) notify('Вы вступили в ' + c.name + ' (+150 очков влияния)!');
return;
}
if (e.target.closest('[data-club-donate]')) {
e.preventDefault(); e.stopImmediatePropagation();
const st = getSt();
if (!st.myClubId) return;
const bal = Number(st.cash) || 0;
if (bal < 25000) { notify('Для взноса в общак нужно 25 000 ₽'); return; }
st.cash = bal - 25000;
st.clubPts = (Number(st.clubPts) || 0) + 320;
saveSt(st, false);
renderClubsPanel();
notify('Взнос в общак принят! +320 очков в Битву регионов');
return;
}
if (e.target.closest('[data-club-claim]')) {
e.preventDefault(); e.stopImmediatePropagation();
const st = getSt();
if (!st.myClubId) return;
const today = new Date().toISOString().slice(0, 10);
if (st.clubLastClaim === today) { notify('Сегодняшний бонус клуба уже получен!'); return; }
st.clubLastClaim = today;
st.cash = (Number(st.cash) || 0) + 18000;
st.free = (Number(st.free) || 0) + 2;
saveSt(st, false);
renderClubsPanel();
notify('Бонус клуба получен: +18 000 ₽ и +2 талона!');
}
}, true);
function boot() {
injectAll();
setInterval(injectAll, 300);
setInterval(function() {
if (document.getElementById('mreo-confiscate-auction')) {
const st = getSt();
if (st && st.confAuc) {
if (st.confAuc.endsAt <= Date.now()) ensureAuctionLot(st);
else if (st.confAuc.leader === 'Вы' && st.confAuc.bid < st.confAuc.market * 0.72 && Math.random() < 0.42) {
st.confAuc.bid += st.confAuc.step;
st.confAuc.leader = BOTS[Math.floor(Math.random() * BOTS.length)];
saveSt(st, false);
}
}
updateAuctionUI();
}
}, 1000);
}
if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', boot);
else boot();
})();