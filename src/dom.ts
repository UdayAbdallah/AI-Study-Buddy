interface ElementProps {
  class?: string;
  text?: string;
  attrs?: Record<string, string>;
  on?: { click?: () => void; change?: () => void };
}

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: ElementProps = {},
  children: (Node | string)[] = []
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (props.class) node.className = props.class;
  if (props.text !== undefined) node.textContent = props.text;
  for (const [key, value] of Object.entries(props.attrs ?? {})) node.setAttribute(key, value);
  if (props.on?.click) node.addEventListener("click", props.on.click);
  if (props.on?.change) node.addEventListener("change", props.on.change);
  node.append(...children);
  return node;
}

export function query<T extends HTMLElement>(selector: string): T {
  const node = document.querySelector<T>(selector);
  if (!node) throw new Error(`Missing element: ${selector}`);
  return node;
}

export function clear(node: HTMLElement): void {
  node.replaceChildren();
}
