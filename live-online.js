(function() {
  if (window.__mreoRealP2PMarketV196) return;
  window.__mreoRealP2PMarketV196 = true;

  let syncLock = false;
  let serverStatus = 'Подключение...';
  let cachedLb = [];
  let cachedLedger = [];
  let cachedMarket = [];
  let selectedIdx = 0;

  function getCfg() {
    const cfg = Object.assign({ url: ['https://', 'fbohoqeffyjawilkinfz', '.supabase.co'].join(''), anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZib2hvcWVmZnlqYXdsa2luZnppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU1Mjc1NzgsImV4cCI6MjExMTEwMzU3OH0.aGPy0BDzOJfZI6gBs6SEofpHHEEwsSAcSQI5TfvftQo' }, window.MREO_CONFIG || {}); if (!cfg.url.includes('fbohoqeffyjawilkinfz')) cfg.url = ['https://', 'fbohoqeffyjawilkinfz', '.supabase.co'].join('');
    const url = String(cfg.url || '').replace(/\/$/, '');
    const key = String(cfg.anonKey || '');
    return { url, key, ok: url.includes('supabase.co') && key.length > 20 };
  }

  async function sbReq(path, method, body, extraHeaders) {
    const cfg = getCfg();
    if (!cfg.ok) { serverStatus = 'Нет ключей API'; return null; }
    try {
      const headers = Object.assign({
        'apikey': cfg.key,
        'Authorization': 'Bearer ' + cfg.key,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }, extraHeaders || {});
      const res = await fetch(cfg.url + '/rest/v1/' + path, {
        method: method || 'GET',
        headers,
        body: body ? JSON.stringify(body) : undefined
      });
      if (!res.ok) { serverStatus = 'Ошибка БД (' + res.status + ')'; return null; }
      serverStatus = 'Онлайн · Активно';
      return await res.json();
    } catch (err) {
      serverStatus = 'URL=' + cfg.url + ' | ' + (err && err.message ? err.message : 'Сеть');
      return null;
    }
  }

  function getUser() {
    try {
      const u = window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user;
      if (u && u.id) {
        const name = [u.first_name, u.last_name].filter(Boolean).join(' ') || u.username || ('Игрок #' + String(u.id).slice(-4));
        return { id: String(u.id), name };
      }
    } catch (_) {}
    let gid = localStorage.getItem('mreo_guest_uid');
    if (!gid) {
      gid = 'guest_' + Math.floor(100000 + Math.random() * 899999);
      localStorage.setItem('mreo_guest_uid', gid);
    }
    return { id: gid, name: 'Инспектор #' + gid.slice(-4) };
  }

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

  function saveSt(st) {
    if (window.__mreoBridge && typeof window.__mreoBridge.save === 'function') {
      window.__mreoBridge.save();
      if (typeof window.__mreoBridge.render === 'function') window.__mreoBridge.render();
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

  async function syncOnline() {
    if (syncLock) return;
    if (!getCfg().ok) return;
    syncLock = true;
    try {
      const st = getSt() || {};
      const user = getUser();
      const payload = {
        player_name: user.name,
        club_id: st.myClubId || '',
        cash: Math.round(Number(st.cash) || 0),
        rep: Math.round(Number(st.bizRep) || 40),
        tenders: Math.round(Number(st.tendersDone) || 0),
        updated_at: new Date().toISOString()
      };

      const upd = await sbReq('mreo_live_leaderboard?tg_id=eq.' + encodeURIComponent(user.id), 'PATCH', payload);
      if (Array.isArray(upd) && upd.length === 0) {
        await sbReq('mreo_live_leaderboard', 'POST', Object.assign({ tg_id: user.id }, payload));
      }

      // Автоматическая выплата продавцу, если его лот выкупили
      const sold = await sbReq('mreo_live_market?seller_id=eq.' + encodeURIComponent(user.id) + '&status=eq.sold', 'GET');
      if (Array.isArray(sold) && sold.length > 0) {
        let sum = 0;
        const buyers = [];
        for (const r of sold) {
          sum += Number(r.price) || 0;
          if (r.buyer_name) buyers.push(r.buyer_name);
          await sbReq('mreo_live_market?id=eq.' + r.id, 'PATCH', { status: 'claimed' });
        }
        if (sum > 0) {
          st.cash = (Number(st.cash) || 0) + sum;
          saveSt(st);
          toast('Продано на P2P-бирже' + (buyers.length ? (' (' + buyers.join(', ') + ')') : '') + '! +' + sum.toLocaleString('ru-RU') + ' ₽');
        }
      }

      const lb = await sbReq('mreo_live_leaderboard?select=*&order=cash.desc&limit=15', 'GET');
      if (Array.isArray(lb)) cachedLb = lb;

      const led = await sbReq('mreo_club_ledger?select=*&order=created_at.desc&limit=25', 'GET');
      if (Array.isArray(led)) cachedLedger = led;

      const mkt = await sbReq('mreo_live_market?select=*&status=eq.active&order=created_at.desc&limit=25', 'GET');
      if (Array.isArray(mkt)) cachedMarket = mkt;

      renderUI();
    } finally {
      syncLock = false;
    }
  }

  function renderUI() {
    const view = document.getElementById('view');
    if (!view) return;
    const txt = view.textContent || '';
    const me = getUser();

    // 1. Живой общак внутри карточки Автоклубов
    const clubsCard = document.getElementById('mreo-region-clubs-card');
    if (clubsCard) {
      let box = document.getElementById('mreo-online-ledger-box');
      if (!box) {
        box = document.createElement('div');
        box.id = 'mreo-online-ledger-box';
        box.style.cssText = 'margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.08);';
        clubsCard.appendChild(box);
      }
      const bank = cachedLedger.reduce((a, r) => a + (Number(r.amount) || 0), 0);
      const feed = cachedLedger.length === 0
        ? '<div style="font-size:11px;color:#64748b;">Пока нет взносов. Пополните общак первым!</div>'
        : cachedLedger.slice(0, 5).map(r =>
            '<div style="display:flex;justify-content:space-between;font-size:11px;padding:4px 0;border-bottom:1px dashed rgba(255,255,255,0.05);">' +
              '<span style="color:#e2e8f0;"><b>' + r.player_name + '</b> · Рег.' + String(r.club_id || '').replace('c', '') + '</span>' +
              '<span style="color:#4ade80;font-weight:800;">+' + Number(r.amount).toLocaleString('ru-RU') + ' ₽</span>' +
            '</div>'
          ).join('');
      box.innerHTML =
        '<div style="display:flex;justify-content:space-between;margin-bottom:6px;">' +
          '<span style="font-size:11.5px;font-weight:900;color:#fde047;">ОНЛАЙН-ОБЩАК КЛУБОВ</span>' +
          '<span style="font-size:11.5px;font-weight:900;color:#4ade80;">Банк: ' + bank.toLocaleString('ru-RU') + ' ₽</span>' +
        '</div>' + feed;
    }

    // 2. Онлайн-рейтинг в Профиле
    if (txt.includes('Инкогнито') || txt.includes('Реферал') || txt.includes('Статистика')) {
      let lbCard = document.getElementById('mreo-online-leaderboard-card');
      if (!lbCard) {
        lbCard = document.createElement('section');
        lbCard.className = 'panel mreo-ext-card';
        lbCard.id = 'mreo-online-leaderboard-card';
        lbCard.style.cssText = 'width:100% !important;box-sizing:border-box !important;margin:0 0 12px 0 !important;padding:13px !important;background:linear-gradient(135deg,#172033,#10141f) !important;border:1px solid rgba(74,222,128,0.3) !important;';
        const afterEl = document.getElementById('mreo-season-pass-card') || document.getElementById('mreo-business-hub-card');
        if (afterEl) afterEl.insertAdjacentElement('afterend', lbCard);
        else view.appendChild(lbCard);
      }
      const rows = cachedLb.length === 0
        ? '<div style="font-size:11.5px;color:#94a3b8;">Статус: ' + serverStatus + '</div>'
        : cachedLb.map((p, idx) => {
            const isMe = String(p.tg_id) === me.id;
            return '<div class="mreo-ext-row' + (isMe ? ' is-mine' : '') + '">' +
              '<div><b style="font-size:12.5px;color:#fff;">#' + (idx + 1) + ' ' + p.player_name + '</b>' +
              '<div style="font-size:11px;color:#94a3b8;">Реп: ' + (p.rep || 40) + ' · Контрактов: ' + (p.tenders || 0) + '</div></div>' +
              '<span style="font-size:12px;font-weight:900;color:#4ade80;">' + Number(p.cash || 0).toLocaleString('ru-RU') + ' ₽</span>' +
            '</div>';
          }).join('');
      lbCard.innerHTML =
        '<div style="display:flex;justify-content:space-between;align-items:center;width:100%;margin-bottom:10px;"><span style="font-size:12px;font-weight:900;color:#4ade80;">ОНЛАЙН-РЕЙТИНГ ИГРОКОВ РФ</span><span class="mreo-ext-badge" style="margin-left:auto;">' + (cachedLb.length > 0 ? ('Онлайн: ' + cachedLb.length) : serverStatus) + '</span></div>' +
        '<div class="mreo-ext-list">' + rows + '</div>';
    }

    // 3. Настоящая P2P-биржа игроков во вкладке Рынок
    if (txt.includes('Биржа номеров') || txt.includes('ГОСЗАКАЗ РФ')) {
      let mCard = document.getElementById('mreo-online-p2p-market');
      if (!mCard) {
        mCard = document.createElement('section');
        mCard.className = 'panel mreo-ext-card';
        mCard.id = 'mreo-online-p2p-market';
        mCard.style.cssText = 'width:100% !important;box-sizing:border-box !important;margin:0 0 12px 0 !important;padding:13px !important;background:linear-gradient(135deg,#1b2436,#11151f) !important;border:1px solid rgba(56,189,248,0.38) !important;';
        view.insertAdjacentElement('afterbegin', mCard);
      }

      // Не перерисовываем форму, если пользователь прямо сейчас печатает цену в поле ввода
      const activeEl = document.activeElement;
      if (activeEl && activeEl.id === 'mreo-p2p-custom-price') return;

      const st = getSt() || {};
const plates = Array.isArray(st.plates) ? st.plates : [];
if (selectedIdx >= plates.length) selectedIdx = 0;
let sellBoxHtml = '';
if (plates.length === 0) {
sellBoxHtml = 'В Боксе нет свободных номеров для выставления на продажу.';
} else {
const curPlate = plates[selectedIdx];
const defaultAsk = Math.round(((Number(curPlate.val) || 15000) * 1.2) / 500) * 500;
const savedInputVal = window.__mreoLastP2PInput || defaultAsk;
const opts = plates.map((p, idx) =>
'<option value="' + idx + '"' + (idx === selectedIdx ? ' selected' : '') + '>' +
fmtPlate(p) + ' (гос: ' + Number(p.val || 0).toLocaleString('ru-RU') + ' ₽)' +
''
).join('');
sellBoxHtml =
'' +
'Выставить свой номер на реальный рынок:' +
'' + opts + '' +
'' +
'' +
'Выставить лот' +
'' +
'';
}
const lotsHtml = cachedMarket.length === 0
? 'На живой бирже пока пусто (' + serverStatus + '). Выставьте свой лот первым!'
: '' + cachedMarket.map(lot => {
const isMine = String(lot.seller_id) === me.id;
return '' +
'' +
'' + lot.plate_code + '' +
'Продавец: ' + (isMine ? 'Вы' : lot.seller_name) + '' +
'' +
(isMine
? '' + Number(lot.price).toLocaleString('ru-RU') + ' ₽Снять'
: 'Купить · ' + Number(lot.price).toLocaleString('ru-RU') + ' ₽'
) +
'';
}).join('') + '';
mCard.innerHTML =
'' +
'ЖИВОЙ P2P-РЫНОК ИГРОКОВ' +
'Лотов: ' + cachedMarket.length + '' +
'' +
lotsHtml +
sellBoxHtml;
}
}
document.addEventListener('change', function(e) {
if (e.target && e.target.id === 'mreo-p2p-plate-select') {
selectedIdx = Number(e.target.value) || 0;
const st = getSt() || {};
const plates = Array.isArray(st.plates) ? st.plates : [];
if (plates[selectedIdx]) {
window.__mreoLastP2PInput = Math.round(((Number(plates[selectedIdx].val) || 15000) * 1.2) / 500) * 500;
}
renderUI();
}
}, true);
document.addEventListener('input', function(e) {
if (e.target && e.target.id === 'mreo-p2p-custom-price') {
window.__mreoLastP2PInput = Number(e.target.value) || 1000;
}
}, true);
document.addEventListener('pointerdown', async function(e) {
if (!e.target || !e.target.closest) return;
if (e.target.closest('[data-club-donate]')) {
setTimeout(async () => {
const st = getSt() || {};
if (!st.myClubId) return;
const u = getUser();
await sbReq('mreo_club_ledger', 'POST', { club_id: st.myClubId, tg_id: u.id, player_name: u.name, amount: 25000, points: 320 });
syncOnline();
}, 250);
}
// Выставление выбранного номера с произвольной ценой
if (e.target.closest('[data-p2p-list-custom]')) {
e.preventDefault(); e.stopImmediatePropagation();
const st = getSt();
const plates = Array.isArray(st.plates) ? st.plates : [];
if (plates.length === 0) { toast('В Боксе нет свободных номеров!'); return; }
const selEl = document.getElementById('mreo-p2p-plate-select');
const priceEl = document.getElementById('mreo-p2p-custom-price');
const idx = selEl ? Number(selEl.value) : 0;
const ask = Math.max(1000, Math.round(Number(priceEl ? priceEl.value : 15000) || 15000));
if (!plates[idx]) return;
const takenArr = plates.splice(idx, 1);
const plate = takenArr;
const u = getUser();
window.__mreoLastP2PInput = null;
saveSt(st);
const res = await sbReq('mreo_live_market', 'POST', {
seller_id: u.id,
seller_name: u.name,
plate_code: fmtPlate(plate),
plate_json: plate,
price: ask,
status: 'active'
});
if (res) {
toast('Лот ' + fmtPlate(plate) + ' выставлен на рынок за ' + ask.toLocaleString('ru-RU') + ' ₽!');
syncOnline();
} else {
plates.unshift(plate);
saveSt(st);
toast('Ошибка связи с сервером (' + serverStatus + ').');
}
return;
}
// Снятие своего лота с продажи обратно в Бокс
const cancelBtn = e.target.closest('[data-p2p-cancel]');
if (cancelBtn) {
e.preventDefault(); e.stopImmediatePropagation();
const lotId = Number(cancelBtn.getAttribute('data-p2p-cancel'));
const lot = cachedMarket.find(x => Number(x.id) === lotId);
if (!lot) return;
const patched = await sbReq('mreo_live_market?id=eq.' + lotId + '&status=eq.active', 'PATCH', { status: 'cancelled' });
if (Array.isArray(patched) && patched.length > 0) {
const st = getSt();
if (!Array.isArray(st.plates)) st.plates = [];
st.plates.unshift(Object.assign({}, lot.plate_json, { id: 'ret_' + Date.now() }));
saveSt(st);
toast('Лот ' + lot.plate_code + ' снят с продажи и возвращён в Бокс.');
syncOnline();
} else {
toast('Лот уже успели выкупить!');
syncOnline();
}
return;
}
// Покупка лота другого реального игрока
const buyBtn = e.target.closest('[data-p2p-buy]');
if (buyBtn) {
e.preventDefault(); e.stopImmediatePropagation();
const lotId = Number(buyBtn.getAttribute('data-p2p-buy'));
const lot = cachedMarket.find(x => Number(x.id) === lotId);
if (!lot) return;
const st = getSt();
const bal = Number(st.cash) || 0;
const price = Number(lot.price) || 0;
if (bal < price) { toast('Не хватает ' + (price - bal).toLocaleString('ru-RU') + ' ₽'); return; }
const u = getUser();
const patched = await sbReq('mreo_live_market?id=eq.' + lotId + '&status=eq.active', 'PATCH', {
status: 'sold',
buyer_name: u.name
});
if (Array.isArray(patched) && patched.length > 0) {
st.cash = bal - price;
if (!Array.isArray(st.plates)) st.plates = [];
st.plates.unshift(Object.assign({}, lot.plate_json, { id: 'p2p_' + Date.now() }));
saveSt(st);
toast('Вы купили ' + lot.plate_code + ' у игрока ' + lot.seller_name + '!');
syncOnline();
} else {
toast('Этот лот уже выкупил другой игрок!');
syncOnline();
}
}
}, true);
function boot() {
syncOnline();
setInterval(syncOnline, 6000);
setInterval(renderUI, 600);
}
if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', boot);
else boot();
})();