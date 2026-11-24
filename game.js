window.playCaseClickSfx = function() {
    try {
      const saved = localStorage.getItem('mreo_tma_save') || localStorage.getItem('mreo_v1') || '';
      if (saved.includes('"sfx":false')) return;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!window.__mreoAudioCtx) window.__mreoAudioCtx = new AC();
      const ctx = window.__mreoAudioCtx;
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;
      if (!window.__mreoClickBuf) {
        const len = Math.floor(ctx.sampleRate * 0.012);
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < len; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (len * 0.22));
        }
        window.__mreoClickBuf = buf;
      }
      const src = ctx.createBufferSource();
      src.buffer = window.__mreoClickBuf;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2400, now);
      filter.Q.setValueAtTime(3.2, now);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.42, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.011);
      src.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      src.start(now);
    } catch (_) {}
  };

(function () {
  'use strict';

  const $ = (s) => document.querySelector(s);
    function fmtCountdown(ms) {
    const sec = Math.max(0, Math.ceil((ms || 0) / 1000));
    const h = String(Math.floor(sec / 3600)).padStart(2, '0');
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
    const sc = String(sec % 60).padStart(2, '0');
    return h + ':' + m + ':' + sc;
  }

  let safeCells = 4, safeState = null;
      const GOV_FLEET = {
    'АМР': { cars: 'Aurus Senat, Mercedes-Benz S-Class (W222/W223), BMW 7 Series, Genesis G90', era: 'С 2006 г. по н.в. · Федеральный резерв', note: 'Заменили федеральные серии с триколором. Первая сотня (001–100) закреплена за высшими должностными лицами государства.' },
    'ЕКХ': { cars: 'Mercedes-Benz S-Class, G-Class (G63/G500), Toyota Land Cruiser 200/300, микроавтобусы сопровождения', era: 'С середины 1990-х гг. · ФСО России', note: 'Одна из самых известных оперативных серий страны, обеспечивающая безопасность охраняемых лиц и кортежей.' },
    'КРА': { cars: 'Mercedes-Benz S-Class Maybach, G63 AMG, Lexus LX 570/600, Toyota Land Cruiser 300', era: 'С 2000-х гг. · Регион 95', note: 'Высшая статусная серия Чеченской Республики, ассоциирующаяся с правительственными кортежами региона.' },
    'ККХ': { cars: 'Mercedes-Benz E/S-Class, Toyota Camry, Ford Mondeo, Volkswagen Passat', era: '1990–2000-е гг. · Оперативный резерв', note: 'Использовалась подразделениями контрразведки и центрального аппарата органов госбезопасности.' },
    'ХКХ': { cars: 'Toyota Land Cruiser, Toyota Camry, Skoda Octavia, служебные седаны', era: 'С 2000-х гг. · Спецподразделения', note: 'Наследница закрытых федеральных серий для оперативных и технических служб.' },
    'САС': { cars: 'Mercedes-Benz S-Class, BMW 7 Series, Audi A8, Toyota Camry', era: 'С 1990-х гг. · Спецсвязь и ведомства', note: 'Серия автомобилей специальной связи, фельдъегерской службы и закрытых государственных структур.' },
    'ММР': { cars: 'Ford Mondeo, Toyota Camry, Skoda Octavia, BMW 5 Series', era: 'С 1990-х гг. · Центральный аппарат МВД', note: 'Закреплена за подразделениями центрального аппарата МВД России и профильными главками.' },
    'АМО': { cars: 'Mercedes-Benz S/E-Class, BMW 5/7 Series, Genesis G80/G90, Toyota Camry', era: 'С 1990-х гг. · Мэрия и Правительство Москвы', note: 'Главная серия столичной исполнительной власти, префектур и Московской городской думы.' },
    'СКР': { cars: 'Mercedes-Benz E-Class, Toyota Camry, Ford Focus/Mondeo, микроавтобусы', era: 'С 2011 г. · Следственный комитет РФ', note: 'Ведомственная серия центрального аппарата и главных следственных управлений СК России.' },
    'СОО': { cars: 'Mercedes-Benz S-Class, BMW 7 Series, Audi A8L, Genesis G90', era: 'С 1990-х гг. · Управление делами Президента', note: 'Обслуживает автобазы Управления делами Президента РФ, Совета Федерации и Госдумы.' }
  };

  const MEDIA_PLATES = [
  { f: 'Х', d: '072', t: 'АУ', reg: '65', owner: 'Михаил Литвин · BMW M8 Comp', val: 5600000, info: 'Редкий сахалинский номер 65-го региона с BMW M8 Competition, фигурирующий в базах автоистории и связанный с проектами Михаила Литвина (наряду с его спорткарами BMW M4 и Ferrari).' },
  { f: 'М', d: '707', t: 'ММ', reg: '78', owner: 'Smotra · Rolls-Royce Cullinan', val: 6800000, info: 'Один из самых заметных номеров с комбинацией «707» и серией «МММ», который связывают с автомобилями Эрика Давидыча, включая чёрный Rolls-Royce Cullinan (2019 г.) и культовые проекты Smotra.' },
  { f: 'С', d: '013', t: 'РУ', reg: '05', owner: 'Эльдархан Мамаев · BMW M5 E60', val: 4700000, info: 'Легендарный дагестанский номер 05-го региона, прославившийся на культовой серебристой BMW M5 E60 Эльдархана Мамаева.' },
  { f: 'А', d: '777', t: 'СХ', reg: '777', owner: 'Асхаб Тамаев · Lamborghini', val: 5800000, info: 'Культовый московский номер с тремя семёрками, прославившийся на Lamborghini Aventador и суперкарах Асхаба Тамаева.' },
  { f: 'О', d: '777', t: 'ОО', reg: '95', owner: 'Асхаб Тамаев · Aventador 95', val: 6400000, info: 'Легендарная триоль ООО 95-го региона, которую Асхаб Тамаев устанавливал на бирюзовый Lamborghini Aventador.' },
  { f: 'А', d: '777', t: 'АА', reg: '30', owner: 'Асхаб Тамаев · ААА 30', val: 4500000, info: 'Редкий именной номер серии ААА с тремя семёрками 30-го региона из автопарка Асхаба Тамаева.' },
  { f: 'О', d: '887', t: 'ОО', reg: '98', owner: 'Булкин · BMW M5 F90', val: 4200000, info: 'Визитная карточка Александра Булкина, с которой началась его коллекция. Перевешивался на многие культовые авто (включая BMW M5 F90).' },
  { f: 'В', d: '004', t: 'КО', reg: '198', owner: 'Булкин · BMW M2 F87', val: 3800000, info: 'Именной питерский номер, созвучный с псевдонимом (Булкин / Булыч), установленный на спортивное купе BMW M2 F87.' },
  { f: 'Е', d: '666', t: 'УТ', reg: '198', owner: 'Булкин · Audi RS6', val: 3900000, info: 'Громкая покупка для заряженного универсала Audi RS6, ставшая одним из самых дерзких номеров в автопарке блогера.' },
  { f: 'Е', d: '999', t: 'ВМ', reg: '05', owner: 'Wengallbi · CLS 63 AMG', val: 4900000, info: 'Главный узнаваемый номер черного Mercedes-Benz CLS 63 AMG («Банан») Ахмеда Венгалби.' },
  { f: 'А', d: '999', t: 'ВМ', reg: '05', owner: 'Wengallbi · AMG GT 63 S', val: 4600000, info: 'Знаменитая комбинация 05-го региона, которую Ахмед Венгалби устанавливал на Mercedes-AMG GT 63 S и CLS.' },
  { f: 'Х', d: '777', t: 'АМ', reg: '77', owner: 'Smotra · Эрик Давидыч', val: 5200000, info: 'Легендарный столичный номер золотого BMW X5M и автопробегов Smotra.' }
];
  let archiveTab = 'gov';
  function mediaInfo(pl) {
    if (!pl) return null;
    return MEDIA_PLATES.find((m) => m.f === pl.f && String(m.d) === String(pl.d) && m.t === pl.t && String(m.reg) === String(pl.reg)) || null;
  }

  const money = (n) => Math.round(n || 0).toLocaleString('ru-RU') + ' ₽';
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const tag = (t, attrs, html) => '<' + t + (attrs ? ' ' + attrs : '') + '>' + (html || '') + '</' + t + '>';
  const LETTERS = ['А','В','Е','К','М','Н','О','Р','С','Т','У','Х'];

  const RAR = {
    common:    { name: 'Обычный',     col: '#94a3b8' },
    uncommon:  { name: 'Необычный',   col: '#38bdf8' },
    rare:      { name: 'Редкий',      col: '#a855f7' },
    epic:      { name: 'Эпический',   col: '#f59e0b' },
    legendary: { name: 'Спецсерия ★', col: '#ef4444' }
  };

  const SERIES = [
    { k: 'АМР', f: 'А', t: 'МР', reg: ['97','77','99'], m: 48, info: 'Главная правительственная серия РФ (с 2006 г. — АМР 97): Администрация Президента, Правительство, Совет министров и главы ведомств.' },
    { k: 'ЕКХ', f: 'Е', t: 'КХ', reg: ['77','97','99','177'], m: 38, info: 'Историческая серия ФСО России («Еду Как Хочу»). Выдаётся автомобилям Федеральной службы охраны с середины 1990-х.' },
    { k: 'КРА', f: 'К', t: 'РА', reg: ['95'], m: 36, info: 'Высшая статусная серия Чеченской Республики (95 регион), закреплённая за руководством и первыми лицами региона.' },
    { k: 'ККХ', f: 'К', t: 'КХ', reg: ['77','99'], m: 32, info: 'Оперативная серия ФСБ России (1990–2000-е гг.), использовалась подразделениями контрразведки и центрального аппарата.' },
    { k: 'ХКХ', f: 'Х', t: 'КХ', reg: ['77','97'], m: 30, info: 'Спецсерия оперативных и технических подразделений ФСБ России, наследница закрытых федеральных серий.' },
    { k: 'САС', f: 'С', t: 'АС', reg: ['77','97','99'], m: 28, info: 'Закрытая ведомственная серия ФСБ, Службы внешней разведки и органов правительственной спецсвязи.' },
    { k: 'ММР', f: 'М', t: 'МР', reg: ['77','99'], m: 26, info: 'Ведомственная серия центрального аппарата МВД и оперативных управлений (массово применялась в 1990–2000-х).' },
    { k: 'АМО', f: 'А', t: 'МО', reg: ['77','99'], m: 25, info: 'Историческая серия Мэрии Москвы, Правительства столицы и Мосгордумы эпохи 1990–2000-х годов.' },
    { k: 'СКР', f: 'С', t: 'КР', reg: ['77','97','99'], m: 24, info: 'Ведомственная серия Следственного комитета Российской Федерации для центрального аппарата и руководства.' },
    { k: 'СОО', f: 'С', t: 'ОО', reg: ['77','99'], m: 23, info: 'Серия Совета Федерации и Управления делами Президента РФ (выдавалась с 1990-х годов).' },
    { k: 'ВМР', f: 'В', t: 'МР', reg: ['77'], m: 22, info: 'Серия Правительства РФ и федеральных министерств (до перехода на единую серию АМР 97).' },
    { k: 'КМР', f: 'К', t: 'МР', reg: ['77'], m: 22, info: 'Высшая судебная серия РФ: Конституционный, Верховный и Высший Арбитражный суды.' },
    { k: 'РМР', f: 'Р', t: 'МР', reg: ['77'], m: 21, info: 'Ведомственная серия Министерства юстиции РФ и руководства федеральных служб.' },
    { k: 'ОСК', f: 'О', t: 'СК', reg: ['78','98'], m: 21, info: 'Культовая петербургская серия (78/98 регион) Следственного комитета и силовых ведомств Северной столицы.' },
    { k: 'ОСА', f: 'О', t: 'СА', reg: ['78','98'], m: 20, info: 'Историческая серия Смольного, Правительства Санкт-Петербурга и городской прокуратуры.' },
    { k: 'ОРР', f: 'О', t: 'РР', reg: ['78','98'], m: 19, info: 'Ведомственная серия ГУВД Санкт-Петербурга и спецполка дорожно-патрульной службы.' },
    { k: 'ТТТ', f: 'Т', t: 'ТТ', reg: ['16','116'], m: 19, info: 'Высшая административная серия Республики Татарстан, закреплённая за Казанским Кремлём и правительством.' },
    { k: 'ААА', f: 'А', t: 'АА', reg: ['61'], m: 18, info: 'Региональная административная серия Ростовской области (Правительство области и полпредство ЮФО).' },
    { k: 'ННН', f: 'Н', t: 'НН', reg: ['52'], m: 18, info: 'Административная серия Нижегородской области и аппарата полпредства в Приволжском округе.' },
    { k: 'УАО', f: 'У', t: 'АО', reg: ['77'], m: 17, info: 'Спецсерия Управления делами и хозяйственного обеспечения государственных органов.' },
    { k: 'ОМР', f: 'О', t: 'МР', reg: ['77'], m: 17, info: 'Серия центрального аппарата МВД России и подразделений специального сопровождения.' },
    { k: 'АММ', f: 'А', t: 'ММ', reg: ['77','99'], m: 16, info: 'Серия Московской городской Думы и руководства столичного главка внутренних дел.' },
    { k: 'ААА', f: 'А', t: 'АА', reg: null, m: 15, info: 'Классические «три А» (общероссийский стандарт с 1994 г.) — символ представительского автопарка.' },
    { k: 'ООО', f: 'О', t: 'ОО', reg: null, m: 14, info: '«Три Ольги» — известная серия деловой элиты и ведомственных автопарков России 1990–2000-х.' },
    { k: 'МММ', f: 'М', t: 'ММ', reg: null, m: 13, info: 'Престижная силовая и коммерческая серия нового образца, высоко ценится коллекционерами.' },
    { k: 'ВВВ', f: 'В', t: 'ВВ', reg: null, m: 12, info: 'Классическая «тройка» одинаковых букв (с 1994 г.), популярная среди владельцев премиальных седанов.' }
  ];

  const CASES = [
    { id: 'c1', name: 'Сейф инспектора', price: 35000, desc: 'Архив дежурного окна №1: наличные, зеркалки и первые спецсерии.', odds: 'Необычный 52% · Редкий 32% · Эпический 13% · Спецсерия 3%' },
    { id: 'c2', name: 'Конфискат Спецполка', price: 120000, desc: 'Изъятые на постах ДПС редкие знаки и столичные регионы 77/97/78.', odds: 'Редкий 54% · Эпический 34% · Спецсерия ★ 12%' },
    { id: 'c3', name: 'Кремлёвский гараж', price: 450000, desc: 'Закрытый ведомственный резерв: АМО, СОО, ЕКХ, СКР и три цифры.', odds: 'Редкий 30% · Эпический 45% · Спецсерия ★ 25%' },
    { id: 'c4', name: 'Кортеж Президента', price: 1500000, desc: 'Особый фонд спецсвязи: максимальный шанс на АМР 97, ЕКХ 77 и КРА 95.', odds: 'Эпический 42% · Спецсерия ★ 58%' }
  ];

  const FRAMES = [
    { id: '', name: 'Заводская рамка', price: 0, mult: 1.0 },
    { id: 'chrome', name: 'Хром ФСО', price: 25000, mult: 1.2 },
    { id: 'gold', name: 'Золото Кремля', price: 95000, mult: 1.45 },
    { id: 'carbon', name: 'Карбон Спецполк', price: 240000, mult: 1.8 },
    { id: 'neon', name: 'Неон Спецсвязь', price: 420000, mult: 2.2 }
  ];

  window.MREO_CARS = (window.MREO_CARS && window.MREO_CARS.length) ? window.MREO_CARS : [
  ['Lada Vesta Sport', 350000, 1.08, 'economy'],
  ['Kia K5 GT-Line', 950000, 1.15, 'comfort'],
  ['Toyota Camry 3.5', 1650000, 1.22, 'comfort'],
  ['BMW 530d xDrive G30', 3200000, 1.32, 'business'],
  ['Mercedes-Benz E53 AMG', 4800000, 1.42, 'business'],
  ['Porsche Cayenne Turbo GT', 8900000, 1.58, 'premium'],
  ['Mercedes-AMG G63', 14500000, 1.75, 'premium'],
  ['Rolls-Royce Cullinan Black Badge', 28000000, 2.05, 'spec'],
  ['Aurus Senat Limousine', 45000000, 2.40, 'spec']
];
const CARS = (window.MREO_CARS || []).map((x, i) => ({ id: 'car_'+i, name: Array.isArray(x)?x.at(0):(x.name||'Авто'), price: Number(Array.isArray(x)?x.at(1):(x.price||500000)), mult: Number(Array.isArray(x)?x.at(2):(x.mult||1.1)), cat: Array.isArray(x)?x.at(3):(x.cat||'comfort') }));
  const LIVE_FEED = [
    '@alex_777 выбил <b>Е 777 КХ 77</b> из Конфиската Спецполка!',
    '@dmitry_msk продал <b>А 001 МР 97</b> на рынке за <b>6 400 000 ₽</b>!',
    '@vovan_spb открыл Кремлёвский гараж и забрал <b>О 078 СК 78</b>!',
    '@ruslan_95 перебил номер в Боксе до серии <b>К 095 РА 95</b>!',
    '@sergey_vip собрал автопарк с <b>Maybach S680</b> и бонусом ×2.4!'
  ];

  let me = { id: 'local', username: '', name: 'Гражданин', isTg: false };
  let tab = 'roll', modal = null, modalData = null, rolling = false, lastRolled = null, rollStrip = null, rollFinalX = -304;
  let wheelSpin = false, wheelDeg = 0, liveIdx = 0;
  let gMode = 'coin', gBet = 10000, raid = null, crash = null, lastCoin = null, safeCode = null, coinSpin = false;
  let fuseSel = [], craftPid = null, garageSort = 'new', carFilter = 'all', mktTab = 'buy', mktFilter = 'all', mktSort = 'asc', sellPriceMult = 1.25;

  function load() {
    try {
      const raw = localStorage.getItem('mreo_tma_save_v2') || localStorage.getItem('mreo_tma_v1') || localStorage.getItem('mreo_save');
      if (raw) {
        const d = JSON.parse(raw);
        if (d && typeof d === 'object' && Array.isArray(d.plates)) return d;
      }
    } catch (e) {}
    return {
      cash: 45000, gems: 12, xp: 0, linkLvl: 0, seenWelcome: false,
      cfg: { light: false, sound: true, vibro: true, ultra: true, turbo: false, anon: false },
      free: 3, plates: [], cars: CARS.length > 0 ? [CARS.at(0).id] : [], activeCar: CARS.length > 0 ? CARS.at(0).id : null, carPlateId: null,
      stats: { rolled: 0, sold: 0, bestVal: 0 }, market: []
    };
  }

  let S = load();
window.__mreoBridge = { getS: () => S, save: () => (typeof save === 'function' && save()), render: () => (typeof render === 'function' && render()), toast: (m, e) => (typeof toast === 'function' && toast(m, e)) };
window.__getS = () => S;
window.__setS = (v) => { S = v; };
  function save() {
    try { localStorage.setItem('mreo_tma_save_v2', JSON.stringify(S)); } catch (e) {}
  }

  function applyCfg() {
    if (!S.cfg) S.cfg = { light: false, sound: true, vibro: true, ultra: true, turbo: false, anon: false };
    document.body.classList.toggle('light-theme', Boolean(S.cfg.light));
    document.body.classList.toggle('eco-gfx', S.cfg.ultra === false);
  }

  function playTone(freq, dur, type, vol) {
    if (S.cfg && S.cfg.sound === false) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!window._ac) window._ac = new AC();
      const ctx = window._ac;
      if (ctx.state === 'suspended') ctx.resume();
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type || 'sine'; o.frequency.value = freq;
      g.gain.setValueAtTime(vol || 0.05, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (dur || 0.08));
      o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + (dur || 0.08));
    } catch (e) {}
  }
  const sfxTick = () => playTone(620, 0.035, 'triangle', 0.04);
  const sfxWin = (big) => { playTone(523, 0.14, 'triangle', 0.09); setTimeout(() => playTone(big ? 1046 : 784, 0.28, 'triangle', 0.11), 110); };
  function haptic(t) {
    if (S.cfg && S.cfg.vibro === false) return;
    try { window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(t || 'light'); } catch (e) {}
  }

  function levelInfo() {
    const xp = S.xp || 0;
    const lvl = clamp(1 + Math.floor(Math.sqrt(xp / 140)), 1, 100);
    const titles = ['Гражданин','Стажёр МРЭО','Инспектор окна','Старший инспектор','Начальник смены','Решала МРЭО','Куратор спецсерий','Генерал-майор','Советник Кремля','Легенда Спецфонда'];
    const title = titles[Math.min(titles.length - 1, Math.floor((lvl - 1) / 10))];
    const curBase = Math.pow(lvl - 1, 2) * 140;
    const nextBase = Math.pow(lvl, 2) * 140;
const pct = lvl >= 100 ? 100 : Math.round(((xp - curBase) / Math.max(1, nextBase - curBase)) * 100);
return { lvl, title, pct: clamp(pct, 0, 100), xp };
}
function seriesInfo(p) {
if (!p) return null;
const code = p.f + p.t;
return SERIES.find((s) => s.k === code && (!s.reg || s.reg.includes(String(p.reg)))) ||
SERIES.find((s) => s.k === code && !s.reg) || null;
}
function value(p) {
const ser = seriesInfo(p);
const d = String(p.d || '123');
const sameDigits = d.at(0) === d.at(1) && d.at(1) === d.at(2);
const mirrorDigits = d.at(0) === d.at(2) && !sameDigits;
const roundDigits = d.endsWith('00');
const firstTen = Number(d) <= 9;
const sameLetters = p.f === p.t.at(0) && p.f === p.t.at(1);
const topReg = ['77','777','97','99','177','78','98','95'].includes(String(p.reg));
let base = 4500 + (Number(d) % 9) * 450;
let rar = 'common';
if (mirrorDigits || roundDigits) { base = 18000; rar = 'uncommon'; }
if (firstTen) { base = 55000; rar = 'rare'; }
if (sameDigits) { base = d === '777' ? 420000 : 165000; rar = d === '777' ? 'epic' : 'rare'; }
if (sameLetters && !ser) { base = Math.max(base, 290000); rar = 'epic'; }
if (ser) {
base = (ser.reg ? 1600000 : 390000) + ser.m * 35000;
if (sameDigits) base *= 1.8;
rar = 'legendary';
}
if (topReg) base *= 1.25;
const fr = FRAMES.find((x) => x.id === (p.frame || '')) || FRAMES.at(0);
base = Math.round((base * fr.mult) / 100) * 100;
return {
id: p.id || ('pl_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6)),
f: p.f, d: d, t: p.t, reg: String(p.reg),
frame: p.frame || '', val: base, rar: rar,
ser: ser ? ser.k : ''
};
}
function isPlateTaken(cand) {
return S.plates.some((x) => x.f === cand.f && x.d === cand.d && x.t === cand.t && String(x.reg) === String(cand.reg));
}
function make(forceBlat) {
const luck = 1 + (S.linkLvl || 0) * 0.25;
for (let attempt = 0; attempt < 80; attempt++) {
let f = pick(LETTERS), d = String(1 + Math.floor(Math.random() * 999)).padStart(3, '0'), t = pick(LETTERS) + pick(LETTERS);
const commonRegs = ['50','16','52','63','66','74','02','59','55','38','34','24','42','76','33','36','61','26'];
const topRegs = ['77','777','99','95','177','78','98'];
let reg = Math.random() < 0.2 ? pick(topRegs) : pick(commonRegs);
if (Math.random() < 0.008 * luck) d = pick('123456789').repeat(3);
if (Math.random() < 0.014 * luck) { f = pick(LETTERS); t = f + f; }
if (forceBlat || Math.random() < 0.003 * luck) {
const sr = pick(forceBlat ? SERIES : SERIES.slice(3));
f = sr.f; t = sr.t;
if (sr.reg) reg = pick(sr.reg);
}
const cand = { f, d, t, reg, frame: '' };
if (!isPlateTaken(cand)) return value(cand);
}
return value({ f: pick(LETTERS), d: '418', t: pick(LETTERS) + pick(LETTERS), reg: '50', frame: '' });
}
function makeByTier(tier) {
if (tier === 'legendary') return make(true);
if (tier === 'epic') return value({ f: 'М', d: pick(['777','001','999','888']), t: 'ММ', reg: pick(['77','777','78']), frame: '' });
if (tier === 'rare') return value({ f: pick(LETTERS), d: pick(['111','222','333','555','007']), t: pick(LETTERS) + pick(LETTERS), reg: pick(['77','50','16']), frame: '' });
if (tier === 'uncommon') return value({ f: pick(LETTERS), d: pick(['101','202','500','700']), t: pick(LETTERS) + pick(LETTERS), reg: '50', frame: '' });
return make(false);
}
  function marketBreakdown(pl) {
    if (!pl) return [];
    const tags = [];
    const d = String(pl.d || '');
    const reg = String(pl.reg || '');
    if (d === '001' || d === '007' || d === '777' || d === '999') tags.push('Топ-комбинация цифр ' + d);
    else if (d.at(0) === d.at(1) && d.at(1) === d.at(2)) tags.push('Три одинаковые цифры ' + d);
    else if (d.at(0) === d.at(2)) tags.push('Зеркальные цифры ' + d);
    else if (Number(d) <= 10) tags.push('Первая десятка ' + d);
    if (pl.f === pl.t.at(0) && pl.f === pl.t.at(1)) tags.push('Три одинаковые буквы ' + pl.f + pl.t);
    if (['77','97','99','177','197','199','777','797','799'].includes(reg)) tags.push('Москва (' + reg + ') ×1.45');
    else if (['78','98','178','198'].includes(reg)) tags.push('Санкт-Петербург (' + reg + ') ×1.25');
    else if (reg === '95') tags.push('Чеченская Респ. (95) ×1.5');
    if (pl.ser) tags.push('Ведомственная серия ' + pl.ser);
    if (tags.length === 0) tags.push('Стандартный тариф МРЭО');
    return tags;
  }

  function plate(p) {
    if (!p) return '';
    const frCls = p.frame && p.frame !== 'none' ? (' frame-' + p.frame) : '';
    const rarCls = p.rar && p.rar !== 'common' ? (' ' + p.rar) : '';
    const f = String(p.f || 'А').toUpperCase();
    const d = String(p.d || '001');
    const t = String(p.t || 'АА').toUpperCase();
    const reg = String(p.reg || '77');
    const regFont = reg.length >= 3 ? 39 : 47;
    const uid = 'g_' + Math.random().toString(36).slice(2, 7);

    return '<div class="plate' + rarCls + '">' +
      '<svg class="gost-svg" viewBox="0 0 520 112" xmlns="http://w3.org">' +
        '<defs>' +
          '<linearGradient id="' + uid + '" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0%" stop-color="#ffffff"/>' +
            '<stop offset="62%" stop-color="#f3f6fa"/>' +
            '<stop offset="100%" stop-color="#dfe6ee"/>' +
          '</linearGradient>' +
        '</defs>' +
        '<rect x="2.5" y="2.5" width="515" height="107" rx="12" fill="url(#' + uid + ')" stroke="rgba(148,163,184,0.45)" stroke-width="1"/>' +
        '<line x1="392" y1="3" x2="392" y2="109" stroke="rgba(148,163,184,0.45)" stroke-width="1"/>' +
        '<circle cx="16" cy="56" r="3.6" fill="#94a3b8" stroke="#334155" stroke-width="1.1"/>' +
        '<circle cx="504" cy="56" r="3.6" fill="#94a3b8" stroke="#334155" stroke-width="1.1"/>' +
        '<text x="52" y="83" font-family="Arial, Helvetica, sans-serif" font-size="56" font-weight="800" fill="#090d16" text-anchor="middle">' + f + '</text>' +
        '<text x="178" y="85" font-family="Arial, Helvetica, sans-serif" font-size="74" font-weight="900" letter-spacing="3" fill="#090d16" text-anchor="middle">' + d + '</text>' +
        '<text x="322" y="83" font-family="Arial, Helvetica, sans-serif" font-size="56" font-weight="800" letter-spacing="3" fill="#090d16" text-anchor="middle">' + t + '</text>' +
        '<text x="454" y="54" font-family="Arial, Helvetica, sans-serif" font-size="' + regFont + '" font-weight="900" letter-spacing="-0.5" fill="#090d16" text-anchor="middle">' + reg + '</text>' +
        '<text x="430" y="88" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="900" letter-spacing="0.8" fill="#090d16" text-anchor="middle">RUS</text>' +
        '<g transform="translate(459, 71)">' +
          '<rect x="0" y="0" width="32" height="20" rx="2" fill="#ffffff" stroke="#090d16" stroke-width="1.6"/>' +
          '<rect x="0.8" y="6.8" width="30.4" height="6.6" fill="#1d4ed8"/>' +
          '<rect x="0.8" y="13.4" width="30.4" height="5.8" fill="#dc2626"/>' +
        '</g>' +
      '</svg>' +
    '</div>';
  }

    function animatePlateToGarage(srcRect, plObj) {
    if (!srcRect || !plObj) return;
    const garageBtn = document.querySelector('.dock-item[data-v="garage"]');
    const dstRect = garageBtn
      ? garageBtn.getBoundingClientRect()
      : { left: window.innerWidth * 0.25, top: window.innerHeight - 40, width: 44, height: 44 };

    const clone = document.createElement('div');
    clone.className = 'gpu-fly-plate';
    clone.style.left = srcRect.left + 'px';
    clone.style.top = srcRect.top + 'px';
    clone.style.width = Math.max(130, srcRect.width) + 'px';
    clone.innerHTML =
      '<span style="font-size:15px;letter-spacing:0.5px">' + String(plObj.f).toUpperCase() + ' ' + plObj.d + ' ' + String(plObj.t).toUpperCase() + '</span>' +
      '<span style="font-size:12px;padding-left:6px;border-left:1.5px solid #090d16">' + plObj.reg + '</span>';
    document.body.appendChild(clone);

    const dx = (dstRect.left + dstRect.width / 2) - (srcRect.left + srcRect.width / 2);
    const dy = (dstRect.top + dstRect.height / 2) - (srcRect.top + srcRect.height / 2);

    const anim = clone.animate([
      { transform: 'translate3d(0, 0, 0) scale3d(1, 1, 1)', opacity: 1 },
      { transform: 'translate3d(0, -24px, 0) scale3d(1.12, 1.12, 1)', opacity: 1, offset: 0.24 },
      { transform: 'translate3d(' + (dx * 0.1).toFixed(1) + 'px, -28px, 0) scale3d(1.1, 1.1, 1)', opacity: 1, offset: 0.42 },
      { transform: 'translate3d(' + (dx * 0.68).toFixed(1) + 'px, ' + (dy * 0.55).toFixed(1) + 'px, 0) scale3d(0.6, 0.6, 1)', opacity: 0.95, offset: 0.78 },
      { transform: 'translate3d(' + dx.toFixed(1) + 'px, ' + dy.toFixed(1) + 'px, 0) scale3d(0.18, 0.18, 1)', opacity: 0 }
    ], {
      duration: 980,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'forwards'
    });

    anim.onfinish = () => {
      clone.remove();
      haptic('medium');
      if (garageBtn) {
        garageBtn.classList.remove('garage-catch');
        void garageBtn.offsetWidth;
        garageBtn.classList.add('garage-catch');
      }
    };
  }

  function renderRoll() {
    const cost = 10000;
    const displayPlate = (rollStrip && rollStrip.at(0)) ? rollStrip.at(0) : (lastRolled || S.lastTerminalPlate || null);
    const ser = lastRolled ? seriesInfo(lastRolled) : null;
    const med = lastRolled ? mediaInfo(lastRolled) : null;

    const stageCls = rolling
      ? 'mreo-terminal-stage scanning'
      : (lastRolled && lastRolled.rar !== 'common' ? ('mreo-terminal-stage locked-' + lastRolled.rar) : 'mreo-terminal-stage');

    const statusLeft = rolling ? 'ПОДБОР СЕРИИ В БАЗЕ ГИБДД...' : (lastRolled ? 'НОМЕР ЗАРЕГИСТРИРОВАН' : 'ТЕРМИНАЛ ВЫДАЧИ МРЭО');
    const statusRight = rolling ? '● СКАН' : (lastRolled ? (RAR[lastRolled.rar]?.name || 'СТАНДАРТ') : 'ГОТОВ');

    const resultCard = lastRolled && !rolling
      ? tag('div', 'class="roll-result-lux"',
          tag('div', 'class="roll-rar-pill ' + (RAR[lastRolled.rar]?.cls || 'rar-common') + '"',
            (RAR[lastRolled.rar]?.name || '') + (med ? ' · ' + med.owner : (ser ? ' · Серия ' + ser.k : ''))) +
          (med ? tag('div', 'class="muted" style="font-size:11.5px;margin:4px 0"', med.info) : (ser ? tag('div', 'class="muted" style="font-size:11.5px;margin:4px 0"', ser.info) : '')) +
          tag('div', 'style="display:flex;flex-wrap:wrap;justify-content:center;gap:4px;margin:6px 0 4px"',
            marketBreakdown(lastRolled).map((tg) => tag('span', 'style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:rgba(56,189,248,0.12);border:0.75px solid rgba(56,189,248,0.3);color:#7dd3fc"', tg)).join('')) +
          tag('div', 'class="roll-val-badge"', 'Рыночная цена РФ: ' + money(lastRolled.val)) +
          tag('div', 'class="roll-actions"',
            tag('button', 'class="btn ghost" style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;padding:4px 8px;white-space:nowrap" data-a="roll_sell"',
              tag('span', 'style="font-size:9.5px;font-weight:700;opacity:0.65;letter-spacing:0.04em"', 'СЛИТЬ СРАЗУ') +
              tag('b', 'style="font-size:13px;font-weight:800;color:#f8fafc"', money(Math.round(lastRolled.val * 0.7)))) +
            tag('button', 'class="btn primary" style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;padding:4px 8px;white-space:nowrap" data-a="roll_keep"',
              tag('b', 'style="font-size:13.5px;font-weight:900"', 'В гараж') +
              tag('span', 'style="font-size:9.5px;font-weight:700;opacity:0.75"', 'В коллекцию'))))
      : '';

    if (!S.hotOffers || S.hotOffers.length === 0) {
      S.hotOffers = [makeByTier('epic'), makeByTier('rare')];
      save();
    }

    const hotHtml = tag('div', 'class="hot-grid-lux"',
      S.hotOffers.map((hp, idx) => {
        const discPrice = Math.round(hp.val * 0.72);
        const canBuy = S.cash >= discPrice;
        return tag('div', 'class="hot-deal-card"',
          tag('div', 'class="hot-top-row"',
            tag('span', 'class="hot-disc-pill"', '-28%') +
            tag('span', 'class="hot-ser-txt"', hp.ser || RAR[hp.rar]?.name || 'ЭЛИТ')) +
          plate(hp) +
          tag('div', 'class="muted" style="text-decoration:line-through;font-size:10.5px;margin-top:8px"', money(hp.val)) +
          tag('button', 'class="case-buy-pill' + (canBuy ? '' : ' cant-afford') + '" style="width:100%;margin-top:5px" data-a="buy_hot" data-v="' + idx + '"', money(discPrice)));
      }).join('')) +
      tag('div', 'class="hot-bundle-card"',
        tag('div', 'class="hot-bundle-ico"',
          '<svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.85;stroke-linecap:round;stroke-linejoin:round"><path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1.5a1.5 1.5 0 0 0 0 3V15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1.5a1.5 1.5 0 0 0 0-3V9z"/><line x1="15" y1="7" x2="15" y2="17" stroke-dasharray="2 2"/></svg>') +
        tag('div', 'style="flex:1;min-width:0"',
          tag('div', 'style="font-size:13px;font-weight:800;color:#f8fafc"', 'Пакет «5 талонов МРЭО»') +
          tag('div', 'class="muted" style="font-size:11px;margin-top:1px"', '5 выдач без очереди · выгода 22%')) +
        tag('button', 'class="case-buy-pill' + (S.cash >= 39000 ? '' : ' cant-afford') + '" data-a="buy_talons"', '39 000 ₽'));

    const caseIcons = {
      c1: '<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="7" x2="12" y2="9"/>',
      c2: '<path d="M12 3l8 4v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V7l8-4z"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="15.5" r="0.8"/>',
      c3: '<path d="M3 10l9-6 9 6"/><path d="M5 10v9h14v-9"/><line x1="9" y1="13" x2="9" y2="17"/><line x1="15" y1="13" x2="15" y2="17"/>',
      c4: '<path d="M3 18h18l-2-10-4.5 4L12 6l-2.5 6L5 8l-2 10z"/>'
    };
    const casesHtml = CASES.map((c) =>
      tag('div', 'class="case-card-lux ' + c.id + '"',
        tag('div', 'class="case-medal"', '<svg viewBox="0 0 24 24">' + (caseIcons[c.id] || caseIcons.c1) + '</svg>') +
        tag('div', 'class="case-info-col"',
          tag('div', 'class="case-title-row"',
            tag('span', '', c.name) +
            tag('button', 'class="case-info-btn" data-a="case_info" data-v="' + c.id + '"', 'i')) +
          tag('div', 'class="case-desc-txt"', c.desc)) +
        tag('button', 'class="case-buy-pill' + (S.cash < c.price ? ' cant-afford' : '') + '" data-a="open_case" data-v="' + c.id + '"', money(c.price)))).join('');

    return tag('section', 'class="hero"',
      tag('div', 'class="hero-kicker"', tag('span', 'class="dot-live"', '') + 'ДЕЖУРНОЕ ОКНО №1 · МРЭО РФ') +
      tag('h2', '', 'Окно выдачи МРЭО') +
      tag('div', 'class="stat-pills"',
        tag('div', 'class="stat-pill"', tag('span', '', 'Талоны') + tag('b', '', (S.free || 0) + ' шт.')) +
        tag('div', 'class="stat-pill"', tag('span', '', 'Связи МРЭО') + tag('b', '', 'Ур. ' + (S.linkLvl || 0) + '/10'))) +
      tag('div', 'class="' + stageCls + '"',
        tag('div', 'class="mreo-status-bar"',
          tag('span', '', statusLeft) +
          tag('span', 'style="color:#38bdf8"', statusRight)) +
        tag('div', 'class="mreo-plate-wrap" id="terminal-plate-slot"', plate(displayPlate))) +
      tag('button', 'class="btn primary' + ((S.free || 0) <= 0 && S.cash < cost ? ' cant-afford' : '') + '" style="width:100%;margin-top:12px"' + (rolling ? ' disabled' : '') + ' data-a="roll"',
        rolling ? 'Подбор комбинации в базе ГИБДД...' : ((S.free || 0) > 0 ? 'Получить по талону (Бесплатно)' : 'Оформить серию · ' + money(cost))) +
      resultCard) +
      tag('section', 'class="panel"',
        tag('div', 'style="display:flex;justify-content:space-between;align-items:center"',
          tag('div', 'class="section" style="margin:0"', 'Горячие предложения') +
          tag('button', 'class="btn ghost small" style="' + (S.cash < 10000 ? 'opacity:0.5;' : '') + '" data-a="refresh_hot"', 'Обновить · 10к')) +
        hotHtml) +
      tag('section', 'class="panel"',
        tag('div', 'class="section"', 'Спец-кейсы МРЭО и МВД') + casesHtml);
  }

  function carSvg(car, mountedPlate) {
    if (!car) return '';
    const nm = String(car.name || '').toLowerCase();
    const isSuv = ['g63','gel','cruiser','lx','x5','x6','x7','q7','q8','cayenne','urus','escalade','tahoe','niva','нива','уаз','patriot','range','defender'].some((w) => nm.includes(w));
    const isPrem = car.cat === 'premium' || car.cat === 'special';
    const paintMap = {
      obsidian: ['#64748b', '#1e293b', '#070b14'],
      pearl:    ['#ffffff', '#cbd5e1', '#475569'],
      crimson:  ['#fca5a5', '#b91c1c', '#2a080c'],
      sapphire: ['#93c5fd', '#1d4ed8', '#091534'],
      gold:     ['#fef08a', '#d97706', '#2d1604']
    };
    const pal = paintMap[S.carColor || 'obsidian'] || paintMap.obsidian;
    const ledCol = isPrem ? '#fde047' : '#38bdf8';
    const roofTop = isSuv ? 18 : 26;
    const beltY = isSuv ? 54 : 58;

    const plateOverlay = mountedPlate
      ? '<div style="position:absolute;left:0;right:0;bottom:34px;display:flex;justify-content:center;pointer-events:none"><div style="width:214px;transform:scale(0.35);transform-origin:bottom center;filter:drop-shadow(0 3px 8px rgba(0,0,0,0.9))">' + plate(mountedPlate) + '</div></div>'
      : '<div style="position:absolute;left:0;right:0;bottom:25px;display:flex;justify-content:center;pointer-events:none"><span style="font-size:8px;font-weight:800;letter-spacing:0.14em;color:rgba(255,255,255,0.34)">НЕТ НОМЕРА</span></div>';

    return '<div style="position:relative;width:268px;height:138px;margin:0 auto;display:flex;align-items:center;justify-content:center">' +
      '<svg viewBox="0 0 320 160" style="width:268px;height:138px;display:block">' +
        '<defs>' +
          '<linearGradient id="luxPaint" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0%" stop-color="' + pal.at(0) + '"/>' +
            '<stop offset="46%" stop-color="' + pal.at(1) + '"/>' +
            '<stop offset="100%" stop-color="' + pal.at(2) + '"/>' +
          '</linearGradient>' +
          '<linearGradient id="windshield" x1="0" y1="0" x2="1" y2="1">' +
            '<stop offset="0%" stop-color="#7dd3fc" stop-opacity="0.38"/>' +
            '<stop offset="45%" stop-color="#090e1a" stop-opacity="0.95"/>' +
            '<stop offset="100%" stop-color="#1e293b" stop-opacity="0.88"/>' +
          '</linearGradient>' +
          '<radialGradient id="headlightGlow" cx="50%" cy="50%" r="50%">' +
            '<stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>' +
            '<stop offset="45%" stop-color="' + ledCol + '" stop-opacity="0.55"/>' +
            '<stop offset="100%" stop-color="' + ledCol + '" stop-opacity="0"/>' +
          '</radialGradient>' +
        '</defs>' +
        '<ellipse cx="160" cy="142" rx="134" ry="11" fill="' + ledCol + '" opacity="0.22"/>' +
        '<rect x="44" y="106" width="36" height="34" rx="10" fill="#05070d" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>' +
        '<rect x="240" y="106" width="36" height="34" rx="10" fill="#05070d" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>' +
        '<path d="M40 ' + (beltY - 2) + ' Q52 ' + (beltY - 10) + ' 64 ' + (beltY - 3) + ' L60 ' + (beltY + 5) + ' L42 ' + (beltY + 4) + ' Z" fill="url(#luxPaint)" stroke="rgba(255,255,255,0.5)" stroke-width="1.2"/>' +
        '<path d="M280 ' + (beltY - 2) + ' Q268 ' + (beltY - 10) + ' 256 ' + (beltY - 3) + ' L260 ' + (beltY + 5) + ' L278 ' + (beltY + 4) + ' Z" fill="url(#luxPaint)" stroke="rgba(255,255,255,0.5)" stroke-width="1.2"/>' +
        '<path d="M68 ' + beltY + ' Q86 ' + roofTop + ' 112 ' + roofTop + ' L208 ' + roofTop + ' Q234 ' + roofTop + ' 252 ' + beltY + ' Z" fill="url(#luxPaint)" stroke="rgba(255,255,255,0.58)" stroke-width="1.4"/>' +
        '<path d="M80 ' + (beltY - 2) + ' Q95 ' + (roofTop + 6) + ' 115 ' + (roofTop + 6) + ' L205 ' + (roofTop + 6) + ' Q225 ' + (roofTop + 6) + ' 240 ' + (beltY - 2) + ' Z" fill="url(#windshield)"/>' +
        '<path d="M34 ' + (beltY + 14) + ' Q44 ' + beltY + ' 68 ' + beltY + ' L252 ' + beltY + ' Q276 ' + beltY + ' 286 ' + (beltY + 14) + ' L290 116 Q290 124 278 124 L42 124 Q30 124 30 116 Z" fill="url(#luxPaint)" stroke="rgba(255,255,255,0.62)" stroke-width="1.5"/>' +
        '<path d="M88 ' + (beltY + 3) + ' L104 ' + (beltY + 26) + ' M232 ' + (beltY + 3) + ' L216 ' + (beltY + 26) + '" stroke="rgba(255,255,255,0.28)" stroke-width="1.2"/>' +
        '<rect x="116" y="' + (beltY + 12) + '" width="88" height="23" rx="7" fill="#060913" stroke="' + ledCol + '" stroke-width="1.5"/>' +
        '<line x1="132" y1="' + (beltY + 13) + '" x2="132" y2="' + (beltY + 34) + '" stroke="rgba(255,255,255,0.24)" stroke-width="1.1"/>' +
        '<line x1="146" y1="' + (beltY + 13) + '" x2="146" y2="' + (beltY + 34) + '" stroke="rgba(255,255,255,0.24)" stroke-width="1.1"/>' +
        '<line x1="160" y1="' + (beltY + 13) + '" x2="160" y2="' + (beltY + 34) + '" stroke="rgba(255,255,255,0.45)" stroke-width="1.4"/>' +
        '<line x1="174" y1="' + (beltY + 13) + '" x2="174" y2="' + (beltY + 34) + '" stroke="rgba(255,255,255,0.24)" stroke-width="1.1"/>' +
        '<line x1="188" y1="' + (beltY + 13) + '" x2="188" y2="' + (beltY + 34) + '" stroke="rgba(255,255,255,0.24)" stroke-width="1.1"/>' +
        '<circle cx="160" cy="' + (beltY + 7) + '" r="4" fill="#090d16" stroke="' + ledCol + '" stroke-width="1.3"/>' +
        '<ellipse cx="64" cy="' + (beltY + 22) + '" rx="28" ry="14" fill="url(#headlightGlow)"/>' +
        '<ellipse cx="256" cy="' + (beltY + 22) + '" rx="28" ry="14" fill="url(#headlightGlow)"/>' +
        '<path d="M40 ' + (beltY + 17) + ' L98 ' + (beltY + 19) + ' L94 ' + (beltY + 27) + ' L38 ' + (beltY + 25) + ' Z" fill="#090e1a" stroke="rgba(255,255,255,0.45)" stroke-width="1"/>' +
        '<path d="M280 ' + (beltY + 17) + ' L222 ' + (beltY + 19) + ' L226 ' + (beltY + 27) + ' L282 ' + (beltY + 25) + ' Z" fill="#090e1a" stroke="rgba(255,255,255,0.45)" stroke-width="1"/>' +
        '<circle cx="56" cy="' + (beltY + 22) + '" r="4" fill="#ffffff"/>' +
        '<circle cx="76" cy="' + (beltY + 22) + '" r="3.5" fill="' + ledCol + '"/>' +
        '<circle cx="264" cy="' + (beltY + 22) + '" r="4" fill="#ffffff"/>' +
        '<circle cx="244" cy="' + (beltY + 22) + '" r="3.5" fill="' + ledCol + '"/>' +
        '<path d="M44 103 L96 105 L92 115 L42 113 Z" fill="#050811" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>' +
        '<path d="M276 103 L224 105 L228 115 L278 113 Z" fill="#050811" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>' +
        '<rect x="108" y="99" width="104" height="24" rx="5" fill="#050811" stroke="rgba(255,255,255,0.48)" stroke-width="1.1"/>' +
      '</svg>' + plateOverlay + '</div>';
  }

  function renderGarage() {
    if (S.cars && S.cars.length && (!S.curCar || Array.isArray(S.curCar) || !S.cars.includes(S.curCar))) { S.curCar = S.cars[0]; }
    if ((!S.cars || S.cars.length === 0) && CARS.length > 0) {
      S.cars = [CARS.at(0).id];
      S.activeCar = CARS.at(0).id;
    }
    const activeCar = CARS.find((c) => c.id === S.activeCar) || CARS.at(0) || null;
    const mounted = S.plates.find((p) => p.id === S.carPlateId) || null;
    const tuneLvl = (S.carTune && activeCar && S.carTune[activeCar.id]) || 0;
    const tuneCost = 45000 * (tuneLvl + 1);
    const totalParkMult = 1 + S.cars.reduce((acc, id) => {
      const c = CARS.find((x) => x.id === id);
      const t = (S.carTune && S.carTune[id]) || 0;
      return acc + (c ? ((c.mult + t * 0.15) - 1) * 0.45 : 0);
    }, 0);
    const platesSum = S.plates.reduce((acc, p) => acc + (p.val || 0), 0);
    const carsSum = S.cars.reduce((acc, id) => {
      const c = CARS.find((x) => x.id === id);
      return acc + (c ? (c.price || 0) : 0);
    }, 0);
    const catLabels = { budget: 'Эконом', comfort: 'Комфорт', business: 'Бизнес', premium: 'Премиум', special: 'Спецтранспорт' };
    const isPrem = activeCar && (activeCar.cat === 'premium' || activeCar.cat === 'special');

    const colors = [
      ['obsidian', '#1e293b', 'Обсидиан'],
      ['pearl', '#e2e8f0', 'Перламутр'],
      ['crimson', '#b91c1c', 'Гранат'],
      ['sapphire', '#1d4ed8', 'Сапфир'],
      ['gold', '#d97706', 'Золото']
    ];
    const colorDots = tag('div', 'style="display:flex;align-items:center;justify-content:center;gap:10px;margin:8px 0 4px"',
      colors.map((cl) => {
        const active = (S.carColor || 'obsidian') === cl.at(0);
        return '<button data-a="car_color" data-v="' + cl.at(0) + '" title="' + cl.at(2) + '" style="width:22px;height:22px;border-radius:50%;background:' + cl.at(1) + ';border:' + (active ? '2.5px solid #fbbf24' : '1px solid rgba(255,255,255,0.35)') + ';box-shadow:' + (active ? '0 0 10px rgba(251,191,36,0.75)' : 'none') + ';cursor:pointer;padding:0"></button>';
      }).join(''));

    const ownedCarsBar = S.cars.length > 1
      ? tag('div', 'class="chips" style="margin:8px 0 2px;justify-content:center"',
          S.cars.map((cid) => {
            const c = CARS.find((x) => x.id === cid);
            if (!c) return '';
            return tag('button', 'class="chip ' + (c.id === S.activeCar ? 'got' : '') + '" data-a="pick_car" data-v="' + c.id + '"', c.name);
          }).join(''))
      : '';

    const cruiseLeft = Math.max(0, (S.nextCruise || 0) - Date.now());
    const cruiseBonus = Math.round(((mounted ? mounted.val : 15000) * 0.08 + 12000) * totalParkMult * (1 + tuneLvl * 0.25));
    const cruiseBtn = tag('button', 'class="btn ghost" style="width:100%;margin-top:8px;height:42px;font-size:12px;' + (cruiseLeft === 0 ? 'border-color:rgba(56,189,248,0.45);color:#7dd3fc;' : 'opacity:0.65;') + '" data-a="car_cruise"',
      cruiseLeft === 0
        ? ('Выехать в город на ' + (activeCar ? activeCar.name : 'авто') + ' · +' + money(cruiseBonus))
        : ('Следующий выезд в город через ' + fmtCountdown(cruiseLeft)));

    const tuneBtn = activeCar
? tag('button', 'class="btn ghost' + (tuneLvl < 3 && S.cash < tuneCost ? ' cant-afford' : '') + '" style="width:100%;margin-top:8px;height:42px;font-size:12px"' + (tuneLvl >= 3 ? ' disabled' : '') + ' data-a="tune_car"',
tuneLvl >= 3
? 'Тюнинг-пакет Stage 3 установлен ★'
: ('Stage ' + (tuneLvl + 1) + '/3 · Доход заездов +25% и парк +0.15× · ' + money(tuneCost)))
: '';
const podium = tag('section', 'class="hero" style="text-align:center"',
tag('div', 'class="hero-kicker"', tag('span', 'class="dot-live"', '') + 'VIP-ГАРАЖ · АКТИВЫ ' + money(platesSum + carsSum)) +
tag('h2', 'style="margin:0 0 10px"', activeCar ? (activeCar.name + (tuneLvl > 0 ? ' · Stage ' + tuneLvl : '')) : 'Автомобиль') +
tag('div', 'class="car-specs-row"',
tag('div', 'class="car-spec-pill"', tag('span', '', 'Класс') + tag('b', '', activeCar ? (catLabels[activeCar.cat] || 'Стандарт') : '—')) +
tag('div', 'class="car-spec-pill"', tag('span', '', 'Бонус парка') + tag('b', '', '×' + totalParkMult.toFixed(2)))) +
tag('div', 'class="garage-showroom' + (isPrem ? ' prem' : '') + '"',
tag('div', 'class="showroom-floor"', '') +
carSvg(activeCar, mounted) +
colorDots) +
ownedCarsBar +
tag('div', 'style="display:flex;gap:8px;margin-top:10px"',
tag('button', 'class="btn primary" style="flex:1" data-a="cars"', 'Автосалон (' + S.cars.length + '/' + CARS.length + ')') +
(mounted ? tag('button', 'class="btn ghost" data-a="unmount"', 'Снять номер') : '')) +
tuneBtn +
cruiseBtn);
const sorted = [...S.plates].sort((a, b) => garageSort === 'val' ? (b.val - a.val) : 0);
const controls = S.plates.length > 0
? tag('div', 'class="chips" style="margin-bottom:10px"',
tag('button', 'class="chip ' + (garageSort === 'new' ? 'got' : '') + '" data-a="g_sort" data-v="new"', 'По дате') +
tag('button', 'class="chip ' + (garageSort === 'val' ? 'got' : '') + '" data-a="g_sort" data-v="val"', 'Дорогие сверху') +
tag('button', 'class="chip" data-a="sell_common"', 'Слить обычные'))
: '';
const grid = sorted.length === 0
      ? tag('div', 'class="empty"', 'В гараже пока пусто. Выбейте первый номер во вкладке «Выдача»!')
      : tag('div', 'class="garage-grid"', sorted.map((p) => {
          const isOn = S.carPlateId === p.id;
          const needMountHighlight = !mounted && !isOn;
          const sellGain = Math.round(p.val * 0.7);
          return tag('div', 'class="garage-plate-card' + (isOn ? ' is-mounted' : '') + '"',
            tag('div', 'class="gp-top-bar"',
              tag('span', 'class="gp-rar-pill ' + (RAR[p.rar]?.cls || '') + '"', (RAR[p.rar]?.name || '') + (p.ser ? ' · ' + p.ser : '')) +
              (isOn ? tag('span', 'class="gp-mounted-dot" title="Установлен на авто"', '') : '')) +
            tag('div', 'class="gp-stage"', plate(p)) +
            tag('div', 'class="gp-price-row"',
              tag('span', '', 'Цена') +
              tag('b', '', money(p.val))) +
            tag('div', 'class="gp-btns"',
              tag('button', 'class="btn ' + (isOn || needMountHighlight ? 'primary' : 'ghost') + '" data-a="' + (isOn ? 'unmount' : 'mount') + '" data-v="' + p.id + '"', isOn ? 'Снять ★' : 'На авто') +
              tag('button', 'class="btn ghost" title="Продать за ' + money(sellGain) + '" data-a="sell_one" data-v="' + p.id + '"', 'Продать')));
        }).join(''));

    return podium + tag('section', 'class="panel"',
tag('div', 'class="section"', 'Ваши госномера (' + S.plates.length + ')') + controls + grid);
}
function renderCraft() {
    const lvl = S.linkLvl || 0;
    const linkCost = 40000 * Math.pow(2, lvl);
    const luckPct = lvl * 25;
    if (!craftPid || !S.plates.some((x) => x.id === craftPid)) {
      craftPid = S.plates.length > 0 ? S.plates.at(0).id : null;
    }
    const targetP = S.plates.find((x) => x.id === craftPid) || null;
    const demoPlate = { f: 'А', d: '777', t: 'МР', reg: '97', rar: 'legendary', frame: 'gold', val: 3200000, ser: 'АМР' };
    const showP = targetP || demoPlate;
    const polishLvl = (targetP && targetP.polish) || 0;
    const polishCost = 30000 * (polishLvl + 1);

    const selectorHtml = S.plates.length > 0
      ? tag('div', 'class="chips" style="margin-bottom:8px"',
          S.plates.map((p) =>
            tag('button', 'class="chip ' + (p.id === craftPid ? 'got' : '') + '" data-a="craft_sel" data-v="' + p.id + '"',
              p.f + p.d + p.t + ' ' + p.reg)).join(''))
      : '';

    const workbenchSection = tag('section', 'class="panel"',
      tag('div', 'style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"',
        tag('div', 'class="section" style="margin:0"', 'Верстак перебивки и тюнинга') +
        tag('span', 'style="font-size:10.5px;font-weight:700;color:' + (targetP ? '#4ade80' : '#fbbf24') + '"', targetP ? 'Номер на стенде' : 'Демо-образец')) +
      selectorHtml +
      tag('div', 'class="workbench-stage"',
        tag('div', 'style="font-size:10.5px;font-weight:800;color:#c084fc;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:8px"',
          (RAR[showP.rar]?.name || '') + (showP.ser ? ' · Серия ' + showP.ser : '') + (polishLvl > 0 ? ' · Полировка +' + (polishLvl * 15) + '%' : '')) +
        tag('div', 'style="max-width:236px;margin:0 auto 8px"', plate(showP)) +
        tag('div', 'class="roll-val-badge" style="margin:4px 0 0"', 'Оценка: ' + money(showP.val))) +
      (targetP
        ? (tag('div', 'class="reroll-grid"',
            tag('button', 'class="btn reroll-btn' + (S.cash < 35000 ? ' cant-afford' : '') + '" data-a="reroll_letters"', tag('span', '', 'Буквы') + tag('b', '', '35 000 ₽')) +
            tag('button', 'class="btn reroll-btn' + (S.cash < 25000 ? ' cant-afford' : '') + '" data-a="reroll_digits"', tag('span', '', 'Цифры') + tag('b', '', '25 000 ₽')) +
            tag('button', 'class="btn reroll-btn' + (S.cash < 45000 ? ' cant-afford' : '') + '" data-a="reroll_reg"', tag('span', '', 'Регион') + tag('b', '', '45 000 ₽'))) +
          tag('button', 'class="btn reroll-btn' + (polishLvl < 3 && S.cash < polishCost ? ' cant-afford' : '') + '" style="width:100%;margin-top:8px;padding:10px 12px"' + (polishLvl >= 3 ? ' disabled' : '') + ' data-a="polish_plate"',
            polishLvl >= 3
              ? (tag('span', '', 'Полировка и бронеплёнка ГОСТ (3/3)') + tag('b', 'style="color:#4ade80"', 'Максимальная защита установлена ★'))
              : (tag('span', '', 'Полировка и бронеплёнка (' + polishLvl + '/3) · +15% к цене') + tag('b', '', money(polishCost)))) +
          tag('div', 'class="section" style="margin-top:16px"', 'Спецрамки на выбранный номер') +
          tag('div', 'class="frames-grid-2x2"',
            FRAMES.slice(1).map((fr) => {
              const installed = targetP.frame === fr.id;
              const canBuy = S.cash >= fr.price;
              return tag('button', 'class="btn frame-card-btn ' + (installed ? 'got' : '') + '" data-a="buy_frame" data-v="' + fr.id + '"',
                tag('div', 'style="display:flex;justify-content:space-between;width:100%;align-items:center"',
                  tag('b', 'style="font-size:12px;color:#f8fafc"', fr.name) +
                  tag('span', 'style="font-size:10.5px;font-weight:800;color:#38bdf8"', '×' + fr.mult)) +
                tag('span', 'style="font-size:11px;font-weight:700;color:' + (installed ? '#4ade80' : (canBuy ? '#fbbf24' : 'rgba(255,255,255,0.45)')) + '"',
                  installed ? 'Установлено ✓' : money(fr.price)));
            }).join('')))
        : tag('button', 'class="btn primary" style="width:100%" data-a="tab" data-v="roll"', 'Получить первый номер в Окне выдачи')));

    const orderSection = tag('section', 'class="panel"',
      tag('div', 'style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"',
        tag('div', 'class="section" style="margin:0"', 'Спецзаказ по закрытой базе') +
        tag('span', 'style="font-size:10.5px;font-weight:800;color:#fbbf24"', 'БЛАТ-РЕЗЕРВ')) +
      tag('p', 'class="sub" style="margin:0 0 10px"', 'Инспектор подберёт из архива номер с красивыми цифрами или столичным регионом.') +
      tag('div', 'style="display:grid;grid-template-columns:1fr 1fr;gap:8px"',
        tag('button', 'class="btn reroll-btn' + (S.cash < 85000 ? ' cant-afford' : '') + '" data-a="order_digits"',
          tag('span', '', 'Три цифры (777/001)') + tag('b', '', '85 000 ₽')) +
        tag('button', 'class="btn reroll-btn' + (S.cash < 140000 ? ' cant-afford' : '') + '" data-a="order_spec"',
          tag('span', '', 'Спецсерия архива ★') + tag('b', '', '140 000 ₽'))));

    const slotsHtml = tag('div', 'style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:8px 0 10px"',
      new Array(0, 1, 2).map((idx) => {
        const pid = fuseSel.at(idx);
        const pl = S.plates.find((x) => x.id === pid);
        return tag('div', 'class="fuse-slot-box' + (pl ? ' filled' : '') + '"',
          pl ? (pl.f + pl.d + pl.t + ' ' + pl.reg) : '+ Слот ' + (idx + 1));
      }).join(''));

    const fuseList = S.plates.length >= 3
      ? tag('div', 'class="chips" style="margin-bottom:10px"',
          S.plates.map((p) => {
            const on = fuseSel.includes(p.id);
            return tag('button', 'class="chip ' + (on ? 'got' : '') + '" data-a="fuse_pick" data-v="' + p.id + '"',
              p.f + p.d + p.t + ' ' + p.reg);
          }).join(''))
      : '';

    return tag('section', 'class="hero"',
      tag('div', 'class="hero-kicker"', tag('span', 'class="dot-live"', '') + 'ЗАКРЫТАЯ МАСТЕРСКАЯ · СПЕЦЦЕХ') +
      tag('h2', '', 'Подпольный бокс') +
      tag('p', 'class="sub" style="margin:0"', 'Перебивка серий, полировка ГОСТ, спецрамки, заказ из архива и переплавка.')) +
      workbenchSection +
      orderSection +
      tag('section', 'class="panel"',
        tag('div', 'class="section"', 'Переплавка 3 в 1') +
        tag('p', 'class="sub" style="margin:0 0 8px"', 'Сплавьте 3 ненужных номера и получите 1 редкий или эпический знак.') +
        slotsHtml + fuseList +
        tag('button', 'class="btn primary" style="width:100%"' + (S.plates.length < 3 ? ' disabled' : '') + ' data-a="fuse3"',
          S.plates.length < 3 ? 'Нужно минимум 3 номера в гараже' : (fuseSel.length === 3 ? 'Сплавить выбранные 3 номера ★' : 'Авто-переплавка 3 младших → 1 редкий'))) +
      tag('section', 'class="panel"',
        tag('div', 'style="display:flex;justify-content:space-between;align-items:center"',
          tag('div', 'class="section" style="margin:0"', 'Связи в МРЭО · Ур. ' + lvl + '/10') +
          tag('span', 'style="font-size:11px;font-weight:800;color:#38bdf8"', 'Шанс удачи +' + luckPct + '%')) +
        tag('div', 'class="link-bar-track"', tag('div', 'class="link-bar-fill" style="width:' + (lvl * 10) + '%"', '')) +
        tag('p', 'class="sub" style="margin:0 0 12px"', 'Повышает вероятность выпадения красивых комбинаций и спецсерий в Окне выдачи.') +
        tag('button', 'class="btn primary' + (lvl < 10 && S.cash < linkCost ? ' cant-afford' : '') + '" style="width:100%"' + (lvl >= 10 ? ' disabled' : '') + ' data-a="up_link"',
          lvl >= 10 ? 'Максимальный уровень связей' : 'Укрепить связи · ' + money(linkCost)));
  }

  function renderMarket() {
    const sellers = ['@alex_777', '@dmitry_msk', '@vovan_spb', '@ruslan_95', '@sergey_vip', '@fso_garage', '@major_77'];
    if (!S.market || S.market.length < 5) {
      S.market = [make(true), make(true), makeByTier('epic'), makeByTier('epic'), makeByTier('rare'), makeByTier('rare')].map((lot, i) => {
        lot.seller = sellers.at(i % sellers.length);
        return lot;
      });
      save();
    }
    if (!S.myListings) S.myListings = [];

    const tabsBar = tag('div', 'class="chips" style="margin-bottom:10px"',
      tag('button', 'class="chip ' + (mktTab === 'buy' ? 'got' : '') + '" style="flex:1" data-a="mkt_tab" data-v="buy"', 'Биржа номеров (' + S.market.length + ')') +
      tag('button', 'class="chip ' + (mktTab === 'sell' ? 'got' : '') + '" style="flex:1" data-a="mkt_tab" data-v="sell"', 'Выставить свой (' + S.myListings.length + ')'));

    if (mktTab === 'sell') {
      const myActiveHtml = S.myListings.length > 0
        ? tag('div', 'class="section" style="margin-top:10px"', 'Ваши активные лоты на бирже') +
          S.myListings.map((item, i) =>
            tag('div', 'class="garage-item" style="margin-top:8px"',
              tag('div', 'style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:6px"',
                tag('span', 'class="muted"', 'В продаже · Ожидает покупателя') +
                tag('span', 'class="val"', money(item.ask))) +
              tag('div', 'style="max-width:215px;margin:0 auto 8px"', plate(item.plate)) +
              tag('div', 'style="display:flex;gap:6px"',
                tag('button', 'class="btn small primary" style="flex:1" data-a="mkt_instant_sell" data-v="' + i + '"', 'Продать перекупу · ' + money(Math.round(item.ask * 0.88))) +
                tag('button', 'class="btn small ghost" data-a="mkt_cancel" data-v="' + i + '"', 'Снять')))).join('')
        : '';

      const availablePlates = S.plates.filter((p) => p.id !== S.carPlateId);
      const listHtml = availablePlates.length === 0
        ? tag('div', 'class="empty"', 'Нет свободных номеров для продажи (снимите номер с авто в Гараже или выбейте новый).')
        : availablePlates.map((p) => {
            const ask = Math.round(p.val * 1.25);
            return tag('div', 'class="garage-item" style="margin-top:8px;display:flex;align-items:center;justify-content:space-between;gap:8px;text-align:left"',
              tag('div', 'style="width:140px;flex-shrink:0"', plate(p)) +
              tag('div', 'style="flex:1;min-width:0"',
                tag('div', 'style="font-size:12px;font-weight:800"', money(ask)) +
                tag('div', 'class="muted" style="font-size:10.5px"', '+25% к госоценке')) +
              tag('button', 'class="btn small primary" data-a="mkt_list" data-v="' + p.id + '"', 'Выставить'));
          }).join('');

      return tag('section', 'class="hero"',
        tag('h2', '', 'Биржа номеров РФ') +
        tag('p', 'class="sub"', 'Выставляйте свои номера коллекционерам дороже госоценки.') +
        tabsBar) +
        tag('section', 'class="panel"', myActiveHtml + tag('div', 'class="section"', 'Ваши номера для выставления') + listHtml);
    }

    const filterBar = tag('div', 'class="chips" style="margin-bottom:8px"',
      [['all','Все'],['legendary','Спецсерии ★'],['epic','Эпические'],['rare','Редкие']].map((f) =>
        tag('button', 'class="chip ' + (mktFilter === f.at(0) ? 'got' : '') + '" data-a="mkt_flt" data-v="' + f.at(0) + '"', f.at(1))).join(''));

    const filtered = S.market.filter((lot) => mktFilter === 'all' || lot.rar === mktFilter);
    const lotsHtml = filtered.length === 0
      ? tag('div', 'class="empty"', 'По выбранному фильтру лотов нет. Нажмите «Обновить биржу».')
      : filtered.map((lot) => {
          const realIdx = S.market.indexOf(lot);
          const ser = seriesInfo(lot);
          const askPrice = Math.round(lot.val * 1.15);
          return tag('div', 'class="garage-item" style="margin-top:10px;text-align:left"',
            tag('div', 'style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"',
              tag('span', 'class="rarity ' + (RAR[lot.rar]?.cls || '') + '" style="margin:0"', (RAR[lot.rar]?.name || '') + (ser ? ' · ' + ser.k : '')) +
              tag('span', 'class="muted" style="font-size:11px"', 'Продавец: ' + (lot.seller || '@alex_777'))) +
            tag('div', 'style="max-width:225px;margin:0 auto 8px"', plate(lot)) +
            (ser ? tag('div', 'class="muted" style="font-size:11px;margin-bottom:8px"', ser.info) : '') +
            tag('button', 'class="btn primary" style="width:100%" data-a="buy_lot" data-v="' + realIdx + '"', 'Выкупить с биржи · ' + money(askPrice)));
        }).join('');

    return tag('section', 'class="hero"',
      tag('h2', '', 'Биржа номеров РФ') +
      tag('p', 'class="sub"', 'Прямые торги между коллекционерами и перекупами.') +
      tabsBar +
      tag('button', 'class="btn ghost" style="width:100%" data-a="refresh_mkt"', 'Обновить лоты биржи · 15 000 ₽')) +
      tag('section', 'class="panel"', filterBar + lotsHtml);
  }

  function renderWheel() {
    const prizes = ['40 000 ₽', '2 талона', '250 000 ₽', '5 ◈', 'Спецсерия ★', '120 000 ₽'];
    const segAngles = new Array(30, 90, 150, 210, 270, 330);
    const pity = (S.wheelPity || 0) % 5;
    const isGuarantee = pity === 4;
    const hist = S.wheelHist || [];
    const cooldownMs = 4 * 3600 * 1000;
    const leftMs = Math.max(0, (S.nextFreeWheel || 0) - Date.now());
    const freeReady = leftMs === 0;

    const labelsHtml = prizes.map((pr, idx) => {
      const ang = segAngles.at(idx);
      const col = idx === 4 ? '#fde047' : (idx === 2 ? '#4ade80' : '#f8fafc');
      return '<div class="wheel-seg-lbl" style="color:' + col + ';transform:rotate(' + ang + 'deg) translateY(-74px) rotate(-' + ang + 'deg)">' + pr + '</div>';
    }).join('');

    const histBlock = hist.length > 0
      ? tag('div', 'class="panel"',
          tag('div', 'class="section"', 'Последние выигрыши в колесе') +
          tag('div', 'style="display:flex;flex-wrap:wrap;gap:6px"',
            hist.map((h) => tag('span', 'class="wheel-hist-pill"', h)).join('')))
      : '';

    return tag('section', 'class="hero" style="text-align:center"',
      tag('div', 'class="hero-kicker"', tag('span', 'class="dot-live"', '') + 'СПЕЦФОНД МРЭО · ГАРАНТ ' + (pity + 1) + '/5') +
      tag('h2', '', 'Колесо фортуны МРЭО') +
      tag('p', 'class="sub" style="margin:0 0 8px"', isGuarantee
        ? '🔥 СЛЕДУЮЩИЙ СПИН — ГАРАНТИРОВАННЫЙ СУПЕРПРИЗ (250 000 ₽ или Спецсерия ★)!'
        : 'Бесплатный запуск каждые 4 часа или без ожидания за 100 000 ₽.') +
      
      tag('div', 'class="wheel-wrap"',
        tag('div', 'style="position:absolute;top:-11px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:11px solid transparent;border-right:11px solid transparent;border-top:18px solid #fbbf24;filter:drop-shadow(0 0 10px rgba(251,191,36,.95));z-index:6"', '') +
        tag('div', 'class="wheel-disk" style="transform:rotate(' + wheelDeg + 'deg)"', labelsHtml) +
        tag('div', 'class="wheel-hub"', 'МРЭО')) +
      tag('div', 'class="wheel-btns-2"',
        tag('button', 'class="btn wheel-free-btn' + (freeReady ? '' : ' locked') + '"' + (wheelSpin ? ' disabled' : '') + ' data-a="spin_wheel_free"',
          freeReady
            ? (tag('b', 'style="font-size:13px"', 'Бесплатно') + tag('span', 'style="font-size:9.5px;opacity:0.85"', 'Доступно сейчас'))
            : (tag('span', 'style="font-size:9px;opacity:0.75"', 'ДОСТУПНО В ' + new Date(S.nextFreeWheel).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })) + tag('b', 'id="wheel-timer" style="font-size:12.5px;color:#38bdf8"', fmtCountdown(leftMs)))) +
        tag('button', 'class="btn primary wheel-paid-btn' + (S.cash < 100000 ? ' cant-afford' : '') + '"' + (wheelSpin ? ' disabled' : '') + ' data-a="spin_wheel"',
          tag('span', 'style="font-size:9.5px;opacity:0.8"', 'БЕЗ ОЖИДАНИЯ') + tag('b', 'style="font-size:13px"', '100 000 ₽'))) +
      tag('div', 'style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:12px"',
        prizes.map((pr) => tag('div', 'class="garage-item" style="padding:7px 4px;font-size:11px;font-weight:700"', pr)).join(''))) +
      histBlock;
  }

    function syncCustomBet() {
    const inp = $('#custom-bet-inp');
    if (inp) {
      const raw = Math.floor(Number(inp.value) || 0);
      if (raw > 0) gBet = raw;
    }
    if (gBet < 10000) {
      gBet = 10000;
      if (inp) inp.value = 10000;
      toast('Минимальная ставка — 10 000 ₽', true);
      return false;
    }
    return true;
  }

  function renderGames() {
    const betRow = tag('div', 'class="chips" style="margin-bottom:8px"',
      new Array(10000, 25000, 50000, 150000).map((b) =>
        tag('button', 'class="chip ' + (gBet === b ? 'got' : '') + (S.cash < b ? ' cant-afford' : '') + '" style="flex:1" data-a="g_bet" data-v="' + b + '"', (b / 1000) + 'к')).join('')) +
      tag('div', 'class="custom-bet-bar"',
        tag('span', '', 'Своя ставка, ₽') +
        '<input id="custom-bet-inp" class="custom-bet-input" type="number" min="10000" step="1000" inputmode="numeric" value="' + gBet + '" />' +
        tag('button', 'class="custom-bet-max" data-a="g_bet_max"', 'MAX'));

    let gameBody = '';
    if (gMode === 'coin') {
      const hist = S.coinHist || [];
      const stageCls = coinSpin ? '' : (lastCoin ? (lastCoin.win ? ' win-glow' : ' lose-glow') : '');
      const badgeTitle = coinSpin ? 'В ПОЛЁТЕ' : (lastCoin ? (lastCoin.side === 'orel' ? 'ОРЁЛ' : 'РЕШКА') : 'ЖЕТОН');
      const badgeSub = coinSpin ? 'ДПС РФ' : (lastCoin ? (lastCoin.side === 'orel' ? 'ГЕРБ РФ' : 'МИГАЛКА') : 'МВД РФ');
      const histBar = hist.length > 0
        ? tag('div', 'style="display:flex;align-items:center;justify-content:center;gap:5px;margin-top:10px"',
            tag('span', 'class="muted" style="font-size:10px;margin-right:3px"', 'Серия:') +
            hist.map((h) => tag('span', 'class="coin-hist-dot ' + h + '"', h === 'o' ? 'О' : 'Р')).join(''))
        : '';

      gameBody = tag('div', 'class="dps-stage' + stageCls + '"',
        tag('div', 'class="dps-header-bar"',
          tag('div', 'style="display:flex;align-items:center;gap:9px;text-align:left"',
            tag('div', 'class="dps-badge-icon"',
              '<svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.9"><path d="M12 3l7 4v5c0 4.5-3 8-7 9-4-1-7-4.5-7-9V7l7-4z"/><circle cx="12" cy="11" r="2"/></svg>') +
            tag('div', '',
              tag('div', 'style="font-size:11.5px;font-weight:800;color:#7dd3fc;letter-spacing:0.03em"', 'ИНСПЕКТОР ДПС НА ПОСТУ') +
              tag('div', 'class="muted" style="font-size:10.5px"', coinSpin ? 'Подбрасывает нагрудный жетон вверх...' : 'Ждёт вашего выбора стороны'))) +
          tag('span', 'style="font-size:11px;font-weight:800;color:#fbbf24"', '×1.95')) +
        tag('div', 'class="coin-arena"',
          tag('div', 'class="coin-shadow' + (coinSpin ? ' air' : '') + '"', '') +
          tag('div', 'class="coin-medallion' + (coinSpin ? ' tossing' : '') + '"',
            tag('div', 'style="font-size:13.5px;line-height:1.1;letter-spacing:0.02em"', badgeTitle) +
            tag('div', 'style="font-size:8.5px;opacity:0.82;margin-top:2px;font-weight:800"', badgeSub))) +
        tag('div', 'style="font-size:12px;font-weight:600;color:' + (coinSpin ? '#7dd3fc' : (lastCoin ? (lastCoin.win ? '#4ade80' : '#fca5a5') : 'rgba(255,255,255,0.68)')) + ';text-align:center"',
          coinSpin ? 'Жетон вращается в воздухе...' : (lastCoin ? lastCoin.msg : 'Выберите сторону: инспектор подбросит жетон вверх')) +
        histBar) +
        tag('div', 'style="display:grid;grid-template-columns:1fr 1fr;gap:8px"',
          tag('button', 'class="btn primary' + (S.cash < gBet ? ' cant-afford' : '') + '" style="height:48px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px"' + (coinSpin ? ' disabled' : '') + ' data-a="coin_flip" data-v="orel"',
            tag('b', 'style="font-size:13px"', 'Орёл · Герб') + tag('span', 'style="font-size:9.5px;opacity:0.8"', 'Выигрыш ' + money(Math.round(gBet * 1.95)))) +
          tag('button', 'class="btn ghost' + (S.cash < gBet ? ' cant-afford' : '') + '" style="height:48px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px"' + (coinSpin ? ' disabled' : '') + ' data-a="coin_flip" data-v="reshka"',
            tag('b', 'style="font-size:13px;color:#f8fafc"', 'Решка · Мигалка') + tag('span', 'style="font-size:9.5px;opacity:0.65"', 'Выигрыш ' + money(Math.round(gBet * 1.95)))));
    } else if (gMode === 'raid') {
      if (!raid) {
        gameBody = tag('div', 'class="dps-stage" style="text-align:center"',
          tag('div', 'style="font-size:12px;font-weight:800;color:#38bdf8;margin-bottom:6px"', 'ОПЕРАТИВНЫЙ ПЛАНШЕТ ПОСТОВ 4×4') +
          tag('p', 'class="sub" style="margin:0 0 12px"', '12 чистых маршрутов и 4 скрытых поста ДПС. Каждый пройденный сектор повышает множитель на +0.35×.')) +
          tag('button', 'class="btn primary' + (S.cash < gBet ? ' cant-afford' : '') + '" style="width:100%;height:48px" data-a="raid_start"', 'Начать рейд · ' + money(gBet));
      } else {
        const mult = (1 + raid.opened * 0.35).toFixed(2);
        const cells = raid.grid.map((cell, i) => {
          const shown = raid.rev.at(i) || raid.over;
const cls = !shown ? 'btn ghost raid-tile' : (cell === 'cop' ? 'btn raid-tile cop' : 'btn raid-tile safe');
const txt = !shown ? '•' : (cell === 'cop' ? 'ДПС' : '✓');
return tag('button', 'class="' + cls + '"' + (shown || raid.over ? ' disabled' : '') + ' data-a="raid_cell" data-v="' + i + '"', txt);
}).join('');
gameBody = tag('div', 'class="dps-stage"',
tag('div', 'style="display:flex;justify-content:space-between;font-size:11px;font-weight:800;margin-bottom:10px"',
tag('span', 'style="color:#4ade80"', 'Пройдено секторов: ' + raid.opened + '/12') +
tag('span', 'style="color:#fbbf24"', 'Множитель ×' + mult)) +
tag('div', 'style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px"', cells)) +
(raid.over
? tag('button', 'class="btn primary" style="width:100%;height:48px" data-a="raid_start"', 'Новый рейд · ' + money(gBet))
: tag('button', 'class="btn primary" style="width:100%;height:48px"' + (raid.opened === 0 ? ' disabled' : '') + ' data-a="raid_cash"', 'Забрать ' + money(Math.round(gBet * Number(mult))) + ' (×' + mult + ')'));
}
} else if (gMode === 'safe') {
      const multMap = { 4: 3.6, 6: 5.4, 8: 7.2 };
      const mult = multMap[safeCells] || 3.6;
      const cols = safeCells === 4 ? 4 : (safeCells === 6 ? 3 : 4);
      const modeTabs = tag('div', 'class="chips" style="margin-bottom:10px;justify-content:center"',
        [[4, '4 ячейки · ×3.6'], [6, '6 ячеек · ×5.4'], [8, '8 ячеек · ×7.2']].map((m) =>
          tag('button', 'class="chip ' + (safeCells === m.at(0) ? 'got' : '') + '"' + (safeState && safeState.cracking ? ' disabled' : '') + ' data-a="safe_mode" data-v="' + m.at(0) + '"', m.at(1))).join(''));

      const cellsHtml = Array.from({ length: safeCells }, (_, i) => i + 1).map((num) => {
        let cls = 'btn safe-vault-btn' + (S.cash < gBet && !safeState ? ' cant-afford' : '');
        let topTxt = 'КОД';
        let botTxt = '#' + num;
        if (safeState) {
          if (safeState.cracking && safeState.picked === num) {
            cls += ' cracking'; topTxt = 'ВЗЛОМ'; botTxt = '•••';
          } else if (!safeState.cracking) {
            if (num === safeState.picked && safeState.win) { cls += ' win-open'; topTxt = 'КУШ'; botTxt = '✓'; }
            else if (num === safeState.picked && !safeState.win) { cls += ' lose-open'; topTxt = 'ПУСТО'; botTxt = '✕'; }
            else if (num === safeState.secret) { cls += ' hint-win'; topTxt = 'ТУТ'; botTxt = '★'; }
          }
        }
        return tag('button', 'class="' + cls + '"' + (safeState && safeState.cracking ? ' disabled' : '') + ' data-a="safe_pick" data-v="' + num + '"',
          tag('span', 'style="font-size:9px;opacity:0.7;letter-spacing:0.05em"', topTxt) +
          tag('b', 'style="font-size:16.5px;font-weight:900"', botTxt));
      }).join('');

      const stageCls = safeState && !safeState.cracking ? (safeState.win ? ' win-glow' : ' lose-glow') : '';
      const statusHtml = safeState
        ? (safeState.cracking
            ? tag('div', 'style="margin-top:12px;font-size:12px;font-weight:700;color:#7dd3fc"', 'Подбор шифра к ячейке #' + safeState.picked + '...')
            : tag('div', 'style="margin-top:12px;font-size:12.5px;font-weight:800;color:' + (safeState.win ? '#4ade80' : '#fca5a5') + '"', safeState.msg))
        : (safeCode ? tag('div', 'style="margin-top:12px;font-size:12px;font-weight:700;color:#fde047"', safeCode) : '');

      gameBody = tag('div', 'class="dps-stage' + stageCls + '" style="text-align:center"',
        tag('div', 'style="font-size:11.5px;font-weight:800;color:#fbbf24;letter-spacing:0.05em;margin-bottom:4px"', 'СЕЙФ НАЧАЛЬНИКА ОТДЕЛА · ×' + mult.toFixed(1)) +
        tag('p', 'class="sub" style="margin:0 0 10px"', 'Вскройте 1 из ' + safeCells + ' ячеек и заберите ' + money(Math.round(gBet * mult))) +
        modeTabs +
        tag('div', 'style="display:grid;grid-template-columns:repeat(' + cols + ',1fr);gap:8px"', cellsHtml) +
        statusHtml);
    } else {
      const m = crash ? crash.mult.toFixed(2) : '1.00';
      const busted = crash && crash.busted;
      const cashed = crash && crash.cashed;
      const running = crash && !busted && !cashed;
      const pct = crash ? Math.min(100, Math.round((crash.mult - 1) * 28)) : 0;
      const carLeft = crash ? Math.min(76, 8 + Math.round((crash.mult - 1) * 22)) : 8;
      const resultBanner = cashed
        ? tag('div', 'style="margin-top:10px;padding:10px 12px;border-radius:14px;background:rgba(74,222,128,0.14);border:1px solid rgba(74,222,128,0.45);color:#4ade80;font-weight:800;font-size:13px"',
            'УСПЕШНЫЙ ОТРЫВ НА ×' + crash.mult.toFixed(2) + ' · +' + money(crash.wonAmt))
        : (busted
            ? tag('div', 'style="margin-top:10px;padding:10px 12px;border-radius:14px;background:rgba(239,68,68,0.14);border:1px solid rgba(239,68,68,0.45);color:#fca5a5;font-weight:800;font-size:12.5px"',
                'ФИКСАЦИЯ КАМЕРОЙ ГИБДД НА ×' + crash.bustAt.toFixed(2))
            : tag('div', 'class="muted" style="font-size:11.5px"', running ? 'Скорость растёт — успейте нажать «Забрать»!' : 'Нажмите старт и успейте забрать выигрыш до радара'));

      gameBody = tag('div', 'class="dps-stage' + (busted ? ' lose-glow' : (cashed || running ? ' win-glow' : '')) + '" style="text-align:center"',
        tag('div', 'style="font-size:10.5px;font-weight:800;letter-spacing:0.08em;color:' + (busted ? '#f87171' : '#38bdf8') + '"', busted ? 'КАМЕРА ГИБДД · ШТРАФ' : 'СКОРОСТНОЙ РЕЖИМ · РАДАР') +
        tag('div', 'id="crash-mult" style="font-size:40px;font-weight:900;letter-spacing:-0.02em;margin:4px 0;font-variant-numeric:tabular-nums;color:' + (busted ? '#ef4444' : '#4ade80') + '"', '×' + m) +
        tag('div', 'class="radar-road"',
          tag('div', 'class="radar-dashes' + (running ? ' running' : '') + '"', '') +
          tag('div', 'id="crash-car" class="radar-car-wrap" style="left:' + carLeft + '%"',
            (running ? tag('div', 'class="radar-tail-glow"', '') : '') +
            '<svg viewBox="0 0 48 22" style="width:44px;height:20px;display:block"><rect x="4" y="8" width="40" height="9" rx="4" fill="' + (busted ? '#ef4444' : '#f8fafc') + '"/><path d="M12 8 L17 3 L31 3 L36 8 Z" fill="#38bdf8"/><circle cx="13" cy="17" r="3.5" fill="#090d16" stroke="#94a3b8" stroke-width="1.2"/><circle cx="35" cy="17" r="3.5" fill="#090d16" stroke="#94a3b8" stroke-width="1.2"/></svg>')) +
        tag('div', 'class="link-bar-track" style="margin:6px 0 8px"',
          tag('div', 'id="crash-bar" class="link-bar-fill" style="width:' + pct + '%;transition:width 0.14s linear;background:' + (busted ? '#ef4444' : 'linear-gradient(90deg,#38bdf8,#4ade80)') + '"', '')) +
        resultBanner) +
        (!running
          ? tag('button', 'class="btn primary' + (S.cash < gBet ? ' cant-afford' : '') + '" style="width:100%;height:48px" data-a="crash_start"', 'Старт разгона · ' + money(gBet))
          : tag('button', 'class="btn primary" style="width:100%;height:48px" data-a="crash_cash"', 'Забрать · <span id="crash-cash-val">' + money(Math.round(gBet * crash.mult)) + '</span>'));
    }

    return tag('section', 'class="hero"',
tag('div', 'class="hero-kicker"', tag('span', 'class="dot-live"', '') + 'ЗАКРЫТЫЙ КЛУБ · СТАВКИ МРЭО') +
tag('h2', '', 'Мини-игры МРЭО') +
tag('div', 'class="chips" style="margin-bottom:10px"',
tag('button', 'class="chip ' + (gMode === 'coin' ? 'got' : '') + '" data-a="g_mode" data-v="coin"', 'Орёл/Решка') +
tag('button', 'class="chip ' + (gMode === 'raid' ? 'got' : '') + '" data-a="g_mode" data-v="raid"', 'Рейд ДПС') +
tag('button', 'class="chip ' + (gMode === 'crash' ? 'got' : '') + '" data-a="g_mode" data-v="crash"', 'Радар') +
tag('button', 'class="chip ' + (gMode === 'safe' ? 'got' : '') + '" data-a="g_mode" data-v="safe"', 'Сейф ×3.6')) +
betRow + gameBody);
}
  window.__MREO_ONLINE_PLAYERS = window.__MREO_ONLINE_PLAYERS || [];
  function getRealOnlineLeaderboard() {
    const tgUser = window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user;
    const myHandle = tgUser
      ? (tgUser.username ? '@' + tgUser.username : (tgUser.first_name || 'Игрок МРЭО'))
      : (S.nick || 'Гражданин');
    const allPlates = [...(S.plates || []), ...(S.equipped ? Object.values(S.equipped) : [])].filter(Boolean);
    const bestPl = allPlates.sort((a, b) => (b.val || 0) - (a.val || 0)).at(0);
    const topSign = bestPl ? (bestPl.f + ' ' + bestPl.d + ' ' + bestPl.t + ' ' + bestPl.reg) : 'Нет номеров';
    const totalCapital = (S.cash || 0) + allPlates.reduce((acc, p) => acc + (p.val || 0), 0);

    const me = {
      id: tgUser ? String(tgUser.id) : 'local_me',
      name: myHandle + ' (Вы)',
      top: topSign,
      val: totalCapital,
      n: myHandle, u: myHandle, name: myHandle, p: topSign, s: topSign, sign: topSign, top: topSign, v: totalCapital, c: totalCapital, b: topSign, best: topSign, plate: topSign, sign: topSign, top: topSign, p: topSign, s: topSign, pl: topSign, str: topSign, txt: topSign, val: totalCapital, isMe: true
    };

    const others = (window.__MREO_ONLINE_PLAYERS || []).filter((p) => p && p.id !== me.id);
    const merged = [me, ...others].sort((a, b) => (b.val || 0) - (a.val || 0));
    return merged;
  }

  function renderProfile() {
  const lvl = levelInfo();
  const premLeft = Math.max(0, ((S.lastDaily || 0) + 43200000) - Date.now());
  const premBtnHtml = premLeft === 0
    ? tag('button', 'class="btn small primary" data-a="daily_bonus"', 'Забрать бонус')
    : tag('button', 'class="btn small ghost" style="opacity:0.65;font-size:11px" data-a="daily_bonus"', 'Через ' + fmtCountdown(premLeft));

const cfg = S.cfg || { light: false, sound: true, vibro: true, ultra: true, turbo: false, anon: false };
const topList = getRealOnlineLeaderboard();

function setRow(key, title, desc, val) {
return tag('div', 'class="ios-set-row"',
tag('div', 'style="text-align:left"',
tag('div', 'style="font-size:13.5px;font-weight:700"', title) +
tag('div', 'class="muted" style="font-size:11.5px"', desc)) +
tag('button', 'class="ios-switch ' + (val ? 'on' : '') + '" data-a="toggle_cfg" data-v="' + key + '" aria-label="' + title + '"', ''));
}
const hero = tag('section', 'class="hero"',
tag('div', 'style="display:flex;justify-content:space-between;align-items:center"',
tag('div', '',
tag('h2', 'style="margin:0 0 2px"', (cfg.anon ? 'Инкогнито МРЭО' : me.name)) +
tag('p', 'class="sub" style="margin:0"', 'Уровень ' + lvl.lvl + ' · ' + lvl.title)) +
tag('button', 'class="btn primary" style="padding:9px 14px;font-size:12px" data-a="daily_bonus"', premLeft === 0 ? 'Премия +25 000 ₽' : ('Через ' + fmtCountdown(premLeft)))) +
tag('div', 'style="height:8px;border-radius:99px;background:rgba(255,255,255,.12);overflow:hidden;margin:12px 0 10px"',
tag('div', 'style="height:100%;width:' + lvl.pct + '%;background:linear-gradient(90deg,#fbbf24,#f59e0b)"', '')) +
tag('div', 'style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;text-align:center"',
tag('div', 'style="padding:8px;border-radius:14px;background:rgba(255,255,255,.05)"', tag('div', 'class="muted" style="font-size:10.5px"', 'Выбито') + tag('div', 'style="font-weight:800;font-size:14px"', String(S.stats?.rolled || 0))) +
tag('div', 'style="padding:8px;border-radius:14px;background:rgba(255,255,255,.05)"', tag('div', 'class="muted" style="font-size:10.5px"', 'Номеров') + tag('div', 'style="font-weight:800;font-size:14px"', String(S.plates.length))) +
tag('div', 'style="padding:8px;border-radius:14px;background:rgba(255,255,255,.05)"', tag('div', 'class="muted" style="font-size:10.5px"', 'Автопарк') + tag('div', 'style="font-weight:800;font-size:14px"', S.cars.length + ' авто'))));
const topCard = tag('section', 'class="panel" style="margin-top:12px"',
tag('div', 'class="section"', 'Рейтинг коллекционеров РФ') +
topList.map((u, idx) =>
tag('div', 'style="display:flex;justify-content:space-between;align-items:center;padding:8px 4px;border-bottom:1px solid rgba(255,255,255,.06)"',
tag('div', '', tag('b', 'style="font-size:13px"', (idx + 1) + '. ' + u.n) + tag('div', 'class="muted" style="font-size:11px"', 'Топ знак: ' + (u.r || (typeof getRealOnlineLeaderboard === 'function' && getRealOnlineLeaderboard()[0] ? getRealOnlineLeaderboard()[0].top : 'Нет номеров')))) +
tag('span', 'class="val" style="font-weight:800;font-size:13px"', money(u.v)))).join(''));
const settingsCard = tag('section', 'class="panel" style="margin-top:12px"',
tag('div', 'class="section"', 'Настройки iOS 27') +
setRow('light', 'Светлая тема (Белое стекло)', 'Переключение между тёмным и светлым Liquid Glass', cfg.light) +
setRow('sound', 'Звуковые эффекты (SFX)', 'Щелчки барабана, вскрытие кейсов и фанфары', cfg.sound !== false) +
setRow('vibro', 'Виброотклик (Taptic Engine)', 'Тактильная отдача при нажатиях и выигрышах', cfg.vibro !== false) +
setRow('ultra', 'Графика Ultra 8K Glass', 'Выключите для экономии заряда на слабых телефонах', cfg.ultra !== false) +
setRow('turbo', 'Турбо-анимации (×2)', 'Ускоренная прокрутка рулетки и кейсов', Boolean(cfg.turbo)) +
setRow('anon', 'Инкогнито в топе и ленте', 'Скрыть ваш никнейм под именем Инкогнито МРЭО', Boolean(cfg.anon)));
    const ownedSeriesSet = new Set(S.plates.map((pl) => pl.ser).filter(Boolean));
    const archiveCard = tag('section', 'class="panel"',
      tag('div', 'style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"',
        tag('div', 'class="section" style="margin:0"', 'Архив спецсерий РФ (' + ownedSeriesSet.size + '/' + SERIES.length + ')') +
        tag('button', 'class="btn small primary" data-a="open_archive"', 'Открыть досье')) +
      tag('p', 'class="sub" style="margin:0 0 8px"', 'Реальная история ведомственных и правительственных номеров России.') +
      tag('div', 'class="chips"',
        SERIES.slice(0, 8).map((sr) => {
          const has = ownedSeriesSet.has(sr.k);
          return tag('button', 'class="chip ' + (has ? 'got' : '') + '" data-a="ser_info" data-v="' + sr.k + '"',
            sr.k + (sr.reg ? ' ' + sr.reg.at(0) : '') + (has ? ' ★' : ''));
        }).join('')));

        if (!S.claimedQ) S.claimedQ = {};
    if (S.claimedQ.q_roll5) S.claimedQ.s1_roll = true;
    if (S.claimedQ.q_mount) S.claimedQ.s1_mount = true;
    if (S.claimedQ.q_rare) S.claimedQ.s1_rare = true;

    const qStage = S.qStage || 1;
    const bestValNow = S.plates.reduce((m, pl) => Math.max(m, pl.val || 0), 0);
    const rolledNow = S.stats?.rolled || 0;
    const carsNow = S.cars ? S.cars.length : 1;

    const stageQuests = qStage === 1 ? [
      { id: 's1_roll', ico: '<svg viewBox="0 0 24 24" style="width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:1.85;stroke-linecap:round;stroke-linejoin:round"><path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1.5a1.5 1.5 0 0 0 0 3V15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1.5a1.5 1.5 0 0 0 0-3V9z"/><line x1="15" y1="7" x2="15" y2="17" stroke-dasharray="2 2"/></svg>', title: 'Смена в Окне выдачи', sub: 'Выбить 5 госномеров', cur: Math.min(5, rolledNow), max: 5, rewardTxt: '+20 000 ₽ · +1 талон' },
      { id: 's1_mount', ico: '<svg viewBox="0 0 24 24" style="width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:1.85;stroke-linecap:round;stroke-linejoin:round"><path d="M5 11l2-5h10l2 5"/><rect x="3" y="11" width="18" height="6" rx="2"/><circle cx="7" cy="17" r="1.5"/><circle cx="17" cy="17" r="1.5"/></svg>', title: 'Постановка на учёт', sub: 'Установить номер на авто', cur: S.carPlateId ? 1 : 0, max: 1, rewardTxt: '+15 000 ₽ · +3 ◈' },
      { id: 's1_rare', ico: '<svg viewBox="0 0 24 24" style="width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:1.85;stroke-linecap:round;stroke-linejoin:round"><polygon points="6 4 18 4 22 9 12 20 2 9 6 4"/><line x1="2" y1="9" x2="22" y2="9"/><polyline points="12 20 8 9 12 4 16 9 12 20"/></svg>', title: 'Редкий экземпляр', sub: 'Номер дороже 100 000 ₽', cur: bestValNow >= 100000 ? 1 : 0, max: 1, rewardTxt: '+35 000 ₽ · +100 XP' }
    ] : [
      { id: 's' + qStage + '_roll', ico: '<svg viewBox="0 0 24 24" style="width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:1.85;stroke-linecap:round;stroke-linejoin:round"><path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1.5a1.5 1.5 0 0 0 0 3V15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1.5a1.5 1.5 0 0 0 0-3V9z"/><line x1="15" y1="7" x2="15" y2="17" stroke-dasharray="2 2"/></svg>', title: 'Активный инспектор', sub: 'Выбить ' + (qStage * 12) + ' номеров', cur: Math.min(qStage * 12, rolledNow), max: qStage * 12, rewardTxt: '+' + money(qStage * 45000) + ' · +2 талона' },
      { id: 's' + qStage + '_park', ico: '<svg viewBox="0 0 24 24" style="width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:1.85;stroke-linecap:round;stroke-linejoin:round"><path d="M3 10l9-6 9 6"/><path d="M5 10v9h14v-9"/><path d="M9 19v-5h6v5"/></svg>', title: 'Расширение автопарка', sub: 'Владеть ' + Math.min(CARS.length, qStage + 1) + ' авто в гараже', cur: Math.min(qStage + 1, carsNow), max: qStage + 1, rewardTxt: '+' + money(qStage * 35000) + ' · +5 ◈' },
      { id: 's' + qStage + '_vip', ico: '<svg viewBox="0 0 24 24" style="width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:1.85;stroke-linecap:round;stroke-linejoin:round"><path d="M3 18h18l-2-10-4.5 4L12 6l-2.5 6L5 8l-2 10z"/></svg>', title: 'Элитный фонд РФ', sub: 'Номер дороже ' + money(qStage * 350000), cur: bestValNow >= qStage * 350000 ? 1 : 0, max: 1, rewardTxt: '+' + money(qStage * 75000) + ' · +250 XP' }
    ];

    const allStageClaimed = stageQuests.every((q) => Boolean(S.claimedQ[q.id]));
    const questsCard = tag('section', 'class="panel"',
      tag('div', 'style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px"',
        tag('div', 'class="section" style="margin:0"', 'Госзадания МРЭО · Этап ' + qStage) +
        tag('span', 'style="font-size:10.5px;font-weight:800;color:#38bdf8"', stageQuests.filter((q) => S.claimedQ[q.id]).length + '/3 выполнено')) +
      stageQuests.map((q) => {
        const done = q.cur >= q.max;
        const claimed = Boolean(S.claimedQ[q.id]);
        const pct = Math.min(100, Math.round((q.cur / Math.max(1, q.max)) * 100));
        const rightHtml = claimed
          ? tag('span', 'class="quest-done-pill"', 'Получено ✓')
          : (done
              ? tag('button', 'class="btn small primary" style="flex-shrink:0" data-a="claim_q" data-v="' + q.id + '"', 'Забрать')
              : tag('span', 'class="quest-cnt-pill"', q.cur + ' / ' + q.max));
        return tag('div', 'class="quest-row-lux' + (claimed ? ' claimed' : (done ? ' done-ready' : '')) + '"',
          tag('div', 'class="quest-ico"', q.ico) +
          tag('div', 'style="flex:1;min-width:0"',
            tag('div', 'style="font-size:13px;font-weight:800;color:#f8fafc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"', q.title) +
            tag('div', 'style="font-size:11px;color:rgba(255,255,255,0.58);margin-top:1px"', q.sub + ' · ' + tag('span', 'style="color:#fbbf24;font-weight:700"', q.rewardTxt)) +
            tag('div', 'class="quest-prog-track"', tag('div', 'class="quest-prog-fill" style="width:' + pct + '%;background:' + (claimed ? '#4ade80' : 'linear-gradient(90deg,#38bdf8,#fbbf24)') + '"', ''))) +
          rightHtml);
      }).join('') +
      (allStageClaimed
        ? tag('button', 'class="btn primary" style="width:100%;margin-top:10px;height:44px" data-a="next_q_stage"', 'Открыть Этап ' + (qStage + 1) + ' госзаданий →')
        : ''));

        const ownedMediaCount = MEDIA_PLATES.filter((mp) =>
      S.plates.some((pl) => pl.f === mp.f && String(pl.d) === mp.d && pl.t === mp.t && String(pl.reg) === mp.reg)
    ).length;
    const mediaCard = tag('section', 'class="panel"',
      tag('div', 'style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"',
        tag('div', 'class="section" style="margin:0"', 'Медиа-коллекция РФ (' + ownedMediaCount + '/' + MEDIA_PLATES.length + ')') +
        tag('button', 'class="btn small primary" data-a="open_media_archive"', 'Открыть реестр')) +
      tag('p', 'class="sub" style="margin:0 0 8px"', 'Культовые номера российских автопроектов, дрифт-пилотов и медиа-личностей.') +
      tag('div', 'class="chips"',
        MEDIA_PLATES.slice(0, 6).map((mp, idx) => {
          const has = S.plates.some((pl) => pl.f === mp.f && String(pl.d) === mp.d && pl.t === mp.t && String(pl.reg) === mp.reg);
          return tag('button', 'class="chip ' + (has ? 'got' : '') + '" data-a="media_info" data-v="' + idx + '"',
            mp.f + ' ' + mp.d + ' ' + mp.t + ' ' + mp.reg + (has ? ' ★' : ''));
        }).join('')));

    return hero + questsCard + archiveCard + mediaCard + topCard + settingsCard;
}
function renderModal() {
    const m = $('#modal');
    if (!m) return;
    if (!modal) { m.classList.remove('open'); m.innerHTML = ''; return; }
    let body = '';
    if (modal === 'case_info') {
      const c = CASES.find((x) => x.id === modalData) || CASES.at(0);
      const lootMap = {
        c1: [
          ['Наличные 25 000 – 60 000 ₽', '28%', '#4ade80'],
          ['Необычный (зеркалки / круглые)', '44%', '#38bdf8'],
          ['Редкий (три цифры / первая десятка)', '24%', '#a855f7'],
          ['Спецсерия ★ (МММ, ВВВ, ОМР)', '4%', '#ef4444']
        ],
        c2: [
          ['Редкий (111, 555, 007 · регион 77/78)', '54%', '#a855f7'],
          ['Эпический (М 777 ММ, одинаковые буквы)', '34%', '#f59e0b'],
          ['Спецсерия ★ (ОРР, ОСК, УАО, АММ)', '12%', '#ef4444']
        ],
        c3: [
          ['Редкий (столичные красивые знаки)', '30%', '#a855f7'],
          ['Эпический (777 / 001 / три буквы)', '45%', '#f59e0b'],
          ['Спецсерия ★ (АМО, СОО, СКР, ВМР)', '25%', '#ef4444']
        ],
        c4: [
          ['Эпический (элитные 001 / 777 · 97/77)', '42%', '#f59e0b'],
          ['Высшая спецсерия ★ (АМР 97, ЕКХ 77, КРА 95)', '58%', '#ef4444']
        ]
      };
      const rows = (lootMap[c.id] || lootMap.c1).map((r) =>
        tag('div', 'class="odds-row"',
          tag('span', 'style="color:#f8fafc;font-weight:600"', r.at(0)) +
          tag('b', 'style="color:' + r.at(2) + ';font-size:12.5px"', r.at(1)))).join('');
      body = tag('div', 'style="text-align:left"',
        tag('div', 'style="font-size:10px;font-weight:800;letter-spacing:1.4px;color:#38bdf8;margin-bottom:4px"', 'СОДЕРЖИМОЕ И ШАНСЫ КЕЙСА') +
        tag('h3', 'style="margin:0 0 6px;font-size:19px"', c.name) +
        tag('p', 'class="sub" style="margin:0 0 12px"', c.desc) +
        rows);
    } else if (modal === 'case_open') {
      const md = modalData || {};
      const cName = md.c ? md.c.name : 'Спец-кейс МРЭО';
      const st = md.stage || 'roll';
      if (st === 'crack') {
        body = tag('div', 'style="text-align:center"',
          tag('h3', 'style="margin:0 0 12px;font-size:19px"', cName) +
          tag('div', 'style="padding:28px 16px;border-radius:18px;background:radial-gradient(circle, rgba(56,189,248,0.16) 0%, rgba(10,14,24,0.92) 75%);border:0.75px solid rgba(56,189,248,0.35)"',
            '<svg viewBox="0 0 24 24" style="width:38px;height:38px;fill:none;stroke:#38bdf8;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round;margin:0 auto 10px;display:block"><rect x="3" y="7" width="18" height="13" rx="3"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><circle cx="12" cy="13.5" r="1.5"/></svg>' +
            tag('div', 'style="font-size:11.5px;font-weight:800;letter-spacing:0.1em;color:#f8fafc"', 'ВСКРЫТИЕ · ' + cName.toUpperCase())));
      } else {
        const itemsHtml = (md.strip || []).map((it) =>
          tag('div', 'class="roulette-slot"',
            it.kind === 'cash'
              ? tag('div', 'style="font-size:14px;font-weight:900;color:#4ade80"', '+' + money(it.val))
              : plate(it.pl))).join('');
        const won = md.won;
        const resultBlock = md.done && won
          ? (won.kind === 'cash'
              ? tag('div', 'style="margin-top:12px;padding:14px;border-radius:18px;background:rgba(74,222,128,0.12);border:1px solid rgba(74,222,128,0.4)"',
                  tag('div', 'class="muted" style="font-size:11.5px;margin-bottom:4px"', 'Денежная премия зачислена на баланс') +
                  tag('div', 'style="font-size:24px;font-weight:900;color:#4ade80"', '+' + money(won.val)))
              : tag('div', 'style="margin-top:12px;padding:12px;border-radius:18px;background:rgba(255,255,255,0.05);border:0.75px solid rgba(255,255,255,0.14)"',
                  tag('div', 'class="muted" style="font-size:11.5px;margin-bottom:8px"', 'Получен госномер · Отправлен в Гараж') +
                  tag('div', 'style="max-width:230px;margin:0 auto 8px"', plate(won.pl)) +
                  tag('div', 'style="font-size:13px;font-weight:800;color:#fbbf24"', 'Цена: ' + money(won.pl.val))))
          : '';
        body = tag('div', 'style="text-align:center"',
          tag('h3', 'style="margin:0 0 12px;font-size:19px"', cName) +
          tag('div', 'class="roulette-box"',
            tag('div', 'class="roulette-focus-frame"', '') +
            tag('div', 'class="roulette-pin"', '') +
            tag('div', 'class="roulette-track" id="case-track" style="transform:translateX(' + (md.finalX || 0) + 'px)"', itemsHtml)) +
          resultBlock);
      }
    } else if (modal === 'rank_info') {
      const curXp = S.xp || 0;
      const curLvl = S.lvl || 1;
      const needXp = curLvl * 150;
      const leftXp = Math.max(0, needXp - (curXp % needXp));
      const rows = [
        ['Оформление серии в МРЭО', '+15 XP'],
        ['Открытие спец-кейсов МРЭО и МВД', '+35 XP'],
        ['Перебивка и реставрация в Боксе', '+25 XP'],
        ['Мини-игры (Аукцион / Сапёр)', '+30 XP'],
        ['Ежедневная премия в Профиле', '+50 XP']
      ].map((r) =>
        tag('div', 'style="display:flex;justify-content:space-between;align-items:center;padding:9px 12px;border-radius:12px;background:rgba(255,255,255,0.04);border:0.5px solid rgba(255,255,255,0.08);margin-bottom:6px"',
          tag('span', 'style="font-size:12.5px;color:#e2e8f0;font-weight:600"', r.at(0)) +
          tag('b', 'style="font-size:12.5px;color:#fbbf24;font-weight:800"', r.at(1)))
      ).join('');
      body = tag('div', '',
        tag('h3', 'style="margin:0 0 6px;font-size:18px"', 'Как повышать уровень') +
        tag('div', 'class="muted" style="font-size:12px;margin-bottom:12px"', 'До следующего звания осталось: ' + leftXp + ' XP · Каждый уровень открывает доступ к элитным авто и повышает лимит ставок.') +
        rows);
    } else if (modal === 'archive') {
      const ownedSet = new Set(S.plates.map((pl) => pl.ser).filter(Boolean));
      const tabsHtml = tag('div', 'class="chips" style="margin-bottom:8px"',
        tag('button', 'class="chip ' + (archiveTab === 'gov' ? 'got' : '') + '" style="flex:1" data-a="arch_tab" data-v="gov"', 'Ведомственные (' + SERIES.length + ')') +
        tag('button', 'class="chip ' + (archiveTab === 'media' ? 'got' : '') + '" style="flex:1" data-a="arch_tab" data-v="media"', 'Медиа-легенды (' + MEDIA_PLATES.length + ')'));
      const rows = archiveTab === 'media'
        ? MEDIA_PLATES.map((mp) => {
            const has = S.plates.some((pl) => pl.f === mp.f && String(pl.d) === mp.d && pl.t === mp.t && String(pl.reg) === mp.reg);
            return tag('div', 'class="archive-card-lux' + (has ? ' owned' : '') + '"',
              tag('div', 'style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:6px"',
                tag('div', 'class="mini-plate-badge"', mp.f + ' ' + mp.d + ' ' + mp.t + tag('span', '', mp.reg)) +
                tag('span', 'style="font-size:11px;font-weight:800;color:#fbbf24"', money(mp.val))) +
              tag('div', 'style="font-size:12.5px;font-weight:800;color:#7dd3fc;margin-bottom:4px;text-align:left"', mp.owner + (has ? ' · В гараже ★' : '')) +
              tag('div', 'style="font-size:11.5px;line-height:1.45;color:rgba(255,255,255,0.82);text-align:left;margin-bottom:6px"', mp.info) +
              tag('div', 'style="font-size:10.5px;padding:5px 8px;border-radius:8px;background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.62);text-align:left"',
                'Статус: Культовый медиа-знак РФ · Рынок: ' + money(mp.val)));
          }).join('')
        : SERIES.map((sr) => {
            const has = ownedSet.has(sr.k);
            const firstReg = sr.reg ? sr.reg.at(0) : '77';
            const regs = sr.reg ? sr.reg.join(', ') : 'Все регионы РФ';
            const fl = GOV_FLEET[sr.k] || {
              cars: 'Mercedes-Benz E/S-Class, BMW 5/7 Series, Toyota Camry, служебные седаны',
              era: 'Ведомственный реестр РФ · Регионы: ' + regs,
              note: 'Относится к сериям особого учёта и закрытых ведомственных автопарков Российской Федерации.'
            };
            return tag('div', 'class="archive-card-lux' + (has ? ' owned' : '') + '"',
              tag('div', 'style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:6px"',
                tag('div', 'class="mini-plate-badge"', sr.f + ' 001 ' + sr.t + tag('span', '', firstReg)) +
                tag('span', 'style="font-size:10.5px;font-weight:700;color:' + (has ? '#4ade80' : '#38bdf8') + '"', has ? 'В коллекции ★' : ('Регион: ' + regs))) +
              tag('div', 'style="font-size:11.5px;line-height:1.45;color:rgba(255,255,255,0.84);text-align:left;margin-bottom:6px"', sr.info) +
              tag('div', 'style="font-size:10.5px;line-height:1.4;padding:6px 8px;border-radius:9px;background:rgba(255,255,255,0.045);color:rgba(255,255,255,0.68);text-align:left"',
                tag('div', 'style="margin-bottom:2px"', tag('b', 'style="color:#fde047"', 'Автопарк: ') + fl.cars) +
                tag('div', 'style="margin-bottom:2px"', tag('b', 'style="color:#7dd3fc"', 'Период: ') + fl.era) +
                tag('div', '', fl.note)));
          }).join('');
      body = tag('div', 'style="text-align:left"',
        tag('div', 'style="font-size:10px;font-weight:800;letter-spacing:1.4px;color:#fbbf24;margin-bottom:4px"', 'ИСТОРИЧЕСКИЙ РЕЕСТР РФ') +
        tag('h3', 'style="margin:0 0 8px;font-size:19px"', archiveTab === 'media' ? 'Медиа-коллекция РФ' : 'Архив спецсерий РФ') +
        tabsHtml +
        tag('div', 'class="archive-scroll"', rows));
    } else if (modal === 'media_info') {
      const mp = MEDIA_PLATES.at(Number(modalData) || 0) || MEDIA_PLATES.at(0);
      body = tag('div', 'style="text-align:left"',
        tag('div', 'style="font-size:10px;font-weight:800;letter-spacing:1.4px;color:#fbbf24;margin-bottom:4px"', 'МЕДИА-ЛЕГЕНДА РФ') +
        tag('h3', 'style="margin:0 0 8px;font-size:19px"', mp.owner) +
        tag('div', 'style="max-width:225px;margin:0 auto 10px"', plate({ f: mp.f, d: mp.d, t: mp.t, reg: mp.reg, rar: 'legendary', frame: 'gold' })) +
        tag('p', 'style="font-size:12.5px;line-height:1.45;color:rgba(255,255,255,0.82);margin:0 0 10px"', mp.info) +
        tag('div', 'class="roll-val-badge" style="margin:0"', 'Рыночная оценка РФ: ' + money(mp.val)));
    } else if (modal === 'won_special') {
      const pl = modalData || {};
      const sr = seriesInfo(pl) || { k: pl.ser || 'СПЕЦСЕРИЯ', info: 'Закрытая ведомственная серия особого учёта Российской Федерации.' };
      body = tag('div', 'style="text-align:center"',
        tag('div', 'style="display:inline-block;padding:4px 12px;border-radius:99px;background:rgba(239,68,68,0.16);border:1px solid rgba(239,68,68,0.48);color:#fca5a5;font-size:10px;font-weight:800;letter-spacing:1.2px;margin-bottom:8px"', '★ ВЫПАЛА СПЕЦСЕРИЯ РФ ★') +
        tag('h3', 'style="margin:0 0 10px;font-size:20px"', 'Серия ' + sr.k + ' · Регион ' + (pl.reg || '77')) +
        tag('div', 'style="max-width:240px;margin:0 auto 12px"', plate(pl)) +
        tag('div', 'style="text-align:left;padding:12px 14px;border-radius:16px;background:rgba(255,255,255,0.05);border:0.75px solid rgba(255,255,255,0.12);font-size:12px;line-height:1.48;color:rgba(255,255,255,0.84);margin-bottom:10px"', sr.info) +
        tag('div', 'style="display:flex;flex-wrap:wrap;justify-content:center;gap:4px;margin-bottom:8px"', marketBreakdown(pl).map((tg) => tag('span', 'style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:rgba(251,191,36,0.12);border:0.75px solid rgba(251,191,36,0.35);color:#fde047"', tg)).join('')) +
        tag('div', 'class="roll-val-badge" style="margin:0"', 'Рыночная цена РФ: ' + money(pl.val || 0)));
    } else if (modal === 'media_info') {
      const mp = MEDIA_PLATES.at(Number(modalData) || 0) || MEDIA_PLATES.at(0);
      body = tag('div', 'style="text-align:left"',
        tag('div', 'style="font-size:10px;font-weight:800;letter-spacing:1.4px;color:#fbbf24;margin-bottom:4px"', 'МЕДИА-ЛЕГЕНДА РФ') +
        tag('h3', 'style="margin:0 0 8px;font-size:19px"', mp.owner) +
        tag('div', 'style="max-width:225px;margin:0 auto 10px"', plate({ f: mp.f, d: mp.d, t: mp.t, reg: mp.reg, rar: 'legendary', frame: 'gold' })) +
        tag('p', 'style="font-size:12.5px;line-height:1.45;color:rgba(255,255,255,0.82);margin:0 0 10px"', mp.info) +
        tag('div', 'class="roll-val-badge" style="margin:0"', 'Рыночная оценка РФ: ' + money(mp.val)));
    } else if (modal === 'ser_info') {
      const sr = SERIES.find((x) => x.k === modalData) || SERIES.at(0);
      const regs = sr.reg ? sr.reg.join(', ') : 'Все регионы РФ';
      body = tag('div', 'style="text-align:left"',
        tag('div', 'style="font-size:10px;font-weight:800;letter-spacing:1.4px;color:#ef4444;margin-bottom:4px"', 'ДОСЬЕ СПЕЦСЕРИИ РФ') +
        tag('h3', 'style="margin:0 0 6px;font-size:20px"', 'Серия ' + sr.k + ' (' + regs + ')') +
        tag('p', 'style="font-size:12.5px;line-height:1.45;color:rgba(255,255,255,0.82);margin:0"', sr.info));
    } else if (modal === 'cars') {
      const catNames = { budget: 'Эконом', comfort: 'Комфорт', business: 'Бизнес', premium: 'Премиум', special: 'Спецтранспорт' };
      const filtered = CARS.filter((c) => carFilter === 'all' || c.cat === carFilter);
      const filterBar = tag('div', 'class="chips" style="margin-bottom:8px"',
        [['all','Все'],['budget','Эконом'],['comfort','Комфорт'],['business','Бизнес'],['premium','Премиум'],['special','Спец']].map((f) =>
          tag('button', 'class="chip ' + (carFilter === f.at(0) ? 'got' : '') + '" data-a="c_flt" data-v="' + f.at(0) + '"', f.at(1))).join(''));
      const rows = filtered.map((c) => {
        const owned = S.cars.includes(c.id);
        const active = S.activeCar === c.id;
        const canBuy = S.cash >= c.price;
        const btnHtml = owned
          ? tag('button', 'class="btn small ' + (active ? 'primary' : 'ghost') + '" style="min-width:86px" data-a="pick_car" data-v="' + c.id + '"', active ? 'В гараже ★' : 'Выбрать')
          : tag('button', 'class="btn small primary' + (canBuy ? '' : ' cant-afford') + '" style="min-width:96px" data-a="buy_car" data-v="' + c.id + '"', money(c.price));
        return tag('div', 'class="salon-card-lux' + (active ? ' active-car' : (owned ? ' owned' : '')) + '"',
          tag('div', 'style="flex:1;min-width:0"',
            tag('span', 'class="salon-cat-tag"', (catNames[c.cat] || 'Авто') + ' · ×' + c.mult.toFixed(2)) +
            tag('div', 'style="font-size:13.5px;font-weight:800;color:#f8fafc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"', c.name) +
            tag('div', 'class="muted" style="font-size:11px;margin-top:2px"', 'Прирост дохода заездов и цен')) +
          btnHtml);
      }).join('');
      body = tag('div', 'style="text-align:left"',
        tag('div', 'style="font-size:10px;font-weight:800;letter-spacing:1.4px;color:#38bdf8;margin-bottom:3px"', 'ОФИЦИАЛЬНЫЙ ДИЛЕР · АВТОПАРК ' + S.cars.length + '/' + CARS.length) +
        tag('h3', 'style="margin:0 0 8px;font-size:19px"', 'VIP-Автосалон') +
        filterBar +
        tag('div', 'class="archive-scroll"', rows));
    } else if (modal === 'cruise_run') {
      const md = modalData || {};
      const done = Boolean(md.done);
      body = tag('div', 'style="text-align:center"',
        tag('div', 'style="font-size:10px;font-weight:800;letter-spacing:1.4px;color:#38bdf8;margin-bottom:4px"', done ? 'ЗАЕЗД ЗАВЕРШЁН' : 'НОЧНОЙ ПРОХВАТ ПО ГОРОДУ') +
        tag('h3', 'style="margin:0 0 4px;font-size:18px"', md.carName || 'Выезд в город') +
        tag('div', 'class="muted" style="font-size:11.5px"', 'Тюнинг Stage ' + (md.stage || 0) + ' · ' + (md.plateTxt || 'Транзитный номер')) +
        tag('div', 'class="cruise-highway"',
          (done ? '' : tag('div', 'class="cruise-lane"', '')) +
          tag('div', 'class="cruise-player-car"',
            '<svg viewBox="0 0 64 26" style="width:62px;height:25px"><rect x="4" y="10" width="54" height="11" rx="5" fill="#f8fafc"/><path d="M16 10 L23 3 L42 3 L49 10 Z" fill="#38bdf8"/><circle cx="16" cy="21" r="4" fill="#090d16" stroke="#fbbf24" stroke-width="1.5"/><circle cx="48" cy="21" r="4" fill="#090d16" stroke="#fbbf24" stroke-width="1.5"/></svg>')) +
        (done
          ? tag('div', 'style="padding:12px;border-radius:16px;background:rgba(74,222,128,0.14);border:1px solid rgba(74,222,128,0.45)"',
              tag('div', 'style="font-size:11.5px;color:#86efac"', 'Посты ДПС пройдены без остановки! Премия:') +
              tag('div', 'style="font-size:22px;font-weight:900;color:#4ade80;margin-top:2px"', '+' + money(md.gain || 0) + ' · +35 XP'))
          : tag('div', 'style="font-size:12px;font-weight:700;color:#7dd3fc"', 'Мчим по ночному проспекту, собираем бонус статуса...')));
    } else if (modal === 'case_open') {
      const md = modalData || {};
      const st = md.stage || 'drop';
      const cid = md.cid || 'c1';
      if (st === 'drop' || st === 'crack') {
        body = tag('div', 'style="text-align:center"',
          tag('h3', 'style="margin:0 0 10px"', md.name || 'Спец-кейс') +
          tag('div', 'class="case-stage ' + cid + '"',
            tag('div', 'class="case-icon-anim"', st === 'crack' ? '<svg viewBox="0 0 24 24" style="width:36px;height:36px;fill:none;stroke:#fbbf24;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round"><rect x="3" y="10" width="18" height="11" rx="3"/><path d="M7 10V6a5 5 0 0 1 9.5-2"/><circle cx="12" cy="15.5" r="1.5"/></svg>' : '<svg viewBox="0 0 24 24" style="width:36px;height:36px;fill:none;stroke:#38bdf8;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round"><rect x="3" y="7" width="18" height="13" rx="3"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><circle cx="12" cy="13.5" r="1.5"/></svg>') +
            tag('div', 'style="font-size:12px;font-weight:800;margin-top:8px"', st === 'crack' ? 'ЗАПУСК БАРАБАНА НАГРАД...' : 'ВСКРЫТИЕ СПЕЦФОНДА...')));
      } else {
        const itemsHtml = (md.strip || []).map((it) => {
          if (it.cash) {
            return tag('div', 'class="roulette-slot"', tag('b', 'style="color:#4ade80"', '+' + money(it.cash)));
          }
          return tag('div', 'class="roulette-slot"', plate(it.plate));
        }).join('');
        const ser = md.plate ? seriesInfo(md.plate) : null;
        const resBox = st === 'done'
          ? tag('div', 'class="garage-item" style="margin-top:12px"',
              md.cash
                ? tag('div', 'class="muted"', 'Зачислено на баланс') + tag('div', 'style="font-size:22px;font-weight:900;color:#4ade80"', '+' + money(md.cash))
                : tag('div', 'class="muted"', 'Получен госномер · Отправлен в Гараж') +
                  tag('div', 'style="max-width:220px;margin:8px auto"', plate(md.plate)) +
                  (ser ? tag('div', 'class="muted" style="margin-bottom:6px"', ser.info) : '') +
                  tag('span', 'class="val"', 'Цена: ' + money(md.plate ? md.plate.val : 0)))
          : tag('div', 'class="sub" style="margin:16px auto 4px;text-align:center;font-size:12.5px;letter-spacing:0.01em"', 'Определение награды...');
        body = tag('div', 'style="text-align:center"',
          tag('h3', 'style="margin:0 0 10px"', md.name || 'Открытие кейса') +
          tag('div', 'class="roulette-box"',
            tag('div', 'class="roulette-pin"', '') +
            tag('div', 'class="roulette-track" id="case-track" style="transform:translateX(' + (md.finalX || 0) + 'px)"', itemsHtml)) +
          resBox);
      }
    }
    const closeBtn = (modal === 'case_open' && modalData && modalData.stage !== 'done')
      ? ''
      : tag('button', 'class="btn ghost" style="width:100%;margin-top:12px" data-a="close"', 'Закрыть');
    m.classList.add('open');
    m.innerHTML = tag('div', 'class="modal-box"', body + closeBtn);
  }

  window.__mreoGoTab = function(v) { if (v) { tab = v; if (typeof haptic === 'function') haptic('light'); render(); } };
  function renderLiquidDock() {
    const nav = $('#nav') || $('#tabs') || $('nav') || $('.liquid-dock') || $('.tabs');
    if (!nav) return;
    nav.classList.add('liquid-dock');
    const tabs = [
      ['roll', 'Выдача', '<rect x="4" y="5" width="16" height="14" rx="3"/><line x1="9.3" y1="5" x2="9.3" y2="19"/><line x1="14.7" y1="5" x2="14.7" y2="19"/>'],
      ['garage', 'Гараж', '<path d="M5 11l2-5h10l2 5"/><rect x="3" y="11" width="18" height="6" rx="2"/><circle cx="7" cy="17" r="1.5"/><circle cx="17" cy="17" r="1.5"/>'],
      ['craft', 'Бокс', '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>'],
      ['market', 'Рынок', '<path d="M3 10l9-6 9 6"/><path d="M5 10v9h14v-9"/><path d="M9 19v-5h6v5"/>'],
      ['wheel', 'Колесо', '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.2"/><line x1="12" y1="4" x2="12" y2="9.8"/><line x1="12" y1="14.2" x2="12" y2="20"/><line x1="4" y1="12" x2="9.8" y2="12"/><line x1="14.2" y1="12" x2="20" y2="12"/>'],
      ['games', 'Игры', '<rect x="3" y="6" width="18" height="12" rx="4"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="6" y1="12" x2="10" y2="12"/><circle cx="15.5" cy="10.5" r="1"/><circle cx="17.5" cy="13.5" r="1"/>'],
      ['shop', 'Магазин', '<path d="M6 7h12l-1 12H7L6 7z"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/>'],
    ['profile', 'Профиль', '<circle cx="12" cy="8" r="3.5"/><path d="M5 19c1.5-3.5 4.2-5 7-5s5.5 1.5 7 5"/>']
    ];
    const activeIdx = Math.max(0, tabs.findIndex((t) => t.at(0) === tab));
    if (!nav._built || !nav.querySelector('.dock-pill')) {
      nav._built = true;
      const itemsHtml = tabs.map((t) =>
        '<button type="button" class="dock-item" onclick="window.__mreoGoTab(\'' + t.at(0) + '\')" data-a="tab" data-v="' + t.at(0) + '">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">' + t.at(2) + '</svg>' +
          '<span>' + t.at(1) + '</span>' +
        '</button>').join('');
      nav.innerHTML = '<div class="dock-pill"></div>' + itemsHtml;
      bindLiquidDockSwipe(nav, tabs);
    }
    const items = Array.from(nav.querySelectorAll('.dock-item'));
    items.forEach((el, i) => el.classList.toggle('active', i === activeIdx));
    const pill = nav.querySelector('.dock-pill');
    if (pill && !nav._dragging) {
      const alignPill = () => {
        const actBtn = items.at(activeIdx);
        if (!actBtn) return;
        const nRect = nav.getBoundingClientRect();
        const bRect = actBtn.getBoundingClientRect();
        if (bRect.width > 0) {
          const w = bRect.width;
          const x = (bRect.left - nRect.left);
          pill.style.setProperty('left', '0px', 'important');
          pill.style.setProperty('width', w.toFixed(2) + 'px', 'important');
          pill.style.setProperty('transform', 'translate3d(' + x.toFixed(2) + 'px, 0, 0) scale3d(1, 1, 1)', 'important');
        }
      };
      alignPill();
    }
  }

  function bindLiquidDockSwipe(nav, tabs) {
    if (nav._swipeBound) return;
    nav._swipeBound = true;
    nav.addEventListener('pointerdown', (e) => {
      nav._downX = e.clientX;
      nav._downTime = Date.now();
    }, { passive: true });
    nav.addEventListener('pointerup', (e) => {
      const dx = Math.abs(e.clientX - (nav._downX ?? e.clientX));
      if (dx <= 22) {
        const btn = e.target && e.target.closest ? e.target.closest('.dock-item') : null;
        if (btn && btn.dataset && btn.dataset.v) {
          if (tab !== btn.dataset.v) {
            tab = btn.dataset.v;
            if (typeof haptic === 'function') haptic('light');
            render();
          }
        }
      }
    });
    nav.addEventListener('click', (e) => {
      const btn = e.target && e.target.closest ? e.target.closest('.dock-item, [data-v]') : null;
      if (btn && btn.dataset && btn.dataset.v && tab !== btn.dataset.v) {
        tab = btn.dataset.v;
        render();
      }
    });
    nav.onclick = null;
    nav.addEventListener('click', (e) => {
      e.preventDefault();
      
      const btn = e.target && e.target.closest ? e.target.closest('.dock-item') : null;
      if (btn && btn.dataset.v && tab !== btn.dataset.v) {
        tab = btn.dataset.v;
        haptic('light');
        render();
      }
    }, true);
    let startX = 0, lastIdx = -1;

    const moveToClientX = (clientX, isMoving) => {
      const rect = nav.getBoundingClientRect();
      const innerW = rect.width - 10;
      const cellW = innerW / tabs.length;
      const relX = Math.max(0, Math.min(innerW - cellW, clientX - rect.left - 5 - cellW / 2));
      const hoverIdx = Math.max(0, Math.min(tabs.length - 1, Math.floor((clientX - rect.left - 5) / cellW)));
      const pill = nav.querySelector('.dock-pill');
      if (pill) {
        pill.style.width = cellW.toFixed(2) + 'px';
        pill.style.transform = 'translate3d(' + relX.toFixed(2) + 'px, 0, 0) scale3d(' + (isMoving ? '1.14, 0.92' : '1, 1') + ', 1)';
      }
      if (hoverIdx !== lastIdx) {
        lastIdx = hoverIdx;
        try {
          const hf = window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback;
          if (hf && hf.selectionChanged) hf.selectionChanged();
          else haptic('light');
        } catch (_) {}
        nav.scrollLeft = 0;
        const nextTab = tabs.at(hoverIdx).at(0);
        if (tab !== nextTab) {
          tab = nextTab;
          Array.from(nav.querySelectorAll('.dock-item')).forEach((el, idx) => el.classList.toggle('active', idx === hoverIdx));
          render();
          nav.scrollLeft = 0;
        }
      }
    };

    nav.addEventListener('pointerdown', (e) => {
      nav._dragging = true;
      startX = e.clientX;
      lastIdx = tabs.findIndex((t) => t.at(0) === tab);
      const pill = nav.querySelector('.dock-pill');
      if (pill) pill.classList.add('dragging');
      if (nav.setPointerCapture) {
        try { nav.setPointerCapture(e.pointerId); } catch (_) {}
      }
    });

    nav.addEventListener('pointermove', (e) => {
      if (!nav._dragging) return;
      if (e.cancelable) e.preventDefault();
      if (Math.abs(e.clientX - startX) > 4) {
        moveToClientX(e.clientX, true);
      }
    });

    const endDrag = (e) => {
      if (!nav._dragging) return;
      nav._dragging = false;
      const pill = nav.querySelector('.dock-pill');
      if (pill) pill.classList.remove('dragging');
      if (Math.abs(e.clientX - startX) <= 4) {
        const btn = e.target && e.target.closest ? e.target.closest('[data-v]') : null;
        if (btn && btn.dataset.v) {
          tab = btn.dataset.v;
          haptic('light');
        }
      }
      render();
    };

    nav.addEventListener('pointerup', endDrag);
    nav.addEventListener('pointercancel', endDrag);
  }

  function render() {
    if (window.__syncThemeAttr) window.__syncThemeAttr(Boolean((S && (S.theme === 'light' || S.light)) || document.body.classList.contains('light') || document.documentElement.classList.contains('light')));
    applyCfg();
    const balEl = $('#balance');
    if (balEl) balEl.textContent = money(S.cash);
    const unameEl = $('#username');
    const lvl = levelInfo();
    if (unameEl) unameEl.textContent = (me.username ? me.username + ' · ' : '') + 'Ур. ' + lvl.lvl + ' · ' + lvl.title;
    const view = $('#view');
    if (view) {
      try {
        if (tab === 'roll') view.innerHTML = renderRoll();
        else if (tab === 'garage') view.innerHTML = renderGarage();
        else if (tab === 'craft') view.innerHTML = renderCraft();
        else if (tab === 'market') view.innerHTML = renderMarket();
        else if (tab === 'wheel') view.innerHTML = renderWheel();
        else if (tab === 'games') view.innerHTML = renderGames();
        else if (tab === 'profile') view.innerHTML = renderProfile();
        else if (tab === 'shop') view.innerHTML = renderShop();
      } catch (err) {
        console.error(err);
        view.innerHTML = '<section class="hero"><h2>Ошибка вкладки: ' + tab + '</h2><p class="sub">' + String(err.message || err) + '</p></section>';
      }
    }
    renderLiquidDock();
    renderModal();
    if (tab === 'roll' && !rolling && (!rollStrip || rollStrip.length === 0)) {
      requestAnimationFrame(() => {
        const tr = $('#roll-track');
        const box = tr ? tr.parentElement : null;
        const frame = box ? box.querySelector('.roulette-focus-frame') : null;
        const slots = tr ? Array.from(tr.querySelectorAll('.roulette-slot')) : [];
        const midSlot = slots.at(3) || slots.at(0);
        if (tr && box && midSlot) {
          tr.style.transition = 'none';
          tr.style.transform = 'translateX(0px)';
          const centerX = box.clientWidth / 2;
          rollFinalX = Math.round(centerX - (3 * 144 + 72));
          tr.style.transform = 'translateX(' + rollFinalX + 'px)';
        }
      });
    }
  }

  function toast(msg, isErr) {
    playTone(isErr ? 210 : 340, isErr ? 0.14 : 0.08, isErr ? 'sawtooth' : 'sine', 0.05);
    let t = $('#toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
    t.textContent = (isErr ? '⚠ ' : '') + msg;
    t.classList.toggle('err', Boolean(isErr));
    t.classList.add('show');
    clearTimeout(window._tt);
    window._tt = setTimeout(() => t.classList.remove('show'), 5200);
  }
  function noMoney(need, btn) {
    haptic('error');
    haptic('medium');
    if (btn) {
      btn.classList.remove('btn-shake');
      void btn.offsetWidth;
      btn.classList.add('btn-shake');
    }
    const diff = Math.max(0, Math.round(need - (S.cash || 0)));
    toast(diff > 0 ? ('Недостаточно средств · не хватает ' + money(diff)) : 'Недостаточно средств', true);
  }
  function _unused_toast(msg) {
let t = $('#toast');
if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
t.textContent = msg;
t.classList.add('show');
clearTimeout(window._tt);
window._tt = setTimeout(() => t.classList.remove('show'), 5200);
}
function handle(e) {
    const _b = e.target && e.target.closest ? e.target.closest('[data-a]') : null;
    if (_b) {
      const _a = _b.dataset.a, _v = _b.dataset.v;
      if (_a === 'arch_tab') { archiveTab = _v; render(); return; }
      if (_a === 'rank_info') { modal = 'rank_info'; render(); return; }
      if (_a === 'buy_hot' || _a === 'hot') {
        const idx = Number(_v);
        const offer = S.hotOffers && S.hotOffers.at(idx);
        if (!offer) return;
        const price = Math.round(offer.val * 0.72);
        if (S.cash < price) { noMoney(price, _b); return; }
        const cardEl = _b.closest('.hot-deal-card') || _b.parentElement;
        const plateEl = cardEl ? cardEl.querySelector('.plate') : null;
        const snapRect = (plateEl || cardEl || _b).getBoundingClientRect();
        const boughtCopy = Object.assign({}, offer);
        S.cash -= price;
        S.plates.unshift(boughtCopy);
        S.hotOffers[idx] = makeByTier(idx === 0 ? 'epic' : 'rare');
        sfxWin(true);
        haptic('success');
        toast('Номер ' + boughtCopy.f + ' ' + boughtCopy.d + ' ' + boughtCopy.t + ' ' + boughtCopy.reg + ' отправлен в Гараж!');
        save(); render();
        requestAnimationFrame(() => {
          const cards = document.querySelectorAll('.hot-deal-card');
          if (cards[idx]) cards[idx].classList.add('new-lot-in');
          if (typeof animatePlateToGarage === 'function') animatePlateToGarage(snapRect, boughtCopy);
        });
        return;
      }
      if (_a === 'open_media_archive') { archiveTab = 'media'; modal = 'archive'; render(); return; }
      if (_a === 'media_info') { modal = 'media_info'; modalData = _v; render(); return; }
    }
const btn = e.target.closest('[data-a]');
if (!btn) return;
    haptic('light');
    if (btn.dataset.a === 'arch_tab') { archiveTab = v; render(); return; }
    if (btn.dataset.a === 'open_media_archive') { archiveTab = 'media'; modal = 'archive'; render(); return; }
    if (btn.dataset.a === 'media_info') { modal = 'media_info'; modalData = btn.dataset.v; render(); return; }
const a = btn.dataset.a, v = btn.dataset.v;
haptic('light');
if (a === 'tab') { tab = v; render(); return; }
    if (a === 'buy_hot') {
      const idx = Number(v);
      const offer = S.hotOffers && S.hotOffers.at(idx);
      if (!offer) return;
      const price = Math.round(offer.val * 0.72);
      if (S.cash < price) { noMoney(price, btn); return; }

      const cardEl = btn.closest('.hot-deal-card');
      const plateEl = cardEl ? cardEl.querySelector('.plate') : null;
      const snapRect = (plateEl || cardEl || btn).getBoundingClientRect();
      const boughtCopy = Object.assign({}, offer);

      S.cash -= price;
      S.plates.unshift(boughtCopy);
      S.hotOffers[idx] = makeByTier(idx === 0 ? 'epic' : 'rare');
      sfxWin(true);
      haptic('success');
      toast('Номер ' + boughtCopy.f + ' ' + boughtCopy.d + ' ' + boughtCopy.t + ' ' + boughtCopy.reg + ' отправлен в Гараж!');
      save(); render();

      requestAnimationFrame(() => {
        const cards = document.querySelectorAll('.hot-deal-card');
        if (cards[idx]) cards[idx].classList.add('new-lot-in');
        if (typeof animatePlateToGarage === 'function') {
          animatePlateToGarage(snapRect, boughtCopy);
        }
      });
      return;
    }
    
    if (a === 'open_case') {
    const c = CASES.find((x) => x.id === v);
    if (!c) return;
    if (S.cash < c.price) {
      const diff = Math.max(0, c.price - (S.cash || 0));
      if (typeof toast === 'function') toast('Недостаточно средств! Не хватает ' + money(diff), true);
      if (typeof noMoney === 'function') noMoney(c.price, btn);
      return;
    }
    S.cash -= c.price;
    const winIdx = 22;
    const strip = Array.from({ length: 28 }, () => {
      const r = Math.random();
      if (r < 0.34) {
        const mult = 0.55 + Math.pow(Math.random(), 1.45) * 2.85;
        const cashVal = Math.max(1000, Math.round((c.price * mult) / 100) * 100);
        return { kind: 'cash', val: cashVal };
      }
      const tier = r < 0.72 ? (c.price >= 150000 ? 'epic' : 'rare') : (r < 0.93 ? 'epic' : 'legend');
      const pl = typeof makeByTier === 'function' ? makeByTier(tier) : makePlate();
      const minPlateVal = Math.round(c.price * 0.62);
      if (pl && (pl.val || 0) < minPlateVal) {
        pl.val = Math.round((minPlateVal * (1 + Math.random() * 1.4)) / 100) * 100;
      }
      return { kind: 'plate', pl };
    });
    const winItem = strip[winIdx];
    modalData = { c, strip, winIdx, winItem, stage: 'crack' };
    modal = 'case_open';
    save(); render();

    setTimeout(() => {
      if (modal !== 'case_open' || !modalData) return;
      modalData.stage = 'roll';
      render();
      requestAnimationFrame(() => {
        const modalEl = document.getElementById('modal');
        if (!modalEl) return;
        const divs = modalEl.querySelectorAll('div');
        let tr = null;
        for (let i = 0; i < divs.length; i++) {
          if (divs[i].children.length >= 15) { tr = divs[i]; break; }
        }
        if (tr) {
          const slotEl = tr.children[winIdx];
          const wrapW = tr.parentElement ? tr.parentElement.clientWidth : 340;
          const exactX = slotEl
            ? -(slotEl.offsetLeft - wrapW / 2 + slotEl.offsetWidth / 2)
            : -(winIdx * 156 - wrapW / 2 + 78);
          tr.style.willChange = 'transform';
          tr.style.transition = 'transform 4.8s cubic-bezier(0.08, 0.9, 0.15, 1)';
          modalData.finalX = exactX;
          tr.style.transform = 'translate3d(' + exactX + 'px, 0, 0)';
        }
      });
    }, 420);

    setTimeout(() => {
      if (modal !== 'case_open' || !modalData) return;
      if (winItem.kind === 'cash') {
        S.cash += winItem.val;
      } else if (winItem.pl) {
        S.plates.unshift(winItem.pl);
      }
      modalData.done = true;
      modalData.stage = 'done';
      if (typeof sfxWin === 'function') sfxWin(true);
      haptic('success');
      save(); render();
      requestAnimationFrame(() => {
        const modalEl = document.getElementById('modal');
        if (!modalEl || !modalData || typeof modalData.finalX !== 'number') return;
        const divs = modalEl.querySelectorAll('div');
        for (let i = 0; i < divs.length; i++) {
          if (divs[i].children.length >= 15) {
            divs[i].style.transition = 'none';
            divs[i].style.transform = 'translate3d(' + modalData.finalX + 'px, 0, 0)';
            break;
          }
        }
      });
    }, 6170);
    return;
  }

    if (a === 'g_mode') { gMode = v; render(); return; }
    if (a === 'g_bet') { gBet = Number(v); render(); return; }
    if (a === 'g_bet_max') { gBet = Math.max(10000, Math.floor(S.cash || 10000)); render(); return; }
    if (a === 'coin_flip') {
      if (!syncCustomBet()) { render(); return; }
      if (!syncCustomBet()) { render(); return; }
      if (coinSpin) return;
      if (S.cash < gBet) { noMoney(gBet, btn); return; }
      S.cash -= gBet; coinSpin = true; render();
      setTimeout(() => {
        coinSpin = false;
        const side = Math.random() < 0.5 ? 'orel' : 'reshka';
        const win = side === v;
        const gain = win ? Math.round(gBet * 1.95) : 0;
        if (win) { S.cash += gain; sfxWin(false); }
        if (!S.coinHist) S.coinHist = [];
        S.coinHist.unshift(side === 'orel' ? 'o' : 'r');
        if (S.coinHist.length > 8) S.coinHist.pop();
        lastCoin = { side, win, msg: win ? ('Выпало: ' + (side === 'orel' ? 'Орёл' : 'Решка') + '! +' + money(gain)) : ('Выпало: ' + (side === 'orel' ? 'Орёл' : 'Решка') + '. Пост ДПС забрал ставку!') };
        save(); render();
      }, 920);
      return;
    }
    if (a === 'raid_start') {
      if (!syncCustomBet()) { render(); return; }
      if (!syncCustomBet()) { render(); return; }
      if (S.cash < gBet) { noMoney(gBet, btn); return; }
      S.cash -= gBet;
      const grid = Array(16).fill('ok');
      let placed = 0;
      while (placed < 4) { const r = Math.floor(Math.random() * 16); if (grid.at(r) !== 'cop') { grid[r] = 'cop'; placed++; } }
      raid = { grid, rev: Array(16).fill(false), opened: 0, over: false };
      save(); render(); return;
    }
    if (a === 'raid_cell') {
      if (!raid || raid.over) return;
      const idx = Number(v);
      if (raid.rev.at(idx)) return;
      raid.rev[idx] = true;
      if (raid.grid.at(idx) === 'cop') {
        raid.over = true;
        playTone(180, 0.2, 'sawtooth', 0.06);
        toast('Пост ДПС! Рейд провален', true);
      } else {
        raid.opened++;
        playTone(540 + raid.opened * 40, 0.08, 'sine', 0.05);
        if (raid.opened >= 12) {
          raid.over = true;
          const mult = 1 + raid.opened * 0.35;
          const gain = Math.round(gBet * mult);
          S.cash += gain; sfxWin(true);
          toast('Все 12 секторов пройдены! +' + money(gain));
        }
      }
      save(); render(); return;
    }
    if (a === 'raid_cash') {
      if (!raid || raid.over || raid.opened === 0) return;
      const mult = 1 + raid.opened * 0.35;
      const gain = Math.round(gBet * mult);
      S.cash += gain; raid.over = true;
      sfxWin(true); save(); render();
      toast('Выигрыш забран: +' + money(gain)); return;
    }
    if (a === 'safe_mode') {
      if (safeState && safeState.cracking) return;
      safeCells = Number(v) || 4;
      safeState = null;
      render(); return;
    }
    if (a === 'safe_pick') {
      if (!syncCustomBet()) { render(); return; }
      if (!syncCustomBet()) { render(); return; }
      if (safeState && safeState.cracking) return;
      if (S.cash < gBet) { noMoney(gBet, btn); return; }
      S.cash -= gBet;
      const picked = Number(v);
      const secret = 1 + Math.floor(Math.random() * safeCells);
      const multMap = { 4: 3.6, 6: 5.4, 8: 7.2 };
      const mult = multMap[safeCells] || 3.6;
      safeState = { cracking: true, picked, secret, win: false, msg: '' };
      playTone(520, 0.08, 'triangle', 0.05);
      render();
      setTimeout(() => {
        const win = picked === secret;
        if (win) {
          const gain = Math.round(gBet * mult);
          S.cash += gain;
          safeState = { cracking: false, picked, secret, win: true, msg: 'СЕЙФ ВСКРЫТ! Ячейка #' + secret + ' · +' + money(gain) };
          sfxWin(true);
          toast('Сейф вскрыт! Выигрыш: +' + money(gain));
        } else {
          safeState = { cracking: false, picked, secret, win: false, msg: 'Тревога! Куш лежал в ячейке #' + secret };
          playTone(190, 0.16, 'sawtooth', 0.05);
        }
        save(); render();
      }, 540);
      return;
    }
    if (a === 'crash_start') {
      if (!syncCustomBet()) { render(); return; }
      if (!syncCustomBet()) { render(); return; }
      if (S.cash < gBet) { noMoney(gBet, btn); return; }
      S.cash -= gBet;
      const bustAt = Number((1.22 + Math.pow(Math.random(), 1.5) * 5.2).toFixed(2));
      crash = { mult: 1.00, bustAt, busted: false, cashed: false, wonAmt: 0 };
      clearInterval(window._radarTimer);
      save(); render();
      window._radarTimer = setInterval(() => {
        if (!crash || crash.busted || crash.cashed) { clearInterval(window._radarTimer); return; }
        crash.mult = Number((crash.mult + 0.03 + crash.mult * 0.012).toFixed(2));
        if (crash.mult >= crash.bustAt) {
          crash.mult = crash.bustAt;
          crash.busted = true;
          clearInterval(window._radarTimer);
          save(); render();
          toast('Радар ДПС зафиксировал превышение на ×' + crash.bustAt.toFixed(2) + '!', true);
          return;
        }
        const mEl = $('#crash-mult');
        const bEl = $('#crash-bar');
        const cEl = $('#crash-car');
        const vEl = $('#crash-cash-val');
        if (mEl) mEl.textContent = '×' + crash.mult.toFixed(2);
        if (bEl) bEl.style.width = Math.min(100, Math.round((crash.mult - 1) * 28)) + '%';
        if (cEl) cEl.style.left = Math.min(76, 8 + Math.round((crash.mult - 1) * 22)) + '%';
        if (vEl) vEl.textContent = money(Math.round(gBet * crash.mult));
      }, 115);
      return;
    }
    if (a === 'crash_cash') {
      if (!crash || crash.busted || crash.cashed) return;
      clearInterval(window._radarTimer);
      const gain = Math.round(gBet * crash.mult);
      crash.cashed = true;
      crash.wonAmt = gain;
      S.cash += gain;
      sfxWin(crash.mult >= 2.0);
      save(); render();
      toast('Успешный отрыв на ×' + crash.mult.toFixed(2) + '! Выигрыш: +' + money(gain));
      return;
    }
    
    
    if (a === 'daily_bonus') {
      const now = Date.now();
      const left = ((S.lastDaily || 0) + 43200000) - now;
      if (left > 0) {
        noMoney(0, btn);
        toast('Премия уже получена · следующая через ' + fmtCountdown(left), true);
        return;
      }
      S.lastDaily = now; S.cash += 25000; S.free = (S.free || 0) + 1;
      sfxWin(true); save(); render();
      toast('Премия МРЭО получена: +25 000 ₽ и +1 талон!'); return;
    }
    if (a === 'refresh_hot') {
      if (S.cash < 10000) { noMoney(10000, btn); return; }
      S.cash -= 10000;
      S.hotOffers = [make(true), makeByTier('epic')];
      save(); render(); return;
    }
    
    if (a === 'buy_talons') {
      const price = 39000;
      if (S.cash < price) { noMoney(price, btn); return; }
      const srcRect = btn.getBoundingClientRect();
      S.cash -= price;
      S.free = (S.free || 0) + 5;
      sfxWin(true);
      haptic('success');
      toast('Зачислено +5 талонов МРЭО!');
      save(); render();

      requestAnimationFrame(() => {
        const card = $('.hot-bundle-card');
        if (card) {
          card.classList.remove('talon-burst');
          void card.offsetWidth;
          card.classList.add('talon-burst');
        }
        const targetPill = document.querySelector('.stat-pill');
        const dstRect = targetPill
          ? targetPill.getBoundingClientRect()
          : { left: window.innerWidth * 0.3, top: 110, width: 80, height: 30 };

        const startX = srcRect.left + srcRect.width / 2 - 17;
        const startY = srcRect.top + srcRect.height / 2 - 11;
        const endX = dstRect.left + dstRect.width / 2 - 17;
        const endY = dstRect.top + dstRect.height / 2 - 11;

        for (let i = 0; i < 5; i++) {
          const el = document.createElement('div');
          el.className = 'flying-talon-vfx';
          el.innerHTML = '<svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round"><path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1.5a1.5 1.5 0 0 0 0 3V15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1.5a1.5 1.5 0 0 0 0-3V9z"/></svg>';
          el.style.left = startX + 'px';
          el.style.top = startY + 'px';
          el.style.opacity = '0';
          document.body.appendChild(el);

          const spreadX = (i - 2) * 26;
          const arcY = -36 - Math.abs(i - 2) * 10;
          const delay = i * 85;

          const anim = el.animate([
            { transform: 'translate3d(0, 0, 0) scale(0.5) rotate(0deg)', opacity: 0 },
            { transform: 'translate3d(' + spreadX + 'px, ' + arcY + 'px, 0) scale(1.15) rotate(' + ((i - 2) * 14) + 'deg)', opacity: 1, offset: 0.28 },
            { transform: 'translate3d(' + (endX - startX) + 'px, ' + (endY - startY) + 'px, 0) scale(0.65) rotate(0deg)', opacity: 0.9 }
          ], {
            duration: 1050,
            delay: delay,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
            fill: 'forwards'
          });

          anim.onfinish = () => {
            el.remove();
            haptic('light');
            if (i === 4 && targetPill) {
              targetPill.classList.remove('talon-pop');
              void targetPill.offsetWidth;
              targetPill.classList.add('talon-pop');
            }
          };
        }
      });
      return;
    }

if (a === 'close') { modal = null; modalData = null; render(); return; }
if (a === 'c_flt') { carFilter = v; renderModal(); return; }
if (a === 'g_sort') { garageSort = v; render(); return; }
if (a === 'sell_common') {
const keep = [], sold = [];
S.plates.forEach((p) => (p.rar === 'common' && p.id !== S.carPlateId ? sold : keep).push(p));
if (sold.length === 0) { toast('Нет свободных обычных номеров'); return; }
const gain = sold.reduce((acc, p) => acc + Math.round(p.val * 0.75), 0);
S.plates = keep; S.cash += gain; save(); render();
toast('Продано ' + sold.length + ' обычных на ' + money(gain)); return;
}
    if (a === 'claim_q') {
      if (!S.claimedQ) S.claimedQ = {};
      if (S.claimedQ[v]) return;
      S.claimedQ[v] = true;
      const st = S.qStage || 1;
      if (v === 'q_roll5' || v === 's1_roll') { S.cash += 20000; S.free = (S.free || 0) + 1; toast('Награда получена: +20 000 ₽ и +1 талон!'); }
      else if (v === 'q_mount' || v === 's1_mount') { S.cash += 15000; S.gems = (S.gems || 0) + 3; toast('Награда получена: +15 000 ₽ и +3 ◈!'); }
      else if (v === 'q_rare' || v === 's1_rare') { S.cash += 35000; S.xp = (S.xp || 0) + 100; toast('Награда получена: +35 000 ₽ и +100 XP!'); }
      else if (v.endsWith('_roll')) { const g = st * 45000; S.cash += g; S.free = (S.free || 0) + 2; toast('Награда получена: +' + money(g) + ' и +2 талона!'); }
      else if (v.endsWith('_park')) { const g = st * 35000; S.cash += g; S.gems = (S.gems || 0) + 5; toast('Награда получена: +' + money(g) + ' и +5 ◈!'); }
      else { const g = st * 75000; S.cash += g; S.xp = (S.xp || 0) + 250; toast('Награда получена: +' + money(g) + ' и +250 XP!'); }
      sfxWin(true); save(); render(); return;
    }
    if (a === 'next_q_stage') {
      S.qStage = (S.qStage || 1) + 1;
      sfxWin(false); save(); render();
      toast('Открыт Этап ' + S.qStage + ' госзаданий МРЭО!'); return;
    }
    if (a === 'daily_bonus') {
      const now = Date.now();
      const left = ((S.lastDaily || 0) + 43200000) - now;
      if (left > 0) {
        noMoney(0, btn);
        toast('Премия уже получена · следующая через ' + fmtCountdown(left), true);
        return;
      }
      S.lastDaily = now; S.cash += 25000; S.free = (S.free || 0) + 1;
      sfxWin(true); save(); render();
      toast('Премия МРЭО получена: +25 000 ₽ и +1 талон!'); return;
    }
    if (a === 'toggle_cfg') {
if (!S.cfg) S.cfg = { light: false, sound: true, vibro: true, ultra: true, turbo: false, anon: false };
S.cfg[v] = !S.cfg[v]; applyCfg(); save(); render(); return;
}
if (a === 'roll') {
      if (rolling) return;
      const cost = 10000;
      if ((S.free || 0) > 0) {
        S.free--;
      } else if (S.cash >= cost) {
        S.cash -= cost;
      } else {
        noMoney(cost, btn);
        return;
      }
      rolling = true;
      lastRolled = null;
      const won = make(false);
      rollStrip = [make(false)];
save(); render();
const steps = new Array(12,12,12,12,12,13,13,13,13,14,14,14,14,15,15,15,16,16,17,18,19,20,22,24,26,28,32,36,42,50,60,75,95,120);
let stepIdx = 0;
const tickShuffle = () => {
if (!rolling) return;
if (stepIdx < steps.length) {
const fakePl = make(false);
rollStrip = [fakePl];
const slotEl = $('#terminal-plate-slot');
if (slotEl) slotEl.innerHTML = plate(fakePl);
haptic('light');
playTone(420 + stepIdx * 28, 0.035, 'sine', 0.03);
const delay = steps.at(stepIdx);
stepIdx++;
setTimeout(tickShuffle, delay);
} else {
rolling = false;
rollStrip = null;
lastRolled = won;
          S.lastTerminalPlate = won;
if (!S.stats) S.stats = { rolled: 0 };
S.stats.rolled = (S.stats.rolled || 0) + 1;
S.xp = (S.xp || 0) + 15;
sfxWin(won.rar === 'legendary' || won.rar === 'epic');
if (won.ser || won.rar === 'legendary' || mediaInfo(won)) { modal = 'won_special'; modalData = won; }
save(); render();
}
};
setTimeout(tickShuffle, 60);
return;
}
if (a === 'roll_sell' && lastRolled) {
const gain = Math.round(lastRolled.val * 0.7);
S.cash += gain; lastRolled = null; save(); render();
toast('Продано за ' + money(gain)); return;
}
if (a === 'roll_keep' && lastRolled) {
S.plates.unshift(lastRolled);
if (!S.carPlateId) S.carPlateId = lastRolled.id;
lastRolled = null; save(); render();
toast('Номер отправлен в Гараж'); return;
}
if (a === 'case_info') { modal = 'case_info'; modalData = v; render(); return; }
    if (a === 'open_archive') { archiveTab = 'gov'; modal = 'archive'; render(); return; }
    if (btn.dataset.a === 'open_media_archive') { archiveTab = 'media'; modal = 'archive'; render(); return; }
    if (btn.dataset.a === 'media_info') { modal = 'media_info'; modalData = btn.dataset.v; render(); return; }

    if (a === 'ser_info') { modal = 'ser_info'; modalData = v; render(); return; }

    if (a === 'cars') { modal = 'cars'; render(); return; }
if (a === 'buy_car') {
const c = CARS.find((x) => x.id === v);
if (!c || S.cars.includes(c.id)) return;
if (S.cash < c.price) { noMoney(c.price, btn); return; }
S.cash -= c.price; S.cars.push(c.id); S.activeCar = c.id;
save(); render(); toast('Куплен ' + c.name); return;
}
if (a === 'pick_car') { S.activeCar = v; save(); render(); return; }
        if (a === 'tune_car') {
const cid = S.activeCar;
if (!cid) return;
if (!S.carTune) S.carTune = {};
const lvl = S.carTune[cid] || 0;
if (lvl >= 3) return;
const cost = 45000 * (lvl + 1);
if (S.cash < cost) { noMoney(cost, btn); return; }
S.cash -= cost;
S.carTune[cid] = lvl + 1;
sfxWin(true); save(); render();
toast('Установлен тюнинг-пакет Stage ' + S.carTune[cid] + '!'); return;
}
    if (a === 'car_color') { S.carColor = v; save(); render(); return; }
if (a === 'car_cruise') {
const left = (S.nextCruise || 0) - Date.now();
if (left > 0) { toast('Автомобиль отдыхает · выезд через ' + fmtCountdown(left), true); return; }
const mounted = S.plates.find((p) => p.id === S.carPlateId) || null;
const totalParkMult = 1 + S.cars.reduce((acc, id) => {
const c = CARS.find((x) => x.id === id);
return acc + (c ? (c.mult - 1) * 0.45 : 0);
}, 0);
const gain = Math.round(((mounted ? mounted.val : 15000) * 0.08 + 12000) * totalParkMult);
S.cash += gain;
S.xp = (S.xp || 0) + 35;
S.nextCruise = Date.now() + 2 * 3600 * 1000;
sfxWin(false); save(); render();
toast('Выезд в город завершён! Премия за статус: +' + money(gain)); return;
}

if (a === 'mount') { S.carPlateId = v; save(); render(); toast('Номер установлен на авто'); return; }
if (a === 'unmount') { S.carPlateId = null; save(); render(); return; }
if (a === 'sell_one') {
const idx = S.plates.findIndex((x) => x.id === v);
if (idx === -1) return;
const gain = Math.round(S.plates[idx].val * 0.75);
if (S.carPlateId === v) S.carPlateId = null;
S.plates.splice(idx, 1); S.cash += gain; save(); render();
toast('Продано за ' + money(gain)); return;
}
if (a === 'craft_sel') { craftPid = v; render(); return; }
    if (a === 'polish_plate') {
      const idx = S.plates.findIndex((x) => x.id === craftPid);
      if (idx === -1) return;
      const p = S.plates.at(idx);
      const plvl = p.polish || 0;
      if (plvl >= 3) return;
      const cost = 30000 * (plvl + 1);
      if (S.cash < cost) { noMoney(cost, btn); return; }
      S.cash -= cost;
      p.polish = plvl + 1;
      p.val = Math.round((p.val * 1.15) / 100) * 100;
      sfxWin(false); save(); render(); toast('Полировка ГОСТ (' + p.polish + '/3): цена выросла на +15%!'); return;
    }
    if (a === 'order_digits') {
      if (S.cash < 85000) { noMoney(85000, btn); return; }
      S.cash -= 85000;
      const ord = makeByTier('rare');
      S.plates.unshift(ord); craftPid = ord.id;
      sfxWin(true); save(); render(); toast('Спецзаказ выполнен: ' + ord.f + ord.d + ord.t + ' ' + ord.reg + '!'); return;
    }
    if (a === 'order_spec') {
      if (S.cash < 140000) { noMoney(140000, btn); return; }
      S.cash -= 140000;
      const ord = makeByTier(Math.random() < 0.45 ? 'legendary' : 'epic');
      S.plates.unshift(ord); craftPid = ord.id;
      sfxWin(true); save(); render(); toast('Из архива выдан: ' + ord.f + ord.d + ord.t + ' ' + ord.reg + '!'); return;
    }

if (a === 'reroll_letters') {
const idx = S.plates.findIndex((x) => x.id === craftPid);
if (idx === -1) return;
if (S.cash < 35000) { noMoney(35000, btn); return; }
S.cash -= 35000;
const p = S.plates[idx];
if (Math.random() < 0.25) { const sr = pick(SERIES); p.f = sr.f; p.t = sr.t; }
else { p.f = pick(LETTERS); p.t = pick(LETTERS) + pick(LETTERS); }
S.plates[idx] = value(p);
save(); render(); toast('Буквы перебиты: ' + S.plates[idx].f + S.plates[idx].d + S.plates[idx].t); return;
}
if (a === 'reroll_digits') {
const idx = S.plates.findIndex((x) => x.id === craftPid);
if (idx === -1) return;
if (S.cash < 25000) { noMoney(25000, btn); return; }
S.cash -= 25000;
const p = S.plates[idx];
const pool = ['001','007','111','222','333','555','777','888','999','100','500'];
p.d = Math.random() < 0.35 ? pick(pool) : String(1 + Math.floor(Math.random() * 999)).padStart(3, '0');
S.plates[idx] = value(p);
save(); render(); toast('Цифры перебиты: ' + S.plates[idx].d); return;
}
if (a === 'reroll_reg') {
const idx = S.plates.findIndex((x) => x.id === craftPid);
if (idx === -1) return;
if (S.cash < 45000) { noMoney(45000, btn); return; }
S.cash -= 45000;
const p = S.plates[idx];
p.reg = pick(['77','97','99','177','777','78','98','95']);
S.plates[idx] = value(p);
save(); render(); toast('Присвоен спецрегион: ' + S.plates[idx].reg); return;
}
if (a === 'up_link') {
      const cost = 40000 * Math.pow(2, S.linkLvl || 0);
      if (S.cash < cost) { noMoney(cost, btn); return; }
      S.cash -= cost; S.linkLvl = (S.linkLvl || 0) + 1;
      sfxWin(false); save(); render();
      toast('Связи повышены до уровня ' + S.linkLvl + '!'); return;
    }

    if (a === 'fuse_pick') {
const i = fuseSel.indexOf(v);
if (i !== -1) fuseSel.splice(i, 1);
else if (fuseSel.length < 3) fuseSel.push(v);
render(); return;
}
if (a === 'fuse3') {
if (S.plates.length < 3) return;
if (fuseSel.length === 3) {
S.plates = S.plates.filter((x) => !fuseSel.includes(x.id));
fuseSel = [];
} else {
S.plates.sort((x, y) => x.val - y.val);
S.plates.splice(0, 3);
}
const res = makeByTier(Math.random() < 0.4 ? 'legendary' : 'epic');
S.plates.unshift(res); craftPid = res.id; save(); render();
toast('Переплавлено в ' + res.f + res.d + res.t + ' ' + res.reg); return;
}
if (a === 'buy_frame') {
const idx = S.plates.findIndex((x) => x.id === craftPid);
const fr = FRAMES.find((x) => x.id === v);
if (idx === -1 || !fr) return;
if (S.cash < fr.price) { noMoney(fr.price, btn); return; }
S.cash -= fr.price; S.plates[idx].frame = fr.id;
S.plates[idx] = value(S.plates[idx]); save(); render();
toast('Установлена рамка: ' + fr.name); return;
}
    if (a === 'mkt_tab') { mktTab = v; render(); return; }
    if (a === 'mkt_sort') { mktSort = mktSort === 'asc' ? 'desc' : 'asc'; render(); return; }
    if (a === 'mkt_mult') { sellPriceMult = Number(v); render(); return; }
    if (a === 'fulfill_order') {
      const parts = String(v).split(':');
      const pid = parts.at(0), mult = Number(parts.at(1) || 1.3);
      const idx = S.plates.findIndex((x) => x.id === pid);
      if (idx === -1) return;
      const pl = S.plates.at(idx);
      const gain = Math.round(pl.val * mult);
      S.plates.splice(idx, 1);
      S.cash += gain;
      sfxWin(true); save(); render(); toast('Заказ выполнен! Выручка: +' + money(gain)); return;
    }

    if (a === 'mkt_flt') { mktFilter = v; render(); return; }
    if (a === 'mkt_list') {
      const idx = S.plates.findIndex((x) => x.id === v);
      if (idx === -1) return;
      const pl = S.plates.at(idx);
      S.plates.splice(idx, 1);
      if (!S.myListings) S.myListings = [];
      S.myListings.unshift({ plate: pl, ask: Math.round(pl.val * sellPriceMult) });
      save(); render(); toast('Лот выставлен на биржу за ' + money(Math.round(pl.val * sellPriceMult))); return;
    }
    if (a === 'mkt_instant_sell') {
      const idx = Number(v);
      const item = (S.myListings || []).at(idx);
      if (!item) return;
      const gain = Math.round(item.ask * 0.88);
      S.cash += gain;
      S.myListings.splice(idx, 1);
      sfxWin(true); save(); render(); toast('Сделка закрыта! Получено ' + money(gain)); return;
    }
    if (a === 'mkt_cancel') {
      const idx = Number(v);
      const item = (S.myListings || []).at(idx);
      if (!item) return;
      S.plates.unshift(item.plate);
      S.myListings.splice(idx, 1);
      save(); render(); toast('Лот снят с продажи и возвращён в Гараж'); return;
    }
    if (a === 'refresh_mkt') {
if (S.cash < 15000) { noMoney(15000, btn); return; }
S.cash -= 15000;
S.market = buildUniqueMarketLots();
save(); render(); return;
}
    if (a === 'haggle_lot') {
      const idx = Number(v);
      const lot = S.market.at(idx);
      if (!lot || lot.haggled !== 0) return;
      if (Math.random() < 0.55) {
        lot.haggled = 1;
        sfxWin(false); save(); render();
        toast('Продавец ' + (lot.seller || '') + ' согласился на скидку 15%!');
      } else {
        lot.haggled = -1;
        save(); render();
        toast('Продавец отказался скидывать цену', true);
      }
      return;
    }
    if (a === 'buy_lot') {
const idx = Number(v);
const lot = S.market[idx];
if (!lot) return;
const baseAsk = Math.round(lot.val * (lot.hotDeal ? 0.96 : 1.15)); const ask = lot.haggled === 1 ? Math.round(baseAsk * 0.85) : baseAsk;
if (S.cash < ask) { noMoney(ask, btn); return; }
S.cash -= ask; S.plates.unshift(lot); S.market.splice(idx, 1);
save(); render(); toast('Лот выкуплен в гараж'); return;
}
if (a === 'spin_wheel' || a === 'spin_wheel_free') {
      if (wheelSpin) return;
      if (a === 'spin_wheel_free') {
        const left = (S.nextFreeWheel || 0) - Date.now();
        if (left > 0) {
          toast('Бесплатный прокрут откроется в ' + new Date(S.nextFreeWheel).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }), true);
          return;
        }
        S.nextFreeWheel = Date.now() + 4 * 3600 * 1000;
      } else {
        if (S.cash < 100000) { noMoney(100000, btn); return; }
        S.cash -= 100000;
      }
      wheelSpin = true;
      const pity = (S.wheelPity || 0) % 5;
      const sector = pity === 4 ? (Math.random() < 0.55 ? 4 : 2) : Math.floor(Math.random() * 6);
      S.wheelPity = (S.wheelPity || 0) + 1;
      const targetCenter = sector * 60 + 30;
      const curMod = ((wheelDeg % 360) + 360) % 360;
      const delta = (360 - targetCenter - curMod + 360) % 360;
      const nextDeg = wheelDeg + 1440 + delta;
      save(); render();
      requestAnimationFrame(() => {
        const disk = $('.wheel-disk');
        if (disk) {
          disk.style.transition = 'none';
          disk.style.transform = 'rotate(' + wheelDeg + 'deg)';
          disk.getBoundingClientRect();
          disk.style.transition = 'transform 5.2s cubic-bezier(0.1, 0.92, 0.2, 1)';
          disk.style.transform = 'rotate(' + nextDeg + 'deg)';
        }
        wheelDeg = nextDeg;
      });
      setTimeout(() => {
        wheelSpin = false;
        if (!S.wheelHist) S.wheelHist = [];
        let logTxt = '';
        if (sector === 0) { S.cash += 40000; logTxt = '+40 000 ₽'; toast('Выигрыш: 40 000 ₽'); }
        else if (sector === 1) { S.free = (S.free || 0) + 2; logTxt = '+2 талона МРЭО'; toast('Выигрыш: +2 талона МРЭО'); }
        else if (sector === 2) { S.cash += 250000; logTxt = '+250 000 ₽'; toast('Суперприз: 250 000 ₽!'); }
        else if (sector === 3) { S.gems = (S.gems || 0) + 5; logTxt = '+5 ◈ Кристаллов'; toast('Выигрыш: +5 ◈ Кристаллов'); }
        else if (sector === 4) { const sp = make(true); S.plates.unshift(sp); logTxt = '★ ' + sp.f + sp.d + sp.t + ' ' + sp.reg; modal = 'won_special'; modalData = sp; }
        else { S.cash += 120000; logTxt = '+120 000 ₽'; toast('Выигрыш: 120 000 ₽!'); }
        S.wheelHist.unshift(logTxt);
        if (S.wheelHist.length > 6) S.wheelHist.pop();
        sfxWin(sector === 4 || sector === 2); save(); render();
      }, 3750);
      return;
    }

    if (a === 'coin_flip') {
      if (!syncCustomBet()) { render(); return; }
      if (!syncCustomBet()) { render(); return; }
if (S.cash < gBet) { noMoney(gBet, btn); return; }
S.cash -= gBet;
coinSpin = true;
const res = Math.random() < 0.5 ? 'orel' : 'reshka';
if (res === v) {
const win = Math.round(gBet * 1.95);
S.cash += win;
lastCoin = { side: res, msg: 'Победа! Выпал' + (res === 'orel' ? ' Орёл' : 'а Решка') + ' · +' + money(win) };
sfxWin(false);
} else {
lastCoin = { side: res, msg: 'Не повезло! Выпал' + (res === 'orel' ? ' Орёл' : 'а Решка') };
}
save(); render();
setTimeout(() => { coinSpin = false; render(); }, 920);
return;
}

    
    
    
}
function init() {
applyCfg();
try {
const wa = window.Telegram?.WebApp;
if (wa) {
wa.ready(); wa.expand();
const u = wa.initDataUnsafe?.user;
if (u) {
me.id = String(u.id);
me.username = u.username ? '@' + u.username : '';
me.name = [u.first_name, u.last_name].filter(Boolean).join(' ') || me.username || 'Игрок';
me.isTg = true;
}
}
} catch (e) {}
document.addEventListener('click', handle);
render();
setInterval(() => {
liveIdx++;
const el = $('#live-ticker');
if (el) el.innerHTML = LIVE_FEED[liveIdx % LIVE_FEED.length];
}, 5500);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
})();


