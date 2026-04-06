import 'css-star-rating/css/star-rating.css';
import iziToast from 'izitoast';
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
  return Math.round(rate);
}

function createRatingMarkup(rate) {
  const rounded = roundRate(rate);
  const fullStars = Math.floor(rounded);
  const hasHalf = rounded % 1 === 0.5;

  let valueClass = `value-${Math.round(rounded)}`;
  if (hasHalf) valueClass = `value-${fullStars} half`;

  return `
    <div class="rating medium star-svg ${valueClass} label-hidden">
      <div class="star-container">
        ${[1, 2, 3, 4, 5].map(() => `
          <div class="star">
            <svg class="star-empty"><use xlink:href="../svg/feedback.svg#icon-star-empty"></use></svg>
            <svg class="star-half"><use xlink:href="../svg/feedback.svg#icon-half-star"></use></svg>
            <svg class="star-filled"><use xlink:href="../svg/feedback.svg#icon-star"></use></svg>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function fillModal(item) {
  modalMainImage.src = item.images[0] ?? '';
  modalMainImage.alt = item.name ?? '';

  modalThumbnails.innerHTML = item.images
    .slice(1)
    .map(src => `<img src="${src}" alt="${item.name}" />`)
    .join('');

  modalThumbnails.querySelectorAll('img').forEach(img => {
    img.addEventListener('click', () => {
      modalMainImage.src = img.src;
    });
  });

  modalTitle.textContent = item.name ?? '';
  modalCategory.textContent = item.category?.name ?? '';
  modalPrice.textContent = `${item.price ?? 0} грн`;
  modalDescription.textContent = item.description ?? '';
  modalSize.textContent = `Розміри: ${item.sizes ?? ''}`;
  modalRating.innerHTML = createRatingMarkup(item.rate ?? 0);

  modalColorOptions.innerHTML = item.color
    .map((hex, i) => `
      <label class="color-option-label">
        <input type="checkbox" name="color" value="${hex}" ${i === 0 ? 'checked' : ''} />
        <span class="color-swatch" style="background: ${hex}"></span>
      </label>
    `)
    .join('');

  dataOrder.modelId = item._id;
  dataOrder.color = item.color[0];

  modalColorOptions.addEventListener('change', e => {
    if (e.target.type === 'checkbox') {
      modalColorOptions.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
      });
      e.target.checked = true;
      dataOrder.color = e.target.value;
    }
  });
}

export async function openModal(id) {
  modal.classList.add('is-open');
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
  closeModal();
  openOrderModal();
});