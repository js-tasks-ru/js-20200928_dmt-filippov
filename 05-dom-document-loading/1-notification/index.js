export default class NotificationMessage {

  static setActiveNotification(element) {
    if (this.activeNotification) {
      this.activeNotification.destroy();
    }
    this.activeNotification = element;
  }

  static delActiveNotification(element) {
    if (this.activeNotification === element ) {
      this.activeNotification = null;
    }
  }

  static activeNotification;

  element; // HTMLElement;

  constructor(message,{
    duration = 2000,
    type = 'success'
  } = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;
    this.render();
  }

  render() {

    const element = document.createElement('div');
    element.innerHTML = `
      <div class="notification ${this.type}" style="--value:${Math.floor(this.duration/1000)}s">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this.type}</div>
          <div class="notification-body">
            ${this.message}
          </div>
        </div>
      </div>
    `;
    this.element = element.firstElementChild;
  }

  show(parent = document.body) {
    parent.append(this.element);
    NotificationMessage.setActiveNotification(this);
    this.timer = setTimeout(() => this.remove(), this.duration);
  }

  remove() {
    clearTimeout(this.timer);
    NotificationMessage.delActiveNotification(this);
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
