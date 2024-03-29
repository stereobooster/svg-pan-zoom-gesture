import { SvgPanZoom, SvgPanZoomProps } from "./SvgPanZoom.js";

const defaultClasses = {
  zoomIn: "zoom-in",
  reset: "reset",
  zoomOut: "zoom-out",
  buttons: "buttons",
  tsWarning: "touchscreen-warning",
  tsWarningActive: "active",
};

const defaultMessage = "Use two fingers to pan and zoom";

export type SvgPanZoomUiProps = SvgPanZoomProps & {
  classes?: typeof defaultClasses;
  /**
   * @default "Use two fingers to pan and zoom"
   */
  message?: string;
};

export class SvgPanZoomUi {
  #buttons: HTMLElement;
  #warning: HTMLElement;
  #instance: SvgPanZoom;
  #container: HTMLElement;

  constructor({
    container,
    classes = defaultClasses,
    message = defaultMessage,
    ...rest
  }: SvgPanZoomUiProps) {
    this.#container = container;
    this.#instance = new SvgPanZoom({ container, ...rest });

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
          this.#instance.zoom(1.1);
        });
      if (i == 1)
        button.addEventListener("click", (e) => {
          e.stopPropagation();
          this.#instance.reset();
        });
      if (i == 2)
        button.addEventListener("click", (e) => {
          e.stopPropagation();
          this.#instance.zoom(0.9);
        });
    });
    buttons.addEventListener("dblclick", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    this.#buttons = buttons;

    const warning = document.createElement("div");

    warning.innerText = message;
    warning.className = classes.tsWarning;
    this.#instance.onOneFingerDrag((flag) =>
      flag
        ? warning.classList.add(classes.tsWarningActive)
        : warning.classList.remove(classes.tsWarningActive)
    );
    this.#warning = warning;
  }

  on() {
    this.#instance.on();
    this.#container.append(this.#warning);
    this.#container.append(this.#buttons);
  }

  off() {
    this.#instance.off();
    this.#warning.remove();
    this.#buttons.remove();
  }
}
