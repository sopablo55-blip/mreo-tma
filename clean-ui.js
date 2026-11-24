(function() {
  if (window.__mreoCleanEmojisV140) return;
  window.__mreoCleanEmojisV140 = true;

  const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\uFE0F]/gu;

  function stripEmojisInNode(rootEl) {
    if (!rootEl) return;
    const walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT, null);
    let node;
    while ((node = walker.nextNode())) {
      const val = node.nodeValue;
      if (val && EMOJI_RE.test(val)) {
        EMOJI_RE.lastIndex = 0;
        node.nodeValue = val.replace(EMOJI_RE, '').replace(/^\s+/, '');
      }
    }
  }

  function enhanceButtons() {
    const prims = document.querySelectorAll('button.primary, .btn.primary');
    prims.forEach(function(btn) {
      if (!btn.querySelector('.mreo-shine-bar')) {
        const bar = document.createElement('span');
        bar.className = 'mreo-shine-bar';
        btn.appendChild(bar);
      }
    });
  }

  
  function enhanceSynergyInfoCard() {
    const card = document.getElementById('mreo-synergy-card');
    if (!card) return;
    const headerRow = card.firstElementChild;
    if (!headerRow) return;

    // 1. Чиним обрезание правого бейджа ×1.0 у края экрана
    const multBadge = headerRow.lastElementChild;
    if (multBadge && multBadge !== headerRow.firstElementChild) {
      multBadge.style.setProperty('flex-shrink', '0', 'important');
      multBadge.style.setProperty('margin-right', '4px', 'important');
      multBadge.style.setProperty('padding', '3px 10px', 'important');
    }

    // 2. Добавляем аккуратный круглый значок [?] рядом с заголовком "ИНДЕКС ВЛИЯНИЯ МРЭО"
    const titleSpan = headerRow.firstElementChild;
    if (titleSpan && !document.getElementById('mreo-syn-help-btn')) {
      titleSpan.style.display = 'inline-flex';
      titleSpan.style.alignItems = 'center';
      titleSpan.style.gap = '6px';

      const qBtn = document.createElement('button');
      qBtn.type = 'button';
      qBtn.id = 'mreo-syn-help-btn';
      qBtn.textContent = '?';
      qBtn.style.cssText = 'width:20px;height:20px;border-radius:50%;border:1px solid rgba(250,204,21,0.55);background:rgba(250,204,21,0.16);color:#fde047;font-weight:900;font-size:12px;line-height:1;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;padding:0;flex-shrink:0;';

      qBtn.addEventListener('pointerdown', function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        let box = document.getElementById('mreo-syn-help-drawer');
        if (box) {
          box.remove();
          return;
        }
        box = document.createElement('div');
        box.id = 'mreo-syn-help-drawer';
        box.style.cssText = 'margin-top:9px;padding:9px 11px;background:rgba(15,23,42,0.88);border:1px solid rgba(250,204,21,0.28);border-radius:12px;font-size:11.5px;line-height:1.42;color:#e2e8f0;';
        box.innerHTML =
          '<div style="font-weight:900;color:#fde047;margin-bottom:4px;">Как работает Индекс влияния:</div>' +
          '<div>• <b>Общий множитель (×...)</b> — умножает цену всех выбитых номеров.</div>' +
          '<div>• <b>Авто и Номер</b> — купите авто в Гараже и наденьте на него номер для бонуса к множителю.</div>' +
          '<div>• <b>Регионы</b> — выкупленные регионы РФ приносят дивиденды и усиливают статус.</div>' +
          '<div>• <b>Комиссия биржи</b> — снижается при прокачке Связей в Магазине (чем ниже %, тем больше чистой прибыли с продаж).</div>';
        card.appendChild(box);
      }, true);

      titleSpan.appendChild(qBtn);
    }
  }

  function runCleanup() {
    enhanceSynergyInfoCard();
    stripEmojisInNode(document.getElementById('view'));
    stripEmojisInNode(document.querySelector('.top-bar'));
    enhanceButtons();
  }

  document.addEventListener('pointerdown', function(e) {
    const btn = e.target && e.target.closest ? e.target.closest('button, .btn') : null;
    if (!btn || btn.classList.contains('dock-item') || btn.closest('.dock, .liquid-dock, nav')) return;
    const rect = btn.getBoundingClientRect();
    const wave = document.createElement('span');
    wave.className = 'mreo-btn-ripple';
    wave.style.left = (e.clientX - rect.left) + 'px';
    wave.style.top = (e.clientY - rect.top) + 'px';
    btn.appendChild(wave);
    btn.classList.remove('mreo-btn-pop');
    void btn.offsetWidth;
    btn.classList.add('mreo-btn-pop');
    setTimeout(function() { if (wave.parentNode) wave.parentNode.removeChild(wave); }, 600);
  }, true);

  function initCleaner() {
    runCleanup();
    const view = document.getElementById('view');
    if (view) {
      const obs = new MutationObserver(runCleanup);
      obs.observe(view, { childList: true, subtree: true });
    }
    setInterval(enhanceButtons, 600);
  }

      if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initCleaner);
  } else {
    initCleaner();
  }
})();
