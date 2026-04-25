function catmullRomToBezier(points) {
  const result = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    result.push({
      cp1: { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 },
      cp2: { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 },
      to: p2,
    });
  }
  return result;
}

function drawSmoothLine(ctx, pts, color) {
  if (!pts.length) return;
  const curves = catmullRomToBezier(pts);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  curves.forEach(({ cp1, cp2, to }) => ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, to.x, to.y));
  ctx.stroke();
}

function drawAreaFill(ctx, pts, color, bottom) {
  if (!pts.length) return;
  const curves = catmullRomToBezier(pts);
  ctx.beginPath();
  ctx.moveTo(pts[0].x, bottom);
  ctx.lineTo(pts[0].x, pts[0].y);
  curves.forEach(({ cp1, cp2, to }) => ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, to.x, to.y));
  ctx.lineTo(pts[pts.length - 1].x, bottom);
  ctx.closePath();
  ctx.fillStyle = color + "1e";
  ctx.fill();
}

export function drawProductionChart(canvas, points) {
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width  = rect.width  * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const W = rect.width, H = rect.height;
  const pad = { top: 28, right: 20, bottom: 38, left: 56 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;

  const vals = points.flatMap((p) => [p.overburden, p.coal]);
  const maxVal = Math.ceil(Math.max(...vals) / 10000) * 10000;
  const xStep = chartW / Math.max(1, points.length - 1);
  const X = (i) => pad.left + i * xStep;
  const Y = (v) => pad.top + chartH * (1 - v / maxVal);
  const bottom = Y(0);

  ctx.clearRect(0, 0, W, H);

  /* Grid lines */
  for (let t = 0; t <= 4; t++) {
    const y = Y((maxVal / 4) * t);
    ctx.strokeStyle = "rgba(0,0,0,0.06)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(W - pad.right, y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#667064";
    ctx.font = `500 11px Inter, sans-serif`;
    ctx.textAlign = "right";
    ctx.fillText(`${Math.round((maxVal / 4) * t / 1000)}k`, pad.left - 8, y + 4);
  }

  /* X labels */
  ctx.fillStyle = "#667064";
  ctx.font = `500 11px Inter, sans-serif`;
  ctx.textAlign = "center";
  points.forEach((p, i) => ctx.fillText(p.day, X(i), H - 8));

  const obPts   = points.map((p, i) => ({ x: X(i), y: Y(p.overburden) }));
  const coalPts = points.map((p, i) => ({ x: X(i), y: Y(p.coal) }));

  drawAreaFill(ctx, obPts,   "#1f6f5b", bottom);
  drawAreaFill(ctx, coalPts, "#315d92", bottom);
  drawSmoothLine(ctx, obPts,   "#1f6f5b");
  drawSmoothLine(ctx, coalPts, "#315d92");

  /* Dots */
  [[obPts, "#1f6f5b"], [coalPts, "#315d92"]].forEach(([pts, color]) => {
    pts.forEach(({ x, y }) => {
      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  });

  /* Legend */
  const last = points[points.length - 1];
  const legendItems = [
    { color: "#1f6f5b", label: `Overburden: ${(last.overburden / 1000).toFixed(1)}k` },
    { color: "#315d92", label: `Coal: ${(last.coal / 1000).toFixed(1)}k` },
  ];
  ctx.font = "600 11px Inter, sans-serif";
  ctx.textAlign = "left";
  legendItems.forEach(({ color, label }, i) => {
    const lx = pad.left + i * 150;
    ctx.fillStyle = color;
    ctx.fillRect(lx, 10, 10, 10);
    ctx.fillStyle = "#667064";
    ctx.fillText(label, lx + 14, 18);
  });

  /* Hover tooltip */
  canvas._state = { points, X, Y, pad, W, H };
  if (!canvas._tooltipBound) {
    canvas._tooltipBound = true;
    canvas.addEventListener("mousemove", onHover);
    canvas.addEventListener("mouseleave", () => {
      if (canvas._tip) { canvas._tip.remove(); canvas._tip = null; }
    });
  }
}

function onHover(e) {
  const canvas = e.currentTarget;
  const state = canvas._state;
  if (!state) return;
  const { points, X, pad } = state;
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const xWidth = (state.W - pad.left - pad.right) / Math.max(1, points.length - 1);
  const idx = Math.max(0, Math.min(Math.round((mx - pad.left) / xWidth), points.length - 1));
  const pt = points[idx];

  let tip = canvas._tip;
  if (!tip) {
    tip = document.createElement("div");
    tip.style.cssText = "position:absolute;pointer-events:none;padding:8px 12px;border-radius:8px;background:#18221c;color:#fff;font-size:12px;font-weight:600;box-shadow:0 4px 16px rgba(0,0,0,0.2);z-index:100;white-space:nowrap;";
    canvas.parentElement.style.position = "relative";
    canvas.parentElement.appendChild(tip);
    canvas._tip = tip;
  }
  tip.innerHTML = `<div style="opacity:0.6;font-size:10px;margin-bottom:4px">${pt.day}</div>
    <div style="color:#6bbda8">&#9632; Overburden: ${(pt.overburden / 1000).toFixed(1)}k bcm</div>
    <div style="color:#6596d6">&#9632; Coal: ${(pt.coal / 1000).toFixed(1)}k t</div>`;
  tip.style.left = `${Math.max(0, X(idx) - 60)}px`;
  tip.style.top  = `0px`;
}

export function renderFleetDonut(fleet) {
  const counts = {};
  fleet.forEach((u) => { counts[u.status] = (counts[u.status] || 0) + 1; });
  const total = fleet.length;
  const colors = { Active: "#1f6f5b", Standby: "#9aac95", Warning: "#c77718", Maintenance: "#b4403b" };
  const order  = ["Active", "Standby", "Warning", "Maintenance"];
  const entries = order.filter((k) => counts[k]).map((k) => ({ label: k, count: counts[k], color: colors[k] }));

  const cx = 60, cy = 60, r = 50, ir = 32;
  let angle = -Math.PI / 2;
  const paths = entries.map(({ count, color }) => {
    const sweep = (count / total) * Math.PI * 2;
    const sa = angle, ea = (angle += sweep);
    const large = sweep > Math.PI ? 1 : 0;
    const d = `M ${cx + r * Math.cos(sa)} ${cy + r * Math.sin(sa)} A ${r} ${r} 0 ${large} 1 ${cx + r * Math.cos(ea)} ${cy + r * Math.sin(ea)} L ${cx + ir * Math.cos(ea)} ${cy + ir * Math.sin(ea)} A ${ir} ${ir} 0 ${large} 0 ${cx + ir * Math.cos(sa)} ${cy + ir * Math.sin(sa)} Z`;
    return `<path d="${d}" fill="${color}" opacity="0.9"/>`;
  }).join("");

  const legend = entries.map(({ label, count, color }) => `
    <div class="donut-legend-item">
      <span class="donut-legend-dot" style="background:${color}"></span>
      <span>${label}</span>
      <strong>${count}</strong>
    </div>`).join("");

  return `
    <div class="donut-wrap">
      <svg class="donut-svg" viewBox="0 0 120 120">
        ${paths}
        <text x="60" y="57" text-anchor="middle" class="donut-total">${total}</text>
        <text x="60" y="70" text-anchor="middle" class="donut-label-text">units</text>
      </svg>
      <div class="donut-legend">${legend}</div>
    </div>`;
}

export function renderUtilization(utilization) {
  return `<div class="bar-chart">
    ${utilization.map((item) => `
      <div class="bar-row">
        <strong>${item.name}</strong>
        <div class="bar-track"><div class="bar-fill" style="width:${item.value}%"></div></div>
        <span>${item.value}%</span>
      </div>`).join("")}
  </div>`;
}
