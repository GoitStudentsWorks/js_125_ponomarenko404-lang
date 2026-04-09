import { dataOrder as dataOrders } from './furniture-modal.js';

let iziToast = null;
let axios = null;

const loadDependencies = async () => {
  if (!iziToast) {
    const iziToastModule = await import('izitoast');
    iziToast = iziToastModule.default;
    await import('izitoast/dist/css/iziToast.min.css');
  }
  if (!axios) {
    const axiosModule = await import('axios');
    axios = axiosModule.default;
  }
};

const elements = {
  form: null,
  orderName: null,
  orderPhone: null,
  orderComment: null,
  backdrop: null,
  closeButton: null,
};

const initElements = () => {
  elements.form = document.getElementById('order-modal-form');
  elements.orderName = document.getElementById('order-name');
  elements.orderPhone = document.getElementById('order-phone');
  elements.orderComment = document.getElementById('order-comment');
  elements.backdrop = document.querySelector('.order-modal-backdrop');
  elements.closeButton = document.getElementById('order-modal-close');
};

const ORDER_REQUEST_URL = 'https://furniture-store-v2.b.goit.study/api/orders';

const debounce = (fn, delay = 150) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

const restoreFormFromStorage = () => {
  const phone = localStorage.getItem('orderPhone');
  const name = localStorage.getItem('orderName');
  const comment = localStorage.getItem('orderComment');

  if (phone && elements.orderPhone) elements.orderPhone.value = phone;
  if (name && elements.orderName) elements.orderName.value = name;
  if (comment && elements.orderComment) elements.orderComment.value = comment;
};

const isModalOpen = () =>
  elements.backdrop && !elements.backdrop.classList.contains('is-hidden');

const syncBodyScrollLock = () => {
  document.body.classList.toggle('order-modal-open', isModalOpen());
};

export const openOrderModal = () => {
  if (!elements.backdrop) {
    return;
  }

  elements.backdrop.classList.remove('is-hidden');
  elements.backdrop.setAttribute('aria-hidden', 'false');
  syncBodyScrollLock();
};

const closeOrderModal = () => {
  if (!elements.backdrop) {
    return;
  }

  elements.backdrop.classList.add('is-hidden');
  syncBodyScrollLock();
};

const initModalHandlers = () => {
  if (elements.backdrop) {
    elements.backdrop.addEventListener('click', event => {
      if (event.target === elements.backdrop) {
        closeOrderModal();
      }
    });

    const backdropObserver = new MutationObserver(syncBodyScrollLock);
    backdropObserver.observe(elements.backdrop, {
      attributes: true,
      attributeFilter: ['class'],
    });

    syncBodyScrollLock();
  }

  if (elements.closeButton) {
    elements.closeButton.addEventListener('click', closeOrderModal);
  }
};

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && isModalOpen()) {
    closeOrderModal();
  }
});

const initForm = () => {
  if (!elements.form) return;

  const normalizePhone = value => value.replace(/\D/g, '');

  const isPhoneValid = value => {
    const digits = normalizePhone(value);
    return (
      (digits.length === 12 && digits.startsWith('380')) ||
      (digits.length === 10 && digits.startsWith('0'))
    );
  };

  const sendOrderRequest = async payload => {
    await loadDependencies();
    return axios.post(ORDER_REQUEST_URL, payload);
  };

  const fields = [
    {
      input: elements.orderName,
      error: document.getElementById('order-name-error'),
      validate: value => {
        if (!value.trim()) {
          return "Поле імені є обов'язковим.";
        }
        return '';
      },
    },
    {
      input: elements.orderPhone,
      error: document.getElementById('order-phone-error'),
      validate: value => {
        if (!value.trim()) {
          return "Поле телефону є обов'язковим.";
        }
        if (!isPhoneValid(value)) {
          return 'Введіть коректний номер телефону.';
        }
        return '';
      },
    },
  ].filter(({ input, error }) => input && error);

  const setFieldState = ({ input, error, validate }) => {
    const errorText = validate(input.value);
    const isInvalid = Boolean(errorText);

    input.classList.toggle('is-invalid', isInvalid);
    input.setAttribute('aria-invalid', String(isInvalid));
    error.textContent = errorText;

    return !isInvalid;
  };

  fields.forEach(field => {
    field.input.addEventListener('blur', () => {
      setFieldState(field);
    });

    field.input.addEventListener(
      'input',
      debounce(() => {
        if (field.input.classList.contains('is-invalid')) {
          setFieldState(field);
        }
      }, 100)
    );
  });

  elements.form.addEventListener('submit', async event => {
    event.preventDefault();

    const invalidField = fields.find(field => !setFieldState(field));

    if (invalidField) {
      await loadDependencies();
      iziToast.error({
        message:
          invalidField.error.textContent || 'Перевірте правильність даних.',
        position: 'topRight',
        timeout: 2500,
      });
      invalidField.input.focus();
      return;
    }

    const payload = {
      name: elements.orderName.value.trim(),
      phone: elements.orderPhone.value.trim(),
      comment: elements.orderComment.value.trim(),
      modelId: dataOrders.modelId.trim(),
      color: dataOrders.color.trim(),
    };

    try {
      await sendOrderRequest(payload);

      iziToast.success({
        message: 'Форму успішно відправлено!',
        position: 'topRight',
        timeout: 2500,
      });

      elements.form.reset();
      closeOrderModal();
      localStorage.removeItem('orderPhone');
      localStorage.removeItem('orderName');
      localStorage.removeItem('orderComment');
      localStorage.removeItem('orderModelId');
      localStorage.removeItem('orderColor');

      fields.forEach(({ input, error }) => {
        input.classList.remove('is-invalid');
        input.setAttribute('aria-invalid', 'false');
        error.textContent = '';
      });
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Не вдалося відправити форму. Спробуйте пізніше.';

      iziToast.error({
        message: errorMessage,
        position: 'topRight',
        timeout: 3500,
      });
    }
  });

  elements.form.addEventListener(
    'input',
    debounce(event => {
      if (event.target === elements.orderPhone) {
        localStorage.setItem('orderPhone', elements.orderPhone.value);
      } else if (event.target === elements.orderName) {
        localStorage.setItem('orderName', elements.orderName.value);
      } else if (event.target === elements.orderComment) {
        localStorage.setItem('orderComment', elements.orderComment.value);
      }
    }, 300)
  );
};

// Ініціалізація при ДОМ готовому
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initElements();
    restoreFormFromStorage();
    initModalHandlers();
    initForm();
  });
} else {
  initElements();
  restoreFormFromStorage();
  initModalHandlers();
  initForm();
}
