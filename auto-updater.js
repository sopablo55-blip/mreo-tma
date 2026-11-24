(function() {
  if (window.__mreoAutoUpdaterV1) return;
  window.__mreoAutoUpdaterV1 = true;

  const LOCAL_VER = '2.2.4';
  let reloading = false;

  async function checkAppUpdate() {
    if (reloading || location.protocol === 'file:') return;
    try {
      const res = await fetch('version.json?nocache=' + Date.now(), { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.version && data.version !== LOCAL_VER) {
        reloading = true;
        if (window.__mreoBridge && typeof window.__mreoBridge.toast === 'function') {
          window.__mreoBridge.toast('Вышло обновление v' + data.version + '! Загружаем...');
        }
        setTimeout(function() {
          const url = new URL(window.location.href);
          url.searchParams.set('v', data.version);
          window.location.replace(url.toString());
        }, 1200);
      }
    } catch (_) {}
  }

  setTimeout(checkAppUpdate, 1500);
  setInterval(checkAppUpdate, 45000);
})();