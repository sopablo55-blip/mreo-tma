(function() {
  if (window.__mreoAppShellV205) return;
  window.__mreoAppShellV205 = true;

  window.__mreoAllowTabScroll = false;

  // Разрешаем скролл вверх ТОЛЬКО при нажатии на нижнее меню вкладок
  document.addEventListener('pointerdown', function(e) {
    if (e.target && e.target.closest && e.target.closest('.dock, .dock-item, nav')) {
      window.__mreoAllowTabScroll = true;
      setTimeout(function() { window.__mreoAllowTabScroll = false; }, 350);
    }
  }, true);

  // Перехватываем принудительный window.scrollTo(0, 0) из базового движка
  const origWinScrollTo = window.scrollTo.bind(window);
  window.scrollTo = function(x, y) {
    const targetY = (typeof x === 'object' && x !== null) ? (x.top || 0) : (y || 0);
    if (targetY === 0 && !window.__mreoAllowTabScroll) return;
    return origWinScrollTo.apply(window, arguments);
  };

  // Запрещаем авто-фокус кнопок (главная причина прыжка экрана на iPhone при тапе!)
  document.addEventListener('focusin', function(e) {
    const el = e.target;
    if (el && (el.tagName === 'BUTTON' || el.classList.contains('btn'))) {
      if (typeof el.blur === 'function') el.blur();
    }
  }, true);

  function injectNativeShell() {
    if (document.getElementById('mreo-ios-opt-style')) return;
    const st = document.createElement('style');
    st.id = 'mreo-ios-opt-style';
    st.textContent =
      '* { -webkit-tap-highlight-color: transparent !important; overflow-anchor: none !important; box-sizing: border-box !important; }' +
      'html, body { position: fixed !important; inset: 0 !important; width: 100% !important; height: 100dvh !important; margin: 0 !important; padding: 0 !important; overflow: hidden !important; overscroll-behavior: none !important; background: #0b0f19 !important; }' +
      '#app, .app { display: flex !important; flex-direction: column !important; position: fixed !important; inset: 0 !important; width: 100% !important; height: 100dvh !important; overflow: hidden !important; }' +
      'header, .topbar, .hud { flex-shrink: 0 !important; z-index: 50 !important; }' +
      '#view { flex: 1 1 auto !important; overflow-y: auto !important; overflow-x: hidden !important; -webkit-overflow-scrolling: touch !important; overscroll-behavior-y: contain !important; padding-bottom: 105px !important; }' +
      '.dock, nav.bottom-nav, .bottom-bar { position: fixed !important; left: 0 !important; right: 0 !important; bottom: 0 !important; z-index: 999 !important; padding-bottom: max(8px, env(safe-area-inset-bottom)) !important; background: rgba(11,15,25,0.96) !important; border-top: 1px solid rgba(255,255,255,0.08) !important; }' +
      'input, select, textarea { font-size: 16px !important; }' +
      'button, .btn, [role="button"], .dock-item { touch-action: manipulation !important; }';
    document.head.appendChild(st);
  }

  try {
    const wa = window.Telegram && window.Telegram.WebApp;
    if (wa) {
      wa.ready();
      wa.expand();
      if (typeof wa.disableVerticalSwipes === 'function') wa.disableVerticalSwipes();
    }
  } catch (_) {}

  if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', injectNativeShell);
  else injectNativeShell();
})();