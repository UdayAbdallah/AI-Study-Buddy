import { query } from "./dom.js";
const VIEWS = ["dashboard", "study", "quiz", "progress", "settings"];
const isView = (value) => VIEWS.some((view) => view === value);
export function initNavigation(onChange) {
    const buttons = Array.from(document.querySelectorAll("[data-view]"));
    const show = (view) => {
        for (const name of VIEWS)
            query(`#view-${name}`).hidden = name !== view;
        for (const button of buttons) {
            if (button.dataset.view === view)
                button.setAttribute("aria-current", "page");
            else
                button.removeAttribute("aria-current");
        }
        window.scrollTo({ top: 0 });
        onChange(view);
    };
    for (const button of buttons) {
        button.addEventListener("click", () => {
            const view = button.dataset.view;
            if (isView(view))
                show(view);
        });
    }
    return show;
}
//# sourceMappingURL=navigation.js.map