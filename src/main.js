import './style.css';
import { initBackground } from './background.js';

window.__bullfyLoadStartedAt = performance.now();
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

document.addEventListener('DOMContentLoaded', () => {
  if (!window.location.hash) {
    window.scrollTo(0, 0);
  }

  initBackground();

  const loadScrollExperience = () => {
    import('./scrollExperience.js').then(({ initScrollExperience }) => {
      initScrollExperience();
    }).catch(() => {
      document.body.classList.remove('is-loading');
      document.body.classList.add('hero-content-ready');
    });
  };

  window.requestAnimationFrame(loadScrollExperience);

  // Populate Market Ticker matching the new format
  const tickerTrack = document.querySelector('.ticker-track');
  const marketData = [
    { sym: 'BTCUSD', price: '77,456.00', changeRaw: '+699.00', changePct: '+0.91%', pos: true },
    { sym: 'XAUUSD', price: '4,537.21', changeRaw: '+55.02', changePct: '+1.23%', pos: true },
    { sym: 'US100 CFD', price: '29,256.00', changeRaw: '+148.0', changePct: '+0.52%', pos: true },
    { sym: 'ETHUSD', price: '3,842.10', changeRaw: '-12.50', changePct: '-0.32%', pos: false },
    { sym: 'EURUSD', price: '1.0945', changeRaw: '+0.0015', changePct: '+0.14%', pos: true },
  ];

  const createTickerItems = () => {
    let html = '';
    marketData.forEach(item => {
      const changeClass = item.pos ? 'positive' : 'negative';
      html += `
        <div class="ticker-item">
          <span class="symbol">${item.sym}</span>
          <span class="price">${item.price}</span>
          <span class="change ${changeClass}">${item.changeRaw} (${item.changePct})</span>
        </div>
      `;
    });
    return html;
  };

  if (tickerTrack) {
    tickerTrack.innerHTML = createTickerItems() + createTickerItems();
  }

  // Testimonials Carousel Logic
  const track = document.getElementById('testimonials-track');
  const dotsContainer = document.getElementById('testimonial-dots');

  if (track && dotsContainer) {
    const cards = Array.from(track.querySelectorAll('.testimonial-card'));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let activeIndex = 0;
    let autoplayId;

    const dots = cards.map((_, index) => {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot';
      dot.type = 'button';
      dot.setAttribute('aria-label', `Show testimonial ${index + 1}`);
      dotsContainer.appendChild(dot);
      return dot;
    });

    const getStep = () => {
      const firstCard = cards[0];
      if (!firstCard) return 0;
      const styles = window.getComputedStyle(track);
      const gap = parseFloat(styles.columnGap || styles.gap) || 0;
      return firstCard.getBoundingClientRect().width + gap;
    };

    const goToTestimonial = (index) => {
      activeIndex = (index + cards.length) % cards.length;
      track.style.transform = `translateX(${-activeIndex * getStep()}px)`;

      cards.forEach((card, cardIndex) => {
        const isActive = cardIndex === activeIndex;
        card.classList.toggle('active', isActive);
        card.setAttribute('aria-hidden', String(!isActive));
      });

      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('active', dotIndex === activeIndex);
        dot.setAttribute('aria-current', dotIndex === activeIndex ? 'true' : 'false');
      });
    };

    const stopAutoplay = () => {
      window.clearInterval(autoplayId);
    };

    const startAutoplay = () => {
      if (reduceMotion || cards.length < 2) return;
      stopAutoplay();
      autoplayId = window.setInterval(() => {
        goToTestimonial(activeIndex + 1);
      }, 4500);
    };

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        goToTestimonial(index);
        startAutoplay();
      });
    });

    track.addEventListener('mouseenter', stopAutoplay);
    track.addEventListener('mouseleave', startAutoplay);
    track.addEventListener('focusin', stopAutoplay);
    track.addEventListener('focusout', startAutoplay);
    window.addEventListener('resize', () => goToTestimonial(activeIndex));

    goToTestimonial(0);
    startAutoplay();
  }

  // --- Prop Firm Plans Interaction ---
  const propSection = document.getElementById('prop');
  if (propSection) {
    const propTabs = propSection.querySelectorAll('.tabs-container .tab-btn');
    const propSizes = propSection.querySelectorAll('.account-size-selector .size-btn');
    
    // Elements to update
    const sizeDisplay = propSection.querySelector('.plan-col-1 .metric-value');
    const priceDisplay = propSection.querySelector('.plan-price');
    const splitDisplay = propSection.querySelectorAll('.plan-col-2 .metric-value')[0];
    const maxDdDisplay = propSection.querySelectorAll('.plan-col-2 .metric-value')[1];
    const dailyDdDisplay = propSection.querySelectorAll('.plan-col-2 .metric-value')[2];
    const listValues = propSection.querySelectorAll('.plan-list-item .item-value');
    const phasesDisplay = listValues[0];
    const levDisplay = listValues[4];

    // Data
    const propPlans = {
      'One Phase': { split: '80%', maxDd: '6%', dailyDd: '3%', phases: '1', lev: '1:30' },
      'Two Phases': { split: '80%', maxDd: '10%', dailyDd: '5%', phases: '2', lev: '1:100' },
      'Instant Funding': { split: '70%', maxDd: '6%', dailyDd: '3%', phases: 'N/A', lev: '1:30' }
    };
    const propPrices = {
      'One Phase': { '$500': '$35', '$1,000': '$60', '$5,000': '$150', '$10,000': '$250', '$25,000': '$450', '$50,000': '$850' },
      'Two Phases': { '$500': '$25', '$1,000': '$40', '$5,000': '$100', '$10,000': '$180', '$25,000': '$350', '$50,000': '$600' },
      'Instant Funding': { '$500': '$70', '$1,000': '$120', '$5,000': '$300', '$10,000': '$500', '$25,000': '$1,200', '$50,000': '$3,700' }
    };

    let currentPropTab = 'Instant Funding';
    let currentPropSize = '$50,000';

    const updatePropUI = () => {
      const plan = propPlans[currentPropTab];
      const price = propPrices[currentPropTab][currentPropSize];

      const card = propSection.querySelector('.plan-card');
      const textElements = [sizeDisplay, priceDisplay, splitDisplay, maxDdDisplay, dailyDdDisplay, phasesDisplay, levDisplay];
      
      // Remove classes to trigger reflow
      card.classList.remove('anim-crazy-card');
      textElements.forEach(el => el.classList.remove('anim-crazy-text'));
      
      // Force reflow
      void card.offsetWidth;
      
      // Update values
      sizeDisplay.textContent = currentPropSize;
      priceDisplay.textContent = 'Price: ' + price;
      splitDisplay.textContent = plan.split;
      maxDdDisplay.textContent = plan.maxDd;
      dailyDdDisplay.textContent = plan.dailyDd;
      phasesDisplay.textContent = plan.phases;
      levDisplay.textContent = plan.lev;
      
      // Add animation classes
      card.classList.add('anim-crazy-card');
      textElements.forEach(el => el.classList.add('anim-crazy-text'));
    };

    propTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        propTabs.forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        currentPropTab = e.target.textContent.trim();
        updatePropUI();
      });
    });

    propSizes.forEach(btn => {
      btn.addEventListener('click', (e) => {
        propSizes.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentPropSize = e.target.textContent.trim();
        updatePropUI();
      });
    });
  }

  // --- Social Trading Interaction ---
  const socialSection = document.getElementById('social');
  if (socialSection) {
    const socialTabs = socialSection.querySelectorAll('.social-tabs .tab-btn');
    const titleDisplay = socialSection.querySelector('.social-card-title');
    const descDisplay = socialSection.querySelector('.social-card-desc');
    const minDepDisplay = socialSection.querySelector('.min-deposit-value');

    const socialData = {
      'PAMM': {
        title: 'PAMM (Percentage Allocation<br>Management Module)',
        desc: 'A professional trader manages a pooled account using their own strategy, and profits or losses are automatically shared with investors based on their contribution.',
        minDep: '$100'
      },
      'MAM': {
        title: 'MAM (Multi-Account<br>Manager)',
        desc: 'Assign specific risk parameters and multipliers to your account while following a master trader. You have full control over your lot sizes and risk exposure.',
        minDep: '$500'
      },
      'Copy Trading': {
        title: 'Automated<br>Copy Trading',
        desc: 'Browse through top-performing traders, analyze their track records, and mirror their trades automatically into your own account in real time.',
        minDep: '$50'
      }
    };

    socialTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        socialTabs.forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        
        const key = e.target.textContent.trim();
        const data = socialData[key];

        const leftCard = socialSection.querySelector('.social-card-left');
        const textElements = [titleDisplay, descDisplay, minDepDisplay];
        
        leftCard.classList.remove('anim-crazy-card');
        textElements.forEach(el => el.classList.remove('anim-crazy-text'));

        void leftCard.offsetWidth;

        titleDisplay.innerHTML = data.title;
        descDisplay.textContent = data.desc;
        minDepDisplay.textContent = data.minDep;

        leftCard.classList.add('anim-crazy-card');
        textElements.forEach(el => el.classList.add('anim-crazy-text'));
      });
    });
  }

});
