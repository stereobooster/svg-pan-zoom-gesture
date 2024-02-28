import "./index.css";

// https://css-tricks.com/creating-a-panning-effect-for-svg/
function init() {
  // We select the SVG into the page
  const svg = document.querySelector("svg");

  if (!svg) return;

  // const debugEvent = (ev: string, map?: any) =>
  //   svg.addEventListener(ev, (e) => console.log(ev, map ? map(e) : e), {
  //     passive: true,
  //   });

  // debugEvent("pointerdown");
  // debugEvent("pointerup");
  // debugEvent("pointerleave");
  // debugEvent("pointermove");

  // debugEvent("mousedown");
  // debugEvent("mouseup");
  // debugEvent("mouseleave");
  // debugEvent("mousemove");

  // debugEvent("touchstart");
  // debugEvent("touchend");
  // debugEvent("touchmove");

  // debugEvent("gesturestart");
  // debugEvent("gesturechange");
  // debugEvent("gestureend");

  // debugEvent(
  //   "wheel",
  //   ({
  //     clientX,
  //     clientY,
  //     deltaY,
  //     deltaX,
  //     deltaMode,
  //     wheelDeltaX,
  //     wheelDeltaY,
  //   }: any) => ({
  //     clientX,
  //     clientY,
  //     deltaY,
  //     deltaX,
  //     deltaMode,
  //     wheelDeltaX,
  //     wheelDeltaY,
  //   })
  // );
  // debugEvent("scroll");
  // debugEvent("mousewheel");

  // If browser supports pointer events
  if (window.PointerEvent) {
    svg.addEventListener("pointerdown", onPointerDown, { passive: true }); // Pointer is pressed
    svg.addEventListener("pointerup", onPointerUp, { passive: true }); // Releasing the pointer
    svg.addEventListener("pointerleave", onPointerUp, { passive: true }); // Pointer gets out of the SVG area
    svg.addEventListener("pointermove", onPointerMove, { passive: true }); // Pointer is moving
  } else {
    // Add all mouse events listeners fallback
    // @ts-expect-error
    svg.addEventListener("mousedown", onPointerDown, { passive: true }); // Pressing the mouse
    svg.addEventListener("mouseup", onPointerUp, { passive: true }); // Releasing the mouse
    svg.addEventListener("mouseleave", onPointerUp, { passive: true }); // Mouse gets out of the SVG area
    // @ts-expect-error
    svg.addEventListener("mousemove", onPointerMove, { passive: true }); // Mouse is moving

    // Add all touch events listeners fallback
    svg.addEventListener("touchstart", onPointerDown, { passive: true }); // Finger is touching the screen
    svg.addEventListener("touchend", onPointerUp, { passive: true }); // Finger is no longer touching the screen
    svg.addEventListener("touchmove", onPointerMove, { passive: true }); // Finger is moving
  }

  // Create an SVG point that contains x & y values
  const point = svg.createSVGPoint();
  // This function returns an object with X & Y values from the pointer event
  function getPointFromEvent(event: TouchEvent | PointerEvent) {
    // If even is triggered by a touch event, we get the position of the first finger
    if ("targetTouches" in event) {
      point.x = event.targetTouches[0].clientX;
      point.y = event.targetTouches[0].clientY;
    } else {
      point.x = event.clientX;
      point.y = event.clientY;
    }

    // We get the current transformation matrix of the SVG and we inverse it
    const invertedSVGMatrix = svg?.getScreenCTM()?.inverse();

    return point.matrixTransform(invertedSVGMatrix);
  }

  // This variable will be used later for move events to check if pointer is down or not
  let isPointerDown = false;

  // This variable will contain the original coordinates when the user start pressing the mouse or touching the screen
  let pointerOrigin: DOMPoint;

  // Function called by the event listeners when user start pressing/touching
  function onPointerDown(event: TouchEvent | PointerEvent) {
    isPointerDown = true; // We set the pointer as down

    // We get the pointer position on click/touchdown so we can get the value once the user starts to drag
    pointerOrigin = getPointFromEvent(event);
  }

  // We save the original values from the viewBox
  const viewBox = svg.viewBox.baseVal;

  // Function called by the event listeners when user start moving/dragging
  function onPointerMove(event: TouchEvent | PointerEvent) {
    // Only run this function if the pointer is down
    if (!isPointerDown) {
      return;
    }
    // This prevent user to do a selection on the page
    // event.preventDefault();

    // Get the pointer position as an SVG Point
    const pointerPosition = getPointFromEvent(event);

    // Update the viewBox variable with the distance from origin and current position
    // We don't need to take care of a ratio because this is handled in the getPointFromEvent function
    viewBox.x -= pointerPosition.x - pointerOrigin.x;
    viewBox.y -= pointerPosition.y - pointerOrigin.y;
  }

  function onPointerUp() {
    // The pointer is no longer considered as down
    isPointerDown = false;
  }
}

// init();

