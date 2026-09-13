/* ==========================================================================
   INTERLOOP LOGISTICS - CORE INTERACTIVITY & UI CONTROLLER
   ========================================================================== */

(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    initHeaderScroll();
    initMobileNav();
    initFaqAccordion();
    initScrollSpy();
    initCardQuoteTriggers();
    initIntentTriggers();
    initBackToTop();
    initScrollReveal();
    initTrackingSystem();
    initPortalModal();
    initAustraliaNetworkMap();
  });

  /* --------------------------------------------------------------------------
     Header Sticky State on Scroll
     -------------------------------------------------------------------------- */
  function initHeaderScroll() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 30) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  /* --------------------------------------------------------------------------
     Mobile Drawer Navigation
     -------------------------------------------------------------------------- */
  function initMobileNav() {
    const toggleBtn = document.querySelector('.mobile-menu-toggle');
    const drawer = document.querySelector('.mobile-nav-drawer');
    const backdrop = document.querySelector('.mobile-drawer-backdrop');
    const closeBtn = document.querySelector('.mobile-drawer-close');
    const navLinks = document.querySelectorAll('.mobile-nav-link');

    if (!toggleBtn || !drawer || !backdrop) return;

    function openDrawer() {
      drawer.classList.add('open');
      backdrop.classList.add('active');
      toggleBtn.classList.add('is-active');
      document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
      drawer.classList.remove('open');
      backdrop.classList.remove('active');
      toggleBtn.classList.remove('is-active');
      document.body.style.overflow = '';
    }

    toggleBtn.addEventListener('click', () => {
      if (drawer.classList.contains('open')) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });

    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    backdrop.addEventListener('click', closeDrawer);

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        closeDrawer();
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('open')) {
        closeDrawer();
      }
    });
  }

  /* --------------------------------------------------------------------------
     FAQ Accordion
     -------------------------------------------------------------------------- */
  function initFaqAccordion() {
    const faqCards = document.querySelectorAll('.faq-card');

    faqCards.forEach(card => {
      const btn = card.querySelector('.faq-question-btn');
      const panel = card.querySelector('.faq-answer-panel');

      if (!btn || !panel) return;

      btn.addEventListener('click', () => {
        const isActive = card.classList.contains('active');

        // Optional: close other open accordions for a clean single-item view
        faqCards.forEach(otherCard => {
          if (otherCard !== card) {
            otherCard.classList.remove('active');
            const otherBtn = otherCard.querySelector('.faq-question-btn');
            const otherPanel = otherCard.querySelector('.faq-answer-panel');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
            if (otherPanel) otherPanel.style.maxHeight = null;
          }
        });

        if (isActive) {
          card.classList.remove('active');
          btn.setAttribute('aria-expanded', 'false');
          panel.style.maxHeight = null;
        } else {
          card.classList.add('active');
          btn.setAttribute('aria-expanded', 'true');
          panel.style.maxHeight = panel.scrollHeight + 'px';
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
     ScrollSpy for Header Navigation Links
     -------------------------------------------------------------------------- */
  function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.desktop-nav .nav-link');

    if (!sections.length || !navLinks.length) return;

    window.addEventListener('scroll', () => {
      let currentSectionId = '';
      const scrollPos = window.scrollY + 120;

      sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          currentSectionId = section.getAttribute('id');
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSectionId}`) {
          link.classList.add('active');
        }
      });
    }, { passive: true });
  }

  /* --------------------------------------------------------------------------
     Connect Service Cards & Freight Chips directly into Quote Wizard
     -------------------------------------------------------------------------- */
  function initCardQuoteTriggers() {
    // Service cards "Enquire →"
    const serviceEnquireBtns = document.querySelectorAll('.service-enquire-btn');
    serviceEnquireBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const serviceName = btn.dataset.service;
        if (window.InterloopQuoteWizard && serviceName) {
          window.InterloopQuoteWizard.setFreightType(serviceName);
        } else {
          scrollToSection('quote-section');
        }
      });
    });

    // Freight Type Chips
    const freightChips = document.querySelectorAll('.freight-chip-card');
    freightChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const freightName = chip.dataset.freight;
        if (window.InterloopQuoteWizard && freightName) {
          window.InterloopQuoteWizard.setFreightType(freightName);
        } else {
          scrollToSection('quote-section');
        }
      });
    });
  }

  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) {
      const topOffset = el.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }
  }

  /* --------------------------------------------------------------------------
     Scroll Reveal Observer for Sections & Cards
     -------------------------------------------------------------------------- */
  function initScrollReveal() {
    // Respect user's motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const revealElements = document.querySelectorAll(
      '.service-card, .why-card, .step-card, .trust-stat-card, .industry-pill, .faq-card, .section-header, .cta-banner-content, .reveal'
    );

    if (!revealElements.length) return;

    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
      revealElements.forEach(el => el.classList.add('revealed'));
      return;
    }

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach((el, index) => {
      el.classList.add('reveal-init');
      revealObserver.observe(el);
    });
  }

  /* --------------------------------------------------------------------------
     Back to Top Button
     -------------------------------------------------------------------------- */
  function initBackToTop() {
    const backBtn = document.getElementById('backToTopBtn');
    if (backBtn) {
      backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  /* --------------------------------------------------------------------------
     Fast Intent Cards Triggers (Drivn-style pathways)
     -------------------------------------------------------------------------- */
  function initIntentTriggers() {
    const intentBtns = document.querySelectorAll('.intent-trigger');
    intentBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const service = btn.getAttribute('data-service');
        if (window.InterloopQuoteWizard && service) {
          window.InterloopQuoteWizard.setFreightType(service);
        }
        scrollToSection('quote-section');
        if (window.InterloopApp) {
          window.InterloopApp.showToast(`Selected "${service}" in Quote Engine`);
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
     Live Consignment Tracking & Sign-on-Glass POD (Drivn-style Feature)
     -------------------------------------------------------------------------- */
  function initTrackingSystem() {
    const trackingModal = document.getElementById('trackingModal');
    const openModalBtn = document.getElementById('openTrackModalBtn');
    const drawerTrackBtn = document.getElementById('drawerTrackBtn');
    const closeModalBtn = document.getElementById('closeTrackingModalBtn');
    const heroTrackForm = document.getElementById('heroTrackForm');
    const heroTrackInput = document.getElementById('heroTrackInput');
    const modalTrackInput = document.getElementById('modalTrackInput');
    const modalTrackBtn = document.getElementById('modalTrackBtn');
    const copyLinkBtn = document.getElementById('copyTrackLinkBtn');
    const printPodBtn = document.getElementById('printPodBtn');
    const quickTags = document.querySelectorAll('.quick-ref-tag');

    if (!trackingModal) return;

    const MOCK_DATA = {
      'IL-8821': {
        ref: 'IL-2026-8821',
        status: 'IN TRANSIT — HUME HWY',
        progress: 66,
        step1Time: '08:15 AM (Today)',
        step2Time: '10:30 AM (Today)',
        step3Time: 'Live GPS Active',
        step4Time: 'Est 04:30 PM (Today)',
        stepActive: 3,
        origin: 'Clayton South, Melbourne VIC Hub',
        dest: 'Moorebank Logistics Park, Sydney NSW',
        vehicle: 'Interstate B-Double (34-Pallet Linehaul #14)',
        cargo: '18 Standard Australian Pallets (Commercial Merchandise)',
        podStatus: 'PENDING ARRIVAL',
        podSigner: 'Receiving Dock Officer (Moorebank)',
        podTime: 'GPS Coords: -35.2809, 149.1300 (Approaching Hume Corridor)',
        podSig: 'Pending Delivery'
      },
      'IL-5012': {
        ref: 'IL-2026-5012',
        status: 'DELIVERED & POD SIGNED',
        progress: 100,
        step1Time: '07:00 AM (Today)',
        step2Time: '08:15 AM (Today)',
        step3Time: '10:45 AM (Today)',
        step4Time: '01:22 PM (Delivered)',
        stepActive: 4,
        origin: 'Dandenong South Distribution Depot',
        dest: 'Tullamarine Industrial Park, Melbourne VIC',
        vehicle: 'Dedicated Heavy Rigid (Tail-Lift Fleet #09)',
        cargo: '6 CHEP Pallets (Industrial Packaging Materials)',
        podStatus: 'COMPLETED & VERIFIED',
        podSigner: 'Marcus Chen (Warehouse Operations Mgr)',
        podTime: 'Delivered: 01:22 PM AEST • GPS: -37.7021, 144.8824',
        podSig: 'M. Chen'
      },
      'IL-9943': {
        ref: 'IL-2026-9943',
        status: 'DISPATCHED FROM HUB',
        progress: 40,
        step1Time: '11:00 AM (Today)',
        step2Time: '01:15 PM (Clayton Hub)',
        step3Time: 'En Route to Brisbane',
        step4Time: 'Est Tomorrow 09:00 AM',
        stepActive: 2,
        origin: 'Clayton South, Melbourne VIC Hub',
        dest: 'Port of Brisbane Logistics Hub, QLD',
        vehicle: 'Heavy Oversized Low-Loader (Unit #22)',
        cargo: 'Specialist Manufacturing Machinery (14.2 Tonnes)',
        podStatus: 'PRE-TRANSIT SCHEDULED',
        podSigner: 'Site Supervisor (Brisbane Quay)',
        podTime: 'Departed VIC Depot • GPS: -37.9318, 145.1215',
        podSig: 'Awaiting Arrival'
      }
    };

    function openModal() {
      trackingModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      trackingModal.classList.remove('open');
      document.body.style.overflow = '';
    }

    function renderTrackingData(query) {
      const cleanKey = (query || 'IL-8821').trim().toUpperCase();
      let key = 'IL-8821';
      if (cleanKey.includes('5012')) key = 'IL-5012';
      else if (cleanKey.includes('9943')) key = 'IL-9943';
      else if (cleanKey.includes('8821')) key = 'IL-8821';

      const data = MOCK_DATA[key] || {
        ref: cleanKey.startsWith('IL-') ? cleanKey : `IL-2026-${cleanKey}`,
        status: 'IN TRANSIT — EN ROUTE',
        progress: 60,
        step1Time: '08:00 AM (Today)',
        step2Time: '10:00 AM (Hub Departure)',
        step3Time: 'Live GPS Active',
        step4Time: 'Est Late Afternoon',
        stepActive: 3,
        origin: 'Melbourne VIC Operations Hub',
        dest: 'Regional Commercial Facility',
        vehicle: 'Commercial Linehaul Fleet Unit #08',
        cargo: 'Palletized B2B Consignment',
        podStatus: 'TRANSIT IN PROGRESS',
        podSigner: 'Designated Receiving Officer',
        podTime: 'Live Tracking Active • Hume Corridor',
        podSig: 'Pending Arrival'
      };

      // Populate DOM elements
      const refDisplay = document.getElementById('trackRefDisplay');
      const statusBadge = document.getElementById('trackStatusBadge');
      const statusText = document.getElementById('trackStatusText');
      const progressFill = document.getElementById('trackProgressFill');
      const originEl = document.getElementById('trackOrigin');
      const destEl = document.getElementById('trackDest');
      const vehicleEl = document.getElementById('trackVehicle');
      const cargoEl = document.getElementById('trackCargo');
      const podStatusTag = document.getElementById('podStatusTag');
      const podSignerName = document.getElementById('podSignerName');
      const podTimestamp = document.getElementById('podTimestamp');
      const podSignatureRender = document.getElementById('podSignatureRender');

      if (refDisplay) refDisplay.textContent = data.ref;
      if (statusText) statusText.textContent = data.status;
      if (originEl) originEl.textContent = data.origin;
      if (destEl) destEl.textContent = data.dest;
      if (vehicleEl) vehicleEl.textContent = data.vehicle;
      if (cargoEl) cargoEl.textContent = data.cargo;
      if (podStatusTag) podStatusTag.textContent = data.podStatus;
      if (podSignerName) podSignerName.textContent = data.podSigner;
      if (podTimestamp) podTimestamp.textContent = data.podTime;
      if (podSignatureRender) podSignatureRender.textContent = data.podSig;

      if (progressFill) {
        progressFill.style.width = `${data.progress}%`;
      }

      // Steps active/completed class update
      const steps = [
        document.getElementById('trackStep1'),
        document.getElementById('trackStep2'),
        document.getElementById('trackStep3'),
        document.getElementById('trackStep4')
      ];

      steps.forEach((stepEl, idx) => {
        if (!stepEl) return;
        stepEl.classList.remove('active', 'completed');
        const stepNum = idx + 1;
        if (stepNum < data.stepActive) {
          stepEl.classList.add('completed');
        } else if (stepNum === data.stepActive) {
          if (data.progress === 100) {
            stepEl.classList.add('completed');
          } else {
            stepEl.classList.add('active');
          }
        }
      });

      if (modalTrackInput) modalTrackInput.value = data.ref;
      if (heroTrackInput) heroTrackInput.value = data.ref;
    }

    if (openModalBtn) {
      openModalBtn.addEventListener('click', () => {
        renderTrackingData(heroTrackInput ? heroTrackInput.value : 'IL-8821');
        openModal();
      });
    }

    if (drawerTrackBtn) {
      drawerTrackBtn.addEventListener('click', () => {
        const drawer = document.querySelector('.mobile-nav-drawer');
        const backdrop = document.querySelector('.mobile-drawer-backdrop');
        if (drawer) drawer.classList.remove('open');
        if (backdrop) backdrop.classList.remove('active');
        renderTrackingData('IL-8821');
        openModal();
      });
    }

    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', closeModal);
    }

    trackingModal.addEventListener('click', (e) => {
      if (e.target === trackingModal) closeModal();
    });

    if (heroTrackForm) {
      heroTrackForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const val = heroTrackInput ? heroTrackInput.value : 'IL-8821';
        renderTrackingData(val);
        openModal();
      });
    }

    if (modalTrackBtn) {
      modalTrackBtn.addEventListener('click', () => {
        const val = modalTrackInput ? modalTrackInput.value : 'IL-8821';
        renderTrackingData(val);
      });
    }

    if (modalTrackInput) {
      modalTrackInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          renderTrackingData(modalTrackInput.value);
        }
      });
    }

    quickTags.forEach(tag => {
      tag.addEventListener('click', () => {
        const ref = tag.getAttribute('data-ref');
        renderTrackingData(ref);
        openModal();
      });
    });

    if (copyLinkBtn) {
      copyLinkBtn.addEventListener('click', () => {
        const ref = modalTrackInput ? modalTrackInput.value : 'IL-8821';
        const url = `${window.location.origin}${window.location.pathname}?track=${encodeURIComponent(ref)}`;
        navigator.clipboard.writeText(url).then(() => {
          if (window.InterloopApp) window.InterloopApp.showToast(`Tracking link for ${ref} copied to clipboard!`);
        }).catch(() => {
          if (window.InterloopApp) window.InterloopApp.showToast(`Reference ${ref} ready to share.`);
        });
      });
    }

    if (printPodBtn) {
      printPodBtn.addEventListener('click', () => {
        window.print();
      });
    }

    // Check URL parameters for direct track link (e.g. ?track=IL-8821)
    const urlParams = new URLSearchParams(window.location.search);
    const trackParam = urlParams.get('track');
    if (trackParam) {
      renderTrackingData(trackParam);
      openModal();
    }
  }

  /* --------------------------------------------------------------------------
     Operations Portal Modal System (Client & Driver)
     -------------------------------------------------------------------------- */
  function initPortalModal() {
    const portalModal = document.getElementById('portalModal');
    const openPortalBtn = document.getElementById('openPortalModalBtn');
    const drawerPortalBtn = document.getElementById('drawerPortalBtn');
    const closePortalBtn = document.getElementById('closePortalModalBtn');
    const tabClient = document.getElementById('tabClientPortal');
    const tabDriver = document.getElementById('tabDriverPortal');
    const clientPane = document.getElementById('clientPortalPane');
    const driverPane = document.getElementById('driverPortalPane');
    const clientLoginBtn = document.getElementById('clientLoginBtn');
    const driverLoginBtn = document.getElementById('driverLoginBtn');

    if (!portalModal) return;

    function openPortal() {
      portalModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closePortal() {
      portalModal.classList.remove('open');
      document.body.style.overflow = '';
    }

    if (openPortalBtn) openPortalBtn.addEventListener('click', openPortal);
    if (drawerPortalBtn) {
      drawerPortalBtn.addEventListener('click', () => {
        const drawer = document.querySelector('.mobile-nav-drawer');
        const backdrop = document.querySelector('.mobile-drawer-backdrop');
        if (drawer) drawer.classList.remove('open');
        if (backdrop) backdrop.classList.remove('active');
        openPortal();
      });
    }
    if (closePortalBtn) closePortalBtn.addEventListener('click', closePortal);

    portalModal.addEventListener('click', (e) => {
      if (e.target === portalModal) closePortal();
    });

    if (tabClient && tabDriver) {
      tabClient.addEventListener('click', () => {
        tabClient.style.background = 'var(--color-emerald)';
        tabClient.style.color = '#FFFFFF';
        tabDriver.style.background = 'transparent';
        tabDriver.style.color = '#A4BFB7';
        if (clientPane) clientPane.style.display = 'block';
        if (driverPane) driverPane.style.display = 'none';
      });

      tabDriver.addEventListener('click', () => {
        tabDriver.style.background = 'var(--color-emerald)';
        tabDriver.style.color = '#FFFFFF';
        tabClient.style.background = 'transparent';
        tabClient.style.color = '#A4BFB7';
        if (driverPane) driverPane.style.display = 'block';
        if (clientPane) clientPane.style.display = 'none';
      });
    }

    if (clientLoginBtn) {
      clientLoginBtn.addEventListener('click', () => {
        closePortal();
        if (window.InterloopApp) {
          window.InterloopApp.showToast('Enterprise Client Portal: Demo access granted. Live consignments active.');
        }
      });
    }

    if (driverLoginBtn) {
      driverLoginBtn.addEventListener('click', () => {
        closePortal();
        if (window.InterloopApp) {
          window.InterloopApp.showToast('Driver Operations App: Pre-departure checklist verified. Run active.');
        }
      });
    }
  }

  /* --------------------------------------------------------------------------
     Australia Network Map Controller (View Switcher & State Coverage HUD)
     -------------------------------------------------------------------------- */
  function initAustraliaNetworkMap() {
    const switcherBtns = document.querySelectorAll('.map-view-btn');
    const mapImg = document.getElementById('activeNetworkMapImg');
    const statePills = document.querySelectorAll('.state-coverage-pill');

    const stateData = {
      vic: {
        title: 'VIC — Victoria (Melbourne Head Office)',
        badge: 'HQ & Central Operations Command',
        node: '709 Heatherton Rd, Clayton South VIC 3169',
        corridor: 'Hume Hwy (Sydney), Western Hwy (Adelaide), Princes Hwy',
        transit: 'Melbourne Metro Same-Day · 24/7 Linehaul Dispatch Hub',
        fleet: 'B-Double, Tautliners, Mezzanine Decks, Tail-Lifts',
        indicator: '#18C58B'
      },
      nsw: {
        title: 'NSW — New South Wales (Sydney Hub)',
        badge: 'Daily Scheduled East Coast Linehaul',
        node: 'Sydney Metro, Moorebank & Western Distribution Hubs',
        corridor: 'M31 Hume Motorway, Pacific Hwy (Brisbane Link)',
        transit: 'Next-Day Linehaul from Melbourne (10–12 hrs overnight)',
        fleet: 'Direct Linehaul, Rigid Curtainsiders, Tail-Lift Dock Delivery',
        indicator: '#EC4899'
      },
      qld: {
        title: 'QLD — Queensland (Brisbane Hub)',
        badge: 'East Coast Interstate Route',
        node: 'Brisbane Freight Precinct, Acacia Ridge & Coastal Corridors',
        corridor: 'Pacific Highway, Bruce Highway Northbound',
        transit: '24 to 36 hours from Melbourne / Next-day from Sydney',
        fleet: 'B-Double Sets, Heavy Semi-Trailers, Pallet Distribution',
        indicator: '#F59E0B'
      },
      sa: {
        title: 'SA — South Australia (Adelaide Hub)',
        badge: 'Western Gateway Corridor',
        node: 'Adelaide Transport Precinct, Wingfield & Regency Park',
        corridor: 'Western Highway (A8 / M8), Sturt Highway Linehaul',
        transit: 'Next-Day Scheduled Linehaul (8–10 hrs from Melbourne)',
        fleet: 'High-Volume FTL & LTL Palletised Linehaul Combinations',
        indicator: '#06B6D4'
      },
      wa: {
        title: 'WA — Western Australia (Perth Hub)',
        badge: 'Trans-Continental Linehaul',
        node: 'Perth Kewdale Logistics Hub & Hazelmere Industrial',
        corridor: 'Eyre Highway across Nullarbor / Trans-Australian Highway',
        transit: '4 to 5 Days Scheduled Cross-Country Freight',
        fleet: 'Heavy Road-Trains, Dedicated FTL, Heavy Machinery Floats',
        indicator: '#A855F7'
      },
      nt: {
        title: 'NT — Northern Territory (Darwin Hub)',
        badge: 'Central Continental Corridor',
        node: 'Darwin Port & Berrimah Multi-Modal Terminal',
        corridor: 'Stuart Highway Northbound via Alice Springs & Katherine',
        transit: '4 to 5 Days Scheduled Northern Transit',
        fleet: 'Climate-Rated Road Trains, Machinery & Outsized Transport',
        indicator: '#22C55E'
      },
      act: {
        title: 'ACT — Australian Capital Territory (Canberra)',
        badge: 'Federal Capital Direct Corridor',
        node: 'Canberra Fyshwick & Hume Logistics Hub',
        corridor: 'Federal Highway / Hume Motorway Link via Goulburn',
        transit: 'Next-Day Morning Delivery from Melbourne or Sydney',
        fleet: 'Commercial Freight, Tail-Lift Vehicles, Secure Dock Loading',
        indicator: '#00E5FF'
      },
      tas: {
        title: 'TAS — Tasmania (Hobart & Launceston)',
        badge: 'Bass Strait Sea-Link',
        node: 'Hobart & Devonport Logistics Terminals',
        corridor: 'Direct Roll-on/Roll-off (RoRo) Bass Strait Ferry Link',
        transit: '2 to 3 Business Days Port-to-Door Service',
        fleet: 'Containerised & Flat-Rack Transport, Pallet Staging',
        indicator: '#38BDF8'
      }
    };

    // State Pills interactivity & HUD update
    statePills.forEach(pill => {
      pill.addEventListener('click', () => {
        const stateKey = pill.getAttribute('data-state');
        if (!stateKey || !stateData[stateKey]) return;

        statePills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        updateHud(stateData[stateKey]);
      });

      pill.addEventListener('mouseenter', () => {
        const stateKey = pill.getAttribute('data-state');
        if (stateKey && stateData[stateKey]) {
          updateHud(stateData[stateKey]);
        }
      });
    });

    function updateHud(info) {
      const titleEl = document.getElementById('hudStateTitle');
      const badgeEl = document.getElementById('hudStateBadge');
      const nodeEl = document.getElementById('hudStateNode');
      const corridorEl = document.getElementById('hudStateCorridor');
      const transitEl = document.getElementById('hudStateTransit');
      const fleetEl = document.getElementById('hudStateFleet');

      if (titleEl) {
        titleEl.innerHTML = `
          <span class="state-indicator" style="background: ${info.indicator}; box-shadow: 0 0 10px ${info.indicator};"></span>
          <span>${info.title}</span>
        `;
      }
      if (badgeEl) badgeEl.textContent = info.badge;
      if (nodeEl) nodeEl.textContent = info.node;
      if (corridorEl) corridorEl.textContent = info.corridor;
      if (transitEl) transitEl.textContent = info.transit;
      if (fleetEl) fleetEl.textContent = info.fleet;
    }
  }

  /* --------------------------------------------------------------------------
     Global Toast System
     -------------------------------------------------------------------------- */
  window.InterloopApp = {
    showToast: function(message) {
      let toastContainer = document.querySelector('.toast-container');
      if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
      }

      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#18C58B" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        <span>${message}</span>
      `;

      toastContainer.appendChild(toast);
      requestAnimationFrame(() => toast.classList.add('show'));

      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
      }, 4500);
    }
  };

})();
