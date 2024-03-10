import "./index.css";
import * as math from "mathjs";
import {
  Coords,
  center,
  centerDiff,
  distance,
  scale,
  transformXY,
  translate,
  ttm,
} from "./utils";

const identity = math.matrix([
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
]);

function init() {
  const svg = document.querySelector("svg");
  const svgContainer = document.querySelector(
    ".svgContainer"
  ) as HTMLDivElement;

  if (!svg || !svgContainer) return;

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

  let current = identity;

  let raf: number;
  function render() {
    cancelAnimationFrame(raf);
    raf = window.requestAnimationFrame(() => {
      svg!.style.transform = ttm(current);
    });
  }

  let tapedTwice = false;
  let mousedown = false;
  let originXY: Coords;
  let currentXY: Coords;

  function onPointerDown(e: MouseEvent | TouchEvent) {
    const xy = getXY(e);
    if ("touches" in e) {
      mousedown = e.touches.length === 2;
      if (mousedown) {
        e.preventDefault();
        // document.body.style.overflow = "none";
      }
      // else {
      //   document.body.style.overflow = "auto";
      // }
      if (e.touches.length === 1) {
        if (tapedTwice) {
          if (distance([xy[0], originXY[0]]) < 20) {
            onPointerDbl();
          } else {
            tapedTwice = false;
          }
        } else {
          tapedTwice = true;
          setTimeout(() => (tapedTwice = false), 300);
        }
      }
    } else {
      mousedown = true;
    }
    originXY = xy;
    currentXY = originXY;
  }

  function onPointerUp(e: MouseEvent | TouchEvent) {
    if ("touches" in e) {
      mousedown = e.touches.length === 2;
      // if (!mousedown) {
      //   document.body.style.overflow = "auto";
      // }
    } else {
      mousedown = false;
    }
  }

  function onPointerMove(e: MouseEvent | TouchEvent) {
    if (!mousedown) return;
    let xy = getXY(e);
    let isPinch = false;
    if ("touches" in e) {
      if (e.touches.length !== 2) return;
      e.preventDefault();
      const originScaleFactor = distance(xy) / distance(originXY);
      isPinch = Math.abs(1 - originScaleFactor) > 0.1;
      // isPinch = Math.abs(distance(xy) - distance(originXY)) > 35;
    }

    const currentScale = current.get([0, 0]);
    const [dx, dy] = centerDiff(xy, currentXY);
    current = translate(current, dx / currentScale, dy / currentScale);

    if (isPinch) {
      const [x, y] = center(xy);
      const scaleFactor = distance(xy) / distance(currentXY);
      const scaleMatrix = scale(current, scaleFactor);
      const [nx1, ny1] = transformXY(math.inv(current), x, y);
      const [nx2, ny2] = transformXY(math.inv(scaleMatrix), x, y);
      current = translate(scaleMatrix, nx2 - nx1, ny2 - ny1);
    }

    render();
    currentXY = xy;
  }

  function onPointerDbl() {
    current = identity;
    render();
    // animation
    const t = 300;
    svg!.style.transitionProperty = "transform";
    svg!.style.transitionDuration = `${t}ms`;
    setTimeout(() => (svg!.style.transitionDuration = "0ms"), t);
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
    svgContainer.addEventListener("dblclick", onPointerDbl, {
      passive: true,
    });
  }
}

init();

// import { DragGesture, PinchGesture } from "@use-gesture/vanilla";
// import anime from "animejs/lib/anime.es.js";

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
