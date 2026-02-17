// ===================================
// CONFIG
// ===================================
const VACANCIES_URL = 'vacancies.json';
const ITEMS_PER_PAGE = 6;

// STATE
let allVacancies = [];
let filteredVacancies = [];
let visibleCount = ITEMS_PER_PAGE;
let activeTags = new Set();

// DOM ELEMENTS
// DOM ELEMENTS
const vacancyGrid = document.getElementById('vacancyGrid');
const tagFiltersContainer = document.getElementById('tagFilters');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const allFilterBtn = document.querySelector('.all-btn');

// ===================================
// LOADER
// ===================================
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    if (loader) {
        setTimeout(() => {
            loader.classList.add('hidden');
            setTimeout(() => {
                loader.style.display = 'none';
            }, 800);
        }, 1500);
    }
});

// ===================================
// NAVBAR
// ===================================
const navbar = document.getElementById('navbar');

if (navbar) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// ===================================
// MOBILE MENU
// ===================================
const mobileToggle = document.getElementById('mobileToggle');
const mobileMenu = document.getElementById('mobileMenu');

if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
        mobileToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
    });

    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
        });
    });
}

// ===================================
// SCROLL PROGRESS
// ===================================
// ===================================
// SCROLL PROGRESS
// ===================================
const scrollProgress = document.querySelector('.scroll-progress');

if (scrollProgress) {
    window.addEventListener('scroll', () => {
        const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        scrollProgress.style.transform = `scaleX(${scrollPercentage / 100})`;
    });
}

// ===================================
// SMOOTH SCROLL
// ===================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href.length > 1) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// ===================================
// ACTIVE NAV
// ===================================
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#') && href.length > 1) {
            link.classList.remove('active');
            if (href === `#${current}`) {
                link.classList.add('active');
            }
        }
    });
});

// ===================================
// COUNTER ANIMATION
// ===================================
let counterActivated = false;

function animateCounters() {
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');
    statNumbers.forEach(counter => {
        const target = parseInt(counter.dataset.target);
        const suffix = counter.dataset.suffix || '';
        if (!target) return;

        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.floor(current).toLocaleString('uk-UA') + suffix;
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target.toLocaleString('uk-UA') + suffix;
            }
        };

        updateCounter();
    });
}

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !counterActivated) {
                animateCounters();
                counterActivated = true;
            }
        });
    }, { threshold: 0.5 });

    statsObserver.observe(heroStats);
}

// ===================================
// PARALLAX
// ===================================
const heroBg = document.querySelector('.hero-bg');

window.addEventListener('scroll', () => {
    if (window.scrollY < window.innerHeight) {
        const scrolled = window.scrollY;
        if (heroBg) {
            heroBg.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    }
});


// ===================================
// VACANCY LOADING
// ===================================
async function loadVacancies() {
    try {
        let data;

        // fetch() не працює з file:// через CORS — використовуємо XMLHttpRequest як фолбек
        if (window.location.protocol === 'file:') {
            data = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', VACANCIES_URL, true);
                xhr.responseType = 'json';
                xhr.onload = () => xhr.status === 0 || xhr.status === 200
                    ? resolve(xhr.response)
                    : reject(new Error('XHR failed'));
                xhr.onerror = () => reject(new Error('XHR error'));
                xhr.send();
            });
        } else {
            const response = await fetch(VACANCIES_URL);
            if (!response.ok) throw new Error('Failed to load vacancies');
            data = await response.json();
        }

        allVacancies = data;

        // Обробка даних
        allVacancies = allVacancies.map(v => ({
            ...v,
            cleanTitle: parseVacancyTitle(v.raw_text),
            cleanOverview: cleanVacancyText(v.overview),
            // ФІКС: Зберігаємо тільки перші 2 теги як релевантні
            primaryTags: (v.tags || []).slice(0, 2),
            id: Math.random().toString(36).substr(2, 9)
        }));

        renderFilters();
        applyFilters();
    } catch (error) {
        console.error('Error loading vacancies:', error);
        if (vacancyGrid) {
            vacancyGrid.innerHTML = '<p class="error-msg">Не вдалося завантажити вакансії. Спробуйте оновити сторінку.</p>';
        }
    }
}

