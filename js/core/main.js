// --------------------------------------
// 定数・設定
// --------------------------------------
const RINGS = 12;
const FPS = 20;

// 円の色設定
const arcColors    = Array.from({length: RINGS}, (_, i) => `hsl(${360 / RINGS * i}, 100%, 60%)`);
const arcColorsSec = Array.from({length: RINGS}, (_, i) => `hsl(${360 / RINGS * i}, 100%, 10%)`);
const arcColorsTet = Array.from({length: RINGS}, (_, i) => `hsla(${360 / RINGS * i}, 100%, 60%, 0.1)`);

// 単位表記（自然な日本語スタイル）
const UNITS = [
  "", "千", "百万", "億", "兆", "京", "垓", "𥝱", "穣",
  "溝", "澗", "正", "載", "極", "恒河沙", "阿僧祇", "那由他",
  "不可思議", "無量大数"
];

// 転生コスト
const rebirthCosts = [
  new ExpantaNum("1e12"),
  new ExpantaNum("1e15"),
  new ExpantaNum("1e18"),
  new ExpantaNum("1e21"),
  new ExpantaNum("1e24"),
  new ExpantaNum("1e27"),
];

// プレイヤーデータ
let player = {
  hyp: 1,
  points: new ExpantaNum(0),
  rebirthTier: 0,
  rebirthPoints: 0,
};

// --------------------------------------
// ローカルストレージ
// --------------------------------------
function saveData() {
  const save = {
    points: player.points.toString(),
    rebirthTier: player.rebirthTier,
    rebirthPoints: player.rebirthPoints,
    rings: []
  };
  for (let i = 1; i <= RINGS; i++) {
    const r = player[`r${i}`];
    save.rings.push({
      level: r.level,
      laps: r.laps,
      unlocked: r.unlocked,
      unlockedUpgrade: r.unlockedUpgrade
    });
  }
  localStorage.setItem("circleRebirthSave", JSON.stringify(save));
}

function loadData() {
  document.getElementById("lapUpgrades").innerHTML = "";
  for (let i = 0; i < RINGS; i++) {
    player[`r${i + 1}`] = {
      price: new ExpantaNum((i === 0) ? 10 : 50 * Math.pow(20, i)),
      priceInit: new ExpantaNum((i === 0) ? 10 : 50 * Math.pow(20, i)),
      priceScale: 1.25 + i * 0.05,
      level: 0,
      levelBase: Math.max(0.05 - 0.01 * i, 0.01),
      speedInit: 1 - 0.02 * i,
      speed: 1 - 0.02 * i,
      laps: 0,
      lapsCeil: 1,
      effectBase: Math.pow(10, i),
      effect: 0,
      unlocked: (i === 0),
      unlockedUpgrade: (i === 0)
    };

    document.getElementById("lapUpgrades").innerHTML += `
      <button class="lapBtn" id="lapBtn${i + 1}" onclick="upgradeCircle(${i})"
        style="display:none; color:${arcColors[i]}; background-color:${arcColorsSec[i]}; border-color:${arcColors[i]}">
        円 ${i + 1} [レベル <span id="lap${i + 1}Level">0</span>]<br>
        スピード: <span id="lapBtn${i + 1}Current">-</span> →
                 <span id="lapBtn${i + 1}Next">-</span><br>
        コスト: <span id="lapBtn${i + 1}Cost">-</span>
      </button>`;
  }

  const saved = JSON.parse(localStorage.getItem("circleRebirthSave") || "null");
  if (saved) {
    player.points = new ExpantaNum(saved.points);
    player.rebirthTier = saved.rebirthTier;
    player.rebirthPoints = saved.rebirthPoints;
    saved.rings.forEach((rdata, i) => {
      const r = player[`r${i + 1}`];
      r.level = rdata.level;
      r.laps = rdata.laps;
      r.unlocked = rdata.unlocked;
      r.unlockedUpgrade = rdata.unlockedUpgrade;
    });
  }
}

// --------------------------------------
// 表示フォーマット
// --------------------------------------
function formatLong(num) {
  num = new ExpantaNum(num);
  if (num.lt(1000)) return num.toFixed(0);

  const log = Math.floor(num.log10());
  const unitIndex = Math.floor(log / 3);
  const value = num.div(ExpantaNum.pow(10, unitIndex * 3));

  const unit = UNITS[unitIndex] ?? `e${unitIndex * 3}`;
  return `${value.toFixed(1)}${unit}`;
}