/* === DIRECT_CAPTURE_HOT_FLY_120FPS === */
(function() {
  function launchExactSvgPlateToGarage(srcRect, innerSvgHtml) {
    const garageBtn = document.querySelector('[data-v="garage"]') || document.querySelectorAll('.dock-item')[1];
    const dstRect = garageBtn
      ? garageBtn.getBoundingClientRect()
      : { left: window.innerWidth * 0.28, top: window.innerHeight - 44, width: 48, height: 48 };

    const fly = document.createElement('div');
    fly.style.cssText = [
      'position:fixed',
      'left:' + srcRect.left + 'px',
      'top:' + srcRect.top + 'px',
      'width:' + srcRect.width + 'px',
      'height:' + srcRect.height + 'px',
      'z-index:2147483647',
      'pointer-events:none',
      'border-radius:7px',
      'box-shadow:0 16px 34px rgba(0,0,0,0.65),0 0 24px rgba(251,191,36,0.85)',
      'will-change:transform,opacity'
    ].join(';');
    fly.innerHTML = innerSvgHtml;
    document.documentElement.appendChild(fly);

    const dx = (dstRect.left + dstRect.width / 2) - (srcRect.left + srcRect.width / 2);
    const dy = (dstRect.top + dstRect.height / 2) - (srcRect.top + srcRect.height / 2);

    const anim = fly.animate([
      { transform: 'translate3d(0, 0, 0) scale3d(1, 1, 1)', opacity: 1 },
      { transform: 'translate3d(0, -28px, 0) scale3d(1.18, 1.18, 1)', opacity: 1, offset: 0.24 },
      { transform: 'translate3d(' + (dx * 0.12).toFixed(1) + 'px, -32px, 0) scale3d(1.15, 1.15, 1)', opacity: 1, offset: 0.42 },
      { transform: 'translate3d(' + (dx * 0.72).toFixed(1) + 'px, ' + (dy * 0.62).toFixed(1) + 'px, 0) scale3d(0.52, 0.52, 1)', opacity: 0.96, offset: 0.8 },
      { transform: 'translate3d(' + dx.toFixed(1) + 'px, ' + dy.toFixed(1) + 'px, 0) scale3d(0.14, 0.14, 1)', opacity: 0 }
    ], {
      duration: 980,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'forwards'
    });

    anim.onfinish = function() {
      fly.remove();
      if (garageBtn) {
        garageBtn.classList.remove('garage-catch');
        void garageBtn.offsetWidth;
        garageBtn.classList.add('garage-catch');
      }
    };
  }

  document.addEventListener('pointerdown', function(ev) {
    const btn = ev.target && ev.target.closest ? ev.target.closest('.hot-deal-card [data-a]') : null;
    if (!btn || btn.classList.contains('cant-afford')) return;
    const card = btn.closest('.hot-deal-card');
    const plateBox = card ? card.querySelector('.plate') : null;
    if (!plateBox) return;
    const snap = plateBox.getBoundingClientRect();
    const svgSnap = plateBox.innerHTML;
    const idx = Number(btn.dataset.v || 0);

    setTimeout(function() {
      launchExactSvgPlateToGarage(snap, svgSnap);
      const cards = document.querySelectorAll('.hot-deal-card');
      if (cards[idx]) {
        cards[idx].classList.remove('new-lot-in');
        void cards[idx].offsetWidth;
        cards[idx].classList.add('new-lot-in');
      }
    }, 30);
  }, true);
})();



