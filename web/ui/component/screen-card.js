const styleUrl = new URL('./screen-card.css', import.meta.url);
const template = document.createElement('template');
template.innerHTML = `
  <link rel="stylesheet" href="${styleUrl.href}" />
  <section class="card">
    <div class="zone zone--header"><slot name="header"></slot></div>
    <div class="zone zone--action"><slot name="action"></slot></div>
    <div class="zone zone--hint"><slot name="hint"></slot></div>
  </section>
`;

class ScreenCard extends HTMLElement {
  static get observedAttributes() {
    return ['data-variant', 'data-status'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    if (!this.hasAttribute('data-variant')) {
      this.setAttribute('data-variant', 'default');
    }
    if (!this.hasAttribute('data-status')) {
      this.setAttribute('data-status', 'ready');
    }
  }
}

customElements.define('screen-card', ScreenCard);
