const styleUrl = new URL('./icon-wrapper.css', import.meta.url);
const template = document.createElement('template');
template.innerHTML = `
  <link rel="stylesheet" href="${styleUrl.href}" />
  <span class="icon">
    <slot></slot>
  </span>
`;

class IconWrapper extends HTMLElement {
  static get observedAttributes() {
    return ['size', 'tone'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    if (!this.hasAttribute('size')) {
      this.setAttribute('size', 'large');
    }
    if (!this.hasAttribute('tone')) {
      this.setAttribute('tone', 'default');
    }
  }

  attributeChangedCallback() {
    // Attributes are reflected via CSS selectors, nothing else to update.
  }
}

customElements.define('icon-wrapper', IconWrapper);
