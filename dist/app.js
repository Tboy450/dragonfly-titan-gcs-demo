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
  battery: 96,
  wind: 0.8,
  payloadDelta: 0,
  view: "mission",
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
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#d18a57");
  sky.addColorStop(0.35, "#bd632f");
  sky.addColorStop(1, "#85320f");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  const horizon = h * 0.28 + state.pitch * 30;
  ctx.fillStyle = "#a4471b";
  ctx.beginPath();
  ctx.moveTo(0, horizon + 22);
  for (let x = 0; x <= w; x += 28) {
    const dune = Math.sin(x * 0.009 + state.missionTime * 0.02) * 12 + Math.sin(x * 0.021) * 7;
    ctx.lineTo(x, horizon + dune);
  }
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(116, 39, 11, 0.34)";
  ctx.beginPath();
  ctx.moveTo(0, horizon + 42);
  for (let x = 0; x <= w; x += 34) {
    ctx.lineTo(x, horizon + 38 + Math.sin(x * 0.014 + 2.4) * 18);
  }
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  drawChaseVehicle(ctx, w, h);

  ctx.save();
  ctx.fillStyle = "rgba(18, 8, 3, 0.44)";
  const shadowW = Math.min(w * 0.2, 240) * (1 - Math.min(state.altitude, 60) / 150);
  ctx.beginPath();
  ctx.ellipse(w / 2, h * 0.61, shadowW, shadowW * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawChaseVehicle(ctx, w, h) {
  const size = Math.min(w, h) * 0.18;
  const cx = w / 2;
  const cy = h * 0.43;
  const bank = -state.roll * 0.32;
  const lift = Math.sin(state.missionTime * 1.8) * 3;

  ctx.save();
  ctx.translate(cx, cy + lift);
  ctx.rotate(bank);

  ctx.strokeStyle = "rgba(45, 28, 17, 0.96)";
  ctx.lineWidth = Math.max(5, size * 0.045);
  ctx.lineCap = "round";
  [[-0.7, -0.38], [0.7, -0.38], [-0.82, 0.28], [0.82, 0.28]].forEach(([x, y]) => {
    ctx.beginPath();
    ctx.moveTo(x * size * 0.3, y * size * 0.15);
    ctx.lineTo(x * size, y * size);
    ctx.stroke();
  });

  const rotors = [[-0.7, -0.38], [0.7, -0.38], [-0.82, 0.28], [0.82, 0.28]];
  rotors.forEach(([x, y], index) => {
    const rx = x * size;
    const ry = y * size;
    const spin = state.missionTime * (index % 2 ? -8 : 8);
    ctx.save();
    ctx.translate(rx, ry);
    ctx.scale(1, 0.3);
    ctx.fillStyle = "rgba(43, 31, 23, 0.34)";
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.48, size * 0.48, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.rotate(spin);
    ctx.strokeStyle = "rgba(235, 193, 139, 0.38)";
    ctx.lineWidth = Math.max(3, size * 0.025);
    ctx.beginPath();
    ctx.moveTo(-size * 0.43, 0);
    ctx.lineTo(size * 0.43, 0);
    ctx.moveTo(0, -size * 0.43);
    ctx.lineTo(0, size * 0.43);
    ctx.stroke();
    ctx.restore();
  });

  const bodyW = size * 0.92;
  const bodyH = size * 0.48;
  ctx.fillStyle = "#171719";
  ctx.strokeStyle = "rgba(235, 193, 139, 0.48)";
  ctx.lineWidth = 2;
  roundRect(ctx, -bodyW / 2, -bodyH / 2, bodyW, bodyH, 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#bea27c";
  ctx.fillRect(-bodyW * 0.22, -bodyH * 0.54, bodyW * 0.44, bodyH * 0.28);
  ctx.fillStyle = "#84340f";
  ctx.fillRect(-bodyW * 0.47, bodyH * 0.34, bodyW * 0.94, Math.max(3, size * 0.025));
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
  const centerOffset = (3.85 / 2 - model.rotorDiameterM / 2) * scale;
  const t = state.missionTime;
  const loadBase = clamp(0.44 + state.throttle * 0.55, 0.25, 1.0);
  const rotorCenters = [
    [-centerOffset, -centerOffset],
    [centerOffset, -centerOffset],
    [-centerOffset, centerOffset],
    [centerOffset, centerOffset],
  ];

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(((state.heading - 84) * Math.PI) / 180);
  ctx.globalAlpha = 0.78;
  ctx.strokeStyle = "rgba(124, 231, 255, 0.62)";
  ctx.lineWidth = 3;
  for (const [x, y] of rotorCenters) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  rotorCenters.forEach(([x, y], index) => {
    const load = clamp(loadBase + Math.sin(t * 3 + index) * 0.06 + Math.abs(state.roll) * 0.12, 0.2, 1);
    drawRotor(ctx, x, y, rotorRadius, t, index, load);
  });

  ctx.globalAlpha = 1;
  ctx.fillStyle = "rgba(223, 239, 255, 0.92)";
  ctx.strokeStyle = "rgba(7, 17, 27, 0.75)";
  ctx.lineWidth = 2;
  roundRect(ctx, -0.62 * scale, -0.42 * scale, 1.24 * scale, 0.84 * scale, 13);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#07111b";
  ctx.font = "700 12px Inter, Arial";
  ctx.textAlign = "center";
  ctx.fillText("DF", 0, 4);

  ctx.strokeStyle = "rgba(255, 180, 87, 0.86)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -0.88 * scale);
  ctx.lineTo(0, -1.23 * scale);
  ctx.lineTo(0.14 * scale, -1.04 * scale);
  ctx.stroke();

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
    ctx.beginPath();
    ctx.arc(0, 0, r - ring * 6, phase, phase + Math.PI * 0.72);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, r - ring * 6, phase + Math.PI, phase + Math.PI * 1.72);
    ctx.stroke();
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