/* === WINDOW_CAPTURE_DOCK_TAP_V15 === */
(function() {
  const tabKeys = ['roll', 'garage', 'craft', 'market', 'wheel', 'games', 'profile'];
  let sx = 0, sy = 0, inDock = false;

  window.addEventListener('pointerdown', function(e) {
    const nav = document.querySelector('#nav, #tabs, nav, .liquid-dock');
    if (!nav) return;
    const r = nav.getBoundingClientRect();
    if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
      inDock = true;
      sx = e.clientX;
      sy = e.clientY;
    } else {
      inDock = false;
    }
  }, true);

  window.addEventListener('pointerup', function(e) {
    if (!inDock) return;
    inDock = false;
    if (Math.abs(e.clientX - sx) <= 10 && Math.abs(e.clientY - sy) <= 10) {
      const nav = document.querySelector('#nav, #tabs, nav, .liquid-dock');
      if (!nav) return;
      const r = nav.getBoundingClientRect();
      const idx = Math.max(0, Math.min(tabKeys.length - 1, Math.floor((sx - r.left) / (r.width / tabKeys.length))));
      if (typeof window.__mreoGoTab === 'function') {
        window.__mreoGoTab(tabKeys[idx]);
      }
    }
  }, true);
})();

/* === GARAGE_STAGE_TUNING_VFX_HOOK === */
(function() {
  let lastStageClickTs = 0;

  function playStageUpgradeVfx(btnRect, stageNum) {
    const podium = document.querySelector('.garage-podium, .car-podium, .podium-box, .hero');
    const carSvgEl = podium ? podium.querySelector('svg') : null;

    if (podium) {
      podium.classList.remove('stage-upgrading');
      void podium.offsetWidth;
      podium.classList.add('stage-upgrading');
    }
    if (carSvgEl) {
      carSvgEl.classList.remove('car-stage-bounce');
      void carSvgEl.offsetWidth;
      carSvgEl.classList.add('car-stage-bounce');
    }

    const anchor = carSvgEl ? carSvgEl.getBoundingClientRect() : btnRect;
    const badge = document.createElement('div');
    badge.className = 'stage-float-badge';
    badge.textContent = 'STAGE ' + stageNum + ' УСТАНОВЛЕН · +' + (stageNum * 25) + '% К ПРОХВАТУ';
    badge.style.left = Math.round(anchor.left + anchor.width / 2) + 'px';
    badge.style.top = Math.round(anchor.top + anchor.height * 0.35) + 'px';
    badge.style.transform = 'translate3d(-50%, 0, 0) scale3d(0.7, 0.7, 1)';
    document.documentElement.appendChild(badge);

    const anim = badge.animate([
      { transform: 'translate3d(-50%, 10px, 0) scale3d(0.7, 0.7, 1)', opacity: 0 },
      { transform: 'translate3d(-50%, -14px, 0) scale3d(1.06, 1.06, 1)', opacity: 1, offset: 0.22 },
      { transform: 'translate3d(-50%, -26px, 0) scale3d(1, 1, 1)', opacity: 1, offset: 0.72 },
      { transform: 'translate3d(-50%, -46px, 0) scale3d(0.92, 0.92, 1)', opacity: 0 }
    ], {
      duration: 1250,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'forwards'
    });
    anim.onfinish = function() { badge.remove(); };
  }

  document.addEventListener('click', function(ev) {
    const btn = ev.target && ev.target.closest ? ev.target.closest('[data-a]') : null;
    if (!btn) return;
    const act = btn.dataset.a || '';
    if (act.indexOf('tune') === -1 && act.indexOf('stage') === -1 && act.indexOf('upg') === -1) return;

    const now = Date.now();
    if (now - lastStageClickTs < 480) {
      ev.preventDefault();
      ev.stopImmediatePropagation();
      return;
    }
    lastStageClickTs = now;

    const btnRect = btn.getBoundingClientRect();
    const txt = btn.textContent || '';
    const m = txt.match(/Stage\s*([1-3])/i);
    const nextStage = m ? Number(m[1]) : 1;

    requestAnimationFrame(function() {
      playStageUpgradeVfx(btnRect, nextStage);
    });
  }, true);
})();