// Очищення тексту від "води"
function cleanVacancyText(text) {
    if (!text) return "";

    const splitter = "внесок в захист країни!";

    if (text.includes(splitter)) {
        let clean = text.split(splitter)[1].trim();
        return clean;
    }

    return text;
}

// Парсинг назви вакансії
function parseVacancyTitle(rawText) {
    if (!rawText) return "Спеціаліст";
    const lines = rawText.split('\n');
    const idx = lines.findIndex(l => l.trim().toLowerCase().includes('вакансія'));
    if (idx !== -1 && lines[idx + 1]) {
        return lines[idx + 1].trim();
    }
    return lines[0] || "Спеціаліст";
}

// ===================================
// RENDER FILTERS
// ===================================
const MAX_VISIBLE_TAGS = 8;
let tagsExpanded = false;

// Маппінг абревіатур на повні назви
const TAG_DISPLAY_NAMES = {
    'зв': 'Зв\'язок',
    'зеніт': 'ППО',
    'ппп': 'Психологія'
};

// Функція для отримання відображуваної назви тега
function getTagDisplayName(tag) {
    const lowerTag = tag.toLowerCase();
    return TAG_DISPLAY_NAMES[lowerTag] || tag;
}

function renderFilters() {
    if (!tagFiltersContainer) return;

    // ФІКС: Рахуємо тільки primaryTags (перші 2 теги)
    const tagCounts = new Map();
    allVacancies.forEach(v => {
        if (v.primaryTags && Array.isArray(v.primaryTags)) {
            v.primaryTags.forEach(t => {
                const clean = t.replace('#', '');
                tagCounts.set(clean, (tagCounts.get(clean) || 0) + 1);
            });
        }
    });

    // Sort by count (most popular first)
    const sortedTags = Array.from(tagCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([tag, count]) => ({ tag, count }));

    tagFiltersContainer.innerHTML = '';

    sortedTags.forEach((item, index) => {
        const btn = document.createElement('button');
        btn.className = 'tag-filter';
        if (index >= MAX_VISIBLE_TAGS) {
            btn.classList.add('hidden-tag');
        }
        // Використовуємо відображувану назву
        const displayName = getTagDisplayName(item.tag);
        btn.innerHTML = `${displayName} <span style="opacity:0.6;font-size:10px">${item.count}</span>`;
        btn.onclick = () => toggleTag(item.tag, btn);
        tagFiltersContainer.appendChild(btn);
    });

    // Add "Show more" toggle if needed
    if (sortedTags.length > MAX_VISIBLE_TAGS) {
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'tag-filter toggle-tags-btn';
        toggleBtn.innerHTML = `<span class="iconify" data-icon="mdi:dots-horizontal"></span>`;
        toggleBtn.onclick = toggleTagsVisibility;
        tagFiltersContainer.appendChild(toggleBtn);
    }
}

function toggleTagsVisibility() {
    tagsExpanded = !tagsExpanded;
    const hiddenTags = tagFiltersContainer.querySelectorAll('.hidden-tag');
    const toggleBtn = tagFiltersContainer.querySelector('.toggle-tags-btn');

    hiddenTags.forEach(tag => {
        tag.style.display = tagsExpanded ? 'inline-block' : 'none';
    });

    if (toggleBtn) {
        toggleBtn.innerHTML = tagsExpanded
            ? `<span class="iconify" data-icon="mdi:chevron-up"></span>`
            : `<span class="iconify" data-icon="mdi:dots-horizontal"></span>`;
    }
}

// ===================================
// TOGGLE TAG
// ===================================
function toggleTag(tag, btn) {
    if (activeTags.has(tag)) {
        activeTags.delete(tag);
        btn.classList.remove('active');
    } else {
        activeTags.add(tag);
        btn.classList.add('active');
    }

    // Деактивуємо кнопку "Всі вакансії"
    if (allFilterBtn) {
        if (activeTags.size === 0) {
            allFilterBtn.classList.add('active');
        } else {
            allFilterBtn.classList.remove('active');
        }
    }

    applyFilters();
}

