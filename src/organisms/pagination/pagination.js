import { LitElement, html, css } from 'lit';

import { dispatchCustomEvent } from '../../../utils/utils.js';

import styles from './pagination.css.js';

/**
 * Pagination control that renders a window of page buttons and ellipses.
 *
 * @fires pagination-element-page-changed - Fired when a valid different page is selected, with `{page: number}` in `event.detail`.
 */
export class PaginationElement extends LitElement {
  /** @returns {string} The custom-element tag name. */
  static get is() {
    return 'pagination-element';
  }

  /** Reactive page-number properties. */
  static properties = {
    /**
     * Current active page number.
     * @type {number}
     * @attribute current-page
     */
    currentPage: { type: Number },
    /**
     * Total number of available pages.
     * @type {number}
     * @attribute total-pages
     */
    totalPages: { type: Number },
    /**
     * Maximum number of visible page buttons.
     * @type {number}
     * @attribute max-visible-pages
     */
    maxVisiblePages: { type: Number },
  };

  /** Initializes the control to page one with a five-button window. */
  constructor() {
    super();
    this.currentPage = 1;
    this.totalPages = 1;
    this.maxVisiblePages = 5;
  }

  /**
   * Changes the active page and emits a page-changed event for a valid selection.
   *
   * @param {Event} event - Click event whose target has a numeric `data-page` attribute.
   * @param {string} event.target.dataset.page - Requested page number.
   * @fires pagination-element-page-changed - Fired with `{page: number}` in `event.detail`.
   * @returns {void}
   */
  changePage({target: {dataset: {page}}}) {
    page = parseInt(page);
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      dispatchCustomEvent(this, `${PaginationElement.is}-page-changed`, { page });
    }
  }

  /**
   * Computes the page number buttons to display.
   *
   * @returns {Array<number|string>} The list of page numbers and ellipses.
   */
  getPageNumbers() {
    const pages = [];
    const half = Math.floor(this.maxVisiblePages / 2);
    let start = Math.max(1, this.currentPage - half);
    let end = Math.min(this.totalPages, start + this.maxVisiblePages - 1);

    if (end - start < this.maxVisiblePages - 1) {
      start = Math.max(1, end - this.maxVisiblePages + 1);
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < this.totalPages) {
      if (end < this.totalPages - 1) pages.push('...');
      pages.push(this.totalPages);
    }

    return pages;
  }

  
  /** @returns {import('lit').CSSResult[]} Styles applied to the control. */
  static get styles() {
    return [styles];
  }
  
  /**
   * Renders the pagination control template.
   *
   * @returns {import('lit').TemplateResult}
   */
  render() {
    return html`
      <section class="pagination">
        ${this.getPageNumbers().map((page) => 
          page === '...' 
            ? html`<span class="pagination-ellipsis">...</span>`
            : html`
              <mwc-button
                ?raised="${page === this.currentPage}"
                class="pagination-item ${page === this.currentPage ? 'active' : ''}"
                @click="${this.changePage}"
                data-page="${page}"
              >
                ${page}
              </mwc-button>
            `
        )}
      </section>
    `;
  }
}

customElements.define('pagination-element', PaginationElement);
