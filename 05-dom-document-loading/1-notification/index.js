export default class NotificationMessage {

  static activeNotification;

  element; // HTMLElement;

  constructor(message,{
    duration = 2000,
    type = 'success'
  } = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;
    /* переделал
     * Но тогда просто удаляется елемент из DOM, а сам компонент остается активным и его "таймер". Или я что то не так понял =)
     */
    if (NotificationMessage.activeNotification) {
      NotificationMessage.activeNotification.remove();
    }
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
    NotificationMessage.activeNotification = this.element;
  }

  show(parent = document.body) {
    parent.append(this.element);
    setTimeout(() => this.remove(), this.duration);
  }

  remove() {
    this.element.remove();
    if (NotificationMessage.activeNotification === this.element) {
      NotificationMessage.activeNotification = null;
    }
  }

  destroy() {
    this.remove();
  }
}