/* === PROFILE_RANK_INFO_DOM_HOOK === */
(function() {
  function injectRankBtn() {
    if (document.querySelector('[data-a="rank_info"]')) return;
    const cards = document.querySelectorAll('#view .hero, #view .panel, #view section');
    for (const card of cards) {
      if (card.textContent && card.textContent.includes('Уровень ') && card.textContent.includes('Автопарк')) {
        const titleEl = card.querySelector('h2, h3');
        if (titleEl && !titleEl.querySelector('[data-a="rank_info"]')) {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'case-info-btn';
          btn.dataset.a = 'rank_info';
          btn.textContent = 'i';
          btn.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;margin-left:8px;vertical-align:middle;border-radius:50%;font-size:11px;font-weight:900;cursor:pointer;';
          titleEl.appendChild(btn);
        }
        break;
      }
    }
  }
  const obs = new MutationObserver(injectRankBtn);
  window.addEventListener('DOMContentLoaded', () => {
    const v = document.getElementById('view');
    if (v) obs.observe(v, { childList: true, subtree: true });
    injectRankBtn();
  });
  setInterval(injectRankBtn, 300);
})();




/* === CASE_ROULETTE_TICK_SOUND_120FPS === */
(function() {
  function unlockAudio() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!window.__mreoAudioCtx) window.__mreoAudioCtx = new AC();
      if (window.__mreoAudioCtx.state === 'suspended') window.__mreoAudioCtx.resume();
    } catch (_) {}
  }
  window.addEventListener('pointerdown', unlockAudio, { passive: true, capture: true });

  let lastCenterSlot = null;

  function watchRouletteCenter() {
    const slots = document.querySelectorAll('.roulette-slot');
    if (slots.length > 0) {
      const centerX = window.innerWidth / 2;
      for (let i = 0; i < slots.length; i++) {
        const el = slots[i];
        const r = el.getBoundingClientRect();
        if (r.width > 10 && r.left <= centerX && r.right >= centerX) {
          if (lastCenterSlot && lastCenterSlot !== el) {
            if (typeof window.playCaseClickSfx === 'function') window.playCaseClickSfx();
            try {
              const hf = window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback;
              if (hf && hf.selectionChanged) hf.selectionChanged();
            } catch (_) {}
          }
          lastCenterSlot = el;
          break;
        }
      }
    } else {
      lastCenterSlot = null;
    }
    requestAnimationFrame(watchRouletteCenter);
  }
  requestAnimationFrame(watchRouletteCenter);
})();

