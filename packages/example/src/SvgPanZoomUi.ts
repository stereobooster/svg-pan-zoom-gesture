import { SvgPanZoom } from "./SvgPanZoom";

// TODO: pass as config to class
const classes = {
  zoomIn: "zoom-in",
  reset: "reset",
  zoomOut: "zoom-out",
  buttons: "buttons",
  tsWarning: "touchscreen-warning",
  tsWarningActive: "active",
};

export class SvgPanZoomUi {
  constructor(element: HTMLElement | SVGSVGElement, container: HTMLElement) {
    const instance = new SvgPanZoom(element, container);
    // TODO: implement on/off functionality
    instance.on();

    const buttons = document.createElement("div");
    buttons.innerHTML = `
      <button class="${classes.zoomIn}" tabindex="-1">+</button>
      <button class="${classes.reset}" tabindex="-1">↺</button>
      <button class="${classes.zoomOut}" tabindex="-1">-</button>
    `;
    buttons.className = classes.buttons;
    buttons.querySelectorAll("button").forEach((button, i) => {
      if (i == 0)
        button.addEventListener("click", (e) => {
          e.stopPropagation();
          instance.zoom(1.1);
        });
      if (i == 1)
        button.addEventListener("click", (e) => {
          e.stopPropagation();
          instance.reset();
        });
      if (i == 2)
        button.addEventListener("click", (e) => {
          e.stopPropagation();
          instance.zoom(0.9);
        });
    });
    container.append(buttons);

    const warning = document.createElement("div");
    // TODO: pass as config
    warning.innerText = "Use two fingers to pan and zoom";
    warning.className = classes.tsWarning;
    container.append(warning);
    instance.onOneFingerDrag((flag) =>
      flag
        ? warning.classList.add(classes.tsWarningActive)
        : warning.classList.remove(classes.tsWarningActive)
    );
  }

  on() {}

  off() {}
}
