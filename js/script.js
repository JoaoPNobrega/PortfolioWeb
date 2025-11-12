/* =========
 * Cards 3D (estilo CodePen)
 * ========= */
Vue.config.devtools = true;
Vue.component('card', {
  template: `
    <div class="card-wrap"
      @mousemove="handleMouseMove"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      ref="wrap">
      <div class="card" ref="card" :style="cardStyle">
        <div class="card-bg" :style="[cardBgTransform, cardBgImage]"></div>
        <div class="card-glare"></div>
        <div class="card-info">
          <slot name="header"></slot>
          <p><slot name="content"></slot></p>
          <div class="project-links">
            <a :href="link" target="_blank" class="project-link">Ver no GitHub</a>
          </div>
        </div>
      </div>
    </div>`,
  props: ['dataImage', 'link'],
  data: () => ({
    w: 0,
    h: 0,
    mx: 0,
    my: 0,
    leaveTimer: null
  }),
  mounted() {
    const el = this.$refs.wrap;
    this.w = el.offsetWidth || 1;
    this.h = el.offsetHeight || 1;
    this.mx = this.w / 2;
    this.my = this.h / 2;
  },
  computed: {
    px() { return this.w ? this.mx / this.w : 0.5; },
    py() { return this.h ? this.my / this.h : 0.5; },
    cardStyle() {
      const rotY = (this.px - 0.5) * 20;
      const rotX = (0.5 - this.py) * 20;
      return {
        transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
        '--mx': `${(this.px * 100).toFixed(2)}%`,
        '--my': `${(this.py * 100).toFixed(2)}%`
      };
    },
    cardBgTransform() {
      const tx = (0.5 - this.px) * 40;
      const ty = (0.5 - this.py) * 40;
      return { transform: `translate(${tx}px, ${ty}px) scale(1.05)` };
    },
    cardBgImage() {
      return { backgroundImage: `url(${this.dataImage})` };
    }
  },
  methods: {
    handleMouseMove(e) {
      const r = this.$refs.wrap.getBoundingClientRect();
      this.mx = e.clientX - r.left;
      this.my = e.clientY - r.top;
    },
    handleMouseEnter() {
      clearTimeout(this.leaveTimer);
      this.$refs.card.classList.add('is-hovered');
    },
    handleMouseLeave() {
      this.$refs.card.classList.remove('is-hovered');
      this.leaveTimer = setTimeout(() => {
        this.mx = this.w / 2;
        this.my = this.h / 2;
      }, 300);
    }
  }
});

new Vue({ el: '#app' });

/* =========================================
 * Esfera de Tags responsiva (fiel ao CodePen)
 * ========================================= */
