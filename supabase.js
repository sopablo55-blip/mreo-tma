/* МРЭО — Supabase клиент. Конфиг устанавливается через window.MREO_CONFIG ДО загрузки этого скрипта. */
(function () {
  'use strict';
  const CFG = window.MREO_CONFIG || {};
  const URL = (CFG.url || '').replace(/\/$/, '');
  const KEY = CFG.anonKey || '';
  const configured = /^https:\/\/.+\.supabase\.co$/.test(URL) && KEY.length > 20;

  async function sb(table, method, query, body, extraHeaders) {
    if (!configured) return null;
    method = method || 'GET';
    query = query || '';
    try {
      const res = await fetch(URL + '/rest/v1/' + table + query, {
        method,
        headers: {
          apikey: KEY,
          Authorization: 'Bearer ' + KEY,
          'Content-Type': 'application/json',
          Prefer: method === 'POST' ? 'resolution=merge-duplicates,return=representation' : 'return=representation',
          ...(extraHeaders || {})
        },
        body: body ? JSON.stringify(body) : undefined
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        console.warn('[sb]', table, res.status, txt);
        return null;
      }
      const txt = await res.text();
      return txt ? JSON.parse(txt) : null;
    } catch (e) {
      console.warn('[sb] fail', table, e);
      return null;
    }
  }

  async function action(name, payload) {
    if (!configured) return null;
    const tg = window.Telegram && window.Telegram.WebApp;
    try {
      const res = await fetch(URL + '/functions/v1/' + name, {
        method: 'POST',
        headers: {
          apikey: KEY,
          Authorization: 'Bearer ' + KEY,
          'Content-Type': 'application/json',
          'X-Telegram-InitData': tg ? tg.initData || '' : ''
        },
        body: JSON.stringify(payload || {})
      });
      if (!res.ok) return null;
      return res.json();
    } catch (e) {
      console.warn('[action] fail', name, e);
      return null;
    }
  }

  window.GameAPI = { configured, url: URL, sb, action };
})();
