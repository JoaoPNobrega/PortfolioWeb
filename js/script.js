Vue.config.devtools = true;
Vue.component('card', {
  template: `
    <div class="card-wrap"
      @mousemove="handleMouseMove"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
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
  },
  props: ['dataImage', 'link'],
  data: () => ({
    width: 0,
    height: 0,
    mouseX: 0,
    mouseY: 0,
    mouseLeaveDelay: null
  }),
  computed: {
    mousePX() { return this.mouseX / this.width; },
    mousePY() { return this.mouseY / this.height; },
    cardStyle() {
      const rX = this.mousePX * 30;
      const rY = this.mousePY * -30;
      return { transform: `rotateY(${rX}deg) rotateX(${rY}deg)` };
    },
    cardBgTransform() {
      const tX = this.mousePX * -40;
      const tY = this.mousePY * -40;
      return { transform: `translateX(${tX}px) translateY(${tY}px)` }
    },
    cardBgImage() {
      return { backgroundImage: `url(${this.dataImage})` }
    }
  },
  methods: {
    handleMouseMove(e) {
      const rect = this.$refs.card.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left - (this.width / 2);
      this.mouseY = e.clientY - rect.top - (this.height / 2);
    },
    handleMouseEnter() { clearTimeout(this.mouseLeaveDelay); },
    handleMouseLeave() {
      this.mouseLeaveDelay = setTimeout(() => {
        this.mouseX = 0;
        this.mouseY = 0;
      }, 1000);
    }
  }
});

const app = new Vue({
  el: '#app'
});

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

            const targetSection = document.querySelector(link.getAttribute('href'));
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 120,
                    behavior: 'smooth'
                });
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