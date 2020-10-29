import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';
const API_URL = {
  product: '/api/rest/products',
  categories: '/api/rest/categories'
};

export default class ProductForm {
  element;
  productId;
  product;
  defaultFormData = {
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    status: 1,
    price: 100,
    discount: 0
  };

  constructor(productId) {

    this.productId = productId;
    this.eventType = productId ? 'product-updated' : 'product-saved';
    this.saveMethod = productId ? 'PATH' : 'PUT';
  }


  get template() {

    return `
    <div class="product-form">
    <form data-element="productForm" class="form-grid">
      <div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input required="" type="text" name="title" id="title" class="form-control" placeholder="Название товара">
        </fieldset>
      </div>
      <div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea required="" class="form-control" name="description" id="description" data-element="productDescription" placeholder="Описание товара"></textarea>
      </div>
      <div class="form-group form-group__wide" data-element="sortable-list-container">
        <label class="form-label">Фото</label>
        <div data-element="imageListContainer">
          <ul class="sortable-list">
          </ul>
        </div>
        <button type="button" name="uploadImage" id="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
      </div>
      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        <select class="form-control" name="subcategory" id="subcategory"></select>
      </div>
      <div class="form-group form-group__half_left form-group__two-col">
        <fieldset>
          <label class="form-label">Цена ($)</label>
          <input required="" type="number" name="price" id="price" class="form-control" placeholder="100">
        </fieldset>
        <fieldset>
          <label class="form-label">Скидка ($)</label>
          <input required="" type="number" name="discount" id="discount" class="form-control" placeholder="0">
        </fieldset>
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input required="" type="number" class="form-control" name="quantity" id="quantity" placeholder="1">
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Статус</label>
        <select class="form-control" name="status" id="status">
          <option value="1">Активен</option>
          <option value="0">Неактивен</option>
        </select>
      </div>
      <div class="form-buttons">
        <button type="submit" name="save" id="save" class="button-primary-outline">
          Сохранить товар
        </button>
      </div>
    </form>
    </div>`;
  }

  getImageList(images) {

    if (images.length > 0) {
      return images.map(({url, source}) => {
        return `<li class="products-edit__imagelist-item sortable-list__item" style="">
          <input type="hidden" name="url" value="${url}">
          <input type="hidden" name="source" value="${source}">
          <span>
            <img src="icon-grab.svg" data-grab-handle="" alt="grab">
            <img class="sortable-table__cell-img" alt="Image" src="${url}">
            <span>${source}</span>
          </span>
          <button type="button">
            <img src="icon-trash.svg" data-delete-handle="" alt="delete">
          </button>
        </li>`;
      }).join('');
    }
  }

  createElement() {

    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();
    this.formElements = this.getFormElements();
    this.eventListeners();
  }


  getSubElements() {

    const elements = this.element.querySelectorAll('[data-element]');
    return [...elements].reduce((acc, subElement) => {
      acc[subElement.dataset.element] = subElement;
      return acc;
    }, {});
  }

  getFormElements() {

    return {
      title: this.subElements.productForm.querySelector("[name='title']"),
      description: this.subElements.productForm.querySelector("[name='description']"),
      price: this.subElements.productForm.querySelector("[name='price']"),
      discount: this.subElements.productForm.querySelector("[name='discount']"),
      quantity: this.subElements.productForm.querySelector("[name='quantity']"),
      status: this.subElements.productForm.querySelector("[name='status']"),
      subcategory: this.subElements.productForm.querySelector("[name='subcategory']")
    };
  }

  getProduct() {

    if (!this.productId) {
      return [this.defaultFormData];
    }
    const urlProduct = new URL(API_URL.product, BACKEND_URL);
    urlProduct.searchParams.set('id', this.productId);
    return fetchJson(urlProduct);
  }

  getCategories() {

    const urlCategories = new URL(API_URL.categories, BACKEND_URL);
    urlCategories.searchParams.set('_sort', 'weight');
    urlCategories.searchParams.set('_refs', 'subcategory');
    return fetchJson(urlCategories);
  }

  createCategoriesList(categories) {

    const list = categories.map(({title, subcategories}) => {
      return subcategories.map(({id, title: subTitle}) => {
        return `<option value="${id}">${title} > ${subTitle}</option>`;
      }).join('');
    }).join('');

    this.subElements.productForm.querySelector("[name='subcategory']").innerHTML = list;
  }

  fillProductForm() {

    const {images} = this.product;
    for (const [key, element] of Object.entries(this.formElements)) {
      element.value = this.product[key];
    }
    this.subElements.imageListContainer.innerHTML = `<ul class="sortable-list">${this.getImageList(images)}</ul>`;
  }

  async render() {

    this.createElement();

    try {
      const [categories, product] = await Promise.all([this.getCategories(), this.getProduct()]);
      this.createCategoriesList(categories);
      this.product = product[0];
      this.fillProductForm();
      return this.element;
    } catch (error) {
      // console.error(error);
    }
  }

  getFormDataToSave() {
    return {
      id: this.productId,
      title: escapeHtml(this.formElements["title"].value),
      description: escapeHtml(this.formElements["description"].value),
      price: parseInt(this.formElements["price"].value, 10),
      discount: parseInt(this.formElements["discount"].value, 10),
      quantity: parseInt(this.formElements["quantity"].value, 10),
      status: parseInt(this.formElements["status"].value, 10),
      subcategory: escapeHtml(this.formElements["subcategory"].value),
      images: this.getImagesToSave()
    };
  }

  getImagesToSave() {
    const liElements = this.subElements.imageListContainer.querySelectorAll('li');
    return [...liElements].map(li => {
      const url = li.querySelector("[name='url']");
      const source = li.querySelector("[name='source']");
      return {url: escapeHtml(url.value), source: escapeHtml(source.value)};
    });
  }

  eventListeners() {
    this.subElements.productForm.addEventListener('submit', event => this.formSubmit(event));
  }

  async formSubmit(event) {
    event.preventDefault();
    await this.save();
  }

  async save() {
    const url = new URL(API_URL.product, BACKEND_URL);
    const data = this.getFormDataToSave();
    try {
      await fetchJson(url, {
        method: this.saveMethod,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      const event = new CustomEvent(this.eventType);
      this.element.dispatchEvent(event);
    } catch (error) {
      // console.error(error);
    }
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = null;
    this.formElements = null;
  }

}
