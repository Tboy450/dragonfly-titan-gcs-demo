import { createChaseRenderer } from "./chase-vehicle.mjs";
import { enterFreeCamera, orbitCamera } from "./flight-camera.mjs";

const model = {
  massKg: 875,
  titanG: 1.352,
  earthG: 9.80665,
  rhoTitan: 5.4,
  rhoEarth: 1.225,
  rotorCount: 8,
  rotorDiameterM: 1.35,
  figureOfMerit: 0.75,
  inducedLossFactor: 1.15,
  batteryAh: 134,
};

const state = {
  mode: "Preflight",
  auto: true,
  hold: false,
  missionTime: 0,
  profilePhase: 0,
  altitude: 0,
  verticalSpeed: 0,
  speed: 0,
  throttle: 0.52,
  yaw: 0,
  pitch: 0,
  roll: 0,
  heading: 84,
  positionX: 0,
  positionZ: 0,
  battery: 96,
  wind: 0.8,
  payloadDelta: 0,
  view: "mission",
  cameraMode: "fixed",
  cameraYaw: 0,
  cameraPitch: 0.10,
  chart: [],
  lastTick: performance.now(),
};

const $ = (id) => document.getElementById(id);
const flightCanvas = $("flight-canvas");
const chartCanvas = $("chart-canvas");
const flightCtx = flightCanvas.getContext("2d");
const chartCtx = chartCanvas.getContext("2d");
const rotorGrid = $("rotor-grid");
const pilotRotorGrid = $("pilot-rotor-grid");
const titanMountainImage = new Image();
titanMountainImage.decoding = "async";
titanMountainImage.src = "./assets/titan-mountain-reference.jpg";
let chaseRenderer;
try {
  chaseRenderer = createChaseRenderer();
} catch (error) {
  console.warn("3D rendering unavailable; using the fixed flight view.", error);
  $("free-camera-button").disabled = true;
  $("free-camera-button").title = "Free camera requires WebGL 2";
}

const rotorTiles = Array.from({ length: model.rotorCount }, (_, index) => {
  const tile = document.createElement("div");
  tile.className = "rotor-tile";
  tile.innerHTML = `
    <header><span>R${index + 1}</span><span class="rotor-load">50%</span></header>
    <strong class="rotor-rpm">0000 rpm</strong>
    <div class="rotor-bar"><i></i></div>
  `;
  rotorGrid.appendChild(tile);
  return tile;
});

const pilotRotorTiles = Array.from({ length: model.rotorCount }, () => {
  const tile = document.createElement("b");
  tile.textContent = "000";
  pilotRotorGrid.appendChild(tile);
  return tile;
});

const derived = () => {
  const mass = model.massKg + state.payloadDelta;
  const singleArea = Math.PI * (model.rotorDiameterM / 2) ** 2;
  const totalArea = singleArea * model.rotorCount;
  const titanWeight = mass * model.titanG;
  const earthWeight = mass * model.earthG;
  const inducedTitan = Math.sqrt(titanWeight / (2 * model.rhoTitan * totalArea));
  const idealTitan = titanWeight * inducedTitan;
  const realisticTitan = (idealTitan * model.inducedLossFactor) / model.figureOfMerit;
  const inducedEarth = Math.sqrt(earthWeight / (2 * model.rhoEarth * totalArea));
  const idealEarth = earthWeight * inducedEarth;
  return {
    mass,
    totalArea,
    titanWeight,
    inducedTitan,
    idealTitan,
    realisticTitan,
    idealEarth,
  };
};

