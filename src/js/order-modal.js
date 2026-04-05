import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import axios from 'axios';
// import { dataOrders } from './furniture-modal.js';

const form = document.getElementById('order-modal-form');
const orderName = document.getElementById('order-name');
const orderPhone = document.getElementById('order-phone');
const orderComment = document.getElementById('order-comment');
const backdrop = document.querySelector('.order-modal-backdrop');
const closeButton = document.getElementById('order-modal-close');
const ORDER_REQUEST_URL = 'https://furniture-store-v2.b.goit.study/api/orders';

if (localStorage.getItem('orderPhone')) {
  orderPhone.value = localStorage.getItem('orderPhone');
}

if (localStorage.getItem('orderName')) {
  orderName.value = localStorage.getItem('orderName');
}

if (localStorage.getItem('orderComment')) {
  orderComment.value = localStorage.getItem('orderComment');
}

const isModalOpen = () => backdrop && !backdrop.classList.contains('is-hidden');

const syncBodyScrollLock = () => {
  document.body.classList.toggle('order-modal-open', isModalOpen());
};

const closeOrderModal = () => {
  if (!backdrop) {
    return;
  }

  backdrop.classList.add('is-hidden');
  backdrop.setAttribute('aria-hidden', 'true');
  syncBodyScrollLock();
};

if (backdrop) {
  backdrop.addEventListener('click', event => {
    if (event.target === backdrop) {
      closeOrderModal();
    }
  });

  const backdropObserver = new MutationObserver(syncBodyScrollLock);
  backdropObserver.observe(backdrop, {
    attributes: true,
    attributeFilter: ['class'],
  });

  syncBodyScrollLock();
}

if (closeButton) {
  closeButton.addEventListener('click', closeOrderModal);
}

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && isModalOpen()) {
    closeOrderModal();
  }
});

if (form) {
  const normalizePhone = value => value.replace(/\D/g, '');

  const isPhoneValid = value => {
    const digits = normalizePhone(value);
    return (
      (digits.length === 12 && digits.startsWith('380')) ||
      (digits.length === 10 && digits.startsWith('0'))
    );
  };

  const sendOrderRequest = payload => axios.post(ORDER_REQUEST_URL, payload);

  const fields = [
    {
      input: document.getElementById('order-name'),
      error: document.getElementById('order-name-error'),
      validate: value => {
        if (!value.trim()) {
          return "Поле імені є обов'язковим.";
        }

        return '';
      },
    },
    {
      input: document.getElementById('order-phone'),
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

    field.input.addEventListener('input', () => {
      if (field.input.classList.contains('is-invalid')) {
        setFieldState(field);
      }
    });
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();

    const invalidField = fields.find(field => !setFieldState(field));

    if (invalidField) {
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
      name: orderName.value.trim(),
      phone: orderPhone.value.trim(),
      comment: orderComment.value.trim(),
      modelId: dataOrders.modelId,
      color: dataOrders.color,
    };

    try {
      await sendOrderRequest(payload);

      iziToast.success({
        message: 'Форму успішно відправлено!',
        position: 'topRight',
        timeout: 2500,
      });

      form.reset();

      closeOrderModal();

      localStorage.removeItem('orderPhone');
      localStorage.removeItem('orderName');
      localStorage.removeItem('orderComment');

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

  form.addEventListener('input', event => {
    if (event.target === orderPhone) {
      localStorage.setItem('orderPhone', orderPhone.value);
    } else if (event.target === orderName) {
      localStorage.setItem('orderName', orderName.value);
    } else if (event.target === orderComment) {
      localStorage.setItem('orderComment', orderComment.value);
    }
  });
}
