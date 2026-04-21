export function renderUtilization(utilization) {
  return `
    <div class="bar-chart">
      ${utilization.map((item) => `
        <div class="bar-row">
          <strong>${item.name}</strong>
          <div class="bar-track"><div class="bar-fill" style="width: ${item.value}%"></div></div>
          <span>${item.value}%</span>
        </div>
      `).join("")}
    </div>
  `;
}

export function drawProductionChart(canvas, points) {
  const context = canvas.getContext("2d");
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * ratio;
  canvas.height = rect.height * ratio;
  context.scale(ratio, ratio);

  const width = rect.width;
  const height = rect.height;
  const padding = { top: 18, right: 18, bottom: 34, left: 52 };
  const values = points.flatMap((point) => [point.overburden, point.coal]);
  const max = Math.ceil(Math.max(...values) / 10000) * 10000;
  const xStep = (width - padding.left - padding.right) / (points.length - 1);
  const y = (value) => padding.top + (height - padding.top - padding.bottom) * (1 - value / max);
  const x = (index) => padding.left + index * xStep;

  context.clearRect(0, 0, width, height);
  context.strokeStyle = "#dce3d8";
  context.lineWidth = 1;
  context.fillStyle = "#667064";
  context.font = "12px Inter, sans-serif";

  for (let tick = 0; tick <= 4; tick += 1) {
    const value = (max / 4) * tick;
    const tickY = y(value);
    context.beginPath();
    context.moveTo(padding.left, tickY);
    context.lineTo(width - padding.right, tickY);
    context.stroke();
    context.fillText(`${Math.round(value / 1000)}k`, 8, tickY + 4);
  }

  points.forEach((point, index) => {
    context.fillText(point.day, x(index) - 12, height - 10);
  });

  drawLine(context, points.map((point, index) => ({ x: x(index), y: y(point.overburden) })), "#1f6f5b");
  drawLine(context, points.map((point, index) => ({ x: x(index), y: y(point.coal) })), "#315d92");

  context.fillStyle = "#1f6f5b";
  context.fillText("Overburden", padding.left, 16);
  context.fillStyle = "#315d92";
  context.fillText("Coal", padding.left + 94, 16);
}

function drawLine(context, points, color) {
  context.strokeStyle = color;
  context.lineWidth = 3;
  context.beginPath();
  points.forEach((point, index) => {
    if (index === 0) {
      context.moveTo(point.x, point.y);
    } else {
      context.lineTo(point.x, point.y);
    }
  });
  context.stroke();

  context.fillStyle = color;
  points.forEach((point) => {
    context.beginPath();
    context.arc(point.x, point.y, 4, 0, Math.PI * 2);
    context.fill();
  });
}
