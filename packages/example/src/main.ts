import "./index.css";
import * as math from "mathjs";

function draw() {
  const svg = document.querySelector("svg");
  const svgContainer = document.querySelector(
    ".svgContainer"
  ) as HTMLDivElement;

  if (!svg || !svgContainer) return;

  function ttm(m: math.Matrix) {
    return `matrix(${[
      m.get([0, 0]),
      m.get([1, 0]),
      m.get([0, 1]),
      m.get([1, 1]),
      m.get([0, 2]),
      m.get([1, 2]),
    ]})`;
  }

  function transformXY(m: math.Matrix, x: number, y: number) {
    const nm = math.multiply(m, [x, y, 1]);
    return [nm.get([0]), nm.get([1])] as const;
  }

  function scale(m: math.Matrix, sf: number) {
    return math.multiply(
      m,
      math.matrix([
        [sf, 0, 0],
        [0, sf, 0],
        [0, 0, 1],
      ])
    );
  }

  function translate(m: math.Matrix, dx: number, dy: number) {
    return math.multiply(
      m,
      math.matrix([
        [1, 0, dx],
        [0, 1, dy],
        [0, 0, 1],
      ])
    );
  }

  function getXY(e: MouseEvent) {
    const rect = svgContainer.getBoundingClientRect();
    const x = e.pageX - rect.x - window.scrollX - rect.width / 2;
    const y = e.pageY - rect.y - window.scrollY - rect.height / 2;
    return [x, y] as const;
  }

  let current = math.matrix([
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ]);

  let raf: number;
  function render() {
    cancelAnimationFrame(raf);
    raf = window.requestAnimationFrame(() => {
      svg!.style.transform = ttm(current);
    });
  }

  svgContainer.addEventListener("wheel", (e) => {
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

  svgContainer.addEventListener(
    "mousedown",
    (e) => {
      mousedown = true;
      x = e.clientX;
      y = e.clientY;
    },
    { passive: true }
  );

  svgContainer.addEventListener(
    "mouseup",
    () => {
      mousedown = false;
    },
    { passive: true }
  );

  svgContainer.addEventListener(
    "mouseleave",
    () => {
      mousedown = false;
    },
    { passive: true }
  );

  svgContainer.addEventListener(
    "mousemove",
    (e) => {
      if (!mousedown) return;
      const dx = e.clientX - x;
      const dy = e.clientY - y;
      const scale = current.get([0, 0]);
      current = translate(current, dx / scale, dy / scale);

      render();

      x = e.clientX;
      y = e.clientY;
    },
    { passive: true }
  );
}

draw();
