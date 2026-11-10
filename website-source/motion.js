(() => {
  'use strict';
  function boot() {
    if (!window.matchMedia || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return;
    const nodes = Array.from(document.querySelectorAll('.section-top, .service-banner-copy, .about-copy, .faq-grid, .contact-wrap, .footer-main'));
    document.documentElement.classList.add('has-motion');
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
      }
    }, { rootMargin:'0px 0px -40px 0px', threshold:0.08 });
    nodes.forEach(node => { node.classList.add('reveal-on-scroll'); observer.observe(node); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
