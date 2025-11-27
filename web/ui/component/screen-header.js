const styleUrl = new URL('./screen-header.css', import.meta.url);
const template = document.createElement('template');
template.innerHTML = `
  <link rel="stylesheet" href="${styleUrl.href}" />
  <div class="header">
    <div class="leading">
      <span class="icon-slot"><slot name="icon"></slot></span>
      <div class="titles">
        <p class="title"></p>
        <p class="subtitle"></p>
      </div>
    </div>
    <div class="actions">
      <slot name="action"></slot>
    </div>
  </div>
`;

class ScreenHeader extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'subtitle'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
    this.titleNode = this.shadowRoot.querySelector('.title');
    this.subtitleNode = this.shadowRoot.querySelector('.subtitle');
    this.iconSlot = this.shadowRoot.querySelector('slot[name="icon"]');
    this.iconObserver = () => this.updateIconPresence();
  }

  connectedCallback() {
    this.updateTitle();
    this.updateSubtitle();
    this.updateIconPresence();
    this.iconSlot?.addEventListener('slotchange', this.iconObserver);
  }

  disconnectedCallback() {
    this.iconSlot?.removeEventListener('slotchange', this.iconObserver);
  }

  attributeChangedCallback(name) {
    if (name === 'title') {
      this.updateTitle();
    }
    if (name === 'subtitle') {
      this.updateSubtitle();
    }
  }

  updateTitle() {
    if (!this.titleNode) return;
    this.titleNode.textContent = this.getAttribute('title') ?? '';
  }

  updateSubtitle() {
    if (!this.subtitleNode) return;
    const value = this.getAttribute('subtitle');
    this.subtitleNode.textContent = value ?? '';
    this.toggleAttribute('has-subtitle', Boolean(value));
  }

  updateIconPresence() {
    const hasIcon = this.iconSlot?.assignedNodes({ flatten: true }).some((node) => {
      return (node.nodeType === Node.ELEMENT_NODE || node.textContent?.trim());
    });
    this.toggleAttribute('has-icon', Boolean(hasIcon));
  }
}

customElements.define('screen-header', ScreenHeader);
