import "@stereobooster/svg-pan-zoom/css/SvgPanZoomUi.css";
import { SvgPanZoomUi } from "@stereobooster/svg-pan-zoom";
import "./index.css";

document.querySelectorAll(".svg-pan-zoom").forEach((container) => {
  const element = container.querySelector("svg,img");
  if (!element) return;
  new SvgPanZoomUi({
    element: element as HTMLElement,
    container: container as HTMLElement,
  }).on();
});
