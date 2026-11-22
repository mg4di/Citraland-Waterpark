import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

/**
 * Home page motion: one intro timeline, scroll reveals, per-item reveals, and a
 * small desktop-only parallax. Everything is scoped to #page-home and cleaned
 * up when the Vue page unmounts or reduced motion is requested.
 */
export function initHomeGsap() {
  const home = document.querySelector('#page-home');
  if (!home) return () => {};

  const q = gsap.utils.selector(home);
  const mm = gsap.matchMedia();
  let observer = null;
  let refreshTimer = null;

  const refresh = () => ScrollTrigger.refresh();
  const scheduleRefresh = () => {
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(refresh, 180);
  };

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const header = q('[data-gsap-hero="header"]')[0];
    const image = q('[data-gsap-hero="image"]')[0];
    const title = q('[data-gsap-hero="title"]')[0];
    const accent = q('[data-gsap-hero="title"] .text-sun')[0];
    const copy = q('[data-gsap-hero="copy"]')[0];
    const actions = q('[data-gsap-hero="actions"]')[0];
    const trust = q('[data-gsap-hero="trust"]')[0];
    const ticket = q('[data-gsap-hero="ticket"]')[0];
    const facts = q('[data-gsap-hero="facts"]')[0];

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      delay: 0.08,
    });

    if (header) {
      const headerItems = header.querySelectorAll(':scope > div > *');
      intro.from(headerItems, { y: -14, autoAlpha: 0, duration: 0.55, stagger: 0.06 }, 0);
    }
    if (image) {
      intro.from(image, { scale: 1.075, autoAlpha: 0, duration: 1.45, ease: 'power2.out' }, 0);
    }
    if (title) intro.from(title, { y: 54, autoAlpha: 0, duration: 1.1 }, 0.12);
    if (accent) {
      intro.from(accent, { yPercent: 22, rotation: 1.5, autoAlpha: 0, duration: 0.8 }, 0.5);
    }
    if (copy) intro.from(copy, { y: 26, autoAlpha: 0, duration: 0.8 }, 0.38);
    if (actions) intro.from(actions, { y: 24, autoAlpha: 0, duration: 0.8 }, 0.5);
    if (trust) intro.from(trust, { y: 16, autoAlpha: 0, duration: 0.65 }, 0.64);
    if (ticket) {
      intro.from(ticket, { y: 38, rotation: 0.4, autoAlpha: 0, duration: 1 }, 0.48);
    }
    if (facts) intro.from(facts, { y: 16, autoAlpha: 0, duration: 0.65 }, 0.72);

    intro.eventCallback('onComplete', () => {
      gsap.set([image, title, ticket].filter(Boolean), { willChange: 'auto' });
    });

    q('[data-gsap-reveal]').forEach((element) => {
      gsap.from(element, {
        y: 34,
        autoAlpha: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 95%',
          once: false,
          toggleActions: 'play reset play reset',
        },
      });
    });

    q('[data-gsap-item]').forEach((element) => {
      gsap.from(element, {
        y: 26,
        autoAlpha: 0,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 95%',
          once: false,
          toggleActions: 'play reset play reset',
        },
      });
    });

    if (window.matchMedia('(min-width: 1024px)').matches) {
      const hero = q('.home-hero')[0];
      if (hero && image) {
        gsap.to(image, {
          yPercent: 7,
          scale: 1.035,
          ease: 'none',
          scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.6,
          },
        });
      }
      if (hero && ticket) {
        gsap.to(ticket, {
          yPercent: -5,
          ease: 'none',
          scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.8,
          },
        });
      }
      q('[data-gsap-parallax]').forEach((element) => {
        gsap.to(element, {
          yPercent: -4,
          ease: 'none',
          scrollTrigger: {
            trigger: element,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.9,
          },
        });
      });
    }
  });

  mm.add('(prefers-reduced-motion: reduce)', () => {
    gsap.set(q('[data-gsap-hero], [data-gsap-reveal], [data-gsap-item]'), {
      clearProps: 'all',
      autoAlpha: 1,
    });
  });

  observer = new MutationObserver(() => {
    if (home.classList.contains('active')) scheduleRefresh();
  });
  observer.observe(home, { attributes: true, attributeFilter: ['class'] });

  window.addEventListener('load', scheduleRefresh);
  const initialRefresh = window.setTimeout(scheduleRefresh, 650);

  return () => {
    observer?.disconnect();
    window.removeEventListener('load', scheduleRefresh);
    window.clearTimeout(initialRefresh);
    window.clearTimeout(refreshTimer);
    mm.revert();
  };
}
