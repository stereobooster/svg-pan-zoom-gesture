import "./index.css";
import { SvgPanZoom } from "./SvgPanZoom";

function init() {
  const svgContainer = document.querySelector(
    ".svg-pan-zoom"
  ) as HTMLDivElement;
  const svg = svgContainer.querySelector("svg");

  if (!svg || !svgContainer) return;

  const instance = new SvgPanZoom(svg, svgContainer);
  instance.on();

  const classes = {
    zoomIn: "zoom-in",
    reset: "reset",
    zoomOut: "zoom-out",
    buttons: "buttons",
  };

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

  svgContainer.append(buttons);
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