// Кнопка "Всі вакансії"
if (allFilterBtn) {
    allFilterBtn.addEventListener('click', () => {
        activeTags.clear();
        const tagButtons = tagFiltersContainer.querySelectorAll('.tag-filter');
        tagButtons.forEach(btn => btn.classList.remove('active'));
        allFilterBtn.classList.add('active');
        applyFilters();
    });
}

// ===================================
// APPLY FILTERS
// ===================================
const searchInput = document.getElementById('vacancySearch');

if (searchInput) {
    searchInput.addEventListener('input', () => {
        applyFilters();
    });
}

// ===================================
// APPLY FILTERS
// ===================================
function applyFilters() {
    visibleCount = ITEMS_PER_PAGE;
    const searchText = searchInput ? searchInput.value.toLowerCase().trim() : '';

    filteredVacancies = allVacancies.filter(v => {
        // Tag filter
        const matchesTags = activeTags.size === 0 || (v.primaryTags && v.primaryTags.some(tag => {
            const cleanTag = tag.replace('#', '');
            return activeTags.has(cleanTag);
        }));

        // Search filter
        const matchesSearch = !searchText ||
            v.cleanTitle.toLowerCase().includes(searchText) ||
            (v.overview && v.overview.toLowerCase().includes(searchText));

        return matchesTags && matchesSearch;
    });

    renderVacancies();
}

// ===================================
// RENDER VACANCIES
// ===================================
function renderVacancies() {
    if (!vacancyGrid) return;
    vacancyGrid.innerHTML = '';

    const toShow = filteredVacancies.slice(0, visibleCount);

    if (toShow.length === 0) {
        vacancyGrid.innerHTML = '<p class="no-results">За вашим запитом вакансій не знайдено. Спробуйте змінити фільтри або пошуковий запит.</p>';
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        return;
    }

    toShow.forEach(vacancy => {
        const card = document.createElement('div');
        card.className = 'vacancy-item';



        // ФІКС: Показуємо primaryTags з повними назвами
        const displayTags = (vacancy.primaryTags || [])
            .map(t => {
                const cleanTag = t.replace('#', '');
                const displayName = getTagDisplayName(cleanTag);
                return `<span>#${displayName}</span>`;
            })
            .join('');

        // Форматуємо опис
        let formattedDesc = vacancy.cleanOverview || vacancy.overview || "Опис вакансії відсутній.";

        // Тизер - перше речення (збережено для сумісності, але не виводиться)
        let teaser = formattedDesc.split('.')[0] + '.';
        if (teaser.length > 150) {
            teaser = teaser.substring(0, 147) + '...';
        }

        // Форматуємо розділи з \n в HTML-списки
        function formatAsList(text) {
            if (!text) return '';
            const items = text.split('\n').filter(i => i.trim());
            if (items.length <= 1) return `<p>${text}</p>`;
            return '<ul>' + items.map(i => `<li>${i.trim()}</li>`).join('') + '</ul>';
        }

        card.innerHTML = `
            <div class="vacancy-header" onclick="toggleVacancyDetails(this)">
                <div class="vacancy-info-col">
                    <div class="vacancy-main-info">
                        <h3>${vacancy.cleanTitle}</h3>
                        ${displayTags ? `<div class="vacancy-badges">${displayTags}</div>` : ''}
                    </div>
                </div>
                <div class="vacancy-meta">
                    <span class="vacancy-toggle iconify" data-icon="mdi:chevron-down"></span>
                </div>
            </div>
            
            <div class="vacancy-body">
                <div class="vacancy-content-wrapper">
                    <div class="vacancy-grid-layout">
                        ${vacancy.duties ? `
                        <div class="vacancy-block duties">
                            <h4 class="block-header">
                                <span class="iconify" data-icon="mdi:target"></span> 
                                Обов'язки
                            </h4>
                            <div class="block-content">
                                ${formatAsList(vacancy.duties)}
                            </div>
                        </div>` : ''}

                        ${vacancy.requirements ? `
                        <div class="vacancy-block requirements">
                            <h4 class="block-header">
                                <span class="iconify" data-icon="mdi:shield-check"></span> 
                                Вимоги
                            </h4>
                            <div class="block-content">
                                ${formatAsList(vacancy.requirements)}
                            </div>
                        </div>` : ''}
                    </div>
                    
                    <div class="vacancy-action">
                        <a href="#contacts" class="btn-apply" style="flex-grow: 1; justify-content: center;" onclick="document.getElementById('contacts').scrollIntoView({behavior: 'smooth'});">
                            <span class="iconify" data-icon="mdi:send"></span>
                            Подати заявку
                        </a>
                        ${vacancy.url ? `<a href="${vacancy.url}" target="_blank" class="vacancy-ext-link">Деталі (LobbyX) →</a>` : ''}
                    </div>
                </div>
            </div>
        `;
        vacancyGrid.appendChild(card);
    });

    // Кнопка "Завантажити ще"
    if (loadMoreBtn) {
        if (visibleCount >= filteredVacancies.length) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'inline-block';
            loadMoreBtn.textContent = `Завантажити ще (${filteredVacancies.length - visibleCount})`;
        }
    }

    // Scan for new icons
    if (window.Iconify) {
        window.Iconify.scan();
    }
}

