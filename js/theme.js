(function () {
  'use strict';

  // Dark is the default. A choice made with the toggle is remembered in this browser.
  var KEY = 'theme';
  var COLORS = { dark: '#1f1713', light: '#f3e6cf' };
  var root = document.documentElement;

  function stored() {
    try {
      var value = localStorage.getItem(KEY);
      return value === 'light' || value === 'dark' ? value : null;
    } catch (err) {
      return null;
    }
  }

  function save(value) {
    try {
      localStorage.setItem(KEY, value);
    } catch (err) {
      // private mode or blocked storage: the choice just lasts for this visit
    }
  }

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', COLORS[theme]);
    }
  }

  // Runs in the head, before the page paints, so there is no flash of the wrong theme.
  apply(stored() || 'dark');

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.querySelector('[data-theme-toggle]');
    if (!btn) {
      return;
    }

    function sync() {
      var light = root.getAttribute('data-theme') === 'light';
      var label = light ? 'Switch to dark mode' : 'Switch to light mode';
      btn.textContent = light ? '\u2600\uFE0F' : '\uD83C\uDF19';
      btn.setAttribute('aria-label', label);
      btn.setAttribute('title', label);
    }

    sync();

    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      apply(next);
      save(next);
      sync();
    });
  });
})();
