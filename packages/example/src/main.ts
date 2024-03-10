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

class SvgPanZoom {
  #element: HTMLElement | SVGSVGElement;
  #container: HTMLElement;
  #curMatrix = identity;
  #raf = 0;
  #tapedTwice = false;
  #mousedown = false;
  #originXY: Coords = [];
  #currentXY: Coords = [];

  constructor(element: HTMLElement | SVGSVGElement, container: HTMLElement) {
    this.#element = element;
    this.#container = container;
  }

  #getXY(e: MouseEvent | TouchEvent, layer = true) {
    let coords: Coords =
      "touches" in e
        ? Array.from(e.touches).map((t) => [t.clientX, t.clientY])
        : [[e.clientX, e.clientY]];

    if (layer) {
      const rect = this.#container.getBoundingClientRect();
      coords = coords.map(([x, y]) => [
        x - rect.x - rect.width / 2,
        y - rect.y - rect.height / 2,
      ]);
    }

    return coords;
  }

  #render() {
    cancelAnimationFrame(this.#raf);
    this.#raf = window.requestAnimationFrame(() => {
      this.#element.style.transform = ttm(this.#curMatrix);
    });
  }

  #onPointerDown(e: MouseEvent | TouchEvent) {
    const xy = this.#getXY(e);
    if ("touches" in e) {
      this.#mousedown = e.touches.length === 2;
      if (this.#mousedown) {
        e.preventDefault();
        // document.body.style.overflow = "none";
      }
      // else {
      //   document.body.style.overflow = "auto";
      // }
      if (e.touches.length === 1) {
        if (this.#tapedTwice) {
          if (distance([xy[0], this.#originXY[0]]) < 20) {
            this.reset();
          } else {
            this.#tapedTwice = false;
          }
        } else {
          this.#tapedTwice = true;
          setTimeout(() => (this.#tapedTwice = false), 300);
        }
      }
    } else {
      this.#mousedown = true;
      this.#container.style.cursor = "grabbing";
    }
    this.#originXY = xy;
    this.#currentXY = xy;
  }

  #onPointerUp(e: MouseEvent | TouchEvent) {
    if ("touches" in e) {
      this.#mousedown = e.touches.length === 2;
      // if (!mousedown) {
      //   document.body.style.overflow = "auto";
      // }
    } else {
      this.#mousedown = false;
      this.#container.style.cursor = "grab";
    }
  }

  #onPointerMove(e: MouseEvent | TouchEvent) {
    if (!this.#mousedown) return;
    let xy = this.#getXY(e);
    let isPinch = false;
    if ("touches" in e) {
      if (e.touches.length !== 2) return;
      e.preventDefault();
      const originScaleFactor = distance(xy) / distance(this.#originXY);
      isPinch = Math.abs(1 - originScaleFactor) > 0.1;
      // isPinch = Math.abs(distance(xy) - distance(originXY)) > 35;
    }

    const currentScale = this.#curMatrix.get([0, 0]);
    const [dx, dy] = centerDiff(xy, this.#currentXY);
    this.#curMatrix = translate(
      this.#curMatrix,
      dx / currentScale,
      dy / currentScale
    );

    if (isPinch) {
      const [x, y] = center(xy);
      const scaleFactor = distance(xy) / distance(this.#currentXY);
      const scaleMatrix = scale(this.#curMatrix, scaleFactor);
      const [nx1, ny1] = transformXY(math.inv(this.#curMatrix), x, y);
      const [nx2, ny2] = transformXY(math.inv(scaleMatrix), x, y);
      this.#curMatrix = translate(scaleMatrix, nx2 - nx1, ny2 - ny1);
    }

    this.#render();
    this.#currentXY = xy;
  }

  #animate() {
    const t = 300;
    this.#element.style.transitionProperty = "transform";
    this.#element.style.transitionDuration = `${t}ms`;
    setTimeout(() => (this.#element.style.transitionDuration = "0ms"), t);
  }

  reset() {
    this.#animate();
    this.#curMatrix = identity;
    this.#render();
  }

  pan(dx: number, dy: number) {
    this.#animate();
    const currentScale = this.#curMatrix.get([0, 0]);
    this.#curMatrix = translate(
      this.#curMatrix,
      dx / currentScale,
      dy / currentScale
    );
    this.#render();
  }

  zoom(scaleFactor: number) {
    this.#animate();
    this.#curMatrix = scale(this.#curMatrix, scaleFactor);
    this.#render();
  }

  on() {
    // https://stackoverflow.com/questions/4817029/whats-the-best-way-to-detect-a-touch-screen-device-using-javascript
    if (window.matchMedia("(pointer: coarse)").matches) {
      // if (window.PointerEvent) {
      //   this.#container.addEventListener("pointerdown", onPointerDown); // Pointer is pressed
      //   this.#container.addEventListener("pointerup", onPointerUp); // Releasing the pointer
      //   this.#container.addEventListener("pointerleave", onPointerUp); // Pointer gets out of the SVG area
      //   this.#container.addEventListener("pointermove", onPointerMove); // Pointer is moving
      // } else {
      this.#container.addEventListener(
        "touchstart",
        this.#onPointerDown.bind(this)
      );
      this.#container.addEventListener(
        "touchend",
        this.#onPointerUp.bind(this)
      );
      this.#container.addEventListener(
        "touchmove",
        this.#onPointerMove.bind(this)
      );
      // }
    } else {
      this.#container.addEventListener("wheel", (e) => {
        // pinch gesture on touchpad or Ctrl + wheel
        if (e.ctrlKey) {
          e.preventDefault();
          const scaleFactor = 1 - e.deltaY * 0.01;

          const [x, y] = center(this.#getXY(e));
          const scaleMatrix = scale(this.#curMatrix, scaleFactor);
          const [nx1, ny1] = transformXY(math.inv(this.#curMatrix), x, y);
          const [nx2, ny2] = transformXY(math.inv(scaleMatrix), x, y);
          this.#curMatrix = translate(scaleMatrix, nx2 - nx1, ny2 - ny1);

          this.#render();
        }
      });

      this.#container.addEventListener(
        "mousedown",
        this.#onPointerDown.bind(this),
        {
          passive: true,
        }
      );
      this.#container.addEventListener(
        "mouseup",
        this.#onPointerUp.bind(this),
        {
          passive: true,
        }
      );
      this.#container.addEventListener(
        "mouseleave",
        this.#onPointerUp.bind(this),
        {
          passive: true,
        }
      );
      this.#container.addEventListener(
        "mousemove",
        this.#onPointerMove.bind(this),
        {
          passive: true,
        }
      );
      this.#container.addEventListener("dblclick", this.reset.bind(this), {
        passive: true,
      });
    }
  }

  off() {
    throw new Error("Not implemented");
  }
}

function init() {
  const svg = document.querySelector("svg");
  const svgContainer = document.querySelector(
    ".svgContainer"
  ) as HTMLDivElement;

  if (!svg || !svgContainer) return;

  const instance = new SvgPanZoom(svg, svgContainer);
  instance.on();

  document.querySelector("#zoomIn")?.addEventListener("click", () => {
    instance.zoom(1.1);
  });
  document.querySelector("#zoomOut")?.addEventListener("click", () => {
    instance.zoom(0.9);
  });
  document.querySelector("#reset")?.addEventListener("click", () => {
    instance.reset();
  });

  document.querySelector("#panUp")?.addEventListener("click", () => {
    instance.pan(0, -20);
  });
  document.querySelector("#panDown")?.addEventListener("click", () => {
    instance.pan(0, 20);
  });
  document.querySelector("#panLeft")?.addEventListener("click", () => {
    instance.pan(-20, 0);
  });
  document.querySelector("#panRight")?.addEventListener("click", () => {
    instance.pan(20, 0);
  });
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