// --------------------------------------
// ゲームロジック
// --------------------------------------
function upgradeCircle(n) {
  const r = player[`r${n + 1}`];
  if (player.points.gte(r.price)) {
    player.points = player.points.sub(r.price);
    r.level++;
  }
}

function rebirth() {
  const cost = rebirthCosts[player.rebirthTier] || new ExpantaNum("1e999");
  if (player.points.gte(cost)) {
    player.points = new ExpantaNum(0);
    player.rebirthPoints++;
    player.rebirthTier++;

    for (let i = 1; i <= RINGS; i++) {
      const r = player[`r${i}`];
      r.level = 0;
      r.laps = 0;
      r.unlocked = (i === 1);
      r.unlockedUpgrade = (i === 1);
    }
  }
}

function pointGen() {
  let sum = new ExpantaNum(0);
  for (let i = 1; i <= RINGS; i++) {
    const r = player[`r${i}`];
    if (r.unlocked) sum = sum.add(r.effect);
  }
  return sum;
}

function updateFormula() {
  let str = "";
  for (let i = 1; i <= RINGS; i++) {
    const r = player[`r${i}`];
    str += `<span style="color:${arcColors[i - 1]};">
              ${formatLong(r.effectBase)}×${r.lapsCeil - 1}
            </span>＋`;
  }
  return str.slice(0, -1);
}

// --------------------------------------
// 描画・更新ループ
// --------------------------------------
function update() {
  const c = mainCanvas.getContext("2d");
  c.clearRect(0, 0, 600, 600);

  document.getElementById("points").textContent = formatLong(player.points);
  document.getElementById("pointGen").textContent = formatLong(pointGen());
  document.getElementById("rebirthPoints").textContent = player.rebirthPoints;
  document.getElementById("formula").innerHTML = updateFormula();

  for (let i = 1; i <= RINGS; i++) {
    const r = player[`r${i}`];
    r.effect = (r.lapsCeil - 1) * r.effectBase;
    r.speed = r.speedInit + r.level * r.levelBase;
    r.price = r.priceInit.mul(Math.pow(r.priceScale, r.level));

    if (r.unlocked) {
      c.beginPath();
      c.arc(300, 300, 35 + 35 * (i - 1), 0, (r.laps % 1) * 2 * Math.PI);
      c.strokeStyle = arcColors[i - 1];
      c.lineWidth = 25;
      c.stroke();
      c.beginPath();
      c.arc(300, 300, 35 + 35 * (i - 1), 0, (r.laps % 1) * 2 * Math.PI);
      c.strokeStyle = arcColorsTet[i - 1];
      c.lineWidth = 35;
      c.stroke();
    }

    if (r.level >= 5 && player[`r${i + 1}`]) {
      player[`r${i + 1}`].unlockedUpgrade = true;
    }

    if (r.unlockedUpgrade) {
      r.unlocked = true;
      const btn = document.getElementById(`lapBtn${i}`);
      btn.style.display = "block";
      document.getElementById(`lapBtn${i}Current`).textContent = r.speed.toFixed(2);
      document.getElementById(`lapBtn${i}Next`).textContent = (r.speed + r.levelBase).toFixed(2);
      document.getElementById(`lapBtn${i}Cost`).textContent = formatLong(r.price);
      document.getElementById(`lap${i}Level`).textContent = r.level;
    }
  }

  const nextCost = rebirthCosts[player.rebirthTier] || new ExpantaNum("1e999");
  document.getElementById("rebirthBtn").style.display =
    player.points.gte(nextCost) ? "inline-block" : "none";

  saveData();
}

function mainLoop() {
  for (let i = 1; i <= RINGS; i++) {
    const r = player[`r${i}`];
    if (r.unlocked) {
      r.laps += r.speed / FPS;
      if (r.laps >= r.lapsCeil) {
        player.points = player.points.add(r.effect);
      }
      r.lapsCeil = Math.ceil(r.laps);
    }
  }
}

// --------------------------------------
// 起動
// --------------------------------------
loadData();
setInterval(() => {
  mainLoop();
  update();
}, 1000 / FPS);
