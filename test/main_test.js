import {MyElement} from '../main.js';
import {fixture, html} from '@open-wc/testing';

const assert = chai.assert;

/**
 * Verifies that the my-element component is defined, renders its default and
 * named content, and updates its click count after interaction.
 */
suite('my-element', () => {
  /** Confirms the custom element is registered and creates a MyElement instance. */
  test('is defined', () => {
    const el = document.createElement('my-element');
    assert.instanceOf(el, MyElement);
  });

  /** Checks the rendered markup and initial state when no name is provided. */
  test('renders with default values', async () => {
    const el = await fixture(html`<my-element></my-element>`);
    assert.shadowDom.equal(
      el,
      `
      <h1>Hello, World!</h1>
      <button part="button">Click Count: 0</button>
      <slot></slot>
    `
    );
  });

  /** Checks that the name attribute is reflected in the rendered greeting. */
  test('renders with a set name', async () => {
    const el = await fixture(html`<my-element name="Test"></my-element>`);
    assert.shadowDom.equal(
      el,
      `
      <h1>Hello, Test!</h1>
      <button part="button">Click Count: 0</button>
      <slot></slot>
    `
    );
  });

  /** Checks that clicking the component button increments the displayed count. */
  test('handles a click', async () => {
    const el = await fixture(html`<my-element></my-element>`);
    const button = el.shadowRoot.querySelector('button');
    button.click();
    await el.updateComplete;
    assert.shadowDom.equal(
      el,
      `
      <h1>Hello, World!</h1>
      <button part="button">Click Count: 1</button>
      <slot></slot>
    `
    );
  });
});
