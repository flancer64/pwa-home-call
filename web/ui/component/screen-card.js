const styleUrl = new URL('./screen-card.css', import.meta.url);
const template = document.createElement('template');
template.innerHTML = `
  <link rel="stylesheet" href="${styleUrl.href}" />
  <section class="card">
    <div class="zone zone--header"><slot name="header"></slot></div>
    <div class="zone zone--main"><slot name="main"></slot></div>
    <div class="zone zone--footer"><slot name="footer"></slot></div>
  </section>
`;

class ScreenCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
  }
}

customElements.define('screen-card', ScreenCard);