function setupTagSphere() {
  const oDiv = document.getElementById('tagsList');
  if (!oDiv) return;

  // parâmetros do pen
  let radius = 120;                 // agora recalculado por fitBox()
  const dtr = Math.PI / 180;
  const d = 300;
  const distr = true;
  const tspeed = 10;
  const size = 250;
  const howElliptical = 1;

  // garante transparência e alinhamento à direita
  oDiv.style.background = 'transparent';
  oDiv.style.margin = '0 0 0 auto';

  const aA = oDiv.getElementsByTagName('a');
  const mcList = [];
  let active = false;
  let lasta = 1;
  let lastb = 1;
  let mouseX = 0;
  let mouseY = 0;

  let sa = 0, ca = 1, sb = 0, cb = 1, sc = 0, cc = 1;

  // coleta dimensões iniciais
  for (let i = 0; i < aA.length; i++) {
    mcList.push({
      offsetWidth: aA[i].offsetWidth,
      offsetHeight: aA[i].offsetHeight,
      cx: 0, cy: 0, cz: 0,
      x: 0, y: 0, scale: 1, alpha: 1
    });
  }

  // dimensiona box e ajusta raio conforme o espaço disponível
  function fitBox() {
    const rect = oDiv.getBoundingClientRect();
    const s = Math.min(rect.width || 0, rect.height || rect.width || 0) || 0;
    radius = Math.max(80, s * 0.38); // escala agradável dentro do quadrado
  }

  fitBox();
  sineCosine(0, 0, 0);
  positionAll();

  // hover e movimento
  oDiv.addEventListener('mouseover', () => { active = true; });
  oDiv.addEventListener('mouseout',  () => { active = false; });

  oDiv.addEventListener('mousemove', (ev) => {
    const rect = oDiv.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX = ev.clientX - centerX;
    mouseY = ev.clientY - centerY;
    mouseX /= 5;
    mouseY /= 5;
  });

  // reencaixa em resize
  window.addEventListener('resize', () => {
    fitBox();
    positionAll();
  });

  const interval = setInterval(update, 30);

  function update() {
    let a, b;

    if (active) {
      a = (-Math.min(Math.max(-mouseY, -size), size) / radius) * tspeed;
      b = ( Math.min(Math.max(-mouseX, -size), size) / radius) * tspeed;
    } else {
      a = lasta * 0.98;
      b = lastb * 0.98;
    }

    lasta = a;
    lastb = b;

    if (Math.abs(a) <= 0.01 && Math.abs(b) <= 0.01) return;

    const c = 0;
    sineCosine(a, b, c);

    for (let j = 0; j < mcList.length; j++) {
      const rx1 = mcList[j].cx;
      const ry1 = mcList[j].cy * ca + mcList[j].cz * (-sa);
      const rz1 = mcList[j].cy * sa + mcList[j].cz * ca;

      const rx2 = rx1 * cb + rz1 * sb;
      const ry2 = ry1;
      const rz2 = rx1 * (-sb) + rz1 * cb;

      const rx3 = rx2 * cc + ry2 * (-sc);
      const ry3 = rx2 * sc + ry2 * cc;
      const rz3 = rz2;

      mcList[j].cx = rx3;
      mcList[j].cy = ry3;
      mcList[j].cz = rz3;

      const per = d / (d + rz3);

      mcList[j].x = (howElliptical * rx3 * per) - (howElliptical * 2);
      mcList[j].y = ry3 * per;
      mcList[j].scale = per;
      mcList[j].alpha = (per - 0.6) * (10 / 6);
    }

    doPosition();
    depthSort();
  }

  function depthSort() {
    // ordena âncoras pela profundidade copiada de mcList
    const order = aA.length;
    const idx = Array.from({ length: order }, (_, i) => i);
    idx.sort((i, j) => mcList[j].cz - mcList[i].cz);
    for (let z = 0; z < order; z++) {
      aA[idx[z]].style.zIndex = z;
    }
  }

  function positionAll() {
    let phi = 0;
    let theta = 0;
    const max = mcList.length;

    // randomiza como no original
    const aTmp = [];
    const frag = document.createDocumentFragment();
    for (let i = 0; i < aA.length; i++) aTmp.push(aA[i]);
    aTmp.sort(() => (Math.random() < 0.5 ? 1 : -1));
    for (let i = 0; i < aTmp.length; i++) frag.appendChild(aTmp[i]);
    oDiv.appendChild(frag);

    for (let i = 1; i < max + 1; i++) {
      if (distr) {
        phi = Math.acos(-1 + (2 * i - 1) / max);
        theta = Math.sqrt(max * Math.PI) * phi;
      } else {
        phi = Math.random() * Math.PI;
        theta = Math.random() * (2 * Math.PI);
      }
      mcList[i - 1].cx = radius * Math.cos(theta) * Math.sin(phi);
      mcList[i - 1].cy = radius * Math.sin(theta) * Math.sin(phi);
      mcList[i - 1].cz = radius * Math.cos(phi);

      aA[i - 1].style.left = (mcList[i - 1].cx + oDiv.offsetWidth / 2 - mcList[i - 1].offsetWidth / 2) + 'px';
      aA[i - 1].style.top  = (mcList[i - 1].cy + oDiv.offsetHeight / 2 - mcList[i - 1].offsetHeight / 2) + 'px';
      // copia cz para permitir ordenação se alguém ler do elemento
      aA[i - 1].cz = mcList[i - 1].cz;
    }
  }

  function doPosition() {
    const l = oDiv.offsetWidth / 2;
    const t = oDiv.offsetHeight / 2;
    for (let i = 0; i < mcList.length; i++) {
      aA[i].style.left = (mcList[i].cx + l - mcList[i].offsetWidth / 2) + 'px';
      aA[i].style.top  = (mcList[i].cy + t - mcList[i].offsetHeight / 2) + 'px';
      aA[i].style.fontSize = Math.ceil(12 * mcList[i].scale / 2) + 8 + 'px';
      aA[i].style.filter = 'alpha(opacity=' + (100 * mcList[i].alpha) + ')';
      aA[i].style.opacity = mcList[i].alpha;
      aA[i].cz = mcList[i].cz;
    }
  }

  function sineCosine(a, b, c) {
    sa = Math.sin(a * dtr);
    ca = Math.cos(a * dtr);
    sb = Math.sin(b * dtr);
    cb = Math.cos(b * dtr);
    sc = Math.sin(c * dtr);
    cc = Math.cos(c * dtr);
  }

  // limpeza defensiva
  const obs = new MutationObserver(() => {
    if (!document.body.contains(oDiv)) {
      clearInterval(interval);
      obs.disconnect();
    }
  });
  obs.observe(document.body, { childList: true, subtree: true });
}

