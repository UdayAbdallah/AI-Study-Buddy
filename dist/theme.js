export function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
}
export function toggleTheme(theme) {
    return theme === "dark" ? "light" : "dark";
}
//# sourceMappingURL=theme.js.map