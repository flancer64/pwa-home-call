const styleUrl = new URL('./big-button.css', import.meta.url);
const template = document.createElement('template');
template.innerHTML = `
  <link rel="stylesheet" href="${styleUrl.href}" />
  <button type="button">
    <span class="glyph">
      <slot name="icon">
        <icon-wrapper name="circle-check" size="medium"></icon-wrapper>
      </slot>
    </span>
    <span class="label"></span>
  </button>
`;

class BigButton extends HTMLElement {
  static get observedAttributes() {
    return ['label', 'action'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));

    this.button = this.shadowRoot.querySelector('button');
    this.labelNode = this.shadowRoot.querySelector('.label');

    this.handleClick = this.handleClick.bind(this);
  }

  connectedCallback() {
    this.updateLabel();
    this.button?.addEventListener('click', this.handleClick);
  }

  disconnectedCallback() {
    this.button?.removeEventListener('click', this.handleClick);
  }

  attributeChangedCallback(name) {
    if (name === 'label') {
      this.updateLabel();
    }
  }

  handleClick() {
    const actionName = this.getAttribute('action') ?? null;
    this.dispatchEvent(
      new CustomEvent('action', {
        bubbles: true,
        composed: true,
        detail: { action: actionName },
      }),
    );
  }

  updateLabel() {
    if (!this.labelNode) return;
    this.labelNode.textContent = this.getAttribute('label') ?? '';
  }

}

customElements.define('big-button', BigButton);
