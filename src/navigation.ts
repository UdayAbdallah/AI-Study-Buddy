import type { View } from "./types.js";
import { query } from "./dom.js";

const VIEWS: readonly View[] = ["dashboard", "study", "quiz", "progress", "settings"];

const isView = (value: string | undefined): value is View => VIEWS.some((view) => view === value);

export function initNavigation(onChange: (view: View) => void): (view: View) => void {
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-view]"));

  const show = (view: View): void => {
    for (const name of VIEWS) query(`#view-${name}`).hidden = name !== view;
    for (const button of buttons) {
      if (button.dataset.view === view) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    }
    window.scrollTo({ top: 0 });
    onChange(view);
  };

  for (const button of buttons) {
    button.addEventListener("click", () => {
      const view = button.dataset.view;
      if (isView(view)) show(view);
    });
  }
  return show;
}
