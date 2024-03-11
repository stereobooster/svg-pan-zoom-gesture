import "./index.css";
import { SvgPanZoomUi } from "@stereobooster/svg-pan-zoom";

function init(selectorContainer: string, selectorElement = "svg,img") {
  const container = document.querySelector(selectorContainer) as HTMLElement;
  const element = container?.querySelector(selectorElement) as HTMLElement;
  if (!element || !container) return;
  new SvgPanZoomUi({ element, container }).on();
}

init("#image-no-size");
init("#image-small");
init("#image-big");

init("#svg-no-size");
init("#svg-small");
init("#svg-big");
