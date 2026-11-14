/*! ServiceSnap: widget de agendamento para o site da loja. */
/* global window, document */
(() => {
  'use strict';

  const ROOT_ATTRIBUTE = 'data-servicesnap-widget';
  const DEFAULT_LABEL = 'Agendar horário';
  const DEFAULT_COLOR = '#0b0b0f';
  const DARK_TEXT = '#0b0b0f';
  const MAX_LABEL_LENGTH = 40;
  const MAX_STORE_NAME_LENGTH = 80;
  const MOBILE_QUERY = '(max-width: 479px)';
  const STORE_ID_PATTERN = /^[A-Za-z0-9-]{1,64}$/;
  const COLOR_PATTERN = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

  /** O próprio <script>: `currentScript` só existe durante a execução síncrona. */
  const findScript = () => {
    const current = document.currentScript;
    if (current && current.src && current.src.indexOf('widget.js') !== -1) {
      return current;
    }
    const scripts = document.querySelectorAll('script[src*="widget.js"]');
    for (let index = 0; index < scripts.length; index += 1) {
      if (scripts[index].hasAttribute('data-store')) return scripts[index];
    }
    return null;
  };

  /** O navegador resolve o `src` relativo; uma âncora dá a origem sem lançar erro. */
  const getOrigin = (src) => {
    const anchor = document.createElement('a');
    anchor.href = src;
    return anchor.origin && anchor.origin !== 'null' ? anchor.origin : null;
  };

  const toRgb = (hex) => {
    const digits =
      hex.length === 4
        ? hex
            .slice(1)
            .split('')
            .map((digit) => digit + digit)
            .join('')
        : hex.slice(1);
    return [0, 2, 4].map((start) =>
      parseInt(digits.slice(start, start + 2), 16),
    );
  };

  const luminance = (hex) => {
    const channels = toRgb(hex).map((value) => {
      const channel = value / 255;
      return channel <= 0.03928
        ? channel / 12.92
        : Math.pow((channel + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  };

  /** Texto branco ou escuro, o que tiver mais contraste com o fundo. */
  const getTextColor = (background) => {
    const backgroundLuminance = luminance(background);
    const withWhite = 1.05 / (backgroundLuminance + 0.05);
    const withDark =
      (backgroundLuminance + 0.05) / (luminance(DARK_TEXT) + 0.05);
    return withWhite >= withDark ? '#ffffff' : DARK_TEXT;
  };

  const script = findScript();
  if (!script) return;

  const origin = getOrigin(script.src);
  const storeId = (script.getAttribute('data-store') || '').trim();
  if (!origin || !STORE_ID_PATTERN.test(storeId)) {
    if (window.console) {
      window.console.warn(
        '[ServiceSnap] widget.js sem data-store válido: o botão não foi exibido.',
      );
    }
    return;
  }

  const label =
    (script.getAttribute('data-label') || '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, MAX_LABEL_LENGTH) || DEFAULT_LABEL;
  const colorAttribute = (script.getAttribute('data-color') || '').trim();
  const color = COLOR_PATTERN.test(colorAttribute)
    ? colorAttribute
    : DEFAULT_COLOR;
  const position =
    script.getAttribute('data-position') === 'left' ? 'left' : 'right';
  const embedUrl = `${origin}/booking/${encodeURIComponent(storeId)}/embed`;

  const STYLES = `
    :host { all: initial; }
    *, *::before, *::after { box-sizing: border-box; }
    [hidden] { display: none !important; }
    .fab {
      position: fixed; bottom: 28px; ${position}: 28px; z-index: 2147483000;
      display: inline-flex; align-items: center; gap: 10px;
      min-height: 56px; max-width: calc(100vw - 56px); margin: 0; padding: 0 22px;
      border: 0; border-radius: 999px; background: ${color}; color: ${getTextColor(color)};
      font: 700 15px/1.2 system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
      letter-spacing: normal; text-transform: none; cursor: pointer;
      box-shadow: 0 12px 32px rgba(15, 12, 30, 0.3);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      -webkit-tap-highlight-color: transparent;
    }
    .fab:hover { transform: translateY(-1px); box-shadow: 0 16px 36px rgba(15, 12, 30, 0.34); }
    .fab:focus { outline: none; }
    .fab:focus-visible {
      box-shadow: 0 0 0 3px #ffffff, 0 0 0 5px ${color}, 0 12px 32px rgba(15, 12, 30, 0.3);
    }
    .dot { flex: none; width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
    .label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .panel {
      position: fixed; bottom: 104px; ${position}: 28px; z-index: 2147483001;
      width: 380px; max-width: calc(100vw - 56px); height: min(640px, calc(100vh - 140px));
      border-radius: 24px; background: #ffffff; overflow: hidden;
      box-shadow: 0 24px 64px rgba(15, 12, 30, 0.25);
      opacity: 0; transform: translateY(12px); visibility: hidden;
      transition: opacity 0.18s ease, transform 0.18s ease, visibility 0s linear 0.18s;
    }
    .panel.open {
      opacity: 1; transform: none; visibility: visible;
      transition: opacity 0.18s ease, transform 0.18s ease;
    }
    .panel:focus { outline: none; }
    .frame { position: relative; z-index: 1; display: block; width: 100%; height: 100%; border: 0; }
    .loading {
      position: absolute; inset: 0; display: grid; place-items: center; margin: 0;
      font: 500 14px/1.4 system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; color: #5f5c6e;
    }
    .close {
      position: absolute; top: 18px; right: 20px; z-index: 2;
      display: grid; place-items: center; width: 44px; height: 44px; margin: 0; padding: 0;
      border: 0; border-radius: 50%; background: #f4f3f7; color: #0b0b0f;
      font: 400 18px/1 system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; cursor: pointer;
    }
    .close:focus { outline: none; }
    .close:focus-visible { box-shadow: 0 0 0 2px #ffffff, 0 0 0 4px #0b0b0f; }
    /* Com a página carregada, o × dela assume; o daqui só aparece no foco do teclado. */
    .panel.ready .close:not(:focus-visible) {
      width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); opacity: 0;
    }
    @media ${MOBILE_QUERY} {
      .panel {
        top: 0; right: 0; bottom: 0; left: 0;
        width: auto; max-width: none; height: auto; border-radius: 0;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .fab, .panel, .panel.open { transition: none; }
    }
  `;

  const mount = () => {
    // Incluído duas vezes, só a primeira cópia monta.
    if (document.querySelector(`[${ROOT_ATTRIBUTE}]`) || !document.body) return;
    if (typeof document.body.attachShadow !== 'function') return;

    const host = document.createElement('div');
    host.setAttribute(ROOT_ATTRIBUTE, '');
    host.setAttribute('style', 'all: initial !important;');
    const root = host.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = STYLES;

    const fab = document.createElement('button');
    fab.type = 'button';
    fab.className = 'fab';
    fab.setAttribute('aria-haspopup', 'dialog');
    fab.setAttribute('aria-expanded', 'false');
    fab.setAttribute('aria-controls', 'servicesnap-panel');
    const dot = document.createElement('span');
    dot.className = 'dot';
    dot.setAttribute('aria-hidden', 'true');
    const text = document.createElement('span');
    text.className = 'label';
    text.textContent = label;
    fab.append(dot, text);

    const panel = document.createElement('div');
    panel.id = 'servicesnap-panel';
    panel.className = 'panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', DEFAULT_LABEL);
    panel.tabIndex = -1;

    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'close';
    close.setAttribute('aria-label', 'Fechar');
    close.textContent = '×';

    const loading = document.createElement('p');
    loading.className = 'loading';
    loading.setAttribute('role', 'status');
    loading.textContent = 'Carregando...';

    panel.append(close, loading);
    root.append(style, panel, fab);
    document.body.appendChild(host);

    const mobileQuery = window.matchMedia(MOBILE_QUERY);
    const state = { isOpen: false, frame: null, previousOverflow: '' };

    const lockPageScroll = () => {
      if (!mobileQuery.matches) return;
      state.previousOverflow = document.documentElement.style.overflow;
      document.documentElement.style.overflow = 'hidden';
    };

    const unlockPageScroll = () => {
      if (!mobileQuery.matches) return;
      document.documentElement.style.overflow = state.previousOverflow;
    };

    const ensureFrame = () => {
      if (state.frame) return;
      // Só carrega a agenda no primeiro clique, não a cada visita ao site.
      const frame = document.createElement('iframe');
      frame.className = 'frame';
      frame.title = DEFAULT_LABEL;
      frame.src = embedUrl;
      frame.addEventListener('load', () => {
        loading.hidden = true;
      });
      panel.appendChild(frame);
      state.frame = frame;
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closePanel();
    };

    const openPanel = () => {
      if (state.isOpen) return;
      state.isOpen = true;
      ensureFrame();
      panel.classList.add('open');
      fab.setAttribute('aria-expanded', 'true');
      lockPageScroll();
      document.addEventListener('keydown', handleKeyDown);
      panel.focus({ preventScroll: true });
    };

    function closePanel() {
      if (!state.isOpen) return;
      state.isOpen = false;
      panel.classList.remove('open');
      fab.setAttribute('aria-expanded', 'false');
      unlockPageScroll();
      document.removeEventListener('keydown', handleKeyDown);
      fab.focus({ preventScroll: true });
    }

    fab.addEventListener('click', () => {
      if (state.isOpen) closePanel();
      else openPanel();
    });
    close.addEventListener('click', closePanel);

    window.addEventListener('message', (event) => {
      if (
        event.origin !== origin ||
        !state.frame ||
        event.source !== state.frame.contentWindow
      ) {
        return;
      }
      const data = event.data;
      if (!data || typeof data.type !== 'string') return;

      if (data.type === 'servicesnap:close') {
        closePanel();
        return;
      }

      if (data.type === 'servicesnap:ready') {
        panel.classList.add('ready');
        const storeName =
          typeof data.storeName === 'string'
            ? data.storeName.trim().slice(0, MAX_STORE_NAME_LENGTH)
            : '';
        if (storeName) {
          state.frame.title = `Agendar em ${storeName}`;
          panel.setAttribute('aria-label', `Agendar em ${storeName}`);
        }
      }

      // 'servicesnap:booked': o painel continua aberto com a confirmação.
    });
  };

  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
