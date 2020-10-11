export default class ColumnChart {
  element;
  chartHeight = 50;

  constructor(options = {data: [], label: '', value: '', link: ''}) {

    this.data = options.data || [];
    this.label = options.label || '';
    this.value = options.value || '';
    this.link = options.link || '';
    this.render();
  }

  _renderData() {
    if (this.data.length === 0) return '';
    this.element.classList.remove('column-chart_loading');
    const maxValue = Math.max(...this.data);
    const ratio = this.chartHeight / maxValue;
    return this.data.reduce( (html, currentValue) => {
      const currentChartHeight = String(Math.floor(currentValue * ratio));
      const currentChartPercent = (currentValue / maxValue * 100).toFixed(0);
      return html + `<div style="--value: ${currentChartHeight}" data-tooltip="${currentChartPercent}%"></div>`;;
    }, '');
  }

  render() {
    this.element = document.createElement('div');
    this.element.classList.add('column-chart_loading');
    const title = this.label? `Total ${this.label}` : '';
    const titleLink = this.link? ` <a class="column-chart__link" href="${this.link}">View all</a>` : '';

    this.element.innerHTML = `
      <div class="column-chart" style="--chart-height: ${this.chartHeight}">
      <div class="column-chart__title">
        ${title}
        ${titleLink}</div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">${this.value}</div>
        <div data-element="body" class="column-chart__chart">
            ${this._renderData()}
        </div>
      </div>
    </div>
    `;
  }

  update(newData) {
    this.data = newData;
    this.render();
  }

  remove() {
    this.element.remove();
  }
  destroy() {
    this.element.remove();
  }
}
