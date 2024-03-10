import { getScale, identity, scaleAt, translate, ttm } from "./utilsDom";
import { Coords, center, centerDiff, distance } from "./utils";

export class SvgPanZoom {
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

    const currentScale = getScale(this.#curMatrix);
    const [dx, dy] = centerDiff(xy, this.#currentXY);
    this.#curMatrix = translate(
      this.#curMatrix,
      dx / currentScale,
      dy / currentScale
    );

    if (isPinch) {
      const scaleFactor = distance(xy) / distance(this.#currentXY);
      this.#scale(scaleFactor, xy);
    }

    this.#render();
    this.#currentXY = xy;
  }

  #scale(scaleFactor: number, xy: Coords) {
    const [x, y] = center(xy);
    this.#curMatrix = scaleAt(this.#curMatrix, scaleFactor, x, y);
  }

  #animate() {
    const t = 300;
    this.#element.style.transitionProperty = "transform";
    this.#element.style.transitionDuration = `${t}ms`;
    setTimeout(() => {
      this.#element.style.transitionDuration = "";
      this.#element.style.transitionProperty = "";
    }, t);
  }

  reset() {
    this.#animate();
    this.#curMatrix = identity;
    this.#render();
  }

  pan(dx: number, dy: number) {
    this.#animate();
    const currentScale = getScale(this.#curMatrix);
    this.#curMatrix = translate(
      this.#curMatrix,
      dx / currentScale,
      dy / currentScale
    );
    this.#render();
  }

  zoom(scaleFactor: number) {
    this.#animate();
    // scale relevant to the center
    this.#scale(scaleFactor, [[0, 0]]);
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
          this.#scale(1 - e.deltaY * 0.01, this.#getXY(e));
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
      this.#container.addEventListener(
        "dblclick",
        (e) => {
          if (e.target !== this.#container) return;
          this.reset();
        },
        {
          passive: true,
        }
      );
    }
  }

  off() {
    throw new Error("Not implemented");
  }
}
