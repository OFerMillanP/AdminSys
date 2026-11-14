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

  mwc-button.pagination-item {
    --mdc-theme-primary: #51204d;
    --mdc-theme-on-primary: #fff;
  }

  mwc-button.pagination-item:hover:not(.active) {
    --mdc-theme-primary: #71386d;
  }

  .pagination-item:hover:not(.disabled) {
    background-color: #f0f0f0;
    border-color: #999;
  }

  mwc-button.pagination-item.active {
    --mdc-theme-primary: #51204d;
    --mdc-theme-on-primary: #fff;
  }

  mwc-button.pagination-item.active:hover {
    --mdc-theme-primary: #71386d;
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