/* === EXPANDED_MEDIA_LEGENDS_AND_SPEC_SERIES_V1 === */
(function() {
  window.__MREO_EXTRA_MEDIA = [
    { pl: 'А 777 УЕ 77', owner: 'Эрик Давидыч · Smotra', car: 'BMW X5M «Тень» (850 л.с.)', info: 'Один из самых узнаваемых номеров автоблогинга СНГ, ставший символом ночных прохватов по Москве.', price: '4 800 000 ₽' },
    { pl: 'В 001 ОР 77', owner: 'Михаил Литвин', car: 'BMW M5 CS / Porsche Taycan', info: 'Культовый первый номер с серией ВОР 77, многократно мелькавший в резонансных автопроектах.', price: '6 500 000 ₽' },
    { pl: 'О 777 ОО 95', owner: 'Асхаб Тамаев', car: 'Lamborghini Urus / Ferrari', info: 'Три семёрки на три Ольги 95-го региона — эталон статуса среди медийных владельцев суперкаров.', price: '7 200 000 ₽' },
    { pl: 'М 001 ММ 77', owner: 'Константин AcademeG', car: 'ЗИЛ-600 сил / Range Rover', info: 'Именной первый номер серии МММ на легендарных инженерных проектах и кастом-внедорожниках.', price: '4 200 000 ₽' },
    { pl: 'Х 001 АМ 77', owner: 'Валентин Wylsacom', car: 'Mercedes-AMG G63', info: 'Редкое сочетание серии ХАМ с первым номером 001 на классическом Гелендвагене.', price: '5 400 000 ₽' },
    { pl: 'С 001 СС 77', owner: 'Гусейн Гасанов', car: 'Rolls-Royce Cullinan', info: 'Три Семёна с первой цифрой 001 — строгая классика для представительских люкс-кроссоверов.', price: '6 900 000 ₽' },
    { pl: 'К 777 КК 77', owner: 'Тимати · Black Star', car: 'Lamborghini Aventador SVJ', info: 'Абсолютный фулл-хаус из семёрок и букв К на флагманском V12-суперкаре в центре столицы.', price: '9 500 000 ₽' },
    { pl: 'Н 001 НН 77', owner: 'Дима Гордей', car: 'Nissan GT-R R35 «Годзилла»', info: 'Легендарный номер с дрифт- и драг-проектов, хорошо знакомый фанатам тюнинг-культуры.', price: '3 900 000 ₽' },
    { pl: 'У 001 УУ 77', owner: 'Subo · Медиа-парк', car: 'Mercedes-AMG GT 63 S', info: 'Эффектный номер с тремя Ульянами 001, ставший визитной карточкой медийных кортежей.', price: '4 600 000 ₽' },
    { pl: 'Е 001 КХ 77', owner: 'Джиган · VIP-гараж', car: 'Mercedes-Maybach S680', info: 'Знаменитая серия ЕКХ с номером 001 на флагманском седане представительского класса.', price: '8 400 000 ₽' }
  ];

  window.__MREO_EXTRA_SERIES = [
    { code: 'А 001 МР 97', dept: 'Администрация Президента и Правительство РФ', desc: 'Главная правительственная серия России. Выдаётся высшим должностным лицам, министрам, губернаторам и руководству силовых ведомств.', rarity: 'Мифическая (x4.5 к цене)' },
    { code: 'Е 001 КХ 77', dept: 'ФСО России (Федеральная служба охраны)', desc: 'Легендарная серия спецтранспорта охраны первых лиц государства и машин сопровождения кортежей.', rarity: 'Легендарная (x3.8 к цене)' },
    { code: 'К 001 РА 95', dept: 'Аппарат Главы Чеченской Республики', desc: 'Высшая ведомственная серия 95-го региона, закреплённая за руководством республики и спецподразделениями.', rarity: 'Легендарная (x3.6 к цене)' },
    { code: 'О 001 ОО 77', dept: 'Управление делами Президента и ФСБ', desc: 'Историческая серия «Три Ольги», берущая начало от спецгаражей советского и российского руководства.', rarity: 'Эпическая (x3.0 к цене)' },
    { code: 'С 001 СС 77', dept: 'Спецсвязь, МИД и Фельдъегерская служба', desc: 'Ведомственные автомобили дипломатической и государственной фельдъегерской связи.', rarity: 'Эпическая (x2.8 к цене)' },
    { code: 'М 001 МР 77', dept: 'Центральный аппарат МВД России', desc: 'Служебный и оперативный автопарк руководства Министерства внутренних дел Российской Федерации.', rarity: 'Эпическая (x2.7 к цене)' },
    { code: 'В 001 МР 77', dept: 'Министерство обороны и ВАИ РФ', desc: 'Спецсерия командования Вооружённых Сил и Военной автомобильной инспекции.', rarity: 'Редкая (x2.5 к цене)' },
    { code: 'Р 001 МР 77', dept: 'Генеральная прокуратура и Минюст РФ', desc: 'Ведомственная серия органов прокуратуры, следственных структур и Министерства юстиции.', rarity: 'Редкая (x2.4 к цене)' },
    { code: 'Х 001 КХ 77', dept: 'Служба внешней разведки (СВР РФ)', desc: 'Закрытая ведомственная серия оперативного транспорта службы внешней разведки.', rarity: 'Легендарная (x3.4 к цене)' },
    { code: 'А 001 АА 97', dept: 'Счётная палата и Федеральное Собрание', desc: 'Престижная серия «Три Анны» на 97-м московском регионе для высших государственных органов.', rarity: 'Эпическая (x2.9 к цене)' },
    { code: 'О 001 МР 77', dept: 'ГУ МВД России по г. Москве', desc: 'Оперативные подразделения столичного главка полиции и спецбатальонов ДПС.', rarity: 'Редкая (x2.3 к цене)' },
    { code: 'Т 001 МР 77', dept: 'Министерство транспорта и Росавиация', desc: 'Ведомственный автопарк руководства транспортного комплекса и авиационных служб.', rarity: 'Редкая (x2.2 к цене)' }
  ];

  document.addEventListener('click', function(ev) {
    const btn = ev.target && ev.target.closest ? ev.target.closest('#view button, #view .chip, #view [data-a]') : null;
    if (!btn) return;
    const txt = (btn.textContent || '').replace(/\s+/g, ' ').trim();
    const cleanCode = txt.replace(/\s+/g, '');

    const foundMedia = window.__MREO_EXTRA_MEDIA.find((m) => m.pl.replace(/\s+/g, '') === cleanCode || txt.includes(m.pl));
    const foundSer = window.__MREO_EXTRA_SERIES.find((sr) => sr.code.replace(/\s+/g, '').slice(0, 6) === cleanCode.slice(0, 6) || txt.includes(sr.code.slice(0, 5)));

    if (foundMedia || foundSer) {
      let box = document.getElementById('mreo-lore-dossier');
      if (!box) {
        box = document.createElement('div');
        box.id = 'mreo-lore-dossier';
        box.style.cssText = 'position:fixed;left:50%;bottom:88px;transform:translateX(-50%);width:min(92vw,420px);z-index:2147483640;padding:16px;border-radius:22px;background:rgba(15,20,32,0.95);backdrop-filter:blur(28px) saturate(180%);-webkit-backdrop-filter:blur(28px) saturate(180%);border:1px solid rgba(251,191,36,0.45);box-shadow:0 18px 44px rgba(0,0,0,0.65);color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif;';
        document.body.appendChild(box);
      }
      if (foundMedia) {
        box.innerHTML =
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">' +
            '<span style="font-size:11px;font-weight:800;letter-spacing:0.06em;color:#fbbf24;text-transform:uppercase">Медиа-легенда РФ</span>' +
            '<button type="button" onclick="this.closest(\'#mreo-lore-dossier\').remove()" style="background:rgba(255,255,255,0.1);border:none;color:#fff;width:24px;height:24px;border-radius:50%;cursor:pointer;font-weight:800">×</button>' +
          '</div>' +
          '<div style="font-size:18px;font-weight:900;margin-bottom:4px">' + foundMedia.pl + ' · ' + foundMedia.owner + '</div>' +
          '<div style="font-size:12.5px;color:#38bdf8;font-weight:700;margin-bottom:6px">Авто: ' + foundMedia.car + '</div>' +
          '<div style="font-size:12.5px;color:#cbd5e1;line-height:1.45;margin-bottom:8px">' + foundMedia.info + '</div>' +
          '<div style="font-size:12px;font-weight:800;color:#4ade80">Оценка коллекционеров: ' + foundMedia.price + '</div>';
      } else if (foundSer) {
        box.innerHTML =
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">' +
            '<span style="font-size:11px;font-weight:800;letter-spacing:0.06em;color:#fbbf24;text-transform:uppercase">Досье спецсерии РФ</span>' +
            '<button type="button" onclick="this.closest(\'#mreo-lore-dossier\').remove()" style="background:rgba(255,255,255,0.1);border:none;color:#fff;width:24px;height:24px;border-radius:50%;cursor:pointer;font-weight:800">×</button>' +
          '</div>' +
          '<div style="font-size:18px;font-weight:900;margin-bottom:4px">' + foundSer.code + '</div>' +
          '<div style="font-size:12.5px;color:#fbbf24;font-weight:700;margin-bottom:6px">' + foundSer.dept + '</div>' +
          '<div style="font-size:12.5px;color:#cbd5e1;line-height:1.45;margin-bottom:8px">' + foundSer.desc + '</div>' +
          '<div style="font-size:12px;font-weight:800;color:#38bdf8">Игровая редкость: ' + foundSer.rarity + '</div>';
      }
    }
  }, true);

  function enrichProfileArchive() {
    const view = document.getElementById('view');
    if (!view) return;
    const panels = view.querySelectorAll('.panel');
    panels.forEach((p) => {
      const h = p.querySelector('h2, h3');
      if (!h) return;
      const title = h.textContent || '';
      if (title.includes('АРХИВ СПЕЦСЕРИЙ') && !p.dataset.enrichedSeries) {
        p.dataset.enrichedSeries = '1';
        const wrap = p.querySelector('div:last-child') || p;
        window.__MREO_EXTRA_SERIES.forEach((sr) => {
          const shortTag = sr.code.replace(/\d{3}/, '').replace(/\s+/g, ' ').trim();
          if (!wrap.textContent.includes(shortTag)) {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'chip';
            b.style.cssText = 'margin:3px;padding:7px 11px;border-radius:11px;font-weight:800;font-size:12px;cursor:pointer;';
            b.textContent = shortTag;
            wrap.appendChild(b);
          }
        });
      }
      if (title.includes('МЕДИА-ЛЕГЕНД') && !p.dataset.enrichedMedia) {
        p.dataset.enrichedMedia = '1';
        const wrap = p.querySelector('div:last-child') || p;
        window.__MREO_EXTRA_MEDIA.forEach((m) => {
          if (!wrap.textContent.includes(m.pl)) {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'chip';
            b.style.cssText = 'margin:3px;padding:7px 11px;border-radius:11px;font-weight:800;font-size:12px;cursor:pointer;';
            b.textContent = m.pl;
            wrap.appendChild(b);
          }
        });
      }
    });
  }

setInterval(enrichProfileArchive, 350);
})();

