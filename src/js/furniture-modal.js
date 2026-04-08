import iziToast from 'izitoast';
import 'css-star-rating/css/star-rating.css';
import 'izitoast/dist/css/iziToast.min.css';
import { openOrderModal } from './order-modal.js';

const BASE_URL = 'https://furniture-store-v2.b.goit.study/api';

const modal = document.getElementById('modal');
const modalClose = document.querySelector('.modal-close');
const modalMainImage = document.querySelector('.modal-main-image');
const modalThumbnails = document.querySelector('.modal-thumbnails');
const modalTitle = document.querySelector('.modal-title');
const modalCategory = document.querySelector('.modal-category');
const modalPrice = document.querySelector('.modal-price');
const modalRating = document.querySelector('.modal-rating');
const modalColorOptions = document.querySelector('.color-options');
const modalDescription = document.querySelector('.modal-description');
const modalSize = document.querySelector('.modal-size');

export const dataOrder = {
  modelId: '',
  color: '',
};

// ЛОАДЕР
const loader = document.createElement('div');
loader.classList.add('furniture-loader', 'is-hidden');
loader.setAttribute('aria-hidden', 'true');
modal.appendChild(loader);

function showLoader() {
  loader.classList.remove('is-hidden');
}

function hideLoader() {
  loader.classList.add('is-hidden');
}

function roundRate(rate) {
  const decimal = rate % 1;

  if (decimal >= 0.3 && decimal <= 0.7) {
    return Math.floor(rate) + 0.5;
  }

  if (decimal >= 0.8 || decimal <= 0.2) {
    return Math.round(rate);
  }

  return Math.round(rate);
}

function createRatingMarkup(rate) {
  const rounded = roundRate(rate);
  const fullStars = Math.floor(rounded);
  const hasHalf = rounded % 1 === 0.5;

  let valueClass = `value-${Math.round(rounded)}`;
  if (hasHalf) valueClass = `value-${fullStars} half`;

  const container = document.createElement('div');
  container.className = `rating medium star-svg ${valueClass} label-hidden`;

  const starContainer = document.createElement('div');
  starContainer.className = 'star-container';

  const template = document.getElementById('modal-star-template');
  for (let i = 0; i < 5; i++) {
    const clone = template.content.cloneNode(true);
    starContainer.appendChild(clone);
  }

  container.appendChild(starContainer);
  return container;
}
function hexToColorName(hex) {
  const map = {
    '#ffffff': 'Білий',
    '#000000': 'Чорний',
    '#ff0000': 'Червоний',
    '#00ff00': 'Зелений',
    '#0000ff': 'Синій',
    '#ffff00': 'Жовтий',
    '#ffa500': 'Помаранчевий',
    '#800080': 'Фіолетовий',
    '#ffc0cb': 'Рожевий',
    '#a52a2a': 'Коричневий',
    '#808080': 'Сірий',
    '#c0c0c0': 'Срібний',
    '#ffd700': 'Золотий',
    '#008080': 'Бірюзовий',
    '#000080': 'Темно-синій',
  };
  return map[hex.toLowerCase()] ?? hex;
}

function fillModal(item) {
  modalMainImage.src = item.images[0] ?? '';
  modalMainImage.alt = item.name ?? '';

  modalThumbnails.innerHTML = item.images
    .slice(1)
    .map((src, i) => `
    <img
      role="listitem"
      src="${src}"
      alt="${item.name}, фото ${i + 2}"
    />
  `)
  .join('');

  modalThumbnails.querySelectorAll('img').forEach(img => {
    img.addEventListener('click', () => {
      const prevMain = modalMainImage.src;
      modalMainImage.src = img.src;
      img.src = prevMain;
    });
  });

  modalTitle.textContent = item.name ?? '';
  modalCategory.textContent = item.category?.name ?? '';
  modalPrice.textContent = `${item.price ?? 0} грн`;
  modalDescription.textContent = item.description ?? '';
  modalSize.textContent = `Розміри: ${item.sizes ?? ''}`;
  modalRating.innerHTML = '';
  modalRating.setAttribute('aria-label', `Рейтинг: ${item.rate} з 5`);
  modalRating.appendChild(createRatingMarkup(item.rate ?? 0));

  modalColorOptions.innerHTML = item.color
  .map((hex, i) => `
    <label class="color-option-label">
      <input
        type="radio"      // ← правильна семантика
        name="color"
        value="${hex}"
        ${i === 0 ? 'checked' : ''}
        aria-label="${hexToColorName(hex)}"
      />
      <span class="color-swatch" style="background: ${hex}"></span>
    </label>
  `)
  .join('');

  dataOrder.modelId = item._id;
  dataOrder.color = item.color[0];

  modalColorOptions.addEventListener('change', e => {
    if (e.target.type === 'radio') {
      dataOrder.color = e.target.value;
    }
  });
}

export async function openModal(id) {
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  showLoader();

  try {
    const response = await fetch(`${BASE_URL}/furnitures/${id}`);

    if (!response.ok) {
      throw new Error(`Помилка завантаження: ${response.status}`);
    }

    const item = await response.json();
    fillModal(item);
  } catch (error) {
    closeModal();
    iziToast.error({
      title: 'Помилка',
      message: 'Не вдалося завантажити інформацію про товар. Спробуйте пізніше.',
      position: 'topRight',
    });
  } finally {
    hideLoader();
  }
}

export function closeModal() {
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);

modal.addEventListener('click', e => {
  if (e.target === modal) closeModal();
});

document.addEventListener('keyup', e => {
  if (e.key === 'Escape') closeModal();
});

const orderBtn = document.querySelector('.modal-order-btn');

orderBtn.addEventListener('click', () => {
  localStorage.setItem('orderModelId', dataOrder.modelId);
  localStorage.setItem('orderColor', dataOrder.color);
  closeModal();
  openOrderModal();
});