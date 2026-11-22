/* МРЭО: клиент общего рынка и онлайн-рейтинга.
   Подключается перед основным скриптом index.html. Telegram initData
   проверяется только на Edge Function; секреты в браузер не передаются. */
(() => {
  'use strict';
  const FUNCTION_URL = 'https://cqwtbowilgtwwhicsxyp.supabase.co/functions/v1/mreo-api';
  let lastBalance = 0;
  let saveQueue = Promise.resolve();

  async function request(action, payload = {}) {
    const initData = window.Telegram?.WebApp?.initData;
    if (!initData) throw new Error('Открой игру через Telegram Mini App');
    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, initData, ...payload })
    });
    let result;
    try { result = await response.json(); }
    catch { throw new Error(`Сервер вернул некорректный ответ (${response.status})`); }
    if (!response.ok || !result?.ok) throw new Error(result?.error || `Ошибка сервера (${response.status})`);
    return result;
  }

  function mapPlate(row, fallbackId) {
    const full = String(row?.full || '');
    const key = String(row?.client_key || fallbackId || '');
    const numericKey = /^\d+$/.test(key) ? Number(key) : key;
    return {
      id: numericKey,
      f: full.slice(0, 1),
      d: full.slice(1, 4),
      t: full.slice(4, 6),
      reg: String(row?.region || ''),
      ser: String(row?.series || ''),
      rar: String(row?.rarity || 'common'),
      val: Number(row?.value || 0),
      price: Number(row?.listed_price || 0),
      frame: ''
    };
  }

  function mapLot(row) {
    const plateRow = row?.plates;
    if (!plateRow) return null;
    return {
      id: String(row.id),
      sellerId: String(row.seller_id),
      price: Number(row.price || 0),
      createdAt: row.created_at,
      seller: row.seller_name || 'Игрок',
      p: mapPlate(plateRow, plateRow.client_key)
    };
  }

  window.Online = {
    request,
    async load(localState = {}) {
      if (!window.Telegram?.WebApp?.initData) return null;
      const data = await request('load');
      const profile = data.profile || {};
      lastBalance = Number(profile.balance || 0);
      const remoteState = profile.game_state && typeof profile.game_state === 'object'
        ? profile.game_state : {};
      const hasRemoteState = Boolean(data.hasCloudState) || Object.keys(remoteState).length > 0;
      const state = { ...localState, ...remoteState };
      state.rub = hasRemoteState || Number(profile.balance || 0) > 0
        ? Number(profile.balance ?? state.rub ?? 0)
        : Number(localState.rub ?? 30000);
      state.crystals = Number(profile.crystals ?? state.crystals ?? localState.crystals ?? 0);
      state.refs = Number(profile.refs ?? state.refs ?? localState.refs ?? 0);
      state.linkLvl = Number(profile.link_level ?? state.linkLvl ?? localState.linkLvl ?? 0);

      const remotePlates = (data.plates || []).map(mapPlate);
      // Первый запуск: переносим старый локальный гараж в облако. После первого сохранения
      // пустой серверный гараж также считается достоверным, а не заменяется старым кэшем.
      state.plates = hasRemoteState || data.hasCloudPlates
        ? remotePlates
        : (Array.isArray(localState.plates) ? localState.plates : []);
      state.nid = Math.max(Number(state.nid) || 1, ...state.plates
        .map(p => Number(p.id)).filter(Number.isFinite).map(n => n + 1), 1);
      delete state.lots;

      return {
        state,
        userId: String(data.userId || ''),
        lots: (data.lots || []).map(mapLot).filter(Boolean),
        myLots: (data.myLots || []).map(mapLot).filter(Boolean)
      };
    },
    save(state) {
      const snapshot = structuredClone(state);
      const sentRub = Math.max(0, Math.floor(Number(snapshot.rub) || 0));
      saveQueue = saveQueue.catch(() => {}).then(async () => {
        const result = await request('save', { state: snapshot, baseBalance: lastBalance });
        if (Number.isFinite(Number(result.balance))) {
          lastBalance = Number(result.balance);
          // Не затираем более новые локальные действия, случившиеся во время запроса.
          if (window.__MREO_STATE__ && Number(window.__MREO_STATE__.rub) === sentRub) {
            window.__MREO_STATE__.rub = lastBalance;
            const balanceNode = document.querySelector('#balance');
            if (balanceNode) balanceNode.textContent = Math.round(lastBalance).toLocaleString('ru-RU') + ' ₽';
            try { localStorage.setItem('mreo-v3', JSON.stringify(window.__MREO_STATE__)); } catch {}
          }
        }
        return result;
      });
      return saveQueue;
    },
    list(plateId, price) { return request('list', { plateId: String(plateId), price: Number(price) }); },
    buy(lotId) { return request('buy', { lotId: String(lotId) }); },
    cancel(lotId) { return request('cancel', { lotId: String(lotId) }); },
    top() { return request('top'); }
  };
})();
