import fetchJson from './utils/fetch-json.js';

export default class ColumnChart {
  element;
  chartHeight = 50;
  subElements = {};

  constructor({
    data = {},
    url = '',
    range: {from = new Date(), to = new Date()} = {},
    label = '',
    value = 0,
    link = '',
    formatHeading} = {}) {
    this.data = data;
    this.url = new URL(url, 'https://course-js.javascript.ru');
    this.rangeFrom = from;
    this.rangeTo = to;
    this.label = label;
    this.value = value;
    this.link = link;
    this.formatHeading = formatHeading;
    this.render();
  }

  renderData() {
    if (Object.values(this.data).length === 0) {
      return '';
    }
    this.element.classList.remove('column-chart_loading');
    const maxValue = Math.max(...Object.values(this.data));
    const ratio = this.chartHeight / maxValue;
    return Object.entries(this.data).map(([date, currentValue]) => {
      const currentChartHeight = String(Math.floor(currentValue * ratio));
      const currentChartPercent = (currentValue / maxValue * 100).toFixed(0);
      return `<div style="--value: ${currentChartHeight}" data-date="${date}" data-tooltip="${currentChartPercent}%"></div>`;
    }).join('');
  }

  get chartTitle() {
    const titleText = this.label ? `Total ${this.label}` : '';
    const titleLink = this.link ? `<a class="column-chart__link" href="${this.link}">View all</a>` : '';
    return `<div class="column-chart__title">${titleText} ${titleLink}</div>`;
  }

  chartHeader() {
    const total = Object.values(this.data).reduce((acc, value) => acc + value, 0);
    if (this.formatHeading) {
      return this.formatHeading(total);
    }
    return `${total}`;
  }

  async render() {
    const element = document.createElement('div');
    element.innerHTML = `
      <div class="column-chart " style="--chart-height: ${this.chartHeight}">
      ${this.chartTitle}
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header"></div>
        <div data-element="body" class="column-chart__chart"></div>
      </div>
    </div>`;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();
    await this.update(this.rangeFrom, this.rangeTo);
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');
    return [...elements].reduce((acc, subElement) => {
      acc[subElement.dataset.element] = subElement;
      return acc;
    }, {});
  }


  async getData() {
    this.url.searchParams.set('from', this.rangeFrom.toISOString());
    this.url.searchParams.set('to', this.rangeTo.toISOString());
    return await fetchJson(this.url);
  }

  async update(from = new Date(), to = new Date()) {
    this.element.classList.add('column-chart_loading');
    this.rangeFrom = from;
    this.rangeTo = to;
    this.data = await this.getData();
    this.subElements.body.innerHTML = this.renderData();
    this.subElements.header.innerHTML = this.chartHeader();
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.subElements = null;
  }

}
