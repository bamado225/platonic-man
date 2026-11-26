/* Shared site shell — loaded at the TOP of <body> on every page.
   Injects the ticker, header (nav + PLAY!), footer and shopping-bag FAB, and
   exposes small helpers on window.PM. No build step: edit this file once and
   every page updates. */
(function () {
    const PM = window.PM = window.PM || {};

    /* ------------------------------------------------------------------
       SHARED CONTENT
       ------------------------------------------------------------------ */
    PM.site = {
        logo: { src: '/assets/img/logo.jpg', alt: 'Platonic Man logo' },
        favicon: '/assets/img/newlogo.png',
        footer: {
            brand: 'PLATONIC COMICS',
            tagline: 'TRAGICALLY SINGLE SINCE THE SILVER AGE',
            copyright: '© 1962 PLATONIC COMICS'
        },
        ticker: [
            'BREAKING: Platonic Man still single',
            'The perfect gag gift is here',
            'Signed sets: order by Dec 14 for Christmas',
            'Play Friendzone Run now'
        ],
        nav: [
            { label: 'Shop', href: '/#shop' },
            { label: 'Games', href: '/games/' },
            { label: 'Videos', href: '/videos/' },
            { label: 'Memes', href: '/#memes' }
        ],
        // Empty string = icon hidden.
        social: {
            instagram: 'https://www.instagram.com/garytal312/',
            facebook: 'https://www.facebook.com/profile.php?id=61596468692228',
            youtube: 'https://www.youtube.com/channel/UCcWxnleE_TRuUFvqTRxfvCQ/',
            tiktok: ''
        },
        footerLinks: [
            { label: 'Privacy Policy', href: '/privacy/' },
            { label: 'Shipping & Returns', href: '/policies/' }
        ],
        contactEmail: 'hello@platonicman.com'
    };

    /* ------------------------------------------------------------------
       TRACKING — paste the IDs here to switch tracking on. While an ID is
       empty that tracker never loads; PM.track() still logs to the console
       so you can test events before going live.
       ------------------------------------------------------------------ */
    PM.config = {
        metaPixelId: '',   // e.g. '123456789012345' (Meta Events Manager → Dataset ID)
        ga4Id: ''          // e.g. 'G-ABC123XYZ' (GA4 → Data stream → Measurement ID)
    };

    (function initTracking() {
        const C = PM.config;
        if (/^G-[A-Z0-9]+$/.test(C.ga4Id)) {
            const s = document.createElement('script');
            s.async = true;
            s.src = 'https://www.googletagmanager.com/gtag/js?id=' + C.ga4Id;
            document.head.appendChild(s);
            window.dataLayer = window.dataLayer || [];
            window.gtag = function () { window.dataLayer.push(arguments); };
            window.gtag('js', new Date());
            window.gtag('config', C.ga4Id);
        }
        if (/^\d{10,20}$/.test(C.metaPixelId)) {
            /* Meta's standard loader */
            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
            n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
            document,'script','https://connect.facebook.net/en_US/fbevents.js');
            window.fbq('init', C.metaPixelId);
            window.fbq('track', 'PageView');
        }
    })();

    // Our event name → GA4 name + Meta standard event (or custom if null).
    const EVENT_MAP = {
        shop_view:        { ga: 'shop_view',      meta: 'ViewContent' },
        click_amazon:     { ga: 'click_amazon',   meta: null },
        InitiateCheckout: { ga: 'begin_checkout', meta: 'InitiateCheckout' },
        Purchase:         { ga: 'purchase',       meta: 'Purchase' },
        game_start:       { ga: 'game_start',     meta: null },
        game_over:        { ga: 'game_over',      meta: null },
        game_cta_click:   { ga: 'game_cta_click', meta: null }
    };

    /* PM.track(name, params, eventId)
       params: plain object (book_id, score, cta, value, currency…).
       eventId: optional dedupe key (Stripe session id on Purchase). */
    PM.track = function (name, params, eventId) {
        params = params || {};
        const map = EVENT_MAP[name] || { ga: name, meta: null };
        try {
            if (window.gtag) {
                const gaParams = Object.assign({}, params);
                if (eventId) gaParams.transaction_id = eventId;
                window.gtag('event', map.ga, gaParams);
            }
            if (window.fbq) {
                const opts = eventId ? { eventID: eventId } : undefined;
                if (map.meta) window.fbq('track', map.meta, params, opts);
                else window.fbq('trackCustom', name, params, opts);
            }
        } catch (e) { /* tracking must never break the page */ }
        if (/[?&]debug\b/.test(location.search)) console.log('[PM.track]', name, params, eventId || '');
    };

    // The video hard-coded on the homepage; /videos/ uses it too.
    PM.defaultVideo = { id: 'uoic8PZWchU', title: '16 Asking a Girl Out' };

    // Videos/memes published via the hidden admin panel (Netlify Blobs).
    // Always resolves to an array — never rejects.
    PM.fetchPublished = function () {
        return fetch('/.netlify/functions/videos')
            .then(res => (res.ok ? res.json() : []))
            .then(list => (Array.isArray(list) ? list : []))
            .catch(() => []);
    };

    /* ------------------------------------------------------------------
       PARTICLE EXPLOSION (PLAY! button, poll votes)
       ------------------------------------------------------------------ */
    const PARTICLES = ['💔', '❤️', '🧸', '👜'];
    PM.createExplosion = function (x, y) {
        for (let i = 0; i < 20; i++) {
            const type = PARTICLES[Math.floor(Math.random() * PARTICLES.length)];
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.setAttribute('aria-hidden', 'true');
            if (type === '❤️') {
                particle.innerHTML = '<div class="particle-inner">❤️<span class="heart-p-overlay">P</span></div>';
            } else {
                particle.textContent = type;
            }
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            document.body.appendChild(particle);

            const angle = Math.random() * Math.PI * 2;
            const velocity = 5 + Math.random() * 15;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            const rotation = (Math.random() - 0.5) * 720;
            const duration = 1000 + Math.random() * 1000;
            const start = performance.now();

            (function animate(now) {
                const progress = (now - start) / duration;
                if (progress < 1) {
                    const dx = vx * progress * 20;
                    const dy = vy * progress * 20 + 0.5 * 9.8 * Math.pow(progress * 2, 2) * 10;
                    particle.style.transform =
                        `translate(-50%, -50%) translate(${dx}px, ${dy}px) rotate(${rotation * progress}deg) scale(${1.5 - progress})`;
                    particle.style.opacity = 1 - progress;
                    requestAnimationFrame(animate);
                } else {
                    particle.remove();
                }
            })(start);
        }
    };

    /* ------------------------------------------------------------------
       TICKER + HEADER (injected immediately, so there is no flash)
       ------------------------------------------------------------------ */
    const S = PM.site;
    const path = location.pathname;
    const isActive = href => href.startsWith('/games/') ? path.startsWith('/games')
        : href.startsWith('/videos/') ? path.startsWith('/videos') : false;

    const desktopLinks = S.nav.map(l =>
        `<a href="${l.href}" class="font-headline-md font-extrabold text-[18px] lg:text-[22px] leading-none uppercase hover:text-primary transition-colors ${isActive(l.href) ? 'underline decoration-4 decoration-primary underline-offset-[10px]' : ''}">${l.label}</a>`
    ).join('');
    const mobileLinks = S.nav.map(l =>
        `<a href="${l.href}" class="px-4 py-3 border-t-4 border-on-surface font-headline-md font-extrabold text-[18px] leading-none uppercase hover:bg-tertiary-fixed ${isActive(l.href) ? 'bg-tertiary-fixed' : ''}">${l.label}</a>`
    ).join('');
    const tickerText = S.ticker.concat(S.ticker).join(' &nbsp;|&nbsp; ');

    document.body.insertAdjacentHTML('afterbegin', `
<div class="bg-secondary text-on-secondary h-9 leading-[28px] border-b-4 border-on-surface z-50 sticky top-0 marquee" role="marquee" aria-label="News ticker">
  <div class="marquee-content font-label-bold text-label-bold uppercase">${tickerText}</div>
</div>
<header class="bg-surface border-b-4 border-on-surface shadow-[8px_8px_0px_0px_rgba(27,27,27,1)] sticky top-9 z-40">
  <div class="px-4 md:px-panel-margin py-3 flex items-center justify-between gap-3">
    <a href="/" class="flex items-center gap-3 min-w-0">
      <img src="${S.favicon}" alt="${S.logo.alt}" class="hidden sm:block h-12 w-12 md:h-16 md:w-16 border-2 border-on-surface shrink-0"/>
      <span class="font-headline-md font-extrabold italic uppercase text-primary text-[20px] sm:text-[32px] md:text-[26px] lg:text-headline-md leading-none whitespace-nowrap">PLATONIC MAN</span>
    </a>
    <nav class="hidden md:flex items-center gap-5 lg:gap-10" aria-label="Main">${desktopLinks}</nav>
    <div class="flex items-center gap-3">
      <button id="play-button" type="button" class="bg-secondary text-on-secondary px-5 sm:px-8 md:px-5 lg:px-8 py-2 sm:py-3 font-headline-sm font-extrabold text-[22px] sm:text-headline-sm md:text-[24px] lg:text-headline-sm border-4 border-on-surface shadow-[4px_4px_0px_0px_rgba(27,27,27,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:scale-95">PLAY!</button>
      <button id="nav-toggle" type="button" class="md:hidden bg-surface border-4 border-on-surface w-12 h-12 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(27,27,27,1)]" aria-label="Menu" aria-expanded="false" aria-controls="mobile-nav">
        <span class="material-symbols-outlined">menu</span>
      </button>
    </div>
  </div>
  <nav id="mobile-nav" class="hidden md:hidden flex-col" aria-label="Main (mobile)">${mobileLinks}</nav>
</header>`);

    const navToggle = document.getElementById('nav-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    function setNav(open) {
        mobileNav.classList.toggle('hidden', !open);
        mobileNav.classList.toggle('flex', open);
        navToggle.setAttribute('aria-expanded', String(open));
        navToggle.firstElementChild.textContent = open ? 'close' : 'menu';
    }
    navToggle.addEventListener('click', () => setNav(mobileNav.classList.contains('hidden')));
    mobileNav.addEventListener('click', e => { if (e.target.closest('a')) setNav(false); });

    // PLAY! — particle explosion, then off to the Game Zone.
    const playButton = document.getElementById('play-button');
    playButton.addEventListener('click', () => {
        const r = playButton.getBoundingClientRect();
        PM.createExplosion(r.left + r.width / 2, r.top + r.height / 2);
        if (!path.startsWith('/games')) {
            setTimeout(() => { location.href = '/games/'; }, 600);
        }
    });

    /* ------------------------------------------------------------------
       FAVICON, FOOTER + FAB (need the rest of the page, so after parse)
       ------------------------------------------------------------------ */
    function injectRest() {
        if (!document.querySelector('link[rel="icon"]')) {
            const icon = document.createElement('link');
            icon.rel = 'icon';
            icon.href = S.favicon;
            document.head.appendChild(icon);
        }

        const socialIcon = (name, label, svg) => !S.social[name] ? '' :
            `<a target="_blank" rel="noopener noreferrer" aria-label="${label}" data-social="${name}" href="${S.social[name]}" class="bg-surface text-on-surface w-14 h-14 border-4 border-on-surface shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] flex items-center justify-center hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:scale-95"><svg fill="none" viewBox="0 0 24 24" width="26" height="26" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${svg}</svg></a>`;

        const footerLinks = S.footerLinks.map(l =>
            `<a class="font-label-bold text-label-bold text-surface-variant hover:text-tertiary-fixed transition-colors" href="${l.href}">${l.label}</a>`).join('');

        document.body.insertAdjacentHTML('beforeend', `
<footer class="bg-on-surface text-surface mt-16 border-t-4 border-on-surface p-panel-margin">
  <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
    <div class="flex items-center gap-4">
      <div class="bg-secondary p-2 border-2 border-white"><img src="${S.logo.src}" alt="${S.logo.alt}" class="h-10 w-10"/></div>
      <div>
        <h2 class="font-headline-sm text-headline-sm text-secondary uppercase">${S.footer.brand}</h2>
        <p class="font-label-bold text-label-bold text-surface-variant">${S.footer.tagline}</p>
      </div>
    </div>
    <div class="flex flex-wrap justify-center gap-6">${footerLinks}</div>
    <div class="font-label-bold text-label-bold text-center md:text-right">${S.footer.copyright}</div>
  </div>
  <div class="max-w-7xl mx-auto mt-10 pt-8 border-t-2 border-surface-variant flex flex-col items-center gap-4">
    <p class="font-label-bold text-label-bold uppercase text-surface-variant">Follow the hero</p>
    <div class="flex flex-wrap justify-center gap-4">
      ${socialIcon('instagram', 'Instagram', '<rect x="3" y="3" width="18" height="18" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"></circle>')}
      ${socialIcon('facebook', 'Facebook', '<path d="M15 3h-2.5a3.5 3.5 0 0 0-3.5 3.5V10H6v3h3v8h3v-8h2.5l.5-3H12V6.8c0-.6.4-.8 1-.8h2z"></path>')}
      ${socialIcon('youtube', 'YouTube', '<rect x="2.5" y="5.5" width="19" height="13" rx="4"></rect><path d="M10 9.5v5l4.5-2.5z" fill="currentColor"></path>')}
      ${socialIcon('tiktok', 'TikTok', '<path d="M9 10.5a4 4 0 1 0 4 4V3c.5 2.5 2.5 4.5 5 5"></path>')}
    </div>
  </div>
</footer>
<a href="/#shop" aria-label="Shop" class="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 bg-secondary text-on-secondary w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-on-surface shadow-[6px_6px_0px_0px_rgba(27,27,27,1)] flex items-center justify-center hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_rgba(27,27,27,1)] transition-all group">
  <span class="material-symbols-outlined text-3xl md:text-4xl group-hover:scale-125 transition-transform" style="font-variation-settings: 'FILL' 1;">shopping_bag</span>
</a>`);
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectRest);
    } else {
        injectRest();
    }
})();
