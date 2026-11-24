(function() {
  var REAL_RF_GARAGE_DB = {
    "М777ММ777": { car: "Mercedes-AMG G 63 (W463A)", color: "Чёрный обсидиан", owner: "Частный VIP-автопарк · Москва" },
    "М777ММ78": { car: "Mercedes-Benz S 500 4MATIC (W223)", color: "Чёрный", owner: "Частный автопарк · Санкт-Петербург" },
    "А001МР97": { car: "Aurus Senat S600", color: "Чёрный", owner: "Федеральный спецфонд РФ" },
    "Е001КХ77": { car: "Mercedes-Maybach S 680 (Z223)", color: "Чёрный обсидиан", owner: "Спецсопровождение РФ" },
    "К802РА95": { car: "Toyota Land Cruiser 300 GR Sport", color: "Чёрный", owner: "Ведомственный автопарк · Грозный" },
    "В007СВ50": { car: "BMW X5 M Competition (F95)", color: "Серый Донингтон", owner: "Частный владелец · Московская обл." },
    "Е333СХ77": { car: "Porsche Cayenne Turbo GT", color: "Чёрный", owner: "Частный владелец · Москва" },
    "М222РС16": { car: "Lexus LX 600 Executive", color: "Белый перламутр", owner: "Частный владелец · Казань" },
    "Т555КВ77": { car: "Audi RS6 Avant (C8)", color: "Серый Нардо", owner: "Частный владелец · Москва" },
    "К333МС16": { car: "Toyota Land Cruiser 200 Executive Lounge", color: "Чёрный", owner: "Частный владелец · Татарстан" },
    "У111ТЕ16": { car: "BMW M5 Competition (F90)", color: "Синий Марина Бэй", owner: "Частный владелец · Казань" },
    "Н333НУ16": { car: "Mercedes-Benz GLE 63 S AMG Coupe", color: "Чёрный", owner: "Частный владелец · Татарстан" },
    "У007КХ50": { car: "Land Rover Range Rover Autobiography", color: "Чёрный Санторини", owner: "Частный владелец · Подмосковье" },
    "М222ТС77": { car: "BMW X7 M60i xDrive (G07)", color: "Чёрный сапфир", owner: "Частный владелец · Москва" }
  };

  var FALLBACK_REAL_CARS = [
    { car: "Mercedes-Benz S 500 4MATIC (W223)", color: "Чёрный обсидиан" },
    { car: "BMW X5 M50d (G05)", color: "Чёрный сапфир" },
    { car: "Toyota Land Cruiser 300 3.5 Twin-Turbo", color: "Чёрный" },
    { car: "Mercedes-AMG E 63 S 4MATIC+ (W213)", color: "Серый селенит" },
    { car: "Lexus LX 570 Superior", color: "Белый перламутр" },
    { car: "Audi Q8 55 TFSI Quattro", color: "Чёрный миф" },
    { car: "BMW 530d xDrive M Sport (G30)", color: "Тёмно-синий" },
    { car: "Porsche Panamera Turbo S", color: "Чёрный" }
  ];

  var REGIONS = {
    "77": "г. Москва", "97": "г. Москва (Спецфонд)", "99": "г. Москва", "177": "г. Москва", "777": "г. Москва",
    "78": "г. Санкт-Петербург", "98": "г. Санкт-Петербург", "178": "г. Санкт-Петербург",
    "95": "Чеченская Республика", "23": "Краснодарский край", "93": "Краснодарский край",
    "76": "Ярославская область", "50": "Московская область", "750": "Московская область",
    "16": "Республика Татарстан", "116": "Республика Татарстан", "66": "Свердловская область", "52": "Нижегородская область"
  };

  function hashStr(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h);
  }

  window.__openNomeroCar = function(plateText, isEquipped) {
    var clean = String(plateText || "").toUpperCase().replace(/[^А-ЯA-Z0-9]/g, "");
    var prettyPlate = clean.replace(/^([А-ЯA-Z])(\d{3})([А-ЯA-Z]{2})(\d{2,3})$/, "$1 $2 $3 $4") || plateText;
    var regMatch = clean.match(/(\d{2,3})$/);
    var regCode = regMatch ? regMatch : "77";
    var regName = REGIONS[regCode] || ("Регион " + regCode + " РФ");

    var dbHit = REAL_RF_GARAGE_DB[clean];
    var h = hashStr(clean);
    var fb = FALLBACK_REAL_CARS[h % FALLBACK_REAL_CARS.length];

    var playerCar = null;
    if (isEquipped) {
      var heroTitle = document.querySelector("#view .hero h2, #view .hero b");
      playerCar = heroTitle ? heroTitle.textContent.trim() : null;
    }

    var carModel = playerCar || (dbHit ? dbHit.car : fb.car);
    var carColor = playerCar ? "Ваш VIP-Гараж" : (dbHit ? dbHit.color : fb.color);
    var ownerLabel = playerCar ? "Вы (установлен на вашем авто)" : (dbHit ? dbHit.owner : ("Частный владелец · " + regName));

    var old = document.getElementById("mreo-nomerogram-box");
    if (old) old.remove();

    var box = document.createElement("div");
    box.id = "mreo-nomerogram-box";
    box.style.cssText = "position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(6,10,18,0.74);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);";
    box.onclick = function(e) { if (e.target === box) box.remove(); };

    var card = document.createElement("div");
    card.style.cssText = "width:min(92vw,390px);border-radius:26px;padding:18px;background:rgba(16,22,36,0.98);border:1px solid rgba(255,255,255,0.18);box-shadow:0 24px 60px rgba(0,0,0,0.75),inset 0 1px 0 rgba(255,255,255,0.22);color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,sans-serif;";

    card.innerHTML =
      "<div style='display:flex;justify-content:space-between;align-items:center;margin-bottom:12px'>" +
        "<span style='font-size:11.5px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:#38bdf8'>Номерограм · База авто РФ</span>" +
        "<button id='nomero-x-btn' type='button' style='width:28px;height:28px;border-radius:50%;border:none;background:rgba(255,255,255,0.12);color:#fff;font-size:16px;font-weight:800;cursor:pointer'>×</button>" +
      "</div>" +
      "<div style='padding:14px;border-radius:18px;background:linear-gradient(145deg,rgba(56,189,248,0.14),rgba(15,23,42,0.88));border:1px solid rgba(56,189,248,0.38);margin-bottom:12px'>" +
        "<div style='font-size:11px;font-weight:800;letter-spacing:0.05em;text-transform:uppercase;color:#38bdf8;margin-bottom:4px'>Сейчас установлен на автомобиле</div>" +
        "<div style='font-size:19px;font-weight:900;color:#ffffff;line-height:1.25;margin-bottom:6px'>" + carModel + "</div>" +
        "<div style='font-size:12.5px;color:#cbd5e1'>Кузов / цвет: <b style='color:#e2e8f0'>" + carColor + "</b></div>" +
        "<div style='font-size:12.5px;color:#cbd5e1;margin-top:3px'>Госномер: <b style='color:#fbbf24'>" + prettyPlate + "</b> · " + regName + "</div>" +
        "<div style='font-size:12px;color:#94a3b8;margin-top:3px'>Владелец: <b style='color:#e2e8f0'>" + ownerLabel + "</b></div>" +
      "</div>" +
      "<button id='nomero-ok-btn' type='button' style='width:100%;height:42px;border-radius:14px;border:none;background:linear-gradient(180deg,#38bdf8,#0284c7);color:#ffffff;font-weight:800;font-size:13.5px;cursor:pointer'>Закрыть</button>";

    box.appendChild(card);
    document.body.appendChild(box);

    document.getElementById("nomero-x-btn").onclick = function() { box.remove(); };
    document.getElementById("nomero-ok-btn").onclick = function() { box.remove(); };
  };

  function addInfoIconsToCards() {
    var view = document.getElementById("view");
    if (!view) return;
    var btns = view.querySelectorAll("button");
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      var t = (b.textContent || "").trim();
      if (t !== "На авто" && t !== "Снять ★" && t !== "Купить") continue;
      var card = b.parentElement && b.parentElement.parentElement;
      if (!card || card.classList.contains("hero") || card.closest(".hero")) continue;
      if (card.querySelector(".nomerogram-i-btn")) continue;

      var svg = card.querySelector("svg");
      if (!svg) continue;
      var rawPlate = (svg.textContent || "").replace(/RUS/gi, " ").replace(/\s+/g, " ").trim();
      var isEquipped = t.indexOf("Снять") === 0;

      if (getComputedStyle(card).position === "static") {
        card.style.position = "relative";
      }
      var infoBtn = document.createElement("button");
      infoBtn.type = "button";
      infoBtn.className = "nomerogram-i-btn";
      infoBtn.textContent = "i";
      infoBtn.dataset.plate = rawPlate;
      infoBtn.dataset.equipped = isEquipped ? "1" : "0";
      infoBtn.style.cssText = "position:absolute;top:10px;right:10px;width:21px;height:21px;border-radius:50%;background:linear-gradient(180deg,rgba(255,255,255,0.22) 0%,rgba(255,255,255,0.08) 100%);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:0.75px solid rgba(255,255,255,0.35);border-top:0.75px solid rgba(255,255,255,0.65);color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:11.5px;font-weight:800;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;z-index:99;padding:0;line-height:1;box-shadow:0 3px 10px rgba(0,0,0,0.35),inset 0 1px 0 rgba(255,255,255,0.35);";
      card.appendChild(infoBtn);
    }
  }

  ["pointerdown", "mousedown", "touchstart", "click"].forEach(function(evtName) {
    document.addEventListener(evtName, function(e) {
      var target = e.target;
      if (!target) return;
      var btn = target.classList && target.classList.contains("nomerogram-i-btn")
        ? target
        : (target.closest ? target.closest(".nomerogram-i-btn") : null);
      if (!btn) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      window.__openNomeroCar(btn.dataset.plate || "Госномер РФ", btn.dataset.equipped === "1");
    }, true);
  });

  function startObserver() {
    addInfoIconsToCards();
    var viewEl = document.getElementById("view");
    if (viewEl && window.MutationObserver) {
      new MutationObserver(addInfoIconsToCards).observe(viewEl, { childList: true, subtree: true });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startObserver);
  } else {
    startObserver();
  }
})();
