export function el(tag, props = {}, children = []) {
    const node = document.createElement(tag);
    if (props.class)
        node.className = props.class;
    if (props.text !== undefined)
        node.textContent = props.text;
    for (const [key, value] of Object.entries(props.attrs ?? {}))
        node.setAttribute(key, value);
    if (props.on?.click)
        node.addEventListener("click", props.on.click);
    if (props.on?.change)
        node.addEventListener("change", props.on.change);
    node.append(...children);
    return node;
}
export function query(selector) {
    const node = document.querySelector(selector);
    if (!node)
        throw new Error(`Missing element: ${selector}`);
    return node;
}
export function clear(node) {
    node.replaceChildren();
}
//# sourceMappingURL=dom.js.map