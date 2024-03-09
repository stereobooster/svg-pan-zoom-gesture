import * as math from "mathjs";
import { fdm, scale, tdm, transformXY, translate } from "./utils";

function draw() {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d")!;

  // function drawDot(x: number, y: number) {
  //   const circle = new Path2D();
  //   circle.arc(x, y, 5, 0, 2 * Math.PI);
  //   ctx.fillStyle = "#606060";
  //   ctx.fill(circle);
  // }

  function drawGrid() {
    const gridDimentions = {
      width: 50,
      height: 50,
    };

    ctx.beginPath();
    ctx.save();

    for (var x = 0; x <= canvas.width; x += gridDimentions.width) {
      ctx.moveTo(0.5 + x, 0);
      ctx.lineTo(0.5 + x, canvas.height);
    }

    for (var x = 0; x <= canvas.height; x += gridDimentions.height) {
      ctx.moveTo(0, 0.5 + x);
      ctx.lineTo(canvas.width, 0.5 + x);
    }

    ctx.strokeStyle = "#606060";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(
      gridDimentions.width * 3,
      canvas.height - gridDimentions.height * 3
    );
    ctx.lineTo(
      canvas.width - gridDimentions.width * 3,
      gridDimentions.height * 3
    );

    ctx.strokeStyle = "#d35d6e";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function getXY(e: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.x;
    const y = e.clientY - rect.y;
    return [x, y] as const;
  }

  function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  const identity = new DOMMatrix([1, 0, 0, 1, 0, 0]);
  let current = fdm(identity);
  drawGrid();

  function render() {
    clear();
    ctx.setTransform(tdm(current));
    drawGrid();
    ctx.setTransform(identity);
  }

  canvas.addEventListener("wheel", (e) => {
    // pinch gesture on touchpad or Ctrl + wheel
    if (e.ctrlKey) {
      e.preventDefault();
      const scaleFactor = 1 - e.deltaY * 0.01;

      const [x, y] = getXY(e);
      const scaleMatrix = scale(current, scaleFactor);
      const [nx1, ny1] = transformXY(math.inv(current), x, y);
      const [nx2, ny2] = transformXY(math.inv(scaleMatrix), x, y);
      current = translate(scaleMatrix, nx2 - nx1, ny2 - ny1);

      render();
    } else {
      // posX -= e.deltaX * 2;
      // posY -= e.deltaY * 2;
    }
  });

  let x = 0;
  let y = 0;
  let mousedown = false;

  canvas.addEventListener("mousedown", (e) => {
    mousedown = true;
    x = e.clientX;
    y = e.clientY;
  });

  canvas.addEventListener("mouseup", () => {
    mousedown = false;
  });

  canvas.addEventListener("mouseleave", () => {
    mousedown = false;
  });

  canvas.addEventListener("mousemove", (e) => {
    if (!mousedown) return;
    const dx = e.clientX - x;
    const dy = e.clientY - y;
    const scale = current.get([0, 0]);
    current = translate(current, dx / scale, dy / scale);

    render();

    x = e.clientX;
    y = e.clientY;
  });
}

draw();