// Завантажити ще
if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', (e) => {
        e.preventDefault();
        visibleCount += ITEMS_PER_PAGE;
        renderVacancies();
    });
}

// Акордеон вакансій
window.toggleVacancyDetails = function (header) {
    const item = header.parentElement;

    // Закриваємо всі інші
    document.querySelectorAll('.vacancy-item').forEach(v => {
        if (v !== item) v.classList.remove('active');
    });

    // Toggling поточної
    item.classList.toggle('active');
}

// ===================================
// FAQ ACCORDION
// ===================================
window.toggleFaq = function (el) {
    const item = el.closest('.faq-item');
    const wasActive = item.classList.contains('active');

    // Закриваємо всі
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));

    // Відкриваємо поточний (якщо не був відкритий)
    if (!wasActive) item.classList.add('active');
}

// ===================================
// REVIEWS CAROUSEL
// ===================================
const reviewsTrack = document.getElementById('reviewsTrack');
const prevBtn = document.getElementById('prevReview');
const nextBtn = document.getElementById('nextReview');
const dotsContainer = document.getElementById('reviewDots');

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
        dotsContainer.appendChild(dot);
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

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentReview = (currentReview - 1 + totalReviews) % totalReviews;
            updateCarousel();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentReview = (currentReview + 1) % totalReviews;
            updateCarousel();
        });
    }

    // Auto-play
    setInterval(() => {
        currentReview = (currentReview + 1) % totalReviews;
        updateCarousel();
    }, 8000);

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    reviewsTrack.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    reviewsTrack.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        if (touchEndX < touchStartX - 50) {
            currentReview = (currentReview + 1) % totalReviews;
            updateCarousel();
        }
        if (touchEndX > touchStartX + 50) {
            currentReview = (currentReview - 1 + totalReviews) % totalReviews;
            updateCarousel();
        }
    }
}

// ===================================
// GALLERY VIDEO AUTOPLAY
// ===================================
const galleryVideos = document.querySelectorAll('.gallery-item video');

if (galleryVideos.length > 0) {
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.play().catch(e => console.log('Autoplay prevented:', e));
            } else {
                entry.target.pause();
            }
        });
    }, { threshold: 0.5 });

    galleryVideos.forEach(video => {
        videoObserver.observe(video);
        // Ensure muted attribute is set for autoplay
        video.muted = true;
    });
}

const contactForm = document.getElementById('contactForm');

if (contactForm) {
    // Маска телефону
    const phoneInput = contactForm.querySelector('input[type="tel"]');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, '');
            if (val.startsWith('380')) val = val;
            else if (val.startsWith('0')) val = '38' + val;
            else if (!val.startsWith('3')) val = '380' + val;

            let formatted = '+' + val.slice(0, 2);
            if (val.length > 2) formatted += ' ' + val.slice(2, 5);
            if (val.length > 5) formatted += ' ' + val.slice(5, 8);
            if (val.length > 8) formatted += ' ' + val.slice(8, 10);
            if (val.length > 10) formatted += ' ' + val.slice(10, 12);
            e.target.value = formatted;
        });
    }

    contactForm.addEventListener('submit', (e) => handleWeb3Submit(e, contactForm));
}

