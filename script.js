const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const overlay = document.querySelector("#overlay");
const startButton = document.querySelector("#start-button");
const selectionPanel = document.querySelector("#selection-panel");
const controls = new Set();
const totalLaps = 3;
const lapLength = 10000;
const stages = [
  { name: "NEON HARBOR", description: "港の夜景と明るいコーナー", curve: 1, skyTop: "#6076a5", skyMid: "#f2a17f", skyBottom: "#f4d18e" },
  { name: "MIDNIGHT MESA", description: "高原を駆ける高速コース", curve: 1.15, skyTop: "#425678", skyMid: "#d78d7b", skyBottom: "#f4d18e" },
  { name: "CRYSTAL RIDGE", description: "氷の視界が切れる峠道", curve: 1.32, skyTop: "#3d5779", skyMid: "#7fc4d9", skyBottom: "#dff4ff" },
  { name: "VOLCANIC RUN", description: "炎と噴煙に透かすカーブ", curve: 1.42, skyTop: "#474e6f", skyMid: "#d97f56", skyBottom: "#f6d07d" },
  { name: "SILK SWITCH", description: "緩急が多い都市外環", curve: 1.08, skyTop: "#3d4b75", skyMid: "#f0a99c", skyBottom: "#f1d7a8" },
  { name: "AQUA DRIFT", description: "水面の反射が強い平坦路", curve: 0.9, skyTop: "#5d7d9f", skyMid: "#8cc7d1", skyBottom: "#efecc3" },
  { name: "EMBER GLEN", description: "木立の間を抜ける変則コース", curve: 1.18, skyTop: "#5c4a63", skyMid: "#ce8f72", skyBottom: "#f7d29c" },
  { name: "ALPINE JET", description: "高空に向かう急カーブ", curve: 1.46, skyTop: "#445784", skyMid: "#a6b7e0", skyBottom: "#eef5ff" },
  { name: "TURBO CANAL", description: "運河沿いのスピードライン", curve: 1.06, skyTop: "#496d86", skyMid: "#f2b08a", skyBottom: "#f7e0a2" },
  { name: "ORBIT RING", description: "夜の大通りを高速で横断", curve: 1.2, skyTop: "#2a385d", skyMid: "#d18ae4", skyBottom: "#f6d9d1" },
  { name: "SAND BLASTER", description: "砂埃の舞う広大な平地", curve: 1.28, skyTop: "#7f5d56", skyMid: "#d5ad65", skyBottom: "#f7e0b7" },
  { name: "CLOUD SPUR", description: "雲が低い高原の軽快コース", curve: 1.02, skyTop: "#6e82a7", skyMid: "#add0d8", skyBottom: "#f6f2da" },
  { name: "DUSK BOULEVARD", description: "日没を迎える都市線路", curve: 0.97, skyTop: "#4c5d8b", skyMid: "#e69589", skyBottom: "#f1d7a4" },
  { name: "GHOST BAY", description: "湾曲した海沿いのスラローム", curve: 1.38, skyTop: "#334d7a", skyMid: "#8bb8d5", skyBottom: "#dfeffb" },
  { name: "FURY TUNNEL", description: "トンネル内の短い追い抜き戦", curve: 1.24, skyTop: "#2d3354", skyMid: "#7aafaf", skyBottom: "#d8e4ef" },
  { name: "RUSTIC LOOP", description: "山道の抜け道と密集カーブ", curve: 1.3, skyTop: "#556d6f", skyMid: "#dba177", skyBottom: "#f3d7b3" },
  { name: "SOLAR DELTA", description: "逆光の夕方にインパクトを演出", curve: 1.1, skyTop: "#5671a8", skyMid: "#f7b276", skyBottom: "#fce6a7" },
  { name: "NOVA GATE", description: "広くて見通しが良い技術コース", curve: 1.16, skyTop: "#486d9f", skyMid: "#d6b8ff", skyBottom: "#f3e5f6" },
  { name: "MONOLITH LINE", description: "巨大構造物が並ぶ高速区間", curve: 1.22, skyTop: "#2f466f", skyMid: "#829cc3", skyBottom: "#e6ecff" },
  { name: "PURE ECHO", description: "静寂に包まれた最終ラップ", curve: 1.14, skyTop: "#504a7d", skyMid: "#b6d6ff", skyBottom: "#eff9ff" },
];
const carts = [
  { name: "VOLT", style: "#c9ff57", speed: 1.0, acceleration: 1.02, handling: 1.0, description: "バランス型" },
  { name: "AERON", style: "#53a6ff", speed: 1.08, acceleration: 1.0, handling: 1.08, description: "軽快型" },
  { name: "BLAZE", style: "#ff7d68", speed: 1.12, acceleration: 1.14, handling: 0.95, description: "加速特化" },
  { name: "NIX", style: "#8afad8", speed: 0.96, acceleration: 1.04, handling: 1.18, description: "旋回特化" },
  { name: "RAVEN", style: "#d6a6ff", speed: 1.15, acceleration: 1.08, handling: 1.02, description: "全速力型" },
  { name: "FALCON", style: "#ffbc58", speed: 1.06, acceleration: 0.98, handling: 1.16, description: "追い越し型" },
  { name: "JET", style: "#58d9ff", speed: 1.2, acceleration: 1.06, handling: 0.98, description: "高速型" },
  { name: "CINDER", style: "#ff6b9d", speed: 1.08, acceleration: 1.2, handling: 1.0, description: "立ち上がり型" },
  { name: "MIRAGE", style: "#7ef1ff", speed: 1.16, acceleration: 1.02, handling: 1.1, description: "安定型" },
  { name: "ORBIT", style: "#ffe36a", speed: 1.22, acceleration: 1.1, handling: 0.96, description: "最終速型" },
];
const cpuLevels = [
  { label: "EASY", description: "少し楽な相手", multiplier: 1.08 },
  { label: "STANDARD", description: "適度な競り合い", multiplier: 1.18 },
  { label: "HARD", description: "かなり速い", multiplier: 1.3 },
  { label: "INSANE", description: "プロ級の速さ", multiplier: 1.44 },
];
const racers = [
  { name: "NOVA", progress: 0, speed: 315, lane: -0.48, color: "#ff557a", baseSpeed: 330 },
  { name: "BYTE", progress: 0, speed: 298, lane: 0.48, color: "#50d9ff", baseSpeed: 320 },
  { name: "ACE", progress: 0, speed: 330, lane: 0.05, color: "#ffbd4a", baseSpeed: 350 },
];
const selectionState = {
  menuStep: "title",
  stageIndex: 0,
  cartIndex: 0,
  cpuIndex: 1,
};

