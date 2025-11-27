const styleUrl = new URL('./screen-note.css', import.meta.url);
const template = document.createElement('template');
template.innerHTML = `
  <link rel="stylesheet" href="${styleUrl.href}" />
  <div class="note">
    <span class="text"></span>
    <span class="meta"><slot name="meta"></slot></span>
  </div>
`;

class ScreenNote extends HTMLElement {
  static get observedAttributes() {
    return ['text', 'tone'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
    this.textNode = this.shadowRoot.querySelector('.text');
    this.metaSlot = this.shadowRoot.querySelector('slot[name="meta"]');
    this.handleMetaSlot = () => {
      const hasMeta = this.metaSlot?.assignedNodes({ flatten: true }).length > 0;
      this.toggleAttribute('has-meta', Boolean(hasMeta));
    };
  }

  connectedCallback() {
    if (!this.hasAttribute('tone')) {
      this.setAttribute('tone', 'neutral');
    }
    this.updateText();
    this.metaSlot?.addEventListener('slotchange', this.handleMetaSlot);
    this.handleMetaSlot();
  }

  disconnectedCallback() {
    this.metaSlot?.removeEventListener('slotchange', this.handleMetaSlot);
  }

  attributeChangedCallback(name) {
    if (name === 'text') {
      this.updateText();
    }
    if (name === 'tone' && !this.hasAttribute('tone')) {
      this.setAttribute('tone', 'neutral');
    }
  }

  updateText() {
    if (!this.textNode) return;
    this.textNode.textContent = this.getAttribute('text') ?? '';
  }
}

customElements.define('screen-note', ScreenNote);