function formatTime(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(s / 60).toString().padStart(2, "0");
  const rest = (s % 60).toString().padStart(2, "0");
  return `${minutes}:${rest}`;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function profileAt(t) {
  const phase = t % 180;
  if (phase < 22) {
    return {
      mode: "Takeoff",
      altitude: lerp(0, 46, phase / 22),
      verticalSpeed: 2.1,
      speed: lerp(0, 4, phase / 22),
      throttle: 0.66,
      pitch: 0.12,
      roll: Math.sin(t * 0.9) * 0.06,
    };
  }
  if (phase < 55) {
    return {
      mode: "Hover",
      altitude: 46 + Math.sin(t * 0.7) * 0.9,
      verticalSpeed: Math.cos(t * 0.7) * 0.2,
      speed: 1.3 + Math.sin(t * 0.4) * 0.5,
      throttle: 0.54,
      pitch: 0.03,
      roll: Math.sin(t * 0.5) * 0.08,
    };
  }
  if (phase < 122) {
    return {
      mode: "Traverse",
      altitude: 48 + Math.sin(t * 0.28) * 2.2,
      verticalSpeed: Math.cos(t * 0.28) * 0.42,
      speed: 10 + Math.sin(t * 0.35) * 1.2,
      throttle: 0.61,
      pitch: 0.3 + Math.sin(t * 0.23) * 0.08,
      roll: Math.sin(t * 0.42) * 0.2,
    };
  }
  if (phase < 158) {
    const p = (phase - 122) / 36;
    return {
      mode: "Descent",
      altitude: lerp(48, 7, p),
      verticalSpeed: -1.15,
      speed: lerp(7, 2.2, p),
      throttle: 0.45,
      pitch: 0.08,
      roll: Math.sin(t * 0.5) * 0.1,
    };
  }
  return {
    mode: "Surface",
    altitude: 0,
    verticalSpeed: 0,
    speed: 0,
    throttle: 0.18,
    pitch: 0,
    roll: 0,
  };
}

function updateSimulation(dt) {
  if (!state.hold) {
    state.missionTime += dt;
  }

  if (state.auto) {
    const target = profileAt(state.missionTime);
    state.mode = target.mode;
    state.altitude = lerp(state.altitude, target.altitude, 0.08);
    state.verticalSpeed = lerp(state.verticalSpeed, target.verticalSpeed, 0.12);
    state.speed = lerp(state.speed, target.speed + state.wind * 0.12, 0.09);
    state.throttle = lerp(state.throttle, target.throttle, 0.09);
    state.pitch = lerp(state.pitch, target.pitch, 0.08);
    state.roll = lerp(state.roll, target.roll, 0.08);
    state.yaw = Math.sin(state.missionTime * 0.22) * 0.17;
  } else {
    const thrustBalance = (state.throttle - 0.5) * 5.2;
    state.verticalSpeed = clamp(state.verticalSpeed + thrustBalance * dt - 0.18 * dt, -3.5, 4.2);
    state.altitude = Math.max(0, state.altitude + state.verticalSpeed * dt);
    if (state.altitude === 0) state.verticalSpeed = Math.max(0, state.verticalSpeed);
    state.speed = clamp(state.speed + state.pitch * dt * 3 - state.speed * 0.08 * dt, 0, 16);
    state.mode = state.altitude < 1 ? "Surface" : state.speed > 5 ? "Traverse" : "Manual";
  }

  state.heading = (state.heading + state.yaw * 22 * dt + 360) % 360;
  if (!state.hold) {
    const bearing = state.heading * Math.PI / 180;
    state.positionX += Math.sin(bearing) * state.speed * dt;
    state.positionZ -= Math.cos(bearing) * state.speed * dt;
  }
  const d = derived();
  const cruisePenalty = 1 + (state.speed ** 2) / 95;
  const windPenalty = 1 + state.wind * 0.025;
  const throttlePenalty = 0.78 + state.throttle * 0.47;
  state.power = d.realisticTitan * cruisePenalty * windPenalty * throttlePenalty;
  state.battery = clamp(state.battery - (state.power / 1000) * dt * 0.0012 + 0.001, 0, 100);

  if (!state.hold) {
    state.chart.push({
      time: state.missionTime,
      altitude: state.altitude,
      powerKw: state.power / 1000,
      speed: state.speed,
    });
    if (state.chart.length > 180) state.chart.shift();
  }
}

function setMode(mode) {
  state.auto = mode === "auto";
  state.hold = mode === "hold" ? !state.hold : false;
  if (mode === "takeoff") {
    state.auto = false;
    state.throttle = 0.68;
    state.pitch = 0.08;
  }
  if (mode === "cruise") {
    state.auto = false;
    state.throttle = 0.6;
    state.pitch = 0.34;
  }
  if (mode === "land") {
    state.auto = false;
    state.throttle = 0.39;
    state.pitch = 0.03;
  }
}

function resizeCanvas(canvas, ctx) {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const width = Math.max(1, Math.floor(rect.width * dpr));
  const height = Math.max(1, Math.floor(rect.height * dpr));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return rect;
}

function drawFlight() {
  const rect = resizeCanvas(flightCanvas, flightCtx);
  const w = rect.width;
  const h = rect.height;
  const ctx = flightCtx;
  ctx.clearRect(0, 0, w, h);

  if (state.view === "pilot") {
    drawPilotFlight(ctx, w, h);
    return;
  }

  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#412318");
  sky.addColorStop(0.28, "#9c4d20");
  sky.addColorStop(0.55, "#191724");
  sky.addColorStop(1, "#081018");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.translate(w / 2, h * 0.39 + state.pitch * 34);
  ctx.rotate(-state.roll * 0.28);
  ctx.fillStyle = "rgba(8, 16, 24, 0.52)";
  ctx.fillRect(-w, 0, w * 2, h);
  ctx.strokeStyle = "rgba(124, 231, 255, 0.62)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-w, 0);
  ctx.lineTo(w, 0);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.translate(0, h * 0.72);
  for (let layer = 0; layer < 7; layer += 1) {
    const y = layer * 34 + Math.sin(state.missionTime * 0.18 + layer) * 4;
    ctx.strokeStyle = `rgba(255, 180, 87, ${0.08 + layer * 0.025})`;
    ctx.lineWidth = 1 + layer * 0.3;
    ctx.beginPath();
    for (let x = -20; x < w + 20; x += 24) {
      const py = y + Math.sin(x * 0.018 + layer * 0.9) * (10 + layer * 2);
      if (x === -20) ctx.moveTo(x, py);
      else ctx.lineTo(x, py);
    }
    ctx.stroke();
  }
  ctx.restore();

  drawGrid(ctx, w, h);
  drawVehicle(ctx, w, h);
  drawHud(ctx, w, h);
}

function drawPilotFlight(ctx, w, h) {
  if (chaseRenderer) {
    chaseRenderer.draw(ctx, w, h, state);
    return;
  }
  const horizon = h * 0.31 + state.pitch * 18;
  drawTitanEnvironment(ctx, w, h, horizon);

  const shadowWidth = Math.min(w * 0.21, 260) * (1 - Math.min(state.altitude, 60) / 170);
  ctx.save();
  ctx.fillStyle = "rgba(38, 16, 5, 0.32)";
  ctx.filter = "blur(7px)";
  ctx.beginPath();
  ctx.ellipse(w / 2, h * 0.58, shadowWidth, shadowWidth * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  drawRotorWash(ctx, w, h);
  drawChaseVehicle(ctx, w, h);
  drawTitanHaze(ctx, w, h, horizon);
}

function hashUnit(value) {
  const raw = Math.sin(value * 12.9898 + 78.233) * 43758.5453;
  return raw - Math.floor(raw);
}

function drawTitanEnvironment(ctx, w, h, horizon) {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#e2a04e");
  sky.addColorStop(0.28, "#d28438");
  sky.addColorStop(0.62, "#a64d20");
  sky.addColorStop(1, "#6d270e");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  if (titanMountainImage.complete && titanMountainImage.naturalWidth > 0) {
    const sourceW = titanMountainImage.naturalWidth;
    const sourceH = titanMountainImage.naturalHeight;
    const targetH = Math.min(h * 0.61, horizon + h * 0.24);
    const sourceAspect = sourceW / sourceH;
    const targetAspect = w / targetH;
    let sx = 0;
    let sy = 0;
    let sw = sourceW;
    let sh = sourceH;

    if (targetAspect > sourceAspect) {
      sh = sourceW / targetAspect;
      sy = Math.max(0, Math.min(sourceH - sh, sourceH * 0.08));
    } else {
      sw = sourceH * targetAspect;
      sx = (sourceW - sw) / 2;
    }

    ctx.save();
    ctx.globalAlpha = 0.86;
    ctx.filter = "saturate(0.78) contrast(1.08) brightness(0.88)";
    ctx.drawImage(titanMountainImage, sx, sy, sw, sh, 0, 0, w, targetH);
    ctx.restore();

    const mountainHaze = ctx.createLinearGradient(0, 0, 0, targetH);
    mountainHaze.addColorStop(0, "rgba(230, 159, 69, 0.24)");
    mountainHaze.addColorStop(0.52, "rgba(190, 91, 30, 0.12)");
    mountainHaze.addColorStop(1, "rgba(113, 42, 14, 0.46)");
    ctx.fillStyle = mountainHaze;
    ctx.fillRect(0, 0, w, targetH);
  }

  const ridgeColors = ["rgba(105, 43, 19, 0.18)", "rgba(126, 50, 19, 0.3)", "rgba(145, 57, 18, 0.5)"];
  for (let ridge = 0; ridge < 3; ridge += 1) {
    const baseY = horizon + 4 + ridge * 18;
    ctx.fillStyle = ridgeColors[ridge];
    ctx.beginPath();
    ctx.moveTo(0, baseY + 16);
    ctx.bezierCurveTo(w * 0.16, baseY - 22 - ridge * 3, w * 0.3, baseY + 18, w * 0.46, baseY - 6);
    ctx.bezierCurveTo(w * 0.62, baseY - 30, w * 0.78, baseY + 18, w, baseY - 10);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();
  }

  const ground = ctx.createLinearGradient(0, horizon, 0, h);
  ground.addColorStop(0, "rgba(126, 53, 19, 0.18)");
  ground.addColorStop(0.35, "#8b3512");
  ground.addColorStop(1, "#57200c");
  ctx.fillStyle = ground;
  ctx.fillRect(0, horizon + 32, w, h - horizon - 32);

  const travel = state.missionTime * Math.max(0.45, state.speed) * 0.0045;
  for (let i = 0; i < 150; i += 1) {
    const depth = (hashUnit(i * 8.17) + travel) % 1;
    const perspective = depth * depth;
    const y = horizon + 38 + perspective * (h - horizon - 28);
    const drift = Math.sin(state.heading * Math.PI / 180) * perspective * 90;
    const x = ((hashUnit(i * 19.31 + 4) * (w + 120) + drift) % (w + 120)) - 60;
    const size = 0.8 + perspective * (8 + hashUnit(i * 3.9) * 12);
    const warm = Math.floor(72 + hashUnit(i * 5.6) * 42);

    ctx.fillStyle = `rgba(35, 12, 4, ${0.15 + perspective * 0.42})`;
    ctx.beginPath();
    ctx.ellipse(x + size * 0.3, y + size * 0.32, size * 0.86, size * 0.28, -0.14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgb(${warm + 55}, ${warm}, ${Math.max(18, warm - 44)})`;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.74, y + size * 0.12);
    ctx.lineTo(x - size * 0.34, y - size * 0.52);
    ctx.lineTo(x + size * 0.36, y - size * 0.42);
    ctx.lineTo(x + size * 0.72, y + size * 0.02);
    ctx.lineTo(x + size * 0.28, y + size * 0.34);
    ctx.lineTo(x - size * 0.45, y + size * 0.3);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = `rgba(255, 194, 102, ${0.08 + perspective * 0.24})`;
    ctx.lineWidth = Math.max(0.6, perspective * 1.4);
    ctx.beginPath();
    ctx.moveTo(x - size * 0.28, y - size * 0.35);
    ctx.lineTo(x + size * 0.31, y - size * 0.26);
    ctx.stroke();
  }
}

function drawRotorWash(ctx, w, h) {
  const phase = state.missionTime * 2.4;
  ctx.save();
  ctx.strokeStyle = "rgba(231, 159, 82, 0.13)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i += 1) {
    const radius = 26 + ((phase * 12 + i * 23) % 90);
    ctx.beginPath();
    ctx.ellipse(w / 2, h * 0.57, radius * 1.8, radius * 0.24, 0, Math.PI * 0.08, Math.PI * 0.92);
    ctx.stroke();
  }
  ctx.restore();
}

function drawTitanHaze(ctx, w, h, horizon) {
  const haze = ctx.createLinearGradient(0, 0, 0, h);
  haze.addColorStop(0, "rgba(255, 205, 106, 0.17)");
  haze.addColorStop(Math.max(0.2, horizon / h), "rgba(235, 145, 61, 0.14)");
  haze.addColorStop(0.72, "rgba(126, 49, 16, 0.03)");
  haze.addColorStop(1, "rgba(63, 22, 6, 0.12)");
  ctx.fillStyle = haze;
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  for (let i = 0; i < 34; i += 1) {
    const x = (hashUnit(i * 5.13) * w + state.missionTime * state.wind * (2 + hashUnit(i) * 4)) % w;
    const y = horizon * 0.45 + hashUnit(i * 11.7) * Math.max(40, h - horizon * 0.35);
    const radius = 0.6 + hashUnit(i * 3.4) * 2.2;
    ctx.fillStyle = `rgba(255, 197, 112, ${0.04 + hashUnit(i * 4.7) * 0.12})`;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawChaseVehicle(ctx, w, h) {
  if (chaseRenderer) {
    chaseRenderer.draw(ctx, w, h, state);
    return;
  }
  drawChaseVehicleFallback(ctx, w, h);
}

function drawChaseVehicleFallback(ctx, w, h) {
  const size = clamp(Math.min(w, h) * 0.245, 96, 202);
  const cx = w / 2;
  const cy = h * 0.37;
  const fixedYaw = clamp(Math.sin(((state.heading - 84) * Math.PI) / 180) * 0.34 + state.yaw * 0.42, -0.58, 0.58);
  const fixedPitch = clamp(state.pitch * 0.5, -0.42, 0.42);
  const viewYaw = state.cameraMode === "free" ? clamp(state.cameraYaw + fixedYaw * 0.25, -1.15, 1.15) : fixedYaw;
  const viewPitch = state.cameraMode === "free" ? clamp(state.cameraPitch + fixedPitch * 0.35, -0.58, 0.58) : fixedPitch;
  const bank = -state.roll * 0.14 + viewYaw * 0.025;
  const lift = Math.sin(state.missionTime * 1.8) * 2.4;

  ctx.save();
  ctx.translate(cx + viewYaw * size * 0.08, cy + lift - viewPitch * size * 0.07);
  ctx.rotate(bank);
  ctx.transform(1, viewYaw * 0.045, viewYaw * 0.24, 0.86 + viewPitch * 0.13, 0, 0);

  // Rear three-quarter chase view: the nose points toward the horizon.
  const stations = [
    [-0.9, -0.38],
    [0.9, -0.38],
    [-1.02, 0.23],
    [1.02, 0.23],
  ];

  // Far rotor stacks sit behind the fuselage in this camera angle.
  stations.slice(0, 2).forEach(([x, y], index) => {
    drawCoaxialRotor(ctx, x * size, y * size, size * 0.42, state.missionTime * (index ? -8 : 8), index);
  });

  ctx.strokeStyle = "rgba(104, 109, 108, 0.98)";
  ctx.lineWidth = Math.max(5, size * 0.052);
  ctx.lineCap = "round";
  stations.forEach(([x, y], index) => {
    ctx.beginPath();
    ctx.moveTo(Math.sign(x) * size * 0.38, index < 2 ? -size * 0.25 : size * 0.14);
    ctx.lineTo(x * size, y * size);
    ctx.stroke();
  });

  // Long fore-aft skids and their splayed supports.
  ctx.strokeStyle = "rgba(72, 77, 77, 0.98)";
  ctx.lineWidth = Math.max(3, size * 0.027);
  ctx.beginPath();
  ctx.moveTo(-size * 0.34, -size * 0.18);
  ctx.lineTo(-size * 0.57, size * 0.39);
  ctx.moveTo(-size * 0.42, size * 0.28);
  ctx.lineTo(-size * 0.66, size * 0.64);
  ctx.moveTo(size * 0.34, -size * 0.18);
  ctx.lineTo(size * 0.57, size * 0.39);
  ctx.moveTo(size * 0.42, size * 0.28);
  ctx.lineTo(size * 0.66, size * 0.64);
  ctx.moveTo(-size * 0.62, size * 0.06);
  ctx.lineTo(-size * 0.69, size * 0.67);
  ctx.moveTo(size * 0.62, size * 0.06);
  ctx.lineTo(size * 0.69, size * 0.67);
  ctx.stroke();

  // Long equipment deck, similar to the exposed flight-structure photographs.
  const metal = ctx.createLinearGradient(-size * 0.5, -size * 0.65, size * 0.5, size * 0.55);
  metal.addColorStop(0, "#87908f");
  metal.addColorStop(0.34, "#596264");
  metal.addColorStop(0.7, "#6e7776");
  metal.addColorStop(1, "#343d3f");
  ctx.fillStyle = metal;
  ctx.strokeStyle = "rgba(38, 43, 44, 0.86)";
  ctx.lineWidth = Math.max(1.5, size * 0.012);
  ctx.beginPath();
  ctx.moveTo(-size * 0.45, -size * 0.48);
  ctx.lineTo(size * 0.45, -size * 0.48);
  ctx.lineTo(size * 0.5, size * 0.38);
  ctx.lineTo(size * 0.45, size * 0.56);
  ctx.lineTo(-size * 0.45, size * 0.56);
  ctx.lineTo(-size * 0.5, size * 0.38);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Only the forward third is enclosed by the curved insulated cab.
  const shell = ctx.createLinearGradient(0, -size * 0.78, 0, size * 0.08);
  shell.addColorStop(0, "#f0f1ed");
  shell.addColorStop(0.48, "#a9b0ae");
  shell.addColorStop(1, "#747d7d");
  ctx.fillStyle = shell;
  ctx.strokeStyle = "rgba(55, 61, 61, 0.9)";
  ctx.lineWidth = Math.max(1.5, size * 0.014);
  ctx.beginPath();
  ctx.moveTo(-size * 0.46, -size * 0.18);
  ctx.bezierCurveTo(-size * 0.5, -size * 0.36, -size * 0.34, -size * 0.54, -size * 0.19, -size * 0.57);
  ctx.quadraticCurveTo(0, -size * 0.63, size * 0.19, -size * 0.57);
  ctx.bezierCurveTo(size * 0.34, -size * 0.54, size * 0.5, -size * 0.36, size * 0.46, -size * 0.18);
  ctx.quadraticCurveTo(0, -size * 0.09, -size * 0.46, -size * 0.18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "rgba(244, 247, 240, 0.42)";
  ctx.lineWidth = Math.max(1, size * 0.01);
  ctx.beginPath();
  ctx.moveTo(-size * 0.23, -size * 0.53);
  ctx.quadraticCurveTo(0, -size * 0.6, size * 0.23, -size * 0.53);
  ctx.stroke();

  // Gold blanket rails and access-panel edges from the integration article.
  ctx.strokeStyle = "#d1a02d";
  ctx.lineWidth = Math.max(2, size * 0.018);
  ctx.beginPath();
  ctx.moveTo(-size * 0.45, -size * 0.17);
  ctx.lineTo(-size * 0.42, size * 0.39);
  ctx.lineTo(-size * 0.34, size * 0.52);
  ctx.lineTo(size * 0.34, size * 0.52);
  ctx.lineTo(size * 0.42, size * 0.39);
  ctx.lineTo(size * 0.45, -size * 0.17);
  ctx.stroke();

  ctx.strokeStyle = "rgba(27, 33, 34, 0.62)";
  ctx.lineWidth = 1;
  for (const y of [-0.05, 0.14, 0.33]) {
    ctx.beginPath();
    ctx.moveTo(-size * 0.42, size * y);
    ctx.lineTo(size * 0.42, size * y);
    ctx.stroke();
  }

  for (const x of [-0.26, 0, 0.26]) {
    ctx.fillStyle = "#131a1d";
    ctx.fillRect(size * (x - 0.075), size * 0.2, size * 0.15, size * 0.1);
    ctx.strokeStyle = "#d1a02d";
    ctx.strokeRect(size * (x - 0.075), size * 0.2, size * 0.15, size * 0.1);
  }

  // Large top-mounted high-gain antenna and its short pedestal.
  ctx.strokeStyle = "#656d6d";
  ctx.lineWidth = Math.max(3, size * 0.025);
  ctx.beginPath();
  ctx.moveTo(size * 0.08, size * 0.42);
  ctx.lineTo(size * 0.08, size * 0.24);
  ctx.stroke();
  ctx.fillStyle = "#b8bdb8";
  ctx.strokeStyle = "#616968";
  ctx.lineWidth = Math.max(1.5, size * 0.012);
  ctx.beginPath();
  ctx.ellipse(size * 0.08, size * 0.22, size * 0.19, size * 0.058, -0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Rear stabilizer fins and sensor housings.
  ctx.fillStyle = "#847046";
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(side * size * 0.39, size * 0.32);
    ctx.lineTo(side * size * 0.57, size * 0.16);
    ctx.lineTo(side * size * 0.43, size * 0.48);
    ctx.closePath();
    ctx.fill();
  }

  // Twin helicopter-style landing rails with two braced mounts per side.
  ctx.strokeStyle = "rgba(61, 67, 67, 0.98)";
  ctx.lineWidth = Math.max(3.2, size * 0.03);
  ctx.lineCap = "round";
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(side * size * 0.61, -size * 0.11);
    ctx.quadraticCurveTo(side * size * 0.68, -size * 0.04, side * size * 0.67, size * 0.13);
    ctx.lineTo(side * size * 0.7, size * 0.68);
    ctx.quadraticCurveTo(side * size * 0.68, size * 0.75, side * size * 0.59, size * 0.73);
    ctx.stroke();

    ctx.lineWidth = Math.max(2.4, size * 0.022);
    ctx.beginPath();
    ctx.moveTo(side * size * 0.39, size * 0.02);
    ctx.lineTo(side * size * 0.66, size * 0.22);
    ctx.moveTo(side * size * 0.41, size * 0.38);
    ctx.lineTo(side * size * 0.69, size * 0.55);
    ctx.stroke();
    ctx.lineWidth = Math.max(3.2, size * 0.03);
  }

  // Near rotor stacks overlap the airframe, making all four stations legible.
  stations.slice(2).forEach(([x, y], index) => {
    drawCoaxialRotor(ctx, x * size, y * size, size * 0.45, state.missionTime * (index ? -8 : 8), index + 2);
  });
  ctx.restore();
}

function drawCoaxialRotor(ctx, x, y, radius, spin, index) {
  ctx.save();
  ctx.translate(x, y);

  ctx.strokeStyle = "rgba(62, 66, 66, 0.98)";
  ctx.lineWidth = Math.max(2.5, radius * 0.07);
  ctx.beginPath();
  ctx.moveTo(0, -radius * 0.34);
  ctx.lineTo(0, radius * 0.35);
  ctx.stroke();

  // Dragonfly uses two counter-rotating, two-blade rotors on each mast.
  for (let layer = 0; layer < 2; layer += 1) {
    const layerY = layer === 0 ? -radius * 0.23 : radius * 0.13;
    ctx.save();
    ctx.translate(0, layerY);
    ctx.scale(1, 0.23);
    const phase = spin * 0.18 * (layer === 0 ? 1 : -1) + index * 0.7 + layer * 0.48;
    const blade = radius * 0.98;
    const root = radius * 0.14;
    const rootWidth = radius * 0.25;
    const tipWidth = radius * 0.04;

    // Long tapered blades are repeated in tight trailing positions to show RPM.
    for (let ghost = 8; ghost >= 0; ghost -= 1) {
      ctx.save();
      ctx.rotate(phase - ghost * 0.085 * (layer === 0 ? 1 : -1));
      ctx.fillStyle = layer === 0
        ? `rgba(220, 208, 170, ${0.42 - ghost * 0.038})`
        : `rgba(143, 159, 155, ${0.37 - ghost * 0.033})`;
      ctx.beginPath();
      ctx.moveTo(root, -rootWidth);
      ctx.lineTo(blade, -tipWidth);
      ctx.lineTo(blade, tipWidth);
      ctx.lineTo(root, rootWidth * 0.5);
      ctx.lineTo(-root, rootWidth * 0.5);
      ctx.lineTo(-blade, tipWidth);
      ctx.lineTo(-blade, -tipWidth);
      ctx.lineTo(-root, -rootWidth);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    ctx.fillStyle = layer === 0 ? "#d4d3c6" : "#8c9896";
    ctx.strokeStyle = "#3d4444";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, layerY, Math.max(3.5, radius * 0.085), 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

function drawGrid(ctx, w, h) {
  ctx.save();
  ctx.strokeStyle = "rgba(151, 184, 209, 0.11)";
  ctx.lineWidth = 1;
  const spacing = 34;
  for (let x = (w / 2) % spacing; x < w; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = (h / 2) % spacing; y < h; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawVehicle(ctx, w, h) {
  const scale = Math.min(w, h) / 6.1;
  const cx = w / 2;
  const cy = h / 2 + 6;
  const rotorRadius = (model.rotorDiameterM / 2) * scale;
  const xOffset = (3.85 / 2 - model.rotorDiameterM / 2) * scale;
  const yOffset = xOffset * 1.16;
  const t = state.missionTime;
  const loadBase = clamp(0.44 + state.throttle * 0.55, 0.25, 1.0);
  const rotorCenters = [
    [-xOffset, -yOffset],
    [xOffset, -yOffset],
    [-xOffset, yOffset],
    [xOffset, yOffset],
  ];

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(((state.heading - 84) * Math.PI) / 180);
  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = "rgba(154, 171, 176, 0.88)";
  ctx.lineWidth = 5;
  rotorCenters.forEach(([x, y], index) => {
    ctx.beginPath();
    ctx.moveTo(index < 2 ? Math.sign(x) * 0.32 * scale : Math.sign(x) * 0.38 * scale, index < 2 ? -0.48 * scale : 0.52 * scale);
    ctx.lineTo(x, y);
    ctx.stroke();
  });

  rotorCenters.forEach(([x, y], index) => {
    const load = clamp(loadBase + Math.sin(t * 3 + index) * 0.06 + Math.abs(state.roll) * 0.12, 0.2, 1);
    drawRotor(ctx, x, y, rotorRadius, t, index, load);
  });

  ctx.globalAlpha = 1;

  // Skid rails remain visible in the top-down engineering view.
  ctx.strokeStyle = "rgba(121, 139, 143, 0.8)";
  ctx.lineWidth = 3;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(side * 0.68 * scale, -0.72 * scale);
    ctx.lineTo(side * 0.68 * scale, 0.78 * scale);
    ctx.moveTo(side * 0.47 * scale, -0.5 * scale);
    ctx.lineTo(side * 0.68 * scale, -0.62 * scale);
    ctx.moveTo(side * 0.47 * scale, 0.5 * scale);
    ctx.lineTo(side * 0.68 * scale, 0.62 * scale);
    ctx.stroke();
  }

  const metal = ctx.createLinearGradient(-0.5 * scale, -0.9 * scale, 0.55 * scale, 0.9 * scale);
  metal.addColorStop(0, "#d2dada");
  metal.addColorStop(0.42, "#738085");
  metal.addColorStop(0.72, "#aeb8b8");
  metal.addColorStop(1, "#4f5a5d");
  ctx.fillStyle = metal;
  ctx.strokeStyle = "#d1a02d";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-0.48 * scale, -0.92 * scale);
  ctx.lineTo(0.48 * scale, -0.92 * scale);
  ctx.lineTo(0.52 * scale, 0.72 * scale);
  ctx.lineTo(0.4 * scale, 0.9 * scale);
  ctx.lineTo(-0.4 * scale, 0.9 * scale);
  ctx.lineTo(-0.52 * scale, 0.72 * scale);
  ctx.lineTo(-0.52 * scale, -0.56 * scale);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  const cabMetal = ctx.createLinearGradient(-0.45 * scale, -1.02 * scale, 0.45 * scale, -0.3 * scale);
  cabMetal.addColorStop(0, "#eef0ed");
  cabMetal.addColorStop(0.52, "#a5afae");
  cabMetal.addColorStop(1, "#687477");
  ctx.fillStyle = cabMetal;
  ctx.strokeStyle = "rgba(43, 53, 55, 0.86)";
  ctx.beginPath();
  ctx.moveTo(-0.48 * scale, -0.42 * scale);
  ctx.lineTo(-0.48 * scale, -0.76 * scale);
  ctx.quadraticCurveTo(-0.34 * scale, -1.03 * scale, 0, -1.06 * scale);
  ctx.quadraticCurveTo(0.34 * scale, -1.03 * scale, 0.48 * scale, -0.76 * scale);
  ctx.lineTo(0.48 * scale, -0.42 * scale);
  ctx.quadraticCurveTo(0, -0.3 * scale, -0.48 * scale, -0.42 * scale);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "rgba(23, 31, 34, 0.52)";
  ctx.lineWidth = 1;
  for (const y of [-0.28, 0.08, 0.44, 0.7]) {
    ctx.beginPath();
    ctx.moveTo(-0.47 * scale, y * scale);
    ctx.lineTo(0.47 * scale, y * scale);
    ctx.stroke();
  }

  for (const x of [-0.3, 0, 0.3]) {
    ctx.fillStyle = "#182126";
    ctx.fillRect((x - 0.09) * scale, 0.36 * scale, 0.18 * scale, 0.16 * scale);
    ctx.strokeStyle = "#d1a02d";
    ctx.strokeRect((x - 0.09) * scale, 0.36 * scale, 0.18 * scale, 0.16 * scale);
  }

  // High-gain antenna reads as a large circular dish from above.
  ctx.fillStyle = "rgba(209, 215, 211, 0.92)";
  ctx.strokeStyle = "rgba(66, 75, 76, 0.9)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0.08 * scale, 0.04 * scale, 0.25 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-0.08 * scale, 0.04 * scale);
  ctx.lineTo(0.24 * scale, 0.04 * scale);
  ctx.moveTo(0.08 * scale, -0.12 * scale);
  ctx.lineTo(0.08 * scale, 0.2 * scale);
  ctx.stroke();

  ctx.fillStyle = "#263034";
  for (const x of [-0.31, 0.31]) {
    ctx.beginPath();
    ctx.arc(x * scale, -0.63 * scale, 0.055 * scale, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#87764c";
  ctx.beginPath();
  ctx.moveTo(-0.47 * scale, 0.52 * scale);
  ctx.lineTo(-0.72 * scale, 0.78 * scale);
  ctx.lineTo(-0.46 * scale, 0.86 * scale);
  ctx.closePath();
  ctx.fill();

  ctx.restore();

  ctx.save();
  ctx.translate(28, h - 42);
  ctx.strokeStyle = "rgba(223, 239, 255, 0.75)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(scale, 0);
  ctx.stroke();
  ctx.fillStyle = "rgba(223, 239, 255, 0.86)";
  ctx.font = "700 12px Inter, Arial";
  ctx.fillText("1 m scale", 0, -8);
  ctx.restore();
}

function drawRotor(ctx, x, y, r, t, index, load) {
  const hue = load > 0.72 ? "#80f2ae" : load > 0.45 ? "#7ce7ff" : "#ffb457";
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = "rgba(223, 239, 255, 0.22)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = hue;
  ctx.lineWidth = 3;
  for (let ring = 0; ring < 2; ring += 1) {
    const phase = t * (3.4 + ring * 0.9) * (index % 2 ? -1 : 1) + index;
    const bladeRadius = r - ring * 7;
    ctx.save();
    ctx.rotate(phase);
    ctx.beginPath();
    ctx.moveTo(-bladeRadius, 0);
    ctx.lineTo(bladeRadius, 0);
    ctx.stroke();
    ctx.restore();
  }

  ctx.fillStyle = "rgba(7, 17, 27, 0.92)";
  ctx.strokeStyle = "rgba(223, 239, 255, 0.6)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "rgba(223, 239, 255, 0.88)";
  ctx.font = "700 11px Inter, Arial";
  ctx.textAlign = "center";
  ctx.fillText(`${index * 2 + 1}/${index * 2 + 2}`, 0, -r - 9);
  ctx.restore();
}

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function drawHud(ctx, w, h) {
  ctx.save();
  ctx.font = "700 12px SFMono-Regular, Consolas, monospace";
  ctx.fillStyle = "rgba(223, 239, 255, 0.86)";
  ctx.strokeStyle = "rgba(124, 231, 255, 0.55)";
  ctx.lineWidth = 1;
  const centerX = w / 2;
  const centerY = h / 2 + 20;
  ctx.beginPath();
  ctx.moveTo(centerX - 36, centerY);
  ctx.lineTo(centerX - 10, centerY);
  ctx.moveTo(centerX + 10, centerY);
  ctx.lineTo(centerX + 36, centerY);
  ctx.moveTo(centerX, centerY - 36);
  ctx.lineTo(centerX, centerY - 10);
  ctx.moveTo(centerX, centerY + 10);
  ctx.lineTo(centerX, centerY + 36);
  ctx.stroke();

  ctx.fillText(`ALT ${state.altitude.toFixed(1)} m`, 24, 74);
  ctx.fillText(`V/S ${state.verticalSpeed.toFixed(2)} m/s`, 24, 94);
  ctx.fillText(`SPD ${state.speed.toFixed(1)} m/s`, 24, 114);
  ctx.textAlign = "right";
  ctx.fillText(`ROLL ${(state.roll * 22).toFixed(1)} deg`, w - 24, 74);
  ctx.fillText(`PITCH ${(state.pitch * 18).toFixed(1)} deg`, w - 24, 94);
  ctx.fillText(`WIND ${state.wind.toFixed(1)} m/s`, w - 24, 114);
  ctx.restore();
}

function drawChart() {
  const rect = resizeCanvas(chartCanvas, chartCtx);
  const w = rect.width;
  const h = rect.height;
  const ctx = chartCtx;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "rgba(255, 255, 255, 0.025)";
  ctx.fillRect(0, 0, w, h);

  const pad = { left: 42, right: 18, top: 14, bottom: 24 };
  const plotW = w - pad.left - pad.right;
  const plotH = h - pad.top - pad.bottom;
  const data = state.chart.length > 1 ? state.chart : [{ time: 0, altitude: 0, powerKw: 0, speed: 0 }];
  const first = data[0].time;
  const last = Math.max(first + 1, data[data.length - 1].time);

  ctx.strokeStyle = "rgba(151, 184, 209, 0.16)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i += 1) {
    const y = pad.top + (plotH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(w - pad.right, y);
    ctx.stroke();
  }

  const xFor = (point) => pad.left + ((point.time - first) / (last - first)) * plotW;
  const drawLine = (key, max, color) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    data.forEach((point, index) => {
      const x = xFor(point);
      const y = pad.top + plotH - clamp(point[key] / max, 0, 1) * plotH;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  };

  drawLine("altitude", 65, "#7ce7ff");
  drawLine("powerKw", 24, "#ffb457");
  drawLine("speed", 16, "#80f2ae");

  ctx.fillStyle = "rgba(223, 239, 255, 0.78)";
  ctx.font = "700 12px Inter, Arial";
  ctx.fillText("altitude", pad.left, h - 7);
  ctx.fillStyle = "#ffb457";
  ctx.fillText("power", pad.left + 72, h - 7);
  ctx.fillStyle = "#80f2ae";
  ctx.fillText("speed", pad.left + 128, h - 7);
}

function updateReadouts() {
  const d = derived();
  const rpmBase = 720 + state.throttle * 640 + state.speed * 8;
  $("mode-value").textContent = state.mode;
  $("met-value").textContent = formatTime(state.missionTime);
  $("altitude-value").textContent = `${state.altitude.toFixed(1)} m`;
  $("speed-value").textContent = `${state.speed.toFixed(1)} m/s`;
  $("power-value").textContent = `${(state.power / 1000).toFixed(1)} kW`;
  $("battery-value").textContent = `${Math.round(state.battery)}%`;
  $("heading-value").textContent = `${Math.round(state.heading).toString().padStart(3, "0")} deg`;
  $("disk-area").textContent = `${d.totalArea.toFixed(2)} m2`;
  $("weight-value").textContent = `${Math.round(d.titanWeight).toLocaleString()} N`;
  $("induced-value").textContent = `${d.inducedTitan.toFixed(2)} m/s`;
  $("ideal-power-value").textContent = `${(d.idealTitan / 1000).toFixed(2)} kW`;
  $("hover-power-value").textContent = `${(d.realisticTitan / 1000).toFixed(2)} kW`;
  $("earth-power-value").textContent = `${Math.round(d.idealEarth / 1000)} kW`;
  $("wind-output").textContent = `${state.wind.toFixed(1)} m/s`;
  $("payload-output").textContent = `${state.payloadDelta > 0 ? "+" : ""}${state.payloadDelta} kg`;
  $("left-stick-readout").textContent = `THR ${Math.round(state.throttle * 100)}% / YAW ${Math.round(state.yaw * 100)}%`;
  $("right-stick-readout").textContent = `PIT ${Math.round(state.pitch * 100)}% / ROL ${Math.round(state.roll * 100)}%`;

  positionStick($("left-stick"), state.yaw, state.throttle * 2 - 1);
  positionStick($("right-stick"), state.roll, state.pitch);

  rotorTiles.forEach((tile, index) => {
    const load = clamp(0.44 + state.throttle * 0.48 + Math.sin(state.missionTime * 2.2 + index) * 0.045, 0.18, 1);
    const rpm = Math.round(rpmBase + Math.sin(state.missionTime * 2.8 + index) * 28);
    tile.querySelector(".rotor-load").textContent = `${Math.round(load * 100)}%`;
    tile.querySelector(".rotor-rpm").textContent = `${rpm.toString().padStart(4, "0")} rpm`;
    tile.querySelector(".rotor-bar i").style.width = `${Math.round(load * 100)}%`;
    pilotRotorTiles[index].textContent = `${rpm}`;
  });

  $("pilot-left-readout").textContent = `THR ${Math.round(state.throttle * 100)}% / YAW ${Math.round(state.yaw * 100)}%`;
  $("pilot-right-readout").textContent = `PIT ${Math.round(state.pitch * 100)}% / ROL ${Math.round(state.roll * 100)}%`;
  $("attitude-readout").textContent = `P ${state.pitch >= 0 ? "+" : ""}${(state.pitch * 18).toFixed(1)} / R ${state.roll >= 0 ? "+" : ""}${(state.roll * 22).toFixed(1)}`;
  $("attitude-horizon").style.transform = `translateY(${state.pitch * 24}px) rotate(${-state.roll * 22}deg)`;
  $("pilot-rotor-summary").textContent = state.wind > 3.8 ? "8 / 8 gust margin" : "8 / 8 nominal";
  positionStick($("pilot-left-stick"), state.yaw, state.throttle * 2 - 1);
  positionStick($("pilot-right-stick"), state.roll, state.pitch);

  $("link-value").textContent = `${Math.round(84 - state.wind * 1.8 + Math.sin(state.missionTime * 0.18) * 3)}%`;
  $("drams-state").textContent = state.mode === "Surface" ? "Sample ready" : "Standby";
  $("dragns-state").textContent = state.mode === "Surface" ? "Surface scan" : "Survey";
  $("camera-state").textContent = state.speed > 2 ? "Nav imaging" : "Hazcam";
  $("draco-state").textContent = state.mode === "Surface" ? "Armed" : "Stowed";
  $("dragmet-state").textContent = state.altitude > 3 ? "Aloft logging" : "Surface logging";
  $("rotor-summary").textContent = state.wind > 3.8 ? "8 nominal, gust margin" : "8 nominal";
}

function positionStick(element, x, y) {
  const max = 35;
  element.style.transform = `translate(${clamp(x, -1, 1) * max}%, ${-clamp(y, -1, 1) * max}%)`;
}

function bindPilotStick(nubId, kind) {
  const nub = $(nubId);
  const pad = nub.closest(".pilot-stick-box");
  let activePointer = null;

  const applyPointer = (event) => {
    const rect = pad.getBoundingClientRect();
    const radius = Math.max(1, rect.width * 0.39);
    const x = clamp((event.clientX - (rect.left + rect.width / 2)) / radius, -1, 1);
    const y = clamp((event.clientY - (rect.top + rect.height / 2)) / radius, -1, 1);
    state.auto = false;
    state.hold = false;
    if (kind === "left") {
      state.yaw = x;
      state.throttle = clamp((1 - y) / 2, 0, 1);
    } else {
      state.roll = x;
      state.pitch = -y;
    }
  };

  pad.addEventListener("pointerdown", (event) => {
    activePointer = event.pointerId;
    pad.setPointerCapture(event.pointerId);
    applyPointer(event);
  });

  pad.addEventListener("pointermove", (event) => {
    if (event.pointerId === activePointer) applyPointer(event);
  });

  const release = (event) => {
    if (event.pointerId !== activePointer) return;
    activePointer = null;
    if (kind === "left") {
      state.yaw = 0;
    } else {
      state.pitch = 0;
      state.roll = 0;
    }
  };

  pad.addEventListener("pointerup", release);
  pad.addEventListener("pointercancel", release);
}

function setCameraMode(mode) {
  if (mode === "free" && !chaseRenderer) return;
  if (mode === "free" && state.cameraMode !== "free") enterFreeCamera(state);
  state.cameraMode = mode;
  document.body.classList.toggle("free-camera", mode === "free");
  const fixedButton = $("fixed-camera-button");
  const freeButton = $("free-camera-button");
  fixedButton.classList.toggle("active", mode === "fixed");
  freeButton.classList.toggle("active", mode === "free");
  fixedButton.setAttribute("aria-pressed", String(mode === "fixed"));
  freeButton.setAttribute("aria-pressed", String(mode === "free"));
}

function bindFreeCamera() {
  let activePointer = null;
  let lastX = 0;
  let lastY = 0;

  flightCanvas.addEventListener("pointerdown", (event) => {
    if (state.view !== "pilot" || state.cameraMode !== "free" || activePointer !== null) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    activePointer = event.pointerId;
    lastX = event.clientX;
    lastY = event.clientY;
    flightCanvas.setPointerCapture(event.pointerId);
  });

  flightCanvas.addEventListener("pointermove", (event) => {
    if (event.pointerId !== activePointer || state.cameraMode !== "free" || state.view !== "pilot") return;
    const rect = flightCanvas.getBoundingClientRect();
    orbitCamera(state, event.clientX - lastX, event.clientY - lastY, rect.width, rect.height);
    lastX = event.clientX;
    lastY = event.clientY;
  });

  const release = (event) => {
    if (event.pointerId === activePointer) activePointer = null;
  };

  flightCanvas.addEventListener("pointerup", release);
  flightCanvas.addEventListener("pointercancel", release);
  flightCanvas.addEventListener("lostpointercapture", release);
}

function setView(view) {
  state.view = view;
  document.body.classList.toggle("pilot-view", view === "pilot");
  const missionButton = $("mission-view-button");
  const pilotButton = $("pilot-view-button");
  missionButton.classList.toggle("active", view === "mission");
  pilotButton.classList.toggle("active", view === "pilot");
  missionButton.setAttribute("aria-pressed", String(view === "mission"));
  pilotButton.setAttribute("aria-pressed", String(view === "pilot"));
}

function tick(now) {
  const dt = Math.min(0.05, (now - state.lastTick) / 1000);
  state.lastTick = now;
  updateSimulation(dt);
  updateReadouts();
  drawFlight();
  drawChart();
  requestAnimationFrame(tick);
}

$("wind-slider").addEventListener("input", (event) => {
  state.wind = Number(event.target.value);
});

$("payload-slider").addEventListener("input", (event) => {
  state.payloadDelta = Number(event.target.value);
});

$("auto-button").addEventListener("click", () => setMode("auto"));
$("hold-button").addEventListener("click", () => setMode("hold"));
$("takeoff-button").addEventListener("click", () => setMode("takeoff"));
$("cruise-button").addEventListener("click", () => setMode("cruise"));
$("land-button").addEventListener("click", () => setMode("land"));
$("mission-view-button").addEventListener("click", () => setView("mission"));
$("pilot-view-button").addEventListener("click", () => setView("pilot"));
$("fixed-camera-button").addEventListener("click", () => setCameraMode("fixed"));
$("free-camera-button").addEventListener("click", () => setCameraMode("free"));
bindPilotStick("pilot-left-stick", "left");
bindPilotStick("pilot-right-stick", "right");
bindFreeCamera();

window.addEventListener("keydown", (event) => {
  const step = event.shiftKey ? 0.08 : 0.04;
  const keys = ["w", "a", "s", "d", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "];
  if (!keys.includes(event.key)) return;
  event.preventDefault();
  state.auto = false;
  if (event.key === "w") state.throttle = clamp(state.throttle + step, 0, 1);
  if (event.key === "s") state.throttle = clamp(state.throttle - step, 0, 1);
  if (event.key === "a") state.yaw = clamp(state.yaw - step, -1, 1);
  if (event.key === "d") state.yaw = clamp(state.yaw + step, -1, 1);
  if (event.key === "ArrowUp") state.pitch = clamp(state.pitch + step, -1, 1);
  if (event.key === "ArrowDown") state.pitch = clamp(state.pitch - step, -1, 1);
  if (event.key === "ArrowLeft") state.roll = clamp(state.roll - step, -1, 1);
  if (event.key === "ArrowRight") state.roll = clamp(state.roll + step, -1, 1);
  if (event.key === " ") {
    state.pitch = 0;
    state.roll = 0;
    state.yaw = 0;
    state.throttle = 0.52;
  }
});

state.lastTick = performance.now();
requestAnimationFrame(tick);