const state = {
  running: false,
  finished: false,
  distance: 0,
  speed: 0,
  steer: 0,
  timer: 0,
  hitCooldown: 0,
  lastFrame: 0,
};

function getSelectedStage() {
  return stages[selectionState.stageIndex] || stages[0];
}

function getSelectedCart() {
  return carts[selectionState.cartIndex] || carts[0];
}

function getSelectedCpu() {
  return cpuLevels[selectionState.cpuIndex] || cpuLevels[1];
}

function renderSelectionPanel() {
  const step = selectionState.menuStep;

  if (step === "title") {
    selectionPanel.classList.remove("is-visible");
    selectionPanel.innerHTML = "";
    return;
  }

  selectionPanel.classList.add("is-visible");

  if (step === "stage") {
    selectionPanel.innerHTML = `
      <div class="selection-grid">
        ${stages.map((item, index) => `
          <button class="selection-button ${index === selectionState.stageIndex ? "is-selected" : ""}" data-selection="stage" data-index="${index}" type="button">
            <strong>${item.name}</strong>
            <small>${item.description}</small>
          </button>
        `).join("")}
      </div>
    `;
  }

  if (step === "cart") {
    selectionPanel.innerHTML = `
      <div class="selection-grid">
        ${carts.map((item, index) => `
          <button class="selection-button cart-card ${index === selectionState.cartIndex ? "is-selected" : ""}" data-selection="cart" data-index="${index}" type="button" style="border-color: ${item.style}55;">
            <strong>${item.name}</strong>
            <span>${item.description}</span>
            <div class="specs">
              <div class="spec"><small>TOP</small><strong>${(item.speed * 100).toFixed(0)}</strong></div>
              <div class="spec"><small>ACC</small><strong>${(item.acceleration * 100).toFixed(0)}</strong></div>
              <div class="spec"><small>HAND</small><strong>${(item.handling * 100).toFixed(0)}</strong></div>
            </div>
          </button>
        `).join("")}
      </div>
    `;
  }

  if (step === "cpu") {
    selectionPanel.innerHTML = `
      <div class="selection-grid">
        ${cpuLevels.map((item, index) => `
          <button class="selection-button cpu-card ${index === selectionState.cpuIndex ? "is-selected" : ""}" data-selection="cpu" data-index="${index}" type="button">
            <strong>${item.label}</strong>
            <span>${item.description}</span>
            <small>${item.multiplier.toFixed(2)}x</small>
          </button>
        `).join("")}
      </div>
    `;
  }

  selectionPanel.querySelectorAll("[data-selection]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.selection;
      const index = Number(button.dataset.index);
      if (target === "stage") selectionState.stageIndex = index;
      if (target === "cart") selectionState.cartIndex = index;
      if (target === "cpu") selectionState.cpuIndex = index;
      renderMenu();
    });
  });

  document.querySelector("#button-label").textContent = selectionState.menuStep === "cpu" ? "スタート" : "次へ";
}

