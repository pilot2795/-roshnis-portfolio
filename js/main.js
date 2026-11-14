(() => {
  const header = document.querySelector('.site-header');

  // The header sits transparent over a full-bleed hero, then turns solid as the hero title reaches it,
  // so the white header text never collides with the title.
  const heroTitle = document.querySelector('[data-hero] h1');
  if (header && heroTitle) {
    if ('IntersectionObserver' in window) {
      let observer;
      const watch = () => {
        if (observer) observer.disconnect();
        observer = new IntersectionObserver(
          ([entry]) => {
            const headerBottom = entry.rootBounds ? entry.rootBounds.top : header.offsetHeight;
            header.classList.toggle('is-solid', entry.boundingClientRect.top < headerBottom);
          },
          { rootMargin: `-${header.offsetHeight}px 0px 0px 0px`, threshold: [0, 1] }
        );
        observer.observe(heroTitle);
      };
      watch();
      let resizeTimer;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(watch, 150);
      });
    } else {
      header.classList.add('is-solid');
    }
  }

  const toggle = document.querySelector('.menu-toggle');
  const menu = document.getElementById('menu');
  if (!toggle || !menu) return;

  const label = toggle.querySelector('.menu-toggle__label');
  const background = [document.querySelector('main'), document.querySelector('.site-footer')].filter(Boolean);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const wide = window.matchMedia('(min-width: 760px)');
  let isOpen = false;
  let hideTimer;

  const setBackgroundInert = (inert) => background.forEach((el) => { el.inert = inert; });

  const openMenu = () => {
    if (isOpen) return;
    isOpen = true;
    clearTimeout(hideTimer);
    menu.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    if (label) label.textContent = 'Close';
    document.body.classList.add('menu-open');
    setBackgroundInert(true);
    // Two frames so the closed clip-path is painted before the wipe starts.
    requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('is-open')));
    const firstLink = menu.querySelector('a');
    if (firstLink) firstLink.focus({ preventScroll: true });
  };

  const closeMenu = ({ restoreFocus = true } = {}) => {
    if (!isOpen) return;
    isOpen = false;
    toggle.setAttribute('aria-expanded', 'false');
    if (label) label.textContent = 'Menu';
    document.body.classList.remove('menu-open');
    setBackgroundInert(false);
    menu.classList.remove('is-open');

    const hide = () => {
      clearTimeout(hideTimer);
      menu.removeEventListener('transitionend', onTransitionEnd);
      if (!isOpen) menu.hidden = true;
    };
    const onTransitionEnd = (event) => {
      if (event.target === menu) hide();
    };

    if (reducedMotion.matches) {
      hide();
    } else {
      menu.addEventListener('transitionend', onTransitionEnd);
      hideTimer = setTimeout(hide, 700);
    }

    if (restoreFocus) toggle.focus({ preventScroll: true });
  };

  toggle.addEventListener('click', () => (isOpen ? closeMenu() : openMenu()));

  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu({ restoreFocus: false });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen) closeMenu();
  });

  const onWide = (event) => {
    if (event.matches) closeMenu({ restoreFocus: false });
  };
  if (wide.addEventListener) wide.addEventListener('change', onWide);
  else wide.addListener(onWide);
})();
