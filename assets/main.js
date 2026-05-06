/* Devon Days Out — minimal interactivity
 * Scroll reveal, keyboard accessibility, pass tilt on hover.
 */

(() => {
  'use strict';

  // ─── Scroll reveal ────────────────────────────────────
  const targets = document.querySelectorAll(
    '.try__head, .anatomy__card, .power, .push__card, .pitch__grid > div, .hero__copy, .hero__pass'
  );
  targets.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Stagger the reveals slightly within each group
        const delay = Array.from(entry.target.parentElement.children).indexOf(entry.target) * 80;
        setTimeout(() => entry.target.classList.add('is-visible'), delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => observer.observe(el));

  // ─── Pass tilt on mouse move ──────────────────────────
  const pass = document.querySelector('.pass');
  const passWrap = document.querySelector('.hero__pass');

  if (pass && passWrap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let raf = 0;

    passWrap.addEventListener('mousemove', (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = pass.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;  // -1..1
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;  // -1..1
        const tiltX = -y * 6;
        const tiltY =  x * 8;
        pass.style.transform = `perspective(800px) rotate(0deg) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-2px)`;
      });
    });

    passWrap.addEventListener('mouseleave', () => {
      cancelAnimationFrame(raf);
      pass.style.transform = '';
    });
  }

  // ─── Smooth-scroll offset for sticky nav ──────────────
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const navH = document.querySelector('.nav')?.offsetHeight || 0;
      const top = target.getBoundingClientRect().top + window.pageYOffset - navH - 12;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ─── Live "deals redeemed" demo on the pass ───────────
  // Click the progress bar to simulate redeeming a deal.
  const bar = document.querySelector('.pass__bar span');
  const dealsValue = document.querySelector('.pass__aux div:nth-child(2) .pass__field-value');

  if (bar && dealsValue) {
    let redeemed = 4;
    const passContainer = document.querySelector('.pass__aux div:nth-child(2)');
    if (passContainer) {
      passContainer.style.cursor = 'pointer';
      passContainer.title = 'Click to simulate redeeming a deal';
      passContainer.addEventListener('click', () => {
        if (redeemed >= 10) {
          redeemed = 0;
        } else {
          redeemed += 1;
        }
        dealsValue.textContent = `${redeemed} / 10`;
        bar.style.width = `${redeemed * 10}%`;
        bar.style.transition = 'width .5s cubic-bezier(.2,.8,.2,1)';
      });
    }
  }
})();