function renderMenu() {
  const stage = getSelectedStage();
  const cart = getSelectedCart();
  const cpu = getSelectedCpu();
  const step = selectionState.menuStep;

  if (step === "title") {
    document.querySelector("#overlay-eyebrow").textContent = "READY TO RACE?";
    document.querySelector("#overlay-title").innerHTML = "OWN THE<br><span>TRACK.</span>";
    document.querySelector("#overlay-copy").textContent = "ネオンのコースを駆け抜けて、1位でゴールしよう。";
    document.querySelector("#button-label").textContent = "レーススタート";
    renderSelectionPanel();
    return;
  }

  if (step === "stage") {
    document.querySelector("#overlay-eyebrow").textContent = "SELECT STAGE";
    document.querySelector("#overlay-title").innerHTML = "PICK THE<br><span>TRACK.</span>";
    document.querySelector("#overlay-copy").textContent = `${stage.name} - ${stage.description}`;
  }

  if (step === "cart") {
    document.querySelector("#overlay-eyebrow").textContent = "SELECT CART";
    document.querySelector("#overlay-title").innerHTML = "CHOOSE YOUR<br><span>CART.</span>";
    document.querySelector("#overlay-copy").textContent = `${cart.name} - ${cart.description}`;
  }

  if (step === "cpu") {
    document.querySelector("#overlay-eyebrow").textContent = "CPU LEVEL";
    document.querySelector("#overlay-title").innerHTML = "SET THE<br><span>RIVAL.</span>";
    document.querySelector("#overlay-copy").textContent = `${cpu.label} - ${cpu.description}`;
  }

  renderSelectionPanel();
}

let width = 0;
let height = 0;
let pixelRatio = 1;

function resize() {
  const rect = canvas.getBoundingClientRect();
  pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  width = rect.width;
  height = rect.height;
  canvas.width = Math.round(width * pixelRatio);
  canvas.height = Math.round(height * pixelRatio);
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  draw();
}

function curveAt(distance) {
  const stage = getSelectedStage();
  return (Math.sin(distance / 1180) * 0.72 + Math.sin(distance / 470 + 1.4) * 0.18) * stage.curve;
}

function roadCenter(ahead) {
  const stage = getSelectedStage();
  return width * 0.5 + (curveAt(state.distance + ahead) - curveAt(state.distance)) * width * (0.27 + (stage.curve - 1) * 0.08);
}

function roadWidth(depth) {
  return width * (0.055 + depth * 0.56);
}

function roadY(depth) {
  const horizon = height * 0.39;
  return horizon + Math.pow(depth, 1.65) * (height - horizon);
}

