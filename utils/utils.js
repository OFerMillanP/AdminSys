export function dispatchCustomEvent(component, name = '', detail = true, bubbles = true, composed = true) {
    component.dispatchEvent(
        new CustomEvent(name, {
        bubbles,
        composed,
        detail,
        }),
    );
}