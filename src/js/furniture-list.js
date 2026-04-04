document.addEventListener('DOMContentLoaded', async () => {
  const BASE_URL = 'https://furniture-store-v2.b.goit.study/api';
  const PER_PAGE = 8;

  const refs = {
    furnitureList: document.querySelector('.furniture-list'),
    categoryButtons: document.querySelectorAll('.category-btn'),
    loadMoreBtn: document.querySelector('.load-more-btn'),
    loader: document.querySelector('.furniture-loader'),
  };

  if (
    !refs.furnitureList ||
    !refs.categoryButtons.length ||
    !refs.loadMoreBtn ||
    !refs.loader
  ) {
    console.error('Не знайдено елементи секції furniture');
    return;
  }

  let categories = [];
  let currentCategory = 'all';
  let currentPage = 1;
  let totalLoadedItems = 0;
  let totalItems = 0;

  function showLoader() {
    refs.loader.classList.remove('is-hidden');
  }

  function hideLoader() {
    refs.loader.classList.add('is-hidden');
  }

  function showLoadMoreButton() {
    refs.loadMoreBtn.classList.remove('is-hidden');
  }

  function hideLoadMoreButton() {
    refs.loadMoreBtn.classList.add('is-hidden');
  }

  function resetActiveButton() {
    refs.categoryButtons.forEach(button => {
      button.classList.remove('is-active');
    });
  }

  function normalizeText(value) {
    return String(value).trim().toLowerCase();
  }

  async function fetchCategories() {
    const response = await fetch(`${BASE_URL}/categories`);

    if (!response.ok) {
      throw new Error(`Помилка завантаження категорій: ${response.status}`);
    }

    const data = await response.json();

    if (Array.isArray(data)) return data;
    if (Array.isArray(data.categories)) return data.categories;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.items)) return data.items;

    throw new Error('Невідомий формат категорій');
  }

  function getCategoryIdByName(categoryName) {
    const foundCategory = categories.find(
      item => normalizeText(item.name) === normalizeText(categoryName)
    );

    return foundCategory ? foundCategory._id : null;
  }
  async function fetchFurnitures(page = 1, categoryName = 'all') {
    const params = new URLSearchParams();
    params.set('page', page);
    params.set('limit', PER_PAGE);

    if (categoryName !== 'all') {
      const categoryId = getCategoryIdByName(categoryName);

      if (categoryId) {
        params.set('category', categoryId);
      }
    }

    const response = await fetch(`${BASE_URL}/furnitures?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Помилка завантаження меблів: ${response.status}`);
    }

    const data = await response.json();
    console.log('furnitures response:', data);

    return {
      items: Array.isArray(data.furnitures)
        ? data.furnitures
        : Array.isArray(data)
          ? data
          : [],
      totalItems: data.totalItems ?? 0,
      page: data.page ?? page,
      limit: data.limit ?? PER_PAGE,
    };
  }

  function createColorsMarkup(colors) {
    if (!Array.isArray(colors) || colors.length === 0) {
      return '';
    }

    return colors
      .map(
        color => `
          <li class="furniture-color" style="background-color: ${color}"></li>
        `
      )
      .join('');
  }

  function createFurnitureCardMarkup(item) {
    const imageUrl =
      Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : '';

    return `
      <li class="furniture-card">
        <div class="furniture-card-thumb">
          <img
            src="${imageUrl}"
            alt="${item.name || 'Меблі'}"
            width="335"
            height="277"
            loading="lazy"
          />
        </div>

        <h3 class="furniture-card-title">${item.name || 'Без назви'}</h3>

        <ul class="furniture-colors">
          ${createColorsMarkup(item.color)}
        </ul>

        <p class="furniture-card-price">${item.price ?? 0} грн</p>

        <button class="details-btn" type="button" data-id="${item._id || ''}">
          Детальніше
        </button>
      </li>
    `;
  }

  function renderFurnitureCards(items) {
    refs.furnitureList.innerHTML = items.map(createFurnitureCardMarkup).join('');
  }

  function appendFurnitureCards(items) {
    refs.furnitureList.insertAdjacentHTML(
      'beforeend',
      items.map(createFurnitureCardMarkup).join('')
    );
  }
  async function loadInitialFurnitures() {
    showLoader();
    hideLoadMoreButton();

    try {
      currentPage = 1;
      totalLoadedItems = 0;

      const response = await fetchFurnitures(currentPage, currentCategory);
      const items = response.items;
      totalItems = response.totalItems;

      renderFurnitureCards(items);
      totalLoadedItems = items.length;

      if (totalLoadedItems >= totalItems) {
        hideLoadMoreButton();
      } else {
        showLoadMoreButton();
      }
    } catch (error) {
      console.error('Помилка початкового завантаження меблів:', error);

      refs.furnitureList.innerHTML = `
        <li class="furniture-card">
          <p class="furniture-card-title">
            На жаль, не вдалося завантажити меблі. Спробуйте пізніше.
          </p>
        </li>
      `;

      hideLoadMoreButton();
    } finally {
      hideLoader();
    }
  }

  async function onCategoryButtonClick(event) {
    const button = event.currentTarget;
    currentCategory = button.dataset.name;

    resetActiveButton();
    button.classList.add('is-active');

    await loadInitialFurnitures();
  }

  function addCategoryListeners() {
    refs.categoryButtons.forEach(button => {
      button.addEventListener('click', onCategoryButtonClick);
    });
  }

  try {
    categories = await fetchCategories();
    addCategoryListeners();
    await loadInitialFurnitures();
  } catch (error) {
    console.error(error);
  }
});