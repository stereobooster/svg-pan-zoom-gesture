import "./index.css";
import * as math from "mathjs";
// import { DragGesture, PinchGesture } from "@use-gesture/vanilla";
// import anime from "animejs/lib/anime.es.js";

type Coords = Array<[number, number]>;

// constructor: wrapper, element to scale
// on/off event listeners
function init() {
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

  // maybe can use `matrixTransform()` from
  // https://developer.mozilla.org/en-US/docs/Web/API/DOMPointReadOnly
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

  function getXY(e: MouseEvent | TouchEvent, layer = true) {
    let coords: Coords =
      "touches" in e
        ? Array.from(e.touches).map((t) => [t.clientX, t.clientY])
        : [[e.clientX, e.clientY]];

    if (layer) {
      const rect = svgContainer.getBoundingClientRect();
      coords = coords.map(([x, y]) => [
        x - rect.x - rect.width / 2,
        y - rect.y - rect.height / 2,
      ]);
    }

    return coords;
  }

  function center(coords: Coords) {
    return coords.length > 1
      ? coords.reduce(([xAcc, yAcc], [x, y]) => [xAcc + x, yAcc + y], [0, 0])
      : coords[0];
  }

  function centerDiff(co1: Coords, co2: Coords) {
    const c1 = center(co1);
    const c2 = center(co2);
    return [c1[0] - c2[0], c1[1] - c2[1]] as const;
  }

  function distance(c: Coords) {
    return c.length === 2
      ? Math.sqrt(
          Math.pow(c[0][0] - c[1][0], 2) + Math.pow(c[0][1] - c[1][1], 2)
        )
      : 0;
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

  let mousedown = false;
  let originXY: Coords;
  let currentXY: Coords;

  function onPointerDown(e: MouseEvent | TouchEvent) {
    if ("touches" in e) {
      mousedown = e.touches.length === 2;
      if (e.touches.length !== 2) return;
      e.preventDefault();
    } else {
      mousedown = true;
    }
    originXY = getXY(e);
    currentXY = originXY;
  }

  function onPointerUp(e: MouseEvent | TouchEvent) {
    if ("touches" in e) {
      mousedown = e.touches.length !== 2;
    } else {
      mousedown = false;
    }
  }

  function onPointerMove(e: MouseEvent | TouchEvent) {
    if (!mousedown) return;
    let xy = getXY(e);
    let isPinch = false;
    const currentScale = current.get([0, 0]);
    let scaleFactor = 0;
    if ("touches" in e) {
      if (e.touches.length !== 2) return;
      e.preventDefault();
      scaleFactor = distance(xy) / distance(originXY);
      // it kind of works, but not ideal
      isPinch = Math.abs(1 - scaleFactor) > 0.02;
    }

    if (isPinch) {
      const [x, y] = center(xy);
      const scaleMatrix = scale(current, scaleFactor);
      const [nx1, ny1] = transformXY(math.inv(current), x, y);
      const [nx2, ny2] = transformXY(math.inv(scaleMatrix), x, y);
      current = translate(scaleMatrix, nx2 - nx1, ny2 - ny1);
      originXY = xy;
    } else {
      const [dx, dy] = centerDiff(xy, currentXY);
      current = translate(current, dx / currentScale, dy / currentScale);
    }

    render();
    currentXY = xy;
  }

  // https://stackoverflow.com/questions/4817029/whats-the-best-way-to-detect-a-touch-screen-device-using-javascript
  if (window.matchMedia("(pointer: coarse)").matches) {
    // if (window.PointerEvent) {
    //   svgContainer.addEventListener("pointerdown", onPointerDown); // Pointer is pressed
    //   svgContainer.addEventListener("pointerup", onPointerUp); // Releasing the pointer
    //   svgContainer.addEventListener("pointerleave", onPointerUp); // Pointer gets out of the SVG area
    //   svgContainer.addEventListener("pointermove", onPointerMove); // Pointer is moving
    // } else {
    svgContainer.addEventListener("touchstart", onPointerDown);
    svgContainer.addEventListener("touchend", onPointerUp);
    svgContainer.addEventListener("touchmove", onPointerMove);
    // }
  } else {
    svgContainer.addEventListener("wheel", (e) => {
      // pinch gesture on touchpad or Ctrl + wheel
      if (e.ctrlKey) {
        e.preventDefault();
        const scaleFactor = 1 - e.deltaY * 0.01;

        const [x, y] = center(getXY(e));
        const scaleMatrix = scale(current, scaleFactor);
        const [nx1, ny1] = transformXY(math.inv(current), x, y);
        const [nx2, ny2] = transformXY(math.inv(scaleMatrix), x, y);
        current = translate(scaleMatrix, nx2 - nx1, ny2 - ny1);

        render();
      }
    });

    svgContainer.addEventListener("mousedown", onPointerDown, {
      passive: true,
    });
    svgContainer.addEventListener("mouseup", onPointerUp, { passive: true });
    svgContainer.addEventListener("mouseleave", onPointerUp, { passive: true });
    svgContainer.addEventListener("mousemove", onPointerMove, {
      passive: true,
    });
  }
}

init();

// function init2() {
//   const svg = document.querySelector("svg");
//   const svgContainer = document.querySelector(".svgContainer");
//   if (!svg || !svgContainer) return;

//   new DragGesture(
//     svgContainer,
//     ({ active, pinching, cancel, movement: [mx, my] }) => {
//       if (pinching) cancel();
//       anime({
//         targets: svg,
//         translateX: active ? mx : 0,
//         translateY: active ? my : 0,
//         duration: active ? 0 : 1000,
//       });
//     }
//   );

//   new PinchGesture(svgContainer, ({ origin, offset: [s] }) => {
//     anime({
//       targets: svg,
//       scale: s,
//       duration: 0,
//     });
//   });
// }

// init2();