/* === REALISTIC_ECONOMY_AND_CLEAN_PLATES_V67 === */
(function() {
  if (window.__mreoBalancedV67) return;
  window.__mreoBalancedV67 = true;

  // 1. Плавный, честный множитель влияния (без экспоненциальной инфляции x10)
  window.getMreoSynergy = function() {
    const st = (window.__mreoBridge && typeof window.__mreoBridge.getS === "function" ? window.__mreoBridge.getS() : null) || ((typeof S !== "undefined" && S) ? S : {});
    const lvl = Math.max(1, Number(st.lvl) || 1);
    const conn = Math.max(0, Number(st.linkLvl || st.conn || st.bribe || 0) || 0);
    const ownedRegs = Array.isArray(st.ownedRegs) ? st.ownedRegs : [];

    let carMult = 1.0;
    let carName = "Пешком";
    if (Array.isArray(typeof CARS !== "undefined" ? CARS : null) && st.curCar) {
      const c = CARS.find(x => x && x.id === st.curCar);
      if (c) {
        carMult = 1 + Math.min(0.35, ((Number(c.mult) || 1) - 1) * 0.28);
        carName = c.name || "Авто";
      }
    }

    let plateBonus = 0;
    let equippedCode = "Без номера";
    if (st.equippedPlate && Array.isArray(st.plates)) {
      const eq = st.plates.find(p => p && p.id === st.equippedPlate);
      if (eq) {
        equippedCode = (eq.a || "") + (eq.num || "") + (eq.b || "") + " " + (eq.reg || "");
        const r = String(eq.rar || eq.tier || "").toLowerCase();
        if (r.includes("spec") || r.includes("legend")) plateBonus = 0.22;
        else if (r.includes("epic")) plateBonus = 0.14;
        else if (r.includes("rare")) plateBonus = 0.08;
        else plateBonus = 0.03;
      }
    }

    // Аддитивный расчёт: плавный рост от 1.00 до ~2.10 на максимальной прокачке
    const addBonus = Math.min(0.45, (lvl - 1) * 0.025)
                   + Math.min(0.30, conn * 0.03)
                   + (carMult - 1)
                   + plateBonus
                   + Math.min(0.24, ownedRegs.length * 0.06);

    const vipBoost = st.vipTier === 'vip' ? 0.30 : (st.vipTier === 'premium' ? 0.15 : 0); const total = Number((1 + addBonus + vipBoost).toFixed(2));
    const baseFee = Math.max(4, 12 - conn); const marketFeePct = st.vipTier === 'vip' ? 3 : (st.vipTier === 'premium' ? Math.min(6, baseFee) : baseFee);

    return {
      total,
      lvl,
      conn,
      carMult: Number(carMult.toFixed(2)),
      carName,
      equippedCode,
      ownedRegs,
      marketFeePct
    };
  };

  // 2. Честная прогрессия опыта (XP) с умеренными наградами
  window.grantMreoXp = function(amount) {
    if (typeof S === "undefined" || !S) return;
    S.xp = (Number(S.xp) || 0) + Math.max(1, Math.round(amount));
    S.lvl = Math.max(1, Number(S.lvl) || 1);
    let up = false;
    while (true) {
      const need = Math.round(180 * Math.pow(1.32, S.lvl - 1));
      if (S.xp >= need) {
        S.xp -= need;
        S.lvl += 1;
        const reward = S.lvl * 7500;
        S.cash = (Number(S.cash) || 0) + reward;
        up = true;
        if (typeof toast === "function") {
          toast("Новый уровень: Ур. " + S.lvl + "! Премия +" + reward.toLocaleString("ru-RU") + " ₽");
        }
      } else {
        break;
      }
    }
    if (up && typeof haptic === "function") haptic("success");
    if (typeof save === "function") save();
  };

  // 3. Балансировка цен номеров при выдаче и открытии кейсов (строго по стоимости источника)
  window.__lastOpenedCasePrice = 0;
  document.addEventListener("click", function(e) {
    const btn = e.target && e.target.closest ? e.target.closest("[data-a]") : null;
    if (!btn) return;
    const act = btn.getAttribute("data-a");
    if (act === "open_case") {
      const card = btn.closest(".panel, div");
      const m = (card ? card.textContent : "").match(/([\d\s ]+)\s*₽/);
      window.__lastOpenedCasePrice = m ? Number(m.replace(/\D/g, "")) || 35000 : 35000;
      window.grantMreoXp(25);
    } else if (act === "roll" || act === "spin") {
      window.__lastOpenedCasePrice = 0;
      window.grantMreoXp(12);
    } else if (act === "buy_lot") {
      window.grantMreoXp(20);
    } else if (act === "buy_car") {
      window.grantMreoXp(65);
    } else if (act === "cruise" || act === "drive") {
      const syn = window.getMreoSynergy();
      const extra = Math.round(2800 * syn.total);
      if (typeof S !== "undefined" && S) S.cash = (Number(S.cash) || 0) + extra;
      window.grantMreoXp(18);
    } else if (act === "craft" || act === "reroll_reg") {
      window.grantMreoXp(22);
    }
  }, true);

  const origMakePlate = typeof makePlate === "function" ? makePlate : null;
  if (origMakePlate) {
    window.makePlate = function() {
      let pl = origMakePlate.apply(this, arguments);
      try {
        const syn = window.getMreoSynergy();
        if (pl && typeof S !== "undefined" && Array.isArray(S.plates)) {
          for (let i = 0; i < 8; i++) {
            const code = (pl.a || "") + (pl.num || "") + (pl.b || "") + (pl.reg || "");
            const dup = S.plates.some(x => x && ((x.a || "") + (x.num || "") + (x.b || "") + (x.reg || "")) === code);
            if (!dup) break;
            pl = origMakePlate.apply(this, arguments);
          }
        }
        if (pl && typeof pl.val === "number") {
          const casePrice = window.__lastOpenedCasePrice || 0;
          if (casePrice > 0) {
            // Строгий потолок дропа из кейса: от 0.35x до 2.2x от цены самого кейса (редкий джекпот до 3.2x)
            const rollFactor = Math.random() < 0.12 ? (1.8 + Math.random() * 1.4) : (0.35 + Math.random() * 1.15);
            pl.val = Math.max(2500, Math.round((casePrice * rollFactor * syn.total) / 500) * 500);
            if (casePrice <= 60000 && (pl.rar === "spec" || pl.rar === "legend")) {
              pl.rar = "rare";
              pl.tier = "rare";
            }
          } else {
            // Обычная выдача в окне МРЭО: реалистичная стоимость от 2 500 ₽ с плавным бонусом влияния
            const isMyReg = syn.ownedRegs.includes(String(pl.reg || ""));
            const regBoost = isMyReg ? 1.15 : 1.0;
            pl.val = Math.max(2500, Math.round((pl.val * 0.55 * syn.total * regBoost) / 500) * 500);
          }
        }
      } catch (_) {}
      return pl;
    };
  }

  // 4. Компактная плашка индекса влияния на главном экране
  function renderSynergyBanner() {
    const view = document.getElementById("view");
    if (!view || document.getElementById("mreo-synergy-card")) return;
    const txt = view.textContent || "";
    if (!txt.includes("Выдача") && !txt.includes("Талон") && !txt.includes("Окно")) return;

    const syn = window.getMreoSynergy();
    const card = document.createElement("section");
    card.className = "panel";
    card.id = "mreo-synergy-card";
    card.style.cssText = "padding:12px 14px !important;margin-bottom:12px !important;background:linear-gradient(135deg,#182030 0%,#121620 100%) !important;border:1px solid rgba(250,204,21,0.22) !important;";
    card.innerHTML =
      "<div style=\"display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;\">" +
        "<span style=\"font-size:12px;font-weight:900;color:#facc15;letter-spacing:0.04em;\">⚡ ИНДЕКС ВЛИЯНИЯ МРЭО</span>" +
        "<span style=\"background:rgba(250,204,21,0.18);color:#fde047;font-size:13px;font-weight:900;padding:2px 9px;border-radius:999px;\">×" + syn.total + "</span>" +
      "</div>" +
      "<div style=\"display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:11px;color:#cbd5e1;\">" +
        "<div>🚘 Авто: <b style=\"color:#fff;\">" + syn.carName + " (×" + syn.carMult + ")</b></div>" +
        "<div>🪪 Номер: <b style=\"color:#fff;\">" + syn.equippedCode + "</b></div>" +
        "<div>🏛️ Регионов: <b style=\"color:#4ade80;\">" + syn.ownedRegs.length + " шт.</b></div>" +
        "<div>📉 Комиссия биржи: <b style=\"color:#38bdf8;\">" + syn.marketFeePct + "%</b></div>" +
      "</div>";
    view.insertAdjacentElement("afterbegin", card);
  }

  if (typeof window.render === "function") {
    const origR = window.render;
    window.render = function() {
      const res = origR.apply(this, arguments);
      renderSynergyBanner();
      return res;
    };
  }
  window.addEventListener("DOMContentLoaded", renderSynergyBanner);
  setTimeout(renderSynergyBanner, 120);
})();

