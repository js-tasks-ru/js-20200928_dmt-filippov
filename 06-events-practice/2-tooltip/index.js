class Tooltip {
  static instance;

  element;
  isInitialized = false;

  constructor() {
    if (!Tooltip.instance) {
      Tooltip.instance = this;
    }
    return Tooltip.instance;
  }

  initialize() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    document.addEventListener("pointerover", (event) =>this.onPointerOver(event));
    document.addEventListener("pointerout", (event) => this.onPointerOut(event));

  }

  onPointerOver(event) {
    if (!event.target.dataset.tooltip) return;
    this.render(event.target.dataset.tooltip);
  }

  onPointerOut(event) {
    // if (!event.target.dataset.tooltip) return;
    this.remove();
  }

  render(target) {
    console.log ('render');
    const element = document.createElement('div');
    element.innerHTML = `<div class="tooltip">${target}</div>`;
    this.element = element.firstElementChild;
    document.body.appendChild(this.element);
    document.addEventListener("pointermove", this.onPointerMove);
  }

  remove() {
    if (!this.element) return;
    console.log ('remove');
    this.element.remove();
    this.element = null;
    document.removeEventListener("pointermove", this.onPointerMove);

  }

  destroy() {
    this.remove();
  }

  tooltipMove(event) {
    console.log ('move');
    const x = (event.clientX + 5 + this.element.offsetWidth < document.documentElement.offsetWidth)
      ? event.clientX + 5
      : event.clientX - 5 - this.element.offsetWidth;
    const y = (event.clientY + 5 + this.element.offsetHeight < document.documentElement.offsetHeight)
      ? event.clientY + 5
      : event.clientY - 5 - this.element.offsetHeight;
    this.element.style.left = `${x}px`;
    this.element.style.top = `${y}px`;
  }

  onPointerMove = (event) => this.tooltipMove(event)

}

const tooltip = new Tooltip();

export default tooltip;
