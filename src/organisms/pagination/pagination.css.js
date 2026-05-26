import {css} from 'lit';

export default css`
  :host {
    display: block;
  }

  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    padding: 16px 0;
  }

  .pagination-item {
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    user-select: none;
    transition: all 0.2s ease;
  }

  .pagination-item:hover:not(.disabled) {
    background-color: #f0f0f0;
    border-color: #999;
  }

  mwc-button.pagination-item.active {
    --mdc-theme-primary: #6200ee;
    --mdc-theme-on-primary: #fff;
  }

  .pagination-item.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .pagination-ellipsis {
    padding: 8px 12px;
    cursor: default;
  }
`;
