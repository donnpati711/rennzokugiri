const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const overlay = document.querySelector("#overlay");
const startButton = document.querySelector("#start-button");
const controls = new Set();
const totalLaps = 3;
const lapLength = 10000;
const racers = [
  { name: "NOVA", progress: 0, speed: 315, lane: -0.48, color: "#ff557a" },
  { name: "BYTE", progress: 0, speed: 298, lane: 0.48, color: "#50d9ff" },
  { name: "ACE", progress: 0, speed: 330, lane: 0.05, color: "#ffbd4a" },
];

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
  return Math.sin(distance / 1180) * 0.72 + Math.sin(distance / 470 + 1.4) * 0.18;
}

function roadCenter(ahead) {
  return width * 0.5 + (curveAt(state.distance + ahead) - curveAt(state.distance)) * width * 0.27;
}

function roadWidth(depth) {
  return width * (0.055 + depth * 0.56);
}

function roadY(depth) {
  const horizon = height * 0.39;
  return horizon + Math.pow(depth, 1.65) * (height - horizon);
}

function drawBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, height * 0.55);
  sky.addColorStop(0, "#6076a5");
  sky.addColorStop(0.58, "#f2a17f");
  sky.addColorStop(1, "#f4d18e");
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
  drawCar(x, y, Math.min(1.15, width / 700), "#c9ff57", true);
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
  const maxSpeed = 390;
  state.speed += (gas ? 245 : -105) * delta;
  if (braking) state.speed -= 270 * delta;
  state.speed = Math.max(0, Math.min(maxSpeed, state.speed));
  state.steer += (steering * (0.95 + state.speed / maxSpeed * 1.05) - state.steer * 2.8) * delta;
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
  state.running = true;
  state.finished = false;
  state.distance = 0;
  state.speed = 0;
  state.steer = 0;
  state.timer = 0;
  state.hitCooldown = 0;
  for (const [index, racer] of racers.entries()) {
    racer.progress = index === 2 ? 80 : 0;
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
startButton.addEventListener("click", startRace);

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
resize();
updateHud();
requestAnimationFrame(frame);
