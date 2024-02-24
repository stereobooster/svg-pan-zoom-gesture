import "./index.css";

// https://css-tricks.com/creating-a-panning-effect-for-svg/
function init() {
  // We select the SVG into the page
  const svg = document.querySelector("svg");

  if (!svg) return;

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

init();