// https://stackblitz.com/edit/multi-touch-trackpad-gesture?file=index.js
function init2() {
  const svg = document.querySelector("svg");
  const svgContainer = document.querySelector(
    ".svgContainer"
  ) as HTMLDivElement;

  if (!svg || !svgContainer) return;

  svg.style.pointerEvents = "none";

  // matrix(scaleX(), skewY(), skewX(), scaleY(), translateX(), translateY())
  //                           a  b  c  d  e  f
  let current = new DOMMatrix([1, 0, 0, 1, 0, 0]);

  const render = () => {
    window.requestAnimationFrame(() => {
      svg.style.transform = current.toString();
    });
  };

  const { width, height } = svg.getBoundingClientRect();

  svgContainer.addEventListener("wheel", (e) => {
    // pinch gesture on touchpad or Ctrl + wheel
    if (e.ctrlKey) {
      e.preventDefault();
      // it almost works
      // @ts-expect-error
      let tx = e.layerX - width / 2;
      // @ts-expect-error
      let ty = e.layerY - height / 2;
      current.translateSelf(tx, ty);
      current.scaleSelf(1 - e.deltaY * 0.01);
      current.translateSelf(-tx, -ty);
      render();
    } else {
      // posX -= e.deltaX * 2;
      // posY -= e.deltaY * 2;
    }
  });

  let x = 0;
  let y = 0;
  let mousedown = false;

  svgContainer.addEventListener("mousedown", (e) => {
    mousedown = true;
    x = e.clientX;
    y = e.clientY;

    if (e.metaKey) {
      const x = current.e;
      const y = current.f;
      current.translateSelf(-x / current.a, -y / current.a);

      current.transformPoint;

      // @ts-expect-error
      let tx = e.layerX - x - width / 2;
      // @ts-expect-error
      let ty = e.layerY - y - height / 2;

      current.translateSelf(tx, ty);
      current.scaleSelf(0.8);
      current.translateSelf(-tx, -ty);

      current.translateSelf(x / current.a, y / current.a);
      render();
    }
  });

  svgContainer.addEventListener("mouseup", (e) => {
    mousedown = false;
  });

  svgContainer.addEventListener("mouseleave", (e) => {
    mousedown = false;
  });

  svgContainer.addEventListener("mousemove", (e) => {
    if (!mousedown) return;
    const tx = e.clientX - x;
    const ty = e.clientY - y;
    const scale = current.a;
    current.translateSelf(tx / scale, ty / scale);
    console.log(current.e, current.f);
    render();

    x = e.clientX;
    y = e.clientY;
  });
}

// init2();

// https://stackoverflow.com/questions/60190965/zoom-scale-at-mouse-position
// https://stackoverflow.com/questions/57262208/javascript-zoom-in-out-to-mouse-x-y-coordinates
function init3() {
  const svg = document.querySelector("svg");
  if (!svg) return;

  const view = (() => {
    const matrix = [1, 0, 0, 1, 0, 0]; // current view transform
    let m = matrix; // alias
    let scale = 1; // current scale
    const pos = { x: 0, y: 0 }; // current position of origin
    let dirty = true;
    const API = {
      applyTo(el: any) {
        if (dirty) {
          this.update();
        }
        el.style.transform = `matrix(${m[0]},${m[1]},${m[2]},${m[3]},${m[4]},${m[5]})`;
      },
      update() {
        dirty = false;
        m[3] = m[0] = scale;
        m[2] = m[1] = 0;
        m[4] = pos.x;
        m[5] = pos.y;
      },
      pan(at: any) {
        if (dirty) {
          this.update();
        }
        pos.x += at.x;
        pos.y += at.y;
        dirty = true;
      },
      scaleAt(at: any, amount: number) {
        // at in screen coords
        if (dirty) {
          this.update();
        }
        scale *= amount;
        pos.x = at.x - (at.x - pos.x) * amount;
        pos.y = at.y - (at.y - pos.y) * amount;
        dirty = true;
      },
    };
    return API;
  })();

  document.addEventListener("mousemove", mouseEvent, { passive: false });
  document.addEventListener("mousedown", mouseEvent, { passive: false });
  document.addEventListener("mouseup", mouseEvent, { passive: false });
  document.addEventListener("mouseout", mouseEvent, { passive: false });
  document.addEventListener("wheel", mouseWheelEvent, { passive: false });

  const mouse = { x: 0, y: 0, oldX: 0, oldY: 0, button: false };
  function mouseEvent(event: MouseEvent) {
    if (event.type === "mousedown") {
      mouse.button = true;
    }
    if (event.type === "mouseup" || event.type === "mouseout") {
      mouse.button = false;
    }
    mouse.oldX = mouse.x;
    mouse.oldY = mouse.y;
    mouse.x = event.pageX;
    mouse.y = event.pageY;
    // console.log(mouse)
    if (mouse.button) {
      // pan
      view.pan({ x: mouse.x - mouse.oldX, y: mouse.y - mouse.oldY });
      view.applyTo(svg!);
    }
    event.preventDefault();
  }

  function mouseWheelEvent(event: WheelEvent) {
    // console.log(svg?.width + 0, svg?.height+ 0, svg?.x+ 0, svg?.y+ 0)
    const x = event.pageX - svg.width / 2;
    const y = event.pageY - svg.height / 2;

    if (event.deltaY < 0) {
      view.scaleAt({ x, y }, 1.1);
      view.applyTo(svg);
    } else {
      view.scaleAt({ x, y }, 1 / 1.1);
      view.applyTo(svg);
    }
    event.preventDefault();
  }
}

init3();
