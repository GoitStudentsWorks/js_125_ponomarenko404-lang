import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';


import sofaOslo from '../img/popular-products/desktop/sofa-oslo.jpg';
import sofaTivoli from '../img/popular-products/desktop/sofa-tivoli.jpg';
import sofaSiena from '../img/popular-products/desktop/sofa-siena.jpg';
import sofaParma from '../img/popular-products/desktop/sofa-parma.jpg';
import sofaMilano from '../img/popular-products/desktop/sofa-milano.jpg';
import sofaVerona from '../img/popular-products/desktop/sofa-verona.jpg';
import decorForma from '../img/popular-products/desktop/decor-forma.jpg';
import atelier from '../img/popular-products/desktop/atelier.jpg';


const popularProducts = [
  { name: 'Софа Oslo', price: '9 999 грн', image: sofaOslo },
  { name: 'Софа Tivoli', price: '11 999 грн', image: sofaTivoli },
  { name: 'Софа Siena', price: '14 999 грн', image: sofaSiena },
  { name: 'Кутовий диван Parma', price: '19 999 грн', image: sofaParma },
  { name: 'Кутовий диван Milano', price: '24 999 грн', image: sofaMilano },
  { name: 'Кутовий диван Verona', price: '22 999 грн', image: sofaVerona },
  { name: 'Декор-колекція Forma', price: '2 499 грн', image: decorForma },
  { name: 'Скульптурна серія Atelier', price: '3 799 грн', image: atelier },
];

const popularList = document.querySelector('.js-popular-list');
const prevBtn = document.querySelector('.js-swiper-button-prev');
const nextBtn = document.querySelector('.js-swiper-button-next');

function renderPopularProducts() {
  popularList.innerHTML = '';

  popularProducts.forEach(product => {
    const item = document.createElement('li');
    item.classList.add('swiper-slide', 'popular-card');

    item.innerHTML = `
      <img src="${product.image}" alt="${product.name}" />
      <h3>${product.name}</h3>
      <p>${product.price}</p>
    `;

    popularList.appendChild(item);
  });
}

renderPopularProducts();

new Swiper('.popular-swiper', {
  modules: [Navigation, Pagination],
  loop: true,

  navigation: {
  nextEl: nextBtn,
  prevEl: prevBtn,
  },
  
  pagination: {
    el: '.js-swiper-pagination',
    clickable: true,
  },

  slidesPerView: 1,
  spaceBetween: 20,

  breakpoints: {
    768: {
      slidesPerView: 2,
    },
    1440: {
      slidesPerView: 3,
    },
  },
});