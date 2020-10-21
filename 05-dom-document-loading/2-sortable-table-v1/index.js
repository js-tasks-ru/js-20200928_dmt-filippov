export default class SortableTable {
  element;
  subElements = {};
  headerCfg = [];
  data = [];
  tabelCells = [];

  constructor(headerCfg,{data = []} = {}) {
    this.headerCfg = headerCfg;
    this.data = data;
    this.tabelCells = this.headerCfg.map( ({id, template}) => { return {id, template} });
    this.render();
  }

  getHeaderItems() {
    return this.headerCfg.map( ({id, title, sortable}) => {
      return `<div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}">
          <span>${title}</span>
          <span data-element="arrow" class="sortable-table__sort-arrow"><span class="sort-arrow"></span></span>
        </div>`
    }).join('');
  }

  getBodyRows(data) {
    return data.map( item => {
      return `<a href="/products/${item.id}" class="sortable-table__row">
        ${this.getRowCells(item)}
      </a>`;
    }).join('');
  }

  getRowCells(item) {
    return this.tabelCells.map( ({id, template}) => {
      if (template) {
        return template(item[id]);
      }
      return `<div class="sortable-table__cell">${item[id]}</div>`;
    }).join('');
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML =  `
      <div class="sortable-table">
        <div data-element="header" class="sortable-table__header sortable-table__row">
          ${this.getHeaderItems()}
        </div>
        <div data-element="body" class="sortable-table__body">
         ${this.getBodyRows(this.data)}
        </div>
      </div>`;
    this.element = element.firstElementChild;
    this.subElements = [...this.element.querySelectorAll('[data-element]')].reduce((acc, subElement) => {
      acc[subElement.dataset.element] = subElement;
      return acc;
    }, {});
  }

  sort(field, order) {
    const oldSortColumn = this.element.querySelectorAll('.sortable-table__cell[data-sortable="true"]');
    const currentSortColumn = this.element.querySelector(`.sortable-table__cell[data-id=${field}]`);

    oldSortColumn.forEach( col => col.dataset.order = '');
    currentSortColumn.dataset.order = order;
    this.subElements.body.innerHTML = this.getBodyRows(this.sortData(field, order));
  }

  sortData(field, order) {
    const sortType = this.headerCfg.find(item => item.id === field).sortType;
    const direction = (order === 'asc') ? 1 : -1;

    return [...this.data].sort((a, b) => {
      switch (sortType) {
      case 'number':
        return direction * (a[field] - b[field]);
      case 'string':
        return direction * a[field].localeCompare(b[field], ['ru', 'en']);
      default:
        return direction * (a[field] - b[field]);
      }
    });
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = null;
    this.headerCfg = null;
    this.data = null;
    this.tabelCells = null;
  }

}