/* =========================================
 * Navegação com pill e scroll suave
 * ========================================= */
function setupSwitcherNav() {
  const navContainer = document.querySelector('.switcher-nav');
  if (!navContainer) return;

  const navLinks = navContainer.querySelectorAll('.switcher__option');
  let previousActiveIndex = 1;

  const setActiveLink = (newActiveLink) => {
    if (!newActiveLink) return;
    const newIndex = parseInt(newActiveLink.getAttribute('data-nav-index'));
    const previousIndex = previousActiveIndex;
    if (newIndex === previousIndex) return;

    navContainer.setAttribute('data-pill-direction', newIndex > previousIndex ? 'forward' : 'backward');
    navLinks.forEach(l => l.classList.remove('active'));
    newActiveLink.classList.add('active');
    navContainer.setAttribute('data-active-index', newIndex);
    previousActiveIndex = newIndex;
  };

  const initialActiveLink = document.querySelector('.switcher__option.active');
  if (initialActiveLink) {
    previousActiveIndex = parseInt(initialActiveLink.getAttribute('data-nav-index'));
    navContainer.setAttribute('data-active-index', previousActiveIndex);
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      setActiveLink(link);
      const targetId = link.getAttribute('href');
      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        if (targetId === '#contact') {
          const body = document.body;
          const html = document.documentElement;
          const height = Math.max(
            body.scrollHeight, body.offsetHeight,
            html.clientHeight, html.scrollHeight, html.offsetHeight
          );
          window.scrollTo({ top: height, behavior: 'smooth' });
        } else {
          window.scrollTo({ top: targetSection.offsetTop - 120, behavior: 'smooth' });
        }
      }
    });
  });

  const sections = document.querySelectorAll('section[id]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const activeLink = document.querySelector(`.switcher__option[href="#${entry.target.id}"]`);
        setActiveLink(activeLink);
      }
    });
  }, { rootMargin: '-40% 0px -60% 0px' });

  sections.forEach(section => observer.observe(section));
}

/* =========================================
 * Popup do CV
 * ========================================= */
function setupCvPopup() {
  const cvIcon = document.getElementById('cv-icon');
  const cvPopup = document.getElementById('cv-popup');
  const popupContent = document.querySelector('.popup-content');
  const closeButton = document.querySelector('.close-btn');
  const minimizeButton = document.querySelector('.minimize-btn');
  const expandButton = document.querySelector('.expand-btn');

  if (!(cvIcon && cvPopup && popupContent && closeButton && minimizeButton && expandButton)) return;

  cvIcon.addEventListener('click', (event) => {
    event.preventDefault();
    popupContent.classList.remove('closing');
    cvPopup.classList.remove('maximized');
    cvPopup.style.display = 'flex';
  });

  closeButton.addEventListener('click', () => {
    cvPopup.style.display = 'none';
  });

  minimizeButton.addEventListener('click', () => {
    popupContent.classList.add('closing');
    popupContent.addEventListener('animationend', () => {
      cvPopup.style.display = 'none';
      popupContent.classList.remove('closing');
    }, { once: true });
  });

  expandButton.addEventListener('click', () => {
    cvPopup.classList.toggle('maximized');
  });

  cvPopup.addEventListener('click', (event) => {
    if (event.target === cvPopup) {
      cvPopup.style.display = 'none';
    }
  });
}

/* =========================================
 * Boot
 * ========================================= */
document.addEventListener('DOMContentLoaded', () => {
  setupSwitcherNav();
  setupCvPopup();
  setupTagSphere(); // esfera de tags
});
