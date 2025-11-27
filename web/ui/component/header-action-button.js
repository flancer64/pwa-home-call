const styleUrl = new URL('./header-action-button.css', import.meta.url);
const template = document.createElement('template');
template.innerHTML = `
  <link rel="stylesheet" href="${styleUrl.href}" />
  <button type="button">
    <span class="icon-slot">
      <slot name="icon"></slot>
    </span>
  </button>
`;

class HeaderActionButton extends HTMLElement {
  static get observedAttributes() {
    return ['aria-label', 'disabled'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
    this.button = this.shadowRoot?.querySelector('button') ?? null;
  }

  connectedCallback() {
    this.updateLabel();
    this.updateDisabled();
  }

  attributeChangedCallback(name) {
    if (name === 'aria-label') {
      this.updateLabel();
    }
    if (name === 'disabled') {
      this.updateDisabled();
    }
  }

  updateLabel() {
    if (!this.button) {
      return;
    }
    const label = this.getAttribute('aria-label');
    if (label) {
      this.button.setAttribute('aria-label', label);
    } else {
      this.button.removeAttribute('aria-label');
    }
  }

  updateDisabled() {
    if (!this.button) {
      return;
    }
    if (this.hasAttribute('disabled')) {
      this.button.setAttribute('disabled', '');
    } else {
      this.button.removeAttribute('disabled');
    }
  }

  focus() {
    this.button?.focus();
  }
}

customElements.define('header-action-button', HeaderActionButton);
