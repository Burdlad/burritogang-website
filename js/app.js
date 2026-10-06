(function () {
  'use strict';

  var copyBtn = document.querySelector('[data-copy]');
  var announce = document.getElementById('copy-announce');
  var statusEl = document.getElementById('server-status');
  var resetTimer;

  function fallbackCopy(text) {
    var field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.className = 'visually-hidden';
    document.body.appendChild(field);
    field.select();
    var ok = false;
    try {
      ok = document.execCommand('copy');
    } catch (err) {
      ok = false;
    }
    document.body.removeChild(field);
    return ok;
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(
        function () { return true; },
        function () { return fallbackCopy(text); }
      );
    }
    return Promise.resolve(fallbackCopy(text));
  }

  if (copyBtn) {
    var idleLabel = copyBtn.textContent;

    copyBtn.addEventListener('click', function () {
      copyText(copyBtn.getAttribute('data-copy')).then(function (ok) {
        var label = ok ? 'Copied' : 'Select it and press Ctrl+C';
        copyBtn.textContent = label;
        copyBtn.classList.toggle('is-copied', ok);
        if (announce) {
          announce.textContent = ok ? 'Server address copied' : label;
        }
        clearTimeout(resetTimer);
        resetTimer = setTimeout(function () {
          copyBtn.textContent = idleLabel;
          copyBtn.classList.remove('is-copied');
        }, 2200);
      });
    });
  }

  // Player count comes from the public mcsrvstat.us lookup (no key needed).
  // If the lookup fails or the server doesn't answer, the line just stays hidden.
  function loadStatus() {
    if (!statusEl || !window.fetch) {
      return;
    }

    var controller = window.AbortController ? new AbortController() : null;
    var timeout = setTimeout(function () {
      if (controller) {
        controller.abort();
      }
    }, 7000);

    fetch('https://api.mcsrvstat.us/3/hub.burritogang.com', {
      signal: controller ? controller.signal : undefined,
      credentials: 'omit',
      referrerPolicy: 'no-referrer'
    })
      .then(function (res) {
        return res.ok ? res.json() : null;
      })
      .then(function (data) {
        clearTimeout(timeout);
        if (!data || data.online !== true || !data.players) {
          return;
        }
        var online = Number(data.players.online);
        if (!isFinite(online) || online < 0) {
          return;
        }
        statusEl.textContent = online === 0
          ? 'Open now, nobody on yet'
          : 'Open now, ' + Math.floor(online) + ' playing';
        statusEl.hidden = false;
      })
      .catch(function () {
        clearTimeout(timeout);
      });
  }

  loadStatus();
})();
