export default class RangePicker {
  element;

  constructor(range = {
    from: new Date(),
    to: new Date(),
  }) {
    this.range = range;
    this.showRangeStart = new Date(this.range.from);
    this.render();
  }

  get template() {
    return `<div class="rangepicker">
    <div class="rangepicker__input" data-element="input">
      <span data-element="from"></span> -
      <span data-element="to"></span>
    </div>
    <div class="rangepicker__selector" data-element="selector"></div>
  </div>`;
  }

  fillInput() {
    const {from, to} = this.subElements;
    from.innerHTML = this.range.from.toLocaleString('ru', {dateStyle: 'short'});
    to.innerHTML = this.range.to.toLocaleString('ru', {dateStyle: 'short'});
  }

  get selectorHeader() {
    return `<div class="rangepicker__selector-arrow"></div>
      <div class="rangepicker__selector-control-left" ></div>
      <div class="rangepicker__selector-control-right" ></div>`
  }

  getCalendarHeader(date) {
    const month = date.toLocaleString('ru', {month: 'long'});
    return `
      <div class="rangepicker__month-indicator"><time datetime="December">${month}</time></div>
      <div class="rangepicker__day-of-week">
        <div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div>
      </div>`;
  }

  createCalendar(date) {
    const month = date.getMonth();
    const gridDate = new Date(date);
    gridDate.setDate(1);
    const startFrom = gridDate.getDay() === 0? 7 : gridDate.getDay();
    const gridCellsArr = [];
    for (let day = 1;  gridDate.getMonth() === month;) {
      const cell = `<button type="button" class="rangepicker__cell" data-value="${gridDate.toISOString()}">${day}</button>`
      gridCellsArr.push(cell)
      gridDate.setDate(++day);
    }
    return `<div class="rangepicker__calendar">
        ${this.getCalendarHeader(date)}
        <div class="rangepicker__date-grid" style="--start-from: ${startFrom}">
          ${gridCellsArr.join('')}
        </div>
        </div>`;
  }


  createSelector() {
    const { selector } = this.subElements;
    const leftDate = new Date(this.showRangeStart);
    const rightDate = new Date(this.showRangeStart);
    rightDate.setMonth(this.showRangeStart.getMonth() + 1);

    const calendars = selector.querySelectorAll('.rangepicker__calendar');
    if (!calendars.length) {
      selector.innerHTML = `
        ${this.selectorHeader}
        ${this.createCalendar(leftDate)}
        ${this.createCalendar(rightDate)}
      `;
    } else {
      calendars.forEach( e => e.remove());
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = `
      ${this.createCalendar(leftDate)}
      ${this.createCalendar(rightDate)}`;

      tempDiv.querySelectorAll('.rangepicker__calendar').forEach( e => selector.append(e));

    }
    this.renderSelectRange();
  }

  createElement() {

    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();
    this.fillInput();
  }

  getSubElements() {

    const elements = this.element.querySelectorAll('[data-element]');
    return [...elements].reduce((acc, subElement) => {
      acc[subElement.dataset.element] = subElement;
      return acc;
    }, {});
  }

  initEventListeners() {
    const {input, selector} = this.subElements;

    selector.addEventListener('click', event => this.selectorhandler(event), true);
    input.addEventListener('click', () => this.toggleOpen());

    document.addEventListener('click', event => this.documentClick(event), true)
  }

  toggleOpen() {
    if (!this.element.classList.contains('rangepicker_open')) {
      this.createSelector(this.showRangeStart);
    }
    this.element.classList.toggle('rangepicker_open');
  }

  close() {
    if (this.element.classList.contains('rangepicker_open')) {
      this.element.classList.remove('rangepicker_open');
    }
  }

  renderSelectRange() {
    const { from, to } = this.range;
    const { selector } = this.subElements;
    const cells = [...selector.querySelectorAll('.rangepicker__cell')];

    for (const cell of cells) {
      const { value } = cell.dataset;
      const currentDate = new Date(value);

      cell.classList.remove('rangepicker__selected-from', 'rangepicker__selected-between', 'rangepicker__selected-to');

      if (from && from.toISOString() === value) {
        cell.classList.add('rangepicker__selected-from');
      } else if (to && to.toISOString() === value) {
        cell.classList.add('rangepicker__selected-to');
      } else if (from && to && (currentDate > from) && (currentDate < to)) {
        cell.classList.add('rangepicker__selected-between');
      }
    }

  }

  selectorhandler({target}) {
    if (target.closest('.rangepicker__selector-control-left')) this.showPrevMonth();
    if (target.closest('.rangepicker__selector-control-right')) this.showNextMonth();

    if (target.closest('.rangepicker__cell')) {
      const value = new Date(target.dataset.value);
      if (this.range.to) {
        this.range = {from: value, to: null};
        this.renderSelectRange();
        return;
      } else if (value < this.range.from) {
        this.range.to = this.range.from;
        this.range.from = value;
      } else {
        this.range.to = value;
      }
      this.renderSelectRange();
      this.close();
      this.fillInput();
      this.dispatchSelectEvent();
    }
  }

  showPrevMonth() {
    this.showRangeStart.setMonth(this.showRangeStart.getMonth() - 1);
    this.createSelector(this.showRangeStart);
  }

  showNextMonth() {
    this.showRangeStart.setMonth(this.showRangeStart.getMonth() + 1);
    this.createSelector(this.showRangeStart);
  }

  documentClick = event => {
    if (this.element.classList.contains('rangepicker_open') && !this.element.contains(event.target)) {
      this.close();
    }
  }

  render() {
    this.createElement();
    this.initEventListeners();
  }

  dispatchSelectEvent() {
    const event = new CustomEvent('date-select', {bubbles: true, detail: this.range})
    this.element.dispatchEvent(event);
  }

  remove() {
    this.element.remove()
  }

  destroy() {
    this.remove();
    document.removeEventListener('click', this.documentClick, true);
  }
}
