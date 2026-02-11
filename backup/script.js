

// ========================================
// LOADING SCREEN
// ========================================
window.addEventListener('load', () => {
    const loadingScreen = document.querySelector('.loading-screen');
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
    }, 2000);
});

// ========================================
// SCROLL PROGRESS BAR
// ========================================
window.addEventListener('scroll', () => {
    const scrollProgress = document.querySelector('.scroll-progress-bar');
    const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    scrollProgress.style.transform = `scaleX(${scrollPercentage / 100})`;
});

// ========================================
// NAVBAR SCROLL EFFECT
// ========================================
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
});

// ========================================
// MOBILE MENU
// ========================================
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const mobileMenu = document.getElementById('mobileMenu');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        mobileMenuToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close on link click
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

// ========================================
// SMOOTH SCROLL
// ========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href !== '#join' && href !== '#apply') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const offsetTop = target.offsetTop - 90;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// ========================================
// ACTIVE NAV LINK
// ========================================
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// ========================================
// PARALLAX EFFECT
// ========================================
const heroBg = document.querySelector('.hero-bg');

window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    if (heroBg && scrolled < window.innerHeight) {
        heroBg.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// ========================================
// PARTICLES ANIMATION
// ========================================
const canvas = document.getElementById('particlesCanvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 50;

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 2 + 0.5;
            this.opacity = Math.random() * 0.5 + 0.2;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
                this.reset();
            }
        }

        draw() {
            ctx.fillStyle = `rgba(3, 92, 107, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// ========================================
// COUNTER ANIMATION
// ========================================
const counters = document.querySelectorAll('.stat-number');
let counterActivated = false;

function animateCounters() {
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };

        updateCounter();
    });
}

window.addEventListener('scroll', () => {
    if (!counterActivated) {
        const heroStats = document.querySelector('.hero-stats');
        if (heroStats) {
            const rect = heroStats.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                animateCounters();
                counterActivated = true;
            }
        }
    }
});

// ========================================
// TYPING EFFECT (Optional)
// ========================================
// Uncomment if you want typing effect
/*
const typingText = document.getElementById('typingText');
if (typingText) {
    const text = typingText.textContent;
    typingText.textContent = '';
    let i = 0;

    setTimeout(() => {
        const type = () => {
            if (i < text.length) {
                typingText.textContent += text.charAt(i);
                i++;
                setTimeout(type, 50);
            }
        };
        type();
    }, 1500);
}
*/

// ========================================
// 3D TILT EFFECT
// ========================================
const tiltElements = document.querySelectorAll('[data-tilt]');

tiltElements.forEach(element => {
    element.addEventListener('mousemove', (e) => {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;

        element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
    });

    element.addEventListener('mouseleave', () => {
        element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
});

// ========================================
// VACANCY FILTER
// ========================================
const filterBtns = document.querySelectorAll('.filter-btn');
const vacancyItems = document.querySelectorAll('.v-item');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');

        vacancyItems.forEach(item => {
            if (filter === 'all') {
                item.style.display = 'block';
            } else {
                const categories = item.getAttribute('data-category');
                if (categories && categories.includes(filter)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            }
        });

        // Update total count
        const visibleCount = Array.from(vacancyItems).filter(item => item.style.display !== 'none').length;
        const totalVacancies = document.getElementById('totalVacancies');
        if (totalVacancies) {
            totalVacancies.textContent = visibleCount;
        }
    });
});

// ========================================
// VACANCY TOGGLE
// ========================================
function toggleVacancy(element) {
    const item = element.parentElement;

    if (item.classList.contains('active')) {
        item.classList.remove('active');
    } else {
        document.querySelectorAll('.v-item').forEach(el => el.classList.remove('active'));
        item.classList.add('active');
    }
}

// ========================================
// REVIEWS CAROUSEL
// ========================================
const reviewsTrack = document.getElementById('reviewsTrack');
const reviewPrev = document.getElementById('reviewPrev');
const reviewNext = document.getElementById('reviewNext');
const reviewDotsContainer = document.getElementById('reviewDots');

if (reviewsTrack) {
    const reviewCards = reviewsTrack.querySelectorAll('.review-card');
    const totalReviews = reviewCards.length;
    let currentReview = 0;

    // Create dots
    for (let i = 0; i < totalReviews; i++) {
        const dot = document.createElement('div');
        dot.classList.add('carousel-dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToReview(i));
        reviewDotsContainer.appendChild(dot);
    }

    const dots = document.querySelectorAll('.carousel-dot');

    function updateCarousel() {
        reviewsTrack.style.transform = `translateX(-${currentReview * 100}%)`;
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentReview);
        });
    }

    function goToReview(index) {
        currentReview = index;
        updateCarousel();
    }

    reviewPrev.addEventListener('click', () => {
        currentReview = (currentReview - 1 + totalReviews) % totalReviews;
        updateCarousel();
    });

    reviewNext.addEventListener('click', () => {
        currentReview = (currentReview + 1) % totalReviews;
        updateCarousel();
    });

    // Auto-play
    setInterval(() => {
        currentReview = (currentReview + 1) % totalReviews;
        updateCarousel();
    }, 8000);
}

// ========================================
// LIGHTBOX
// ========================================
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxTriggers = document.querySelectorAll('[data-lightbox]');

lightboxTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
        const img = trigger.querySelector('img');
        if (img) {
            lightboxImage.src = img.src;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    });
});

if (lightboxClose) {
    lightboxClose.addEventListener('click', () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    });
}

if (lightbox) {
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// ========================================
// FADE-IN SECTIONS
// ========================================
const fadeInSections = document.querySelectorAll('.fade-in-section');

const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
        }
    });
}, {
    threshold: 0.1
});

fadeInSections.forEach(section => {
    fadeInObserver.observe(section);
});

// ========================================
// CONTACT FORM
// ========================================
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);

        console.log('Form submitted:', data);

        // Here you would typically send data to a server
        // For now, just show a success message
        alert('Дякуємо за вашу заявку! Ми зв\'яжемося з вами найближчим часом.');

        contactForm.reset();
    });
}

// ========================================
// PERFORMANCE OPTIMIZATION
// ========================================
// Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debounce to heavy scroll operations
const debouncedScroll = debounce(() => {
    // Any heavy operations on scroll can go here
}, 10);

window.addEventListener('scroll', debouncedScroll);

// ========================================
// CONSOLE MESSAGE
// ========================================
console.log('%c36 ОБрМП - SEMPER FIDELIS', 'color: #035C6B; font-size: 24px; font-weight: bold;');
console.log('%cСлава Україні! 🇺🇦', 'color: #c5a059; font-size: 16px;');