// ===================================
// UNIVERSAL WEB3FORMS SUBMIT HANDLER
// ===================================
async function handleWeb3Submit(e, form) {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="iconify" data-icon="mdi:loading" style="animation: spin 1s linear infinite"></span> Надсилаємо...';

    try {
        const formData = new FormData(form);
        const object = Object.fromEntries(formData);
        const json = JSON.stringify(object);

        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: json
        });
        const result = await response.json();

        if (result.success) {
            showToast('✓ Заявку надіслано! Ми зв\'яжемося з вами найближчим часом. 🇺🇦');
            form.reset();
        } else {
            showToast('❌ Помилка відправки. Спробуйте ще раз або зателефонуйте нам.');
            console.error('Web3Forms error:', result);
        }
    } catch (error) {
        showToast('❌ Помилка мережі. Перевірте інтернет-з\'єднання.');
        console.error('Network error:', error);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHTML;
    }
}

// Підключаємо applyForm (субсторінки: contract-18-24, direct-recruiting, career)
const applyForm = document.getElementById('applyForm');
if (applyForm) {
    applyForm.addEventListener('submit', (e) => handleWeb3Submit(e, applyForm));
}

// Toast-сповіщення
function showToast(message) {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `
        <span class="toast-text">${message}</span>
    `;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 5000);
}

// ===================================
// SCROLL REVEAL
// ===================================
// ===================================
// MEDIA GALLERY LIGHTBOX
// ===================================
const lightbox = document.getElementById('lightbox');
const lightboxContent = document.querySelector('.lightbox-content');
const lightboxClose = document.querySelector('.lightbox-close');
const galleryItems = document.querySelectorAll('.gallery-item');

if (lightbox) {
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const content = item.querySelector('.gallery-content');
            // Check if it has a placeholder
            const videoPlaceholder = content.querySelector('.video-placeholder');
            const imagePlaceholder = content.querySelector('.image-placeholder');

            lightboxContent.innerHTML = ''; // Clear previous content

            if (videoPlaceholder) {
                // If it's a placeholder, just show the text in a nicer way
                const pText = videoPlaceholder.querySelector('p').innerText;
                lightboxContent.innerHTML = `
                    <div style="color:white; text-align:center; padding: 40px;">
                        <span class="iconify" data-icon="mdi:play-circle-outline" style="font-size: 64px; opacity: 0.8;"></span>
                        <h3>Відео не знайдено</h3>
                        <p>${pText}</p>
                    </div>
                `;
            } else if (imagePlaceholder) {
                const pText = imagePlaceholder.querySelector('p').innerText;
                lightboxContent.innerHTML = `
                    <div style="color:white; text-align:center; padding: 40px;">
                        <span class="iconify" data-icon="mdi:image-outline" style="font-size: 64px; opacity: 0.8;"></span>
                        <h3>Зображення не знайдено</h3>
                        <p>${pText}</p>
                    </div>
                `;
            } else {
                // Real content
                const img = content.querySelector('img');
                const video = content.querySelector('video');

                if (img) {
                    const clone = img.cloneNode(true);
                    lightboxContent.appendChild(clone);
                } else if (video) {
                    const clone = video.cloneNode(true);
                    clone.controls = true; // Enable controls in lightbox
                    clone.muted = false; // Unmute in lightbox (optional)
                    lightboxContent.appendChild(clone);
                    clone.play();
                }
            }

            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        });
    });

    // Close Lightbox
    lightboxClose.addEventListener('click', () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        lightboxContent.innerHTML = ''; // Stop video
    });

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
            lightboxContent.innerHTML = '';
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
            lightboxContent.innerHTML = '';
        }
    });
}

// ===================================
// SCROLL REVEAL
// ===================================
const revealElements = document.querySelectorAll('.reveal-on-scroll');
if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => revealObserver.observe(el));
}


// ===================================
// INITIALIZATION
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    if (typeof loadVacancies === 'function' && document.getElementById('vacancyGrid')) {
        loadVacancies();
    }

    // Lazy loading для зображень
    document.querySelectorAll('img:not([loading])').forEach(img => {
        img.setAttribute('loading', 'lazy');
    });

    console.log('%c36 ОБрМП', 'color: #035C6B; font-size: 24px; font-weight: bold;');
    console.log('%cСлава Україні! 🇺🇦', 'color: #c5a059; font-size: 16px;');
});