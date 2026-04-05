import 'css-star-rating/css/star-rating.css';

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

// ОКРУГЛЕННЯ РЕЙТИНГУ
function roundRate(rate) {
  const decimal = rate % 1;
  if (decimal >= 0.3 && decimal <= 0.7) {
    return Math.floor(rate) + 0.5;
  }
  return Math.round(rate);
}

// ГЕНЕРАЦІЯ ЗІРОК через css-star-rating
function createRatingMarkup(rate) {
  const rounded = roundRate(rate);
  const valueClass = String(rounded).replace('.', '-');

  return `
    <div class="rating value-${valueClass} star-icon">
      <div class="star-container">
        ${[1, 2, 3, 4, 5]
          .map(() => `
          <div class="star">
            <i class="star-empty"></i>
            <i class="star-half"></i>
            <i class="star-filled"></i>
          </div>`)
          .join('')}
      </div>
    </div>
  `;
}

// ЗАПОВНИТИ МОДАЛКУ ДАНИМИ
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

 // КОЛЬОРИ
modalColorOptions.innerHTML = item.color
  .map((hex, i) => `
    <label class="color-option-label">
      <input 
        type="checkbox" 
        name="color" 
        value="${hex}"
        ${i === 0 ? 'checked' : ''}
      />
      <span class="color-swatch" style="background: ${hex}"></span>
    </label>
  `)
  .join('');

// Записуємо дефолтні значення — id товару і перший колір
dataOrder.modelId = item._id;
dataOrder.color = item.color[0];

// Слухач на зміну кольору
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

// ВІДКРИТИ МОДАЛКУ
async function openModal(id) {
  try {
    const response = await fetch(`${BASE_URL}/furnitures/${id}`);
    const item = await response.json();

    fillModal(item);
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  } catch (error) {
    console.error('Помилка завантаження товару:', error);
  }
}

// ЗАКРИТИ МОДАЛКУ
function closeModal() {
  modal.classList.remove('is-open');
  document.body.style.overflow = '';
}

// СЛУХАЧІ
modalClose.addEventListener('click', closeModal);

modal.addEventListener('click', e => {
  if (e.target === modal) closeModal();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

document.addEventListener('click', e => {
  const btn = e.target.closest('.details-btn');
  if (!btn) return;
  const id = btn.dataset.id;
  if (id) openModal(id);
});


export const dataOrder = {
  modelId: '',
  color: '',
};




openModal('682f9bbf8acbdf505592ac36');