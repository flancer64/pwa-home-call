const styleUrl = new URL('./icon-wrapper.css', import.meta.url);
const template = document.createElement('template');
template.innerHTML = `
  <link rel="stylesheet" href="${styleUrl.href}" />
  <span class="icon"></span>
`;

const SIZE_VARIANTS = ['small', 'medium', 'large'];

class IconWrapper extends HTMLElement {
  static get observedAttributes() {
    return ['name', 'size'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
    this.iconContainer = this.shadowRoot.querySelector('.icon');
  }

  connectedCallback() {
    if (!this.hasAttribute('size')) {
      this.setAttribute('size', 'medium');
    } else {
      this.ensureValidSize(this.getAttribute('size'));
    }
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    if (name === 'size') {
      const normalized = this.normalizeSize(newValue);
      if (normalized !== newValue) {
        this.setAttribute('size', normalized);
        return;
      }
    }

    this.render();
  }

  render() {
    void this.updateIcon();
  }

  async updateIcon() {
    if (!this.iconContainer) return;
    const filename = this.getIconFilename();
    if (!filename) {
      this.iconContainer.innerHTML = '';
      return;
    }

    try {
      const response = await fetch(`/assets/icons/${filename}`);
      if (!response.ok) {
        throw new Error(`Failed to load icon ${filename} (${response.status})`);
      }
      const svgText = await response.text();
      this.iconContainer.innerHTML = svgText;
    } catch (error) {
      console.error('[icon-wrapper] Unable to load icon:', error);
      this.iconContainer.innerHTML = '';
    }
  }

  getIconFilename() {
    const rawName = (this.getAttribute('name') ?? '').trim();
    if (!rawName) {
      return '';
    }

    const segments = rawName
      .split('/')
      .map((segment) => segment.trim())
      .filter((segment) => segment.length && segment !== '..');

    if (segments.length === 0) {
      return '';
    }

    const candidate = segments.join('/');
    return candidate.endsWith('.svg') ? candidate : `${candidate}.svg`;
  }

  normalizeSize(value) {
    if (typeof value !== 'string') {
      return 'medium';
    }

    const normalized = value.trim().toLowerCase();
    return SIZE_VARIANTS.includes(normalized) ? normalized : 'medium';
  }

  ensureValidSize(value) {
    const normalized = this.normalizeSize(value);
    if (normalized !== value) {
      this.setAttribute('size', normalized);
    }
  }
}

customElements.define('icon-wrapper', IconWrapper);