function drawBackground() {
  const stage = getSelectedStage();
  const sky = ctx.createLinearGradient(0, 0, 0, height * 0.55);
  sky.addColorStop(0, stage.skyTop);
  sky.addColorStop(0.58, stage.skyMid);
  sky.addColorStop(1, stage.skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  const sunX = width * 0.76;
  const sunY = height * 0.21;
  const sunGlow = ctx.createRadialGradient(sunX, sunY, 2, sunX, sunY, height * 0.17);
  sunGlow.addColorStop(0, "rgba(255,239,183,.92)");
  sunGlow.addColorStop(1, "rgba(255,218,163,0)");
  ctx.fillStyle = sunGlow;
  ctx.fillRect(sunX - height * 0.17, sunY - height * 0.17, height * 0.34, height * 0.34);
  ctx.fillStyle = "#fff0bc";
  ctx.beginPath();
  ctx.arc(sunX, sunY, Math.max(12, height * 0.04), 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#53617e";
  ctx.beginPath();
  ctx.moveTo(0, height * 0.4);
  for (let x = 0; x <= width + 60; x += 60) {
    ctx.lineTo(x, height * (0.24 + Math.sin(x * 0.013 + 2) * 0.08));
  }
  ctx.lineTo(width, height * 0.42);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#737c91";
  ctx.beginPath();
  ctx.moveTo(0, height * 0.4);
  for (let x = 0; x <= width + 80; x += 80) {
    ctx.lineTo(x, height * (0.3 + Math.sin(x * 0.009) * 0.065));
  }
  ctx.lineTo(width, height * 0.44);
  ctx.closePath();
  ctx.fill();
}

function drawRoad() {
  const bands = 64;
  for (let i = 0; i < bands; i++) {
    const near = i / bands;
    const far = (i + 1) / bands;
    const y1 = roadY(near);
    const y2 = roadY(far);
    const center1 = roadCenter((1 - near) * 1450);
    const center2 = roadCenter((1 - far) * 1450);
    const half1 = roadWidth(near);
    const half2 = roadWidth(far);
    const stripe = Math.floor((state.distance + (1 - near) * 1900) / 110) % 2;

    ctx.fillStyle = stripe ? "#38875f" : "#3d9363";
    ctx.fillRect(0, y1, width, y2 - y1 + 1);
    ctx.fillStyle = stripe ? "#fff0dd" : "#ed536e";
    ctx.beginPath();
    ctx.moveTo(center1 - half1 * 1.12, y1);
    ctx.lineTo(center1 - half1, y1);
    ctx.lineTo(center2 - half2, y2);
    ctx.lineTo(center2 - half2 * 1.12, y2);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(center1 + half1, y1);
    ctx.lineTo(center1 + half1 * 1.12, y1);
    ctx.lineTo(center2 + half2 * 1.12, y2);
    ctx.lineTo(center2 + half2, y2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#41485c";
    ctx.beginPath();
    ctx.moveTo(center1 - half1, y1);
    ctx.lineTo(center1 + half1, y1);
    ctx.lineTo(center2 + half2, y2);
    ctx.lineTo(center2 - half2, y2);
    ctx.closePath();
    ctx.fill();

    if (Math.floor((state.distance + (1 - near) * 2100) / 145) % 2 === 0) {
      ctx.strokeStyle = "rgba(247,244,221,.62)";
      ctx.lineWidth = Math.max(1, near * 2);
      for (const lane of [-1 / 3, 1 / 3]) {
        ctx.beginPath();
        ctx.moveTo(center1 + half1 * lane, y1);
        ctx.lineTo(center2 + half2 * lane, y2);
        ctx.stroke();
      }
    }

    if (i % 5 === 0) drawScenery(near, far);
  }
}

function drawScenery(near, far) {
  const depth = (near + far) * 0.5;
  if (depth < 0.11) return;
  const y = roadY(depth);
  const size = 5 + depth * 34;
  const center = roadCenter((1 - depth) * 1450);
  const half = roadWidth(depth);
  const offset = width * (0.1 + depth * 0.16);
  const scroll = Math.floor((state.distance + (1 - depth) * 2300) / 290);
  for (const side of [-1, 1]) {
    const x = center + side * (half + offset);
    if (x < -size || x > width + size) continue;
    const variation = (scroll + (side < 0 ? 1 : 0)) % 3;
    ctx.fillStyle = variation === 0 ? "#263b52" : variation === 1 ? "#34475b" : "#293c50";
    ctx.beginPath();
    ctx.moveTo(x, y - size * 2.2);
    ctx.lineTo(x - size * 0.65, y);
    ctx.lineTo(x + size * 0.65, y);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#72534e";
    ctx.fillRect(x - size * 0.09, y - size * 0.25, size * 0.18, size * 0.3);
  }
}

function drawCar(x, y, scale, color, player = false) {
  const carWidth = (player ? 49 : 35) * scale;
  const carHeight = (player ? 74 : 52) * scale;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "rgba(15,20,34,.3)";
  ctx.beginPath();
  ctx.ellipse(0, carHeight * 0.36, carWidth * 0.65, carHeight * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#161b26";
  ctx.fillRect(-carWidth * 0.53, -carHeight * 0.1, carWidth * 0.18, carHeight * 0.55);
  ctx.fillRect(carWidth * 0.35, -carHeight * 0.1, carWidth * 0.18, carHeight * 0.55);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-carWidth * 0.48, carHeight * 0.38);
  ctx.lineTo(-carWidth * 0.42, -carHeight * 0.1);
  ctx.lineTo(-carWidth * 0.26, -carHeight * 0.42);
  ctx.lineTo(carWidth * 0.26, -carHeight * 0.42);
  ctx.lineTo(carWidth * 0.42, -carHeight * 0.1);
  ctx.lineTo(carWidth * 0.48, carHeight * 0.38);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(19,31,49,.86)";
  ctx.beginPath();
  ctx.moveTo(-carWidth * 0.28, -carHeight * 0.13);
  ctx.lineTo(-carWidth * 0.17, -carHeight * 0.35);
  ctx.lineTo(carWidth * 0.17, -carHeight * 0.35);
  ctx.lineTo(carWidth * 0.28, -carHeight * 0.13);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#fff5c9";
  ctx.fillRect(-carWidth * 0.36, carHeight * 0.23, carWidth * 0.19, carHeight * 0.07);
  ctx.fillRect(carWidth * 0.17, carHeight * 0.23, carWidth * 0.19, carHeight * 0.07);
  if (player && state.speed > 140) {
    ctx.fillStyle = "rgba(201,255,87,.8)";
    ctx.beginPath();
    ctx.moveTo(-carWidth * 0.16, carHeight * 0.37);
    ctx.lineTo(0, carHeight * (0.48 + Math.random() * 0.16));
    ctx.lineTo(carWidth * 0.16, carHeight * 0.37);
    ctx.fill();
  }
  ctx.restore();
}

function drawRacers() {
  const opponents = racers
    .map((racer) => ({ ...racer, gap: racer.progress - state.distance }))
    .filter((racer) => racer.gap > 0 && racer.gap < 1500)
    .sort((a, b) => b.gap - a.gap);
  for (const racer of opponents) {
    const depth = 1 - racer.gap / 1500;
    const x = roadCenter(racer.gap) + racer.lane * roadWidth(depth);
    drawCar(x, roadY(depth), 0.3 + depth * 0.85, racer.color);
  }
}

function drawPlayer() {
  const center = roadCenter(0);
  const y = height * 0.84;
  const x = center + state.steer * roadWidth(0.78);
  drawCar(x, y, Math.min(1.15, width / 700), getSelectedCart().style, true);
}

function draw() {
  if (!width || !height) return;
  ctx.clearRect(0, 0, width, height);
  drawBackground();
  drawRoad();
  drawRacers();
  drawPlayer();
}

function updateHud() {
  const place = 1 + racers.filter((racer) => racer.progress > state.distance).length;
  document.querySelector("#position").textContent = String(place);
  document.querySelector("#lap").textContent = String(Math.min(totalLaps, Math.floor(state.distance / lapLength) + 1));
  document.querySelector("#speed").textContent = String(Math.round(state.speed * 0.58)).padStart(3, "0");
  const minutes = Math.floor(state.timer / 60).toString().padStart(2, "0");
  const seconds = (state.timer % 60).toFixed(1).padStart(4, "0");
  document.querySelector("#clock").textContent = `${minutes}:${seconds}`;
}

function finishRace() {
  state.running = false;
  state.finished = true;
  const place = 1 + racers.filter((racer) => racer.progress > state.distance).length;
  document.querySelector("#overlay-eyebrow").textContent = "CHEQUERED FLAG";
  document.querySelector("#overlay-title").innerHTML = place === 1 ? "YOU'RE<br><span>THE ACE.</span>" : `RACE<br><span>COMPLETE.</span>`;
  document.querySelector("#overlay-copy").textContent = `${place}位でフィニッシュ！ タイム ${document.querySelector("#clock").textContent}`;
  document.querySelector("#button-label").textContent = "もう一度プレイ";
  overlay.classList.remove("is-hidden");
}

function update(delta) {
  const gas = controls.has("gas") || controls.has("up");
  const braking = controls.has("down");
  const steering = (controls.has("right") || controls.has("rightkey") ? 1 : 0) - (controls.has("left") || controls.has("leftkey") ? 1 : 0);
  const cart = getSelectedCart();
  const maxSpeed = 390 * cart.speed;
  state.speed += (gas ? 245 * cart.acceleration : -105) * delta;
  if (braking) state.speed -= 270 * delta;
  state.speed = Math.max(0, Math.min(maxSpeed, state.speed));
  state.steer += (steering * (0.95 + state.speed / maxSpeed * 1.05) * cart.handling - state.steer * 2.8) * delta;
  state.steer = Math.max(-1.3, Math.min(1.3, state.steer));
  if (Math.abs(state.steer) > 0.88) state.speed = Math.max(100, state.speed - 95 * delta);
  state.distance += state.speed * delta;
  state.timer += delta;
  state.hitCooldown = Math.max(0, state.hitCooldown - delta);

  for (const racer of racers) {
    racer.progress += racer.speed * delta;
    racer.lane += Math.sin((state.timer + racer.speed) * 0.45) * delta * 0.035;
    racer.lane = Math.max(-0.65, Math.min(0.65, racer.lane));
    const gap = racer.progress - state.distance;
    if (state.hitCooldown === 0 && gap > -28 && gap < 28 && Math.abs(state.steer - racer.lane) < 0.3) {
      state.speed *= 0.58;
      state.hitCooldown = 1;
    }
  }
  if (state.distance >= totalLaps * lapLength) {
    state.distance = totalLaps * lapLength;
    finishRace();
  }
  updateHud();
}

function frame(timestamp) {
  const delta = Math.min((timestamp - (state.lastFrame || timestamp)) / 1000, 0.04);
  state.lastFrame = timestamp;
  if (state.running) update(delta);
  draw();
  requestAnimationFrame(frame);
}

function startRace() {
  const cpu = getSelectedCpu();
  state.running = true;
  state.finished = false;
  state.distance = 0;
  state.speed = 0;
  state.steer = 0;
  state.timer = 0;
  state.hitCooldown = 0;
  for (const [index, racer] of racers.entries()) {
    racer.progress = index === 2 ? 80 : 0;
    racer.speed = racer.baseSpeed * cpu.multiplier;
  }
  controls.clear();
  overlay.classList.add("is-hidden");
  updateHud();
}

const keyMap = {
  ArrowUp: "up", w: "up", W: "up",
  ArrowDown: "down", s: "down", S: "down",
  ArrowLeft: "leftkey", a: "leftkey", A: "leftkey",
  ArrowRight: "rightkey", d: "rightkey", D: "rightkey",
};

window.addEventListener("keydown", (event) => {
  const control = keyMap[event.key];
  if (!control) return;
  event.preventDefault();
  controls.add(control);
});

window.addEventListener("keyup", (event) => {
  const control = keyMap[event.key];
  if (control) controls.delete(control);
});

window.addEventListener("blur", () => controls.clear());
startButton.addEventListener("click", () => {
  if (!state.running && !state.finished && selectionState.menuStep === "title") {
    selectionState.menuStep = "stage";
    renderMenu();
    return;
  }

  if (!state.running && !state.finished && selectionState.menuStep === "stage") {
    selectionState.menuStep = "cart";
    renderMenu();
    return;
  }

  if (!state.running && !state.finished && selectionState.menuStep === "cart") {
    selectionState.menuStep = "cpu";
    renderMenu();
    return;
  }

  if (!state.running && !state.finished && selectionState.menuStep === "cpu") {
    startRace();
    return;
  }

  if (state.finished) {
    state.finished = false;
    state.running = false;
    selectionState.menuStep = "title";
    renderMenu();
    overlay.classList.remove("is-hidden");
    return;
  }

  startRace();
});

document.querySelectorAll("[data-control]").forEach((button) => {
  const control = button.dataset.control;
  const release = () => {
    controls.delete(control);
    button.classList.remove("is-pressed");
  };
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    controls.add(control);
    button.classList.add("is-pressed");
    button.setPointerCapture(event.pointerId);
  });
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("lostpointercapture", release);
});

window.addEventListener("resize", resize);
renderMenu();
resize();
updateHud();
requestAnimationFrame(frame);
