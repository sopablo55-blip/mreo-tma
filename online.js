/* МРЭО — онлайн: рейтинг игроков, онлайн-счётчик, лента событий, рефералка. */
(function () {
  'use strict';
  const API = window.GameAPI;
  if (!API) return;

  const Online = { me: null };

  Online.init = (me) => { Online.me = me; };

  // Обновить свою запись в облаке
  Online.heartbeat = async (me, state, worth) => {
    if (!API.configured) return;
    await API.sb('users', 'POST', '?on_conflict=telegram_id', {
      telegram_id: me.id,
      username: me.name,
      balance: Math.round(state.rub || 0),
      worth: Math.round(worth || 0),
      refs: Number(state.refs) || 0,
      state_json: state,
      updated_at: new Date().toISOString()
    });
  };

  Online.top = async (limit) => {
    if (!API.configured) return null;
    const rows = await API.sb('users', 'GET', '?select=telegram_id,username,worth&order=worth.desc&limit=' + (limit || 25));
    return Array.isArray(rows) ? rows : null;
  };

  Online.count = async () => {
    if (!API.configured) return null;
    const since = new Date(Date.now() - 5 * 60000).toISOString();
    const rows = await API.sb('users', 'GET', '?select=telegram_id&updated_at=gt.' + since, null, { Prefer: 'count=exact' });
    return Array.isArray(rows) ? rows.length : null;
  };

  Online.feed = async (limit) => {
    if (!API.configured) return null;
    const rows = await API.sb('feed', 'GET', '?select=username,text,created_at&order=created_at.desc&limit=' + (limit || 20));
    return Array.isArray(rows) ? rows : null;
  };

  Online.push = async (kind, text) => {
    if (!API.configured || !Online.me) return;
    await API.sb('feed', 'POST', '', {
      user_id: Online.me.id,
      username: Online.me.name,
      kind,
      text
    });
  };

  Online.publishLot = async (plate) => {
    if (!API.configured || !Online.me) return;
    await API.sb('market_lots', 'POST', '', {
      seller_id: Online.me.id,
      seller_name: Online.me.name,
      plate_json: plate,
      price: Math.round(plate.price || 0),
      created_at: new Date().toISOString()
    });
  };

  Online.referral = async (invId) => {
    if (!API.configured) return;
    // Начисление пригласившему делает серверная функция (защита от накрутки).
    await API.action('referral', { inviter_id: invId, user_id: Online.me.id });
  };

  // Композитный снимок для UI
  Online.refresh = async () => {
    if (!API.configured) return null;
    const [top, count, feed] = await Promise.all([Online.top(25), Online.count(), Online.feed(15)]);
    return { top, count, feed };
  };

  window.Online = Online;
})();

/* === TELEGRAM_STARS_PAYMENTS_V83 === */
(function() {
  if (window.__mreoStarsV83) return;
  window.__mreoStarsV83 = true;

  window.buyWithTelegramStars = async function(tierId, starsCost, onSuccess) {
    const tg = window.Telegram && window.Telegram.WebApp;
    const uid = (typeof window.getCurrentTgId === "function") ? window.getCurrentTgId() : "guest";

    // Если запущено внутри Telegram Mini App — запрашиваем ссылку на инвойс в валюте XTR (Telegram Stars)
    if (tg && tg.initData && typeof tg.openInvoice === "function") {
      try {
        if (typeof supabase !== "undefined" && supabase && supabase.functions) {
          const { data, error } = await supabase.functions.invoke("create_stars_invoice", {
            body: { userId: uid, tierId: tierId, stars: starsCost, currency: "XTR" }
          });
          if (!error && data && data.invoiceUrl) {
            tg.openInvoice(data.invoiceUrl, function(status) {
              if (status === "paid") {
                if (typeof onSuccess === "function") onSuccess();
              } else if (status === "failed" && typeof toast === "function") {
                toast("Оплата не прошла. Попробуйте снова.", true);
              }
            });
            return;
          }
        }
      } catch (_) {}
      if (typeof toast === "function") {
        toast("Для оплаты в Stars подключите Edge Function create_stars_invoice в Supabase.", true);
      }
      return;
    }

    // Вне Telegram (в обычном браузере ПК) уведомляем игрока
    if (typeof toast === "function") {
      toast("Оплата в Telegram Stars (" + starsCost + " ⭐) доступна при запуске игры внутри Telegram!", true);
    }
  };
})();
