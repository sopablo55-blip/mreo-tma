(function() {
  if (window.__mreoAppShellV206) return;
  window.__mreoAppShellV206 = true;

  window.__mreoAllowTabScroll = false;

  // Разрешаем прокрутку вверх ТОЛЬКО в момент клика по вкладке нижнего меню
  document.addEventListener('pointerdown', function(e) {
    if (!e.target || !e.target.closest) return;
    if (e.target.closest('.dock, .dock-item, nav')) {
      window.__mreoAllowTabScroll = true;
      setTimeout(function() { window.__mreoAllowTabScroll = false; }, 350);
    }
  }, true);

  // Перехватываем и блокируем программный сброс scrollTop = 0 внутри вкладок
  try {
    const desc = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollTop');
    if (desc && desc.set && desc.get) {
      Object.defineProperty(Element.prototype, 'scrollTop', {
        configurable: true,
        get: function() { return desc.get.call(this); },
        set: function(val) {
          if (val === 0 && !window.__mreoAllowTabScroll && desc.get.call(this) > 20) {
            return;
          }
          return desc.set.call(this, val);
        }
      });
    }
  } catch (_) {}

  // Блокируем window.scrollTo(0, 0) внутри вкладок
  const origScrollTo = window.scrollTo.bind(window);
  window.scrollTo = function(x, y) {
    const ty = (typeof x === 'object' && x !== null) ? (x.top || 0) : (y || 0);
    if (ty === 0 && !window.__mreoAllowTabScroll) return;
    return origScrollTo.apply(window, arguments);
  };

  // Сбрасываем фокус кнопок, чтобы iOS Safari не дёргал экран к кнопке
  document.addEventListener('focusin', function(e) {
    const el = e.target;
    if (el && (el.tagName === 'BUTTON' || (el.classList && el.classList.contains('btn')))) {
      if (typeof el.blur === 'function') el.blur();
    }
  }, true);

  // Чистые естественные стили без скачущего 100dvh
  function injectCleanIosCss() {
    let st = document.getElementById('mreo-ios-opt-style');
    if (!st) {
      st = document.createElement('style');
      st.id = 'mreo-ios-opt-style';
      document.head.appendChild(st);
    }
    st.textContent =
      '* { -webkit-tap-highlight-color: transparent !important; overflow-anchor: none !important; }' +
      'html, body { position: static !important; height: auto !important; min-height: 100% !important; overflow-x: hidden !important; overflow-y: auto !important; overscroll-behavior-y: none !important; }' +
      '#app, .app { position: static !important; height: auto !important; min-height: 100% !important; overflow: visible !important; padding-bottom: 95px !important; }' +
      '#view { position: static !important; height: auto !important; overflow: visible !important; }' +
      '.dock, nav.bottom-nav, .bottom-bar { position: fixed !important; left: 0 !important; right: 0 !important; bottom: 0 !important; z-index: 999 !important; padding-bottom: max(8px, env(safe-area-inset-bottom)) !important; background: rgba(11,15,25,0.97) !important; border-top: 1px solid rgba(255,255,255,0.08) !important; }' +
      'input, select, textarea { font-size: 16px !important; }' +
      'button, .btn, [role="button"], .dock-item { touch-action: manipulation !important; }';
  }

  try {
    const wa = window.Telegram && window.Telegram.WebApp;
    if (wa) {
      wa.ready();
      wa.expand();
      if (typeof wa.disableVerticalSwipes === 'function') wa.disableVerticalSwipes();
    }
  } catch (_) {}

  if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', injectCleanIosCss);
  else injectCleanIosCss();
})();