/* === REFERRAL_SYSTEM_LVL5_V78 === */
(function() {
  if (window.__mreoRefV78) return;
  window.__mreoRefV78 = true;

  const BOT_USERNAME = "nmrznk_bot";

  window.getCurrentTgId = function() {
    try {
      const id = window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user && window.Telegram.WebApp.initDataUnsafe.user.id;
      if (id) return String(id);
    } catch (_) {}
    if (typeof S !== "undefined" && S && S.uid) return String(S.uid);
    let localId = localStorage.getItem("mreo_guest_uid");
    if (!localId) {
      localId = "u" + Math.floor(100000 + Math.random() * 900000);
      localStorage.setItem("mreo_guest_uid", localId);
    }
    return localId;
  };

  window.generateRefLink = function() {
    const tgId = window.getCurrentTgId();
    return "https://t.me/" + BOT_USERNAME + "?start=ref_" + tgId;
  };

  window.processReferralProgress = async function() {
    if (typeof S === "undefined" || !S) return;
    const myId = window.getCurrentTgId();

    if (!S.invitedBy) {
      let startParam = "";
      try {
        startParam = (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.start_param) || "";
      } catch (_) {}
      const urlRef = new URLSearchParams(window.location.search).get("ref") || "";
      const rawRef = startParam.startsWith("ref_") ? startParam.slice(4) : urlRef;
      if (rawRef && rawRef !== myId) {
        S.invitedBy = rawRef;
        if (typeof save === "function") save();
      }
    }

    const curLvl = Number(S.lvl) || 1;
    if (S.invitedBy && curLvl >= 5 && !S.refLvl5Awarded) {
      S.refLvl5Awarded = true;
      S.tix = (Number(S.tix ?? S.tickets ?? 0)) + 10;
      if ("tickets" in S) S.tickets = S.tix;
      S.cash = (Number(S.cash) || 0) + 50000;
      if (typeof save === "function") save();
      if (typeof toast === "function") {
        toast("Реферальный бонус за 5 уровень: +10 талонов и +50 000 ₽!");
      }
      try {
        if (typeof supabase !== "undefined" && supabase && supabase.rpc) {
          await supabase.rpc("award_referral_lvl5", {
            referrer_id: S.invitedBy,
            friend_id: myId,
            referrer_tix: 15,
            referrer_cash: 75000
          });
        }
      } catch (_) {}
    }
  };

  document.addEventListener("click", function(e) {
    const btn = e.target && e.target.closest ? e.target.closest("button") : null;
    if (!btn) return;
    const txt = btn.textContent || "";
    if (txt.includes("Позвать напарника") || txt.includes("Скопировать реф")) {
      const link = window.generateRefLink();
      if (navigator.clipboard) navigator.clipboard.writeText(link);
      if (typeof toast === "function") toast("Реферальная ссылка скопирована: " + link);
    }
  }, true);

  window.addEventListener("DOMContentLoaded", window.processReferralProgress);
  setInterval(window.processReferralProgress, 5000);
})();

