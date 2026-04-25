(function () {
  'use strict';

  var doc = document;
  var win = window;
  var root = doc.documentElement;
  var body = doc.body;
  var header = doc.querySelector('.site-header, header');
  var reduceMotionQuery = win.matchMedia ? win.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var prefersReducedMotion = !!(reduceMotionQuery && reduceMotionQuery.matches);
  var gsapInstance = win.gsap || null;
  var ScrollTriggerInstance = win.ScrollTrigger || null;
  var lenisInstance = null;

  if (gsapInstance && ScrollTriggerInstance && typeof gsapInstance.registerPlugin === 'function') {
    gsapInstance.registerPlugin(ScrollTriggerInstance);
  }

  function onNextFrame(callback) {
    return win.requestAnimationFrame(function () {
      callback();
    });
  }

  function setScrolledState() {
    if (!header) {
      return;
    }

    if (win.scrollY > 24) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  function initLenis() {
    if (prefersReducedMotion || typeof win.Lenis !== 'function') {
      return;
    }

    try {
      lenisInstance = new win.Lenis({
        duration: 1.05,
        wheelMultiplier: 0.95,
        touchMultiplier: 1,
        smoothWheel: true,
        syncTouch: false
      });

      function raf(time) {
        if (!lenisInstance) {
          return;
        }

        lenisInstance.raf(time);
        win.requestAnimationFrame(raf);
      }

      win.requestAnimationFrame(raf);

      if (ScrollTriggerInstance && typeof lenisInstance.on === 'function') {
        lenisInstance.on('scroll', function () {
          ScrollTriggerInstance.update();
          setScrolledState();
        });
      }
    } catch (error) {
      lenisInstance = null;
    }
  }

  function getRevealConfig(element) {
    var type = (element.getAttribute('data-reveal') || 'up').toLowerCase();

    switch (type) {
      case 'left':
        return { x: -28, y: 0, scale: 1 };
      case 'right':
        return { x: 28, y: 0, scale: 1 };
      case 'scale':
        return { x: 0, y: 0, scale: 0.96 };
      case 'up':
      default:
        return { x: 0, y: 26, scale: 1 };
    }
  }

  function initHeroIntro() {
    var hero = doc.querySelector('.hero, .hero-section, .site-hero');
    if (!hero) {
      return;
    }

    var introTargets = hero.querySelectorAll(
      '.hero-eyebrow, .eyebrow, h1, .hero p, .hero-text p, .hero-actions, .hero-buttons, .hero-stats, .stats-grid, .glass-card'
    );

    if (!introTargets.length) {
      return;
    }

    if (prefersReducedMotion || !gsapInstance) {
      introTargets.forEach(function (item) {
        item.style.opacity = '1';
        item.style.transform = 'none';
      });
      return;
    }

    gsapInstance.set(introTargets, {
      opacity: 0,
      y: 22,
      willChange: 'transform, opacity'
    });

    gsapInstance.timeline({ defaults: { ease: 'power2.out' } }).to(introTargets, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      stagger: 0.12,
      clearProps: 'willChange'
    });
  }

  function initRevealAnimations() {
    var revealItems = doc.querySelectorAll('[data-reveal]');
    if (!revealItems.length) {
      return;
    }

    if (prefersReducedMotion || !gsapInstance || !ScrollTriggerInstance) {
      revealItems.forEach(function (item) {
        item.style.opacity = '1';
        item.style.transform = 'none';
      });
      return;
    }

    revealItems.forEach(function (item, index) {
      var config = getRevealConfig(item);

      gsapInstance.fromTo(
        item,
        {
          opacity: 0,
          x: config.x,
          y: config.y,
          scale: config.scale,
          willChange: 'transform, opacity'
        },
        {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.9,
          delay: Math.min(index * 0.02, 0.16),
          ease: 'power2.out',
          clearProps: 'willChange',
          scrollTrigger: {
            trigger: item,
            start: 'top 88%',
            toggleActions: 'play none none none',
            once: true
          }
        }
      );
    });
  }

  function initMagneticButtons() {
    var buttons = doc.querySelectorAll('.magnetic-btn');
    if (!buttons.length) {
      return;
    }

    buttons.forEach(function (button) {
      var strength = 0.18;

      function resetButton() {
        if (gsapInstance && !prefersReducedMotion) {
          gsapInstance.to(button, {
            x: 0,
            y: 0,
            duration: 0.45,
            ease: 'power3.out'
          });
        } else {
          button.style.transform = 'translate3d(0, 0, 0)';
        }
      }

      if (prefersReducedMotion) {
        resetButton();
        return;
      }

      button.addEventListener('mousemove', function (event) {
        var rect = button.getBoundingClientRect();
        var relX = event.clientX - rect.left - rect.width / 2;
        var relY = event.clientY - rect.top - rect.height / 2;
        var moveX = relX * strength;
        var moveY = relY * strength;

        if (gsapInstance) {
          gsapInstance.to(button, {
            x: moveX,
            y: moveY,
            duration: 0.3,
            ease: 'power2.out',
            overwrite: true
          });
        } else {
          button.style.transform = 'translate3d(' + moveX.toFixed(2) + 'px, ' + moveY.toFixed(2) + 'px, 0)';
        }
      });

      button.addEventListener('mouseleave', resetButton);
      button.addEventListener('blur', resetButton);
    });
  }

  function initOrbParallax() {
    var orbs = doc.querySelectorAll('.parallax-orb');
    if (!orbs.length) {
      return;
    }

    if (prefersReducedMotion) {
      orbs.forEach(function (orb) {
        orb.style.transform = 'none';
      });
      return;
    }

    var pointerX = win.innerWidth / 2;
    var pointerY = win.innerHeight / 2;
    var currentX = pointerX;
    var currentY = pointerY;
    var ticking = false;

    function render() {
      ticking = false;
      currentX += (pointerX - currentX) * 0.08;
      currentY += (pointerY - currentY) * 0.08;

      orbs.forEach(function (orb, index) {
        var depth = (index + 1) * 10;
        var moveX = ((currentX / win.innerWidth) - 0.5) * depth;
        var moveY = ((currentY / win.innerHeight) - 0.5) * depth;

        if (gsapInstance) {
          gsapInstance.to(orb, {
            x: moveX,
            y: moveY,
            duration: 0.9,
            ease: 'power2.out',
            overwrite: true
          });
        } else {
          orb.style.transform = 'translate3d(' + moveX.toFixed(2) + 'px, ' + moveY.toFixed(2) + 'px, 0)';
        }
      });
    }

    function requestTick() {
      if (ticking) {
        return;
      }
      ticking = true;
      win.requestAnimationFrame(render);
    }

    win.addEventListener(
      'mousemove',
      function (event) {
        pointerX = event.clientX;
        pointerY = event.clientY;
        requestTick();
      },
      { passive: true }
    );

    win.addEventListener(
      'deviceorientation',
      function (event) {
        if (typeof event.gamma !== 'number' || typeof event.beta !== 'number') {
          return;
        }
        pointerX = ((event.gamma + 45) / 90) * win.innerWidth;
        pointerY = ((event.beta + 45) / 90) * win.innerHeight;
        requestTick();
      },
      { passive: true }
    );

    requestTick();
  }

  function bindGlobalEvents() {
    setScrolledState();

    win.addEventListener(
      'scroll',
      function () {
        setScrolledState();
      },
      { passive: true }
    );

    if (reduceMotionQuery) {
      var handleMotionChange = function (event) {
        prefersReducedMotion = event.matches;
        setScrolledState();
      };

      if (typeof reduceMotionQuery.addEventListener === 'function') {
        reduceMotionQuery.addEventListener('change', handleMotionChange);
      } else if (typeof reduceMotionQuery.addListener === 'function') {
        reduceMotionQuery.addListener(handleMotionChange);
      }
    }
  }

  function init() {
    if (body) {
      body.classList.add('js-ready');
    }

    bindGlobalEvents();
    initLenis();

    onNextFrame(function () {
      initHeroIntro();
      initRevealAnimations();
      initMagneticButtons();
      initOrbParallax();

      if (ScrollTriggerInstance && typeof ScrollTriggerInstance.refresh === 'function') {
        ScrollTriggerInstance.refresh();
      }
    });
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  root.classList.add('js-enabled');
})();