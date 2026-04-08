const header = document.querySelector('.mobile-menu-content');
const burgerBtn = document.querySelector('.js-open-menu');
const closeBtn = document.querySelector('.close-header-mobile');
const headerCloseMobile = document.querySelector('.mobile-menu-list');
const headerShadov = document.querySelector('.overlay');
const headerDescScroll = document.querySelector('.nav-list');
const toggleMenu = () => {
  if (document.body.style.overflow !== 'hidden') {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }

  headerShadov.classList.toggle('is-open');
  header.classList.toggle('is-open');
  burgerBtn.classList.toggle('zib-zap-btn');
  closeBtn.classList.toggle('zib-zap-btn');
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        window.scrollTo({
          top: target.offsetTop,
          behavior: 'smooth',
        });
      }
    });
  });
};

const toggleMenuFromShadov = async e => {
  document.body.style.overflow = '';
  e.preventDefault();
  headerShadov.classList.toggle('is-open');
  header.classList.toggle('is-open');
  burgerBtn.classList.toggle('zib-zap-btn');
  closeBtn.classList.toggle('zib-zap-btn');
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        window.scrollTo({
          top: target.offsetTop,
          behavior: 'smooth',
        });
      }
    });
  });
};

document.querySelectorAll('a[href*="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const url = new URL(this.href);
    const current = new URL(window.location.href);

    const isSamePage =
      url.pathname === current.pathname && url.origin === current.origin;

    const isRoot =
      current.pathname.endsWith('/') || current.pathname.endsWith('index.html');

    const hash = url.hash;

    if (!hash || hash === '#') return;

    if (isSamePage && isRoot) {
      const target = document.querySelector(hash);

      if (target) {
        e.preventDefault();

        window.scrollTo({
          top: target.offsetTop - 80,
          behavior: 'smooth',
        });
      }
    }
  });
});
burgerBtn.addEventListener('click', toggleMenu);
closeBtn.addEventListener('click', toggleMenu);
headerShadov.addEventListener('click', toggleMenuFromShadov);
for (const item of headerCloseMobile.children) {
  const link = item.querySelector('a');
  if (link) link.addEventListener('click', toggleMenu);
}

for (const item of headerDescScroll.children) {
  const link = item.querySelector('a');
  if (link) link.addEventListener('click', toggleMenu);
}