/* === NATIVE_SHOP_MODULE_V88 === */
(function() {
  if (window.__mreoShopV101) return;
  window.__mreoShopV101 = true;

  function getState() {
    if (window.__mreoBridge && typeof window.__mreoBridge.getS === "function") return window.__mreoBridge.getS();
    if (typeof S !== "undefined") return S;
    try {
      const raw = localStorage.getItem("mreo_tma_save_v2") || localStorage.getItem("mreo_tma_save");
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return null;
  }

  function syncUI(st) {
    if (window.__mreoBridge) {
      window.__mreoBridge.save();
      window.__mreoBridge.render();
    } else {
      try {
        if (st) localStorage.setItem("mreo_tma_save_v2", JSON.stringify(st));
      } catch (_) {}
      location.reload();
    }
  }

  function notify(msg, isErr) {
    if (window.__mreoBridge && window.__mreoBridge.toast) window.__mreoBridge.toast(msg, isErr);
    else if (typeof toast === "function") toast(msg, isErr);
    else alert(msg);
  }

  const STARS_TIERS = [
    { id: "stars_25", title: "Стартовый Буст · 25 ⭐", desc: "+40 талонов, +250 000 ₽ и +1 уровень Связей МРЭО", stars: 25, tix: 40, cash: 250000, conn: 1, badge: "ВЫГОДНЫЙ СТАРТ" },
    { id: "stars_75", title: "Статус «Перекуп PRO» · 75 ⭐", desc: "Комиссия биржи 6% навсегда + 15% к цене номеров + 150 тал. + 1 млн ₽", stars: 75, tix: 150, cash: 1000000, vip: "premium", badge: "НАВСЕГДА" },
    { id: "stars_190", title: "Набор «Спецсерия ФСО» · 190 ⭐", desc: "Спецномер Е 777 КХ 77 в гараж + 450 талонов + 3.5 млн ₽ + 2 Связи", stars: 190, tix: 450, cash: 3500000, conn: 2, givePlate: { a: "Е", num: "777", b: "КХ", reg: "77", val: 1850000, rar: "spec" }, badge: "СПЕЦНОМЕР" },
    { id: "stars_450", title: "Кортеж VIP · 450 ⭐", desc: "Комиссия 3% и +30% ко всем доходам навсегда + номер А 001 МР 97 + 1 200 тал. + 12 млн ₽", stars: 450, tix: 1200, cash: 12000000, vip: "vip", givePlate: { a: "А", num: "001", b: "МР", reg: "97", val: 4500000, rar: "spec" }, badge: "ЭКСКЛЮЗИВ VIP" }
  ];

  const RUB_OFFERS = [
    { id: "tix_10", title: "Пакет «Дежурный»", desc: "+10 талонов выдачи МРЭО", basePrice: 65000, tix: 10, badge: "РАСХОДНИК" },
    { id: "tix_35", title: "Смена инспектора", desc: "+35 талонов выдачи МРЭО", basePrice: 210000, tix: 35, badge: "РАСХОДНИК" },
    { id: "conn_up", title: "Связи в управлении (+1)", desc: "Увеличивает множитель дохода (цена растёт с уровнем)", basePrice: 320000, conn: 1, scaleByConn: true, badge: "ПРОКАЧКА" }
  ];

  function getRubPrice(item) {
    const st = getState();
    if (!item.scaleByConn || !st) return item.basePrice;
    const c = Math.max(0, Number(st.linkLvl || st.conn || 0));
    return Math.round(item.basePrice * Math.pow(1.45, c));
  }

  function grantPackage(pkg) {
    const st = getState();
    if (!st) return;
    if (pkg.tix) st.free = (Number(st.free) || 0) + Number(pkg.tix);
    if (pkg.cash) st.cash = (Number(st.cash) || 0) + Number(pkg.cash);
    if (pkg.conn) st.linkLvl = (Number(st.linkLvl) || 0) + Number(pkg.conn);
    if (pkg.vip && st.vipTier !== "vip") st.vipTier = pkg.vip;
    if (pkg.givePlate && Array.isArray(st.plates)) {
      st.plates.unshift({ id: "vip_" + Date.now() + "_" + Math.floor(Math.random() * 999), f: pkg.givePlate.a, d: pkg.givePlate.num, t: pkg.givePlate.b, reg: pkg.givePlate.reg, val: pkg.givePlate.val, rar: pkg.givePlate.rar });
    }
    syncUI(st);
    notify("Куплено: " + pkg.title + "!", false);
  }

  window.buyStarsTier = function(id) {
    const pkg = STARS_TIERS.find(x => x.id === id);
    if (pkg && typeof window.buyWithTelegramStars === "function") {
      window.buyWithTelegramStars(pkg.id, pkg.stars, function() { grantPackage(pkg); });
    }
  };

  window.buyRubOffer = function(id) {
    const st = getState();
    if (!st) return;
    const pkg = RUB_OFFERS.find(x => x.id === id);
    if (!pkg) return;
    const price = getRubPrice(pkg);
    const bal = Number(st.cash) || 0;
    if (bal < price) {
      notify("Недостаточно средств! Не хватает " + (price - bal).toLocaleString("ru-RU") + " ₽", true);
      return;
    }
    st.cash = bal - price;
    grantPackage(pkg);
  };

  window.getShopHtml = function() {
    const st = getState() || {};
    const curVip = st.vipTier ? String(st.vipTier).toUpperCase() : "СТАНДАРТ";
    const starsHtml = STARS_TIERS.map(it =>
      "<div style=\"background:linear-gradient(135deg,#281e3d,#151822);border:1px solid rgba(250,204,21,0.34);border-radius:16px;padding:13px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;gap:10px;\">" +
        "<div style=\"min-width:0;\"><div style=\"display:flex;align-items:center;gap:6px;flex-wrap:wrap;\"><b style=\"font-size:14px;color:#fff;\">" + it.title + "</b><span style=\"background:#facc15;color:#0b0d11;font-size:10px;font-weight:900;padding:2px 7px;border-radius:999px;\">" + it.badge + "</span></div><div class=\"muted\" style=\"font-size:12px;margin-top:4px;\">" + it.desc + "</div></div>" +
        "<button type=\"button\" class=\"btn small primary\" style=\"flex-shrink:0;\" data-shop-stars=\"" + it.id + "\">" + it.stars + " ⭐</button>" +
      "</div>"
    ).join("");

    const rubHtml = RUB_OFFERS.map(it => {
      const p = getRubPrice(it);
      return (
        "<div style=\"background:var(--card-2);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:12px;margin-bottom:9px;display:flex;justify-content:space-between;align-items:center;gap:10px;\">" +
          "<div style=\"min-width:0;\"><div style=\"display:flex;align-items:center;gap:6px;flex-wrap:wrap;\"><b style=\"font-size:14px;color:#fff;\">" + it.title + "</b><span style=\"background:rgba(56,189,248,0.16);color:#7dd3fc;font-size:10px;font-weight:900;padding:2px 7px;border-radius:999px;\">" + it.badge + "</span></div><div class=\"muted\" style=\"font-size:12px;margin-top:3px;\">" + it.desc + "</div></div>" +
          "<button type=\"button\" class=\"btn small primary\" style=\"flex-shrink:0;\" data-shop-buy=\"" + it.id + "\">" + p.toLocaleString("ru-RU") + " ₽</button>" +
        "</div>"
      );
    }).join("");

    return (
      "<section class=\"panel\"><div style=\"display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;\"><div class=\"hero-kicker\" style=\"margin:0;\"><span class=\"dot-live\"></span>ЭКСКЛЮЗИВ ЗА TELEGRAM STARS</div><span style=\"font-size:11px;font-weight:900;color:#fde047;\">СТАТУС: " + curVip + "</span></div><h2 style=\"font-size:20px;\">⭐ Привилегии и спецнаборы</h2><div class=\"muted\" style=\"margin-bottom:11px;\">Уникальные VIP-статусы, снижение комиссии до 3% и готовые спецномера в гараж.</div>" + starsHtml + "</section>" +
      "<section class=\"panel\"><h3 style=\"font-size:17px;\">🎟️ Снабжение за игровую валюту</h3><div class=\"muted\" style=\"margin-bottom:10px;\">Базовые расходники и талоны для ежедневной работы в отделе.</div>" + rubHtml + "</section>"
    );
  };

  window.renderShopView = function() {
    const view = document.getElementById("view");
    if (view) view.innerHTML = window.getShopHtml();
  };
})();
function renderShop() { return (typeof window.getShopHtml === "function") ? window.getShopHtml() : ""; }
window.renderShop = renderShop;

/* === EXACT_COORDS_DOCK_TAP_V93 === */
(function() {
  if (window.__mreoCoordsDockV101) return;
  window.__mreoCoordsDockV101 = true;
  let startX = 0, startY = 0, isDownOnDock = false;
  function findDockContainer() { const item = document.querySelector(".dock-item"); return item ? item.parentElement : null; }
  function switchTabByClientX(clientX) {
    const dock = findDockContainer();
    if (!dock) return;
    for (const btn of Array.from(dock.querySelectorAll(".dock-item"))) {
      const r = btn.getBoundingClientRect();
      if (clientX >= r.left - 2 && clientX <= r.right + 2) {
        const targetTab = btn.getAttribute("data-v") || btn.getAttribute("data-tab");
        if (targetTab && typeof window.__mreoGoTab === "function") window.__mreoGoTab(targetTab);
        return;
      }
    }
  }
  document.addEventListener("pointerdown", function(e) {
    const dock = findDockContainer();
    if (!dock) return;
    const r = dock.getBoundingClientRect();
    if (e.clientY >= r.top && e.clientY <= r.bottom && e.clientX >= r.left && e.clientX <= r.right) { isDownOnDock = true; startX = e.clientX; startY = e.clientY; }
    else isDownOnDock = false;
  }, true);
  document.addEventListener("pointerup", function(e) {
    if (!isDownOnDock) return;
    isDownOnDock = false;
    if (Math.abs(e.clientX - startX) <= 16 && Math.abs(e.clientY - startY) <= 24) switchTabByClientX(e.clientX);
  }, true);
})();

/* === SHOP_CAPTURING_CLICK_V104 === */
(function() {
  if (window.__mreoShopCapV104) return;
  window.__mreoShopCapV104 = true;

  document.addEventListener("click", function(e) {
    const rubBtn = e.target && e.target.closest ? e.target.closest("[data-shop-buy]") : null;
    if (rubBtn) {
      e.preventDefault();
      e.stopImmediatePropagation();
      const id = rubBtn.getAttribute("data-shop-buy");
      if (id && typeof window.buyRubOffer === "function") {
        window.buyRubOffer(id);
      }
      return;
    }
    const starBtn = e.target && e.target.closest ? e.target.closest("[data-shop-stars]") : null;
    if (starBtn) {
      e.preventDefault();
      e.stopImmediatePropagation();
      const id = starBtn.getAttribute("data-shop-stars");
      if (id && typeof window.buyStarsTier === "function") {
        window.buyStarsTier(id);
      }
    }
  }, true);
})();

/* === SAFE_NON_BLOCKING_WINDOW_AND_SYNERGY_V113 === */

(function() {
  if (window.__mreoSafeLoopV113) return;
  window.__mreoSafeLoopV113 = true;

  const SHIFT_GOAL = 50;
  let hookLock = false;

  function getSt() {
    if (window.__mreoBridge && typeof window.__mreoBridge.getS === "function") return window.__mreoBridge.getS();
    if (typeof S !== "undefined") return S;
    return null;
  }

  function saveOnly() {
    if (window.__mreoBridge && typeof window.__mreoBridge.save === "function") window.__mreoBridge.save();
    else if (typeof save === "function") save();
  }

  function notifyMsg(txt, err) {
    if (window.__mreoBridge && typeof window.__mreoBridge.toast === "function") window.__mreoBridge.toast(txt, err);
    else if (typeof toast === "function") toast(txt, err);
  }

  function injectSafeOverlays() {
    if (hookLock) return;
    const view = document.getElementById("view");
    if (!view) return;
    const txt = view.textContent || "";
    if (!txt.includes("Окно выдачи") && !txt.includes("ДЕЖУРНОЕ ОКНО")) return;

    hookLock = true;
    try {
      // А. Карточка Индекса влияния МРЭО (вставляем только если её ещё нет)
      if (!document.getElementById("mreo-synergy-card") && typeof window.getMreoSynergy === "function") {
        const syn = window.getMreoSynergy();
        const card = document.createElement("section");
        card.className = "panel";
        card.id = "mreo-synergy-card";
        card.style.cssText = "padding:12px 14px !important;margin-bottom:12px !important;background:linear-gradient(135deg,#182030 0%,#121620 100%) !important;border:1px solid rgba(250,204,21,0.22) !important;";
        card.innerHTML =
          "<div style=\"display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;\">" +
            "<span style=\"font-size:12px;font-weight:900;color:#facc15;letter-spacing:0.04em;\">⚡ ИНДЕКС ВЛИЯНИЯ МРЭО</span>" +
            "<span style=\"background:rgba(250,204,21,0.18);color:#fde047;font-size:13px;font-weight:900;padding:2px 9px;border-radius:999px;\">×" + syn.total + "</span>" +
          "</div>" +
          "<div style=\"display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:11px;color:#cbd5e1;\">" +
            "<div>🚘 Авто: <b style=\"color:#fff;\">" + syn.carName + " (×" + syn.carMult + ")</b></div>" +
            "<div>🪪 Номер: <b style=\"color:#fff;\">" + syn.equippedCode + "</b></div>" +
            "<div>🏛️ Регионов: <b style=\"color:#4ade80;\">" + syn.ownedRegs.length + " шт.</b></div>" +
            "<div>📉 Комиссия биржи: <b style=\"color:#38bdf8;\">" + syn.marketFeePct + "%</b></div>" +
          "</div>";
        view.insertAdjacentElement("afterbegin", card);
      }

      // Б. Аккуратная строка Смены инспектора внутри карточки терминала
      if (!document.getElementById("mreo-clean-shift-row")) {
        const st = getSt() || {};
        const shift = Math.min(SHIFT_GOAL, Number(st.winPity) || 0);
        const combo = Math.min(15, Number(st.winCombo) || 0);
        const divs = Array.from(view.querySelectorAll("div"));
        const termHeader = divs.find(d => (d.textContent || "").includes("ТЕРМИНАЛ ВЫДАЧИ МРЭО") && d.children.length >= 2);
        if (termHeader && termHeader.parentElement) {
          const bar = document.createElement("div");
          bar.id = "mreo-clean-shift-row";
          bar.style.cssText = "display:flex;justify-content:space-between;align-items:center;font-size:11px;font-weight:800;color:#94a3b8;margin-top:8px;padding-top:7px;border-top:1px solid rgba(255,255,255,0.06);";
          bar.innerHTML =
            "<span>Смена инспектора: <b style=\"color:#fde047;\">" + shift + " / " + SHIFT_GOAL + "</b></span>" +
            "<span>Серия: <b style=\"color:#4ade80;\">+" + combo + "%</b> · Возврат талона: <b style=\"color:#38bdf8;\">10%</b></span>";
          termHeader.parentElement.appendChild(bar);
        }
      }
    } finally {
      hookLock = false;
    }
  }

  // Обработка крутки окна (без вызова повторного render(), чтобы не вызывать цикл перерисовки)
  document.addEventListener("click", function(e) {
    const btn = e.target && e.target.closest ? e.target.closest("button") : null;
    if (!btn) return;
    const bTxt = btn.textContent || "";
    if (!bTxt.includes("Получить по талону") && !bTxt.includes("Выбить номер")) return;

    const st = getSt();
    if (!st) return;

    setTimeout(function() {
      const shift = Number(st.winPity) || 0;
      const combo = Number(st.winCombo) || 0;
      const comboMult = 1 + Math.min(0.15, combo * 0.01);

      if (shift >= SHIFT_GOAL - 1) {
        const midPool = [
          { f: "К", d: "303", t: "МР", reg: "77", val: 58000 },
          { f: "В", d: "505", t: "ОР", reg: "97", val: 52000 },
          { f: "С", d: "707", t: "АМ", reg: "77", val: 68000 },
          { f: "М", d: "808", t: "КХ", reg: "77", val: 64000 }
        ];
        const pick = midPool[Math.floor(Math.random() * midPool.length)];
        if (Array.isArray(st.plates) && st.plates.length > 0) {
          const top = st.plates;
          top.f = pick.f; top.d = pick.d; top.t = pick.t; top.reg = pick.reg;
          if ("a" in top) top.a = pick.f;
          if ("num" in top) top.num = pick.d;
          if ("b" in top) top.b = pick.t;
          top.rar = "rare";
          if ("tier" in top) top.tier = "rare";
          top.val = Math.round(pick.val * comboMult);
        }
        st.cash = (Number(st.cash) || 0) + 15000;
        st.winPity = 0;
        notifyMsg("Смена 50/50 закрыта! Премия +15 000 ₽ и номер " + pick.f + " " + pick.d + " " + pick.t + " " + pick.reg, false);
      } else {
        st.winPity = shift + 1;
        if (Array.isArray(st.plates) && st.plates.length > 0 && typeof st.plates.val === "number") {
          const capped = Math.min(160000, Math.round((st.plates.val * 0.85 * comboMult) / 500) * 500);
          st.plates.val = Math.max(3500, capped);
        }
      }

      st.winCombo = Math.min(15, combo + 1);

      if (Math.random() < 0.10) {
        st.free = (Number(st.free) || 0) + 1;
        notifyMsg("🍀 Талон не погашен: +1 талон возвращён", false);
      }

      saveOnly();
      const bar = document.getElementById("mreo-clean-shift-row");
      if (bar) {
        bar.innerHTML =
          "<span>Смена инспектора: <b style=\"color:#fde047;\">" + (Number(st.winPity) || 0) + " / " + SHIFT_GOAL + "</b></span>" +
          "<span>Серия: <b style=\"color:#4ade80;\">+" + (Number(st.winCombo) || 0) + "%</b> · Возврат талона: <b style=\"color:#38bdf8;\">10%</b></span>";
      }
    }, 90);
  }, true);

  function initSafeObserver() {
    const view = document.getElementById("view");
    if (!view) return;
    injectSafeOverlays();
    // Наблюдаем только за прямыми детьми #view (без subtree: true), чтобы исключить рекурсию и зависания
    const obs = new MutationObserver(function() {
      if (!hookLock) injectSafeOverlays();
    });
    obs.observe(view, { childList: true });
  }

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", initSafeObserver);
  } else {
    initSafeObserver();
  }
})();
