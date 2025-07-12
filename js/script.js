Vue.config.devtools = true;
Vue.component('card', {
  template: `
    <div class="card-wrap"
      @mousemove="handleMouseMove"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      @touchstart.once="requestMotionPermission" 
      ref="card">
      <div class="card"
        :style="cardStyle">
        <div class="card-bg" :style="[cardBgTransform, cardBgImage]"></div>
        <div class="card-info">
          <slot name="header"></slot>
          <p><slot name="content"></slot></p> 
          <div class="project-links">
            <a :href="link" target="_blank" class="project-link">Ver no GitHub</a>
          </div>
        </div>
      </div>
    </div>`,
  mounted() {
    this.width = this.$refs.card.offsetWidth;
    this.height = this.$refs.card.offsetHeight;
    
    // Verifica se o dispositivo suporta os eventos de orientação.
    if (window.DeviceOrientationEvent) {
      this.isMobile = true;
      // Para dispositivos Android que não precisam de um pedido de permissão.
      window.addEventListener('deviceorientation', this.handleOrientation, true);
    }
  },
  props: ['dataImage', 'link'],
  data: () => ({
    width: 0,
    height: 0,
    mouseX: 0,
    mouseY: 0,
    isMobile: false,
    gamma: 0, // Eixo Esquerda/Direita
    beta: 0,  // Eixo Frente/Trás
    mouseLeaveDelay: null
  }),
  computed: {
    mousePX() { return this.mouseX / this.width; },
    mousePY() { return this.mouseY / this.height; },
    cardStyle() {
      // Se for mobile, usa os dados do giroscópio.
      if (this.isMobile) {
        // Mapeia os ângulos do giroscópio para a rotação do cartão.
        const rX = this.beta * -1;
        const rY = this.gamma;
        return { transform: `rotateY(${rY}deg) rotateX(${rX}deg)` };
      }
      // Se for desktop, mantém a lógica do rato.
      const rX = this.mousePX * 30;
      const rY = this.mousePY * -30;
      return { transform: `rotateY(${rX}deg) rotateX(${rY}deg)` };
    },
    cardBgTransform() {
      if (this.isMobile) {
        const tX = this.gamma * -1.5;
        const tY = this.beta * -1.5;
        return { transform: `translateX(${tX}px) translateY(${tY}px)` };
      }
      const tX = this.mousePX * -40;
      const tY = this.mousePY * -40;
      return { transform: `translateX(${tX}px) translateY(${tY}px)` }
    },
    cardBgImage() {
      return { backgroundImage: `url(${this.dataImage})` }
    }
  },
  methods: {
    // --- LÓGICA DO RATO (PARA DESKTOP) ---
    handleMouseMove(e) {
      if (this.isMobile) return;
      const rect = this.$refs.card.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left - (this.width / 2);
      this.mouseY = e.clientY - rect.top - (this.height / 2);
    },
    handleMouseEnter() { if (this.isMobile) return; clearTimeout(this.mouseLeaveDelay); },
    handleMouseLeave() {
      if (this.isMobile) return;
      this.mouseLeaveDelay = setTimeout(() => {
        this.mouseX = 0;
        this.mouseY = 0;
      }, 1000);
    },
    // --- LÓGICA DO GIROSCÓPIO (PARA MOBILE) ---
    requestMotionPermission() {
      // Função específica para iOS 13+ que exige um pedido de permissão explícito.
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
          .then(permissionState => {
            if (permissionState === 'granted') {
              window.addEventListener('deviceorientation', this.handleOrientation, true);
            }
          })
          .catch(console.error);
      }
    },
    handleOrientation(event) {
      // Limita os ângulos para evitar movimentos muito bruscos.
      // Gamma (esquerda/direita) -> limitado a ±30 graus
      // Beta (frente/trás) -> limitado a ±30 graus
      this.gamma = Math.max(-30, Math.min(30, event.gamma));
      this.beta = Math.max(-30, Math.min(30, event.beta));
    }
  }
});

const app = new Vue({
  el: '#app'
});

// A sua lógica de navegação permanece exatamente igual.
document.addEventListener('DOMContentLoaded', () => {
    const navContainer = document.querySelector('.switcher-nav');
    if (!navContainer) return;

    const navLinks = navContainer.querySelectorAll('.switcher__option');
    let previousActiveIndex = 1;

    const setActiveLink = (newActiveLink) => {
        if (!newActiveLink) return;
        const newIndex = parseInt(newActiveLink.getAttribute('data-nav-index'));
        const previousIndex = previousActiveIndex;
        if (newIndex === previousIndex) return;
        if (newIndex > previousIndex) {
            navContainer.setAttribute('data-pill-direction', 'forward');
        } else {
            navContainer.setAttribute('data-pill-direction', 'backward');
        }
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
                    window.scrollTo({
                        top: document.body.scrollHeight,
                        behavior: 'smooth'
                    });
                } else {
                    window.scrollTo({
                        top: targetSection.offsetTop - 120,
                        behavior: 'smooth'
                    });
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

    sections.forEach(section => {
        observer.observe(section);
    });
});
