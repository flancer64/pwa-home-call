const styleUrl = new URL('./big-button.css', import.meta.url);
const template = document.createElement('template');
template.innerHTML = `
  <link rel="stylesheet" href="${styleUrl.href}" />
  <button type="button">
    <span class="glyph"><slot name="icon"></slot></span>
    <span class="label"></span>
    <span class="meta"><slot name="meta"></slot></span>
  </button>
`;

class BigButton extends HTMLElement {
  static get observedAttributes() {
    return ['label', 'tone', 'disabled'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
    this.button = this.shadowRoot.querySelector('button');
    this.labelNode = this.shadowRoot.querySelector('.label');
    this.iconSlot = this.shadowRoot.querySelector('slot[name="icon"]');
    this.metaSlot = this.shadowRoot.querySelector('slot[name="meta"]');
    this.handleSlotChange = () => {
      const hasIcon = this.iconSlot?.assignedNodes({ flatten: true }).length > 0;
      const hasMeta = this.metaSlot?.assignedNodes({ flatten: true }).length > 0;
      this.toggleAttribute('has-icon', Boolean(hasIcon));
      this.toggleAttribute('has-meta', Boolean(hasMeta));
    };
  }

  connectedCallback() {
    if (!this.hasAttribute('tone')) {
      this.setAttribute('tone', 'primary');
    }
    this.updateLabel();
    this.updateDisabled();
    this.iconSlot?.addEventListener('slotchange', this.handleSlotChange);
    this.metaSlot?.addEventListener('slotchange', this.handleSlotChange);
    this.handleSlotChange();
  }

  attributeChangedCallback(name) {
    if (name === 'label') {
      this.updateLabel();
    }
    if (name === 'disabled') {
      this.updateDisabled();
    }
    if (name === 'tone' && !this.hasAttribute('tone')) {
      this.setAttribute('tone', 'primary');
    }
  }

  updateLabel() {
    const text = this.getAttribute('label') ?? '';
    this.labelNode.textContent = text;
  }

  updateDisabled() {
    if (!this.button) return;
    this.button.disabled = this.hasAttribute('disabled');
  }
}

customElements.define('big-button', BigButton);
