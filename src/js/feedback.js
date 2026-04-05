import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "css-star-rating/css/star-rating.css";


const API = "https://furniture-store-v2.b.goit.study/api/feedbacks";
const reviewsList = document.getElementById("reviews-list");


function normalizeRating(r) {
  if (r >= 3.3 && r <= 3.7) return 3.5;
  if (r >= 3.8 && r <= 4.2) return 4;
  return Math.round(r * 2) / 2;
}


function createCard({ name, descr, rate }) {
  const normalized = normalizeRating(rate);
  const whole = Math.floor(normalized);
  const half = normalized % 1 === 0.5;


  let valueClass = `value-${Math.round(normalized)}`;
  if (half) valueClass = `value-${whole} half`;


  return `
    <div class="swiper-slide">
      <div class="review-card">
        <div class="rating medium star-svg ${valueClass} label-hidden" data-rating="${normalized}">
          <div class="star-container">
            ${[1,2,3,4,5].map(i => `
              <div class="star">
                <svg class="star-empty"><use xlink:href="../svg/feedback.svg#icon-star-empty"></use></svg>
                <svg class="star-half"><use xlink:href="../svg/feedback.svg#icon-half-star"></use></svg>
                <svg class="star-filled"><use xlink:href="../svg/feedback.svg#icon-star"></use></svg>
              </div>
            `).join('')}
          </div>
        </div>
        <p class="review-text">"${descr}"</p>
        <p class="review-name">${name}</p>
      </div>
    </div>
  `;
}


async function loadReviews() {
  try {
    const res = await fetch(`${API}?page=1&limit=10`);
    const data = await res.json();

    
    reviewsList.innerHTML = data.feedbacks.map(createCard).join("");


    new Swiper(".reviews-slider", {
      modules: [Navigation, Pagination],
      slidesPerView: 1,
      spaceBetween: 24,
      breakpoints: { 768: { slidesPerView: 2 }, 1440: { slidesPerView: 3 } },
      pagination: { el: ".swiper-pagination", clickable: true },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
        disabledClass: "swiper-button-disabled",
      },
    });
    document.querySelectorAll('.swiper-button-next, .swiper-button-prev')
  .forEach(btn => {
    btn.addEventListener('click', () => btn.blur());
  });
  } catch (err) {
    console.error("Помилка завантаження відгуків:", err);
  }
}


loadReviews();
