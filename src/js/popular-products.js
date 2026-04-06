import axios from 'axios';
import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const BASE_URL = 'https://furniture-store-v2.b.goit.study/api';

const list = document.querySelector('.js-popular-list');
const prevBtn = document.querySelector('.js-swiper-button-prev');
const nextBtn = document.querySelector('.js-swiper-button-next');
const paginationEl = document.querySelector('.js-swiper-pagination');

async function fetchPopularProducts() {
  const { data } = await axios.get(`${BASE_URL}/furnitures?type=popular`);
  return data.furnitures;
}

function renderProducts(products) {
  const markup = products
    .map(
      product => `
        <li class="swiper-slide popular-card">
          <img
            class="popular-card-image"
            src="${product.images?.[0] || ''}"
            alt="${product.name}"
            loading="lazy"
          />
          <h3 class="popular-card-title">${product.name}</h3>
          <ul class="popular-card-colors">
            <li class="popular-card-color" style="background-color: #d9b8ae;"></li>
            <li class="popular-card-color" style="background-color: #d7a36d;"></li>
            <li class="popular-card-color" style="background-color: #201815;"></li>
          </ul>
          <p class="popular-card-price">${product.price} грн</p>
          <button class="popular-card-btn" type="button">Детальніше</button>
        </li>
      `
    )
    .join('');

  list.innerHTML = markup;
}

function initSwiper() {
  new Swiper('.popular-swiper', {
    modules: [Navigation, Pagination],
    loop: false,
    slidesPerView: 1,
    spaceBetween: 16,
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

async function initPopularProducts() {
  try {
    const products = await fetchPopularProducts();
    renderProducts(products);
    initSwiper();
  } catch {
    list.innerHTML =
      '<li class="popular-card-error">Не вдалося завантажити товари.</li>';
  }
}

initPopularProducts();
