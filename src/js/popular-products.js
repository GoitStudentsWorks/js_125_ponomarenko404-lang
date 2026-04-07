import axios from 'axios';
import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const BASE_URL = 'https://furniture-store-v2.b.goit.study/api';
const BASE_ORIGIN = 'https://furniture-store-v2.b.goit.study';

const list = document.querySelector('.js-popular-list');
const prevBtn = document.querySelector('.js-swiper-button-prev');
const nextBtn = document.querySelector('.js-swiper-button-next');
const paginationEl = document.querySelector('.js-swiper-pagination');

let popularSwiper = null;

function getImageUrl(path) {
  if (!path) return '';

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  return `${BASE_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
}

function getColors(colors) {
  if (!Array.isArray(colors) || !colors.length) {
    return ['#d9b8ae', '#d7a36d', '#201815'];
  }

  return colors;
}

async function fetchPopularProducts() {
  const { data } = await axios.get(`${BASE_URL}/furnitures?type=popular`);
  return data.furnitures || [];
}

function renderProducts(products) {
  const markup = products
    .map(product => {
      const cleanName = product.name.replaceAll('"', '');
      const imagePath = product.images?.[0] || product.image || product.photo || '';

      const colorsMarkup = getColors(product.color)
        .map(
          color => `
            <li
              class="popular-card-color"
              style="background-color: ${color};"
            ></li>
          `
        )
        .join('');

      return `
        <li class="swiper-slide popular-card">
          <img
            class="popular-card-image"
            src="${getImageUrl(imagePath)}"
            alt="${cleanName}"
            loading="lazy"
          />

          <div class="popular-card-content">
            <h3 class="popular-card-title">${cleanName}</h3>

            <ul class="popular-card-colors">
              ${colorsMarkup}
            </ul>

            <p class="popular-card-price">${product.price} грн</p>
          </div>

          <button class="popular-card-btn btn-white" type="button">
            Детальніше
          </button>
        </li>
      `;
    })
    .join('');

  list.innerHTML = markup;
}

function initSwiper() {
  if (popularSwiper) {
    popularSwiper.destroy(true, true);
  }

  popularSwiper = new Swiper('.popular-swiper', {
    modules: [Navigation, Pagination],
    loop: false,
    slidesPerView: 1,
    spaceBetween: 20,
    speed: 500,
    navigation: {
      nextEl: nextBtn,
      prevEl: prevBtn,
    },
    pagination: {
      el: paginationEl,
      clickable: true,
    },
    breakpoints: {
      768: {
        slidesPerView: 2,
        spaceBetween: 16,
      },
      1440: {
        slidesPerView: 4,
        spaceBetween: 20,
      },
    },
  });
}

function bindNavigationBlur() {
  prevBtn?.addEventListener('click', event => {
    event.currentTarget.blur();
  });

  nextBtn?.addEventListener('click', event => {
    event.currentTarget.blur();
  });
}

async function initPopularProducts() {
  if (!list || !prevBtn || !nextBtn || !paginationEl) return;

  try {
    const products = await fetchPopularProducts();

    if (!products.length) {
      list.innerHTML =
        '<li class="popular-card-error">Популярні товари відсутні.</li>';
      return;
    }

    renderProducts(products);
    initSwiper();
    bindNavigationBlur();
  } catch (error) {
    console.error(error);
    list.innerHTML =
      '<li class="popular-card-error">Не вдалося завантажити товари.</li>';
  }
}

initPopularProducts();
