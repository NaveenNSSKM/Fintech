document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('header');
    const newsletterForm = document.querySelector('.newsletter-form');

    // Dynamically resolve path depending on whether we are inside /pages/ directory
    let proxyPath = 'api/data.php';
    if (window.location.pathname.includes('/pages/')) {
        proxyPath = '../api/data.php';
    }

    // Inject Popup Modal and Styles dynamically
    const modalStyles = `
        .modal-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.85); backdrop-filter: blur(5px);
            display: flex; justify-content: center; align-items: center;
            z-index: 9999; opacity: 0; visibility: hidden; transition: all 0.3s ease;
        }
        .modal-overlay.visible { opacity: 1; visibility: visible; }
        .modal-content {
            background: #ffffff; border: 1px solid rgba(0,0,0,0.1);
            border-radius: 12px; padding: 40px 30px; max-width: 420px; width: calc(100% - 30px);
            max-height: 90vh; overflow-y: auto;
            position: relative; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.15);
            box-sizing: border-box;
        }
        .modal-close {
            position: absolute; top: 15px; right: 15px;
            background: none; border: none; color: #333; font-size: 24px; cursor: pointer;
        }
        .modal-content h3 { color: #121318; margin-bottom: 15px; font-family: 'Lexend Deca', sans-serif; }
        .modal-content p { color: #555555; margin-bottom: 25px; font-size: 14px; }
        .modal-content input {
            width: 100%; padding: 12px; border-radius: 6px;
            border: 1px solid rgba(0,0,0,0.1); background: #f4f5f8;
            color: #121318; margin-bottom: 15px; box-sizing: border-box;
        }
        .btn-modal-subscribe {
            width: 100%; padding: 12px; border: none; border-radius: 6px;
            background: #5356FF; color: #fff; font-weight: bold; cursor: pointer;
            transition: background 0.2s ease;
        }
        .btn-modal-subscribe:hover { background: #3f42d4; }
        .modal-status { margin-top: 15px; font-size: 14px; opacity: 0; transition: opacity 0.3s ease; }
        .modal-status.visible { opacity: 1; }
        .modal-status.success { color: #4bb543; }
        .modal-status.error { color: #ff3333; }
    `;

    const modalHTML = `
        <div id="subscribe-modal" class="modal-overlay">
            <div class="modal-content">
                <button class="modal-close" id="modal-close">&times;</button>
                <h3>Subscribe to FinTech Pulse</h3>
                <p>Get the latest tech and finance news delivered securely to your inbox.</p>
                <form id="popup-newsletter-form">
                    <input type="email" placeholder="Enter your email address" required />
                    <button type="submit" class="btn-modal-subscribe">Subscribe Now</button>
                </form>
                <div class="modal-status" id="modal-status"></div>
            </div>
        </div>
    `;

    // Append Styles
    const styleSheet = document.createElement("style");
    styleSheet.innerText = modalStyles;
    document.head.appendChild(styleSheet);

    // Append Modal
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const subscribeModal = document.getElementById('subscribe-modal');
    const modalClose = document.getElementById('modal-close');
    const popupForm = document.getElementById('popup-newsletter-form');
    const modalStatus = document.getElementById('modal-status');

    // Function to handle Supabase Subscriptions
    async function submitToSupabase(email, button, statusEl) {
        button.disabled = true;
        const originalText = button.textContent;
        button.textContent = 'Subscribing...';

        try {
            const res = await fetch(`${proxyPath}?type=subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email })
            });
            const data = await res.json();

            if (data.status === 'success') {
                if (statusEl) {
                    statusEl.textContent = "Subscribed successfully!";
                    statusEl.className = "modal-status visible success";
                }
                button.textContent = 'Success!';
                button.style.background = '#4bb543';
                
                setTimeout(() => {
                    if (subscribeModal.classList.contains('visible')) {
                        subscribeModal.classList.remove('visible');
                    }
                    button.disabled = false;
                    button.textContent = originalText;
                    button.style.background = '';
                    if (statusEl) statusEl.className = "modal-status";
                }, 2000);
            } else {
                throw new Error(data.message || "Error");
            }
        } catch (err) {
            console.error("Subscription error:", err);
            if (statusEl) {
                statusEl.textContent = "Subscription failed. Try again.";
                statusEl.className = "modal-status visible error";
            }
            button.disabled = false;
            button.textContent = originalText;
        }
    }

    // Hook Up Header Buttons
    const headerSubBtns = document.querySelectorAll('.btn-subscribe, .btn-subscribe-mobile');
    headerSubBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            subscribeModal.classList.add('visible');
        });
    });

    modalClose.addEventListener('click', () => {
        subscribeModal.classList.remove('visible');
    });

    subscribeModal.addEventListener('click', (e) => {
        if (e.target === subscribeModal) {
            subscribeModal.classList.remove('visible');
        }
    });

    if (popupForm) {
        popupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = popupForm.querySelector('input');
            const submitBtn = popupForm.querySelector('button');
            submitToSupabase(emailInput.value, submitBtn, modalStatus);
            emailInput.value = '';
        });
    }

    // Header scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            const icon = mobileToggle.querySelector('i');
            if (mobileMenu.classList.contains('active')) {
                icon.className = 'fa-solid fa-xmark';
                document.body.style.overflow = 'hidden'; 
            } else {
                icon.className = 'fa-solid fa-bars';
                document.body.style.overflow = '';
            }
        });
    }

    // Simple Newsletter Submission
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = newsletterForm.querySelector('input');
            const button = newsletterForm.querySelector('button');
            
            button.disabled = true;
            submitToSupabase(emailInput.value, button, null).then(() => {
                button.textContent = 'Subscribed!';
                button.classList.add('success');
                emailInput.value = '';
                
                setTimeout(() => {
                    button.textContent = 'Join the Team';
                    button.classList.remove('success');
                    button.disabled = false;
                }, 3000);
            });
        });
    }

    let allRssItems = [];
    let currentRenderIndex = 0;

    // Helper to calculate "Time Ago"
    function timeAgo(dateParam) {
        if (!dateParam) return null;
        const date = typeof dateParam === 'object' ? dateParam : new Date(dateParam);
        const today = new Date();
        const seconds = Math.round((today - date) / 1000);
        const minutes = Math.round(seconds / 60);
        const hours = Math.round(minutes / 60);
        const days = Math.round(hours / 24);

        if (seconds < 60) return 'Just now';
        else if (minutes < 60) return minutes + 'm';
        else if (hours < 24) return hours + 'h';
        else if (days < 7) return days + 'd';
        else return date.toLocaleDateString();
    }

    // Helper to render an article HTML
    function createArticleHTML(item, idx) {
        const excerpt = item.description || item.summary || "";
        const cleanExcerpt = excerpt.replace(/<[^>]*>?/gm, '').trim();
        const thumb = item.image || item.thumbnail || "";
        const pubDate = new Date(item.pubDate).toLocaleDateString();
        
        const pubDateLong = new Date(item.pubDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
        const displayTime = timeAgo(item.pubDate);
        
        // Extract domain from URL
        let domain = "";
        try {
            domain = new URL(item.link).hostname.replace('www.', '');
        } catch(e) {
            domain = item.author || "Tech Pulse";
        }

        return `
            <article class="article-item scroll-animate visible" style="transition-delay: ${0.05 * (idx % 4)}s">
                <div class="article-thumb">
                    ${thumb ? `<img src="${thumb}" alt="${item.title}" loading="lazy" width="300" height="170" decoding="async" onerror="this.closest('.article-item').remove()">` : `<div class="no-thumb"></div>`}
                </div>
                <div class="article-info">
                    <span class="article-date">${pubDateLong}</span>
                    <h3 class="article-h3"><a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.title}</a></h3>
                    <div class="article-footer">
                        <div class="article-meta-info">${domain} • ${displayTime}</div>
                    </div>
                </div>
            </article>
        `;
    }

    // Intersection Observer for Scroll Animations
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Initial observer call for existing elements
    document.querySelectorAll('.scroll-animate').forEach(el => observer.observe(el));

    // RSS Feed Integration
    async function initFeed() {
        const category = document.body.getAttribute('data-category') || 'home';
        
        const PROXY_URL = `${proxyPath}?type=rss&page=${category}`;
        
        const heroTitle = document.getElementById('hero-title');
        const heroDesc = document.getElementById('hero-description');
        const heroImg = document.getElementById('hero-image');
        const loadMoreBtn = document.getElementById('load-more');
        const articlesContainer = document.getElementById('articles-container');

        try {
            const response = await fetch(PROXY_URL);
            const data = await response.json();

            if (data.items && data.items.length > 0) {
                console.log("JSON RSS Feed Parsed: " + data.items.length + " items found.");
                
                const seenTitles = new Set();
                allRssItems = data.items.map(item => {
                    const authorName = item.authors && item.authors.length > 0 ? item.authors[0].name : "Tech Chronicle";
                    return {
                        title: item.title || "Breaking News",
                        link: item.url || item.link || "#",
                        description: item.content_text || item.summary || "",
                        image: item.image || item.thumbnail || "",
                        pubDate: item.date_published || item.pubDate || new Date().toISOString(),
                        author: authorName
                    };
                }).filter(item => {
                    if (!item.image || item.image.trim() === '') return false;
                    
                    const normalizedTitle = item.title.trim().toLowerCase();
                    if (seenTitles.has(normalizedTitle)) return false;
                    
                    seenTitles.add(normalizedTitle);
                    return true;
                }).slice(1);

                // Distribution logic
                if (allRssItems.length > 0) {
                    // 1. Hero Section
                    const hero = allRssItems[0];
                    if (heroTitle) heroTitle.innerHTML = `<a href="${hero.link}" target="_blank">${hero.title}</a>`;
                    if (heroDesc) heroDesc.textContent = hero.description.replace(/<[^>]*>?/gm, '').substring(0, 180).trim() + '...';
                    if (heroImg && hero.image) heroImg.src = hero.image;

                    // 2. Top Stories (next 3 items: 1, 2, 3)
                    allRssItems.slice(1, 4).forEach((item, idx) => {
                        const storyEl = document.getElementById(`top-story-${idx + 1}`);
                        if (storyEl) {
                            const titleLink = storyEl.querySelector('h4 a');
                            const metaEl = storyEl.querySelector('.article-meta-info');
                            
                            if (titleLink) {
                                titleLink.href = item.link;
                                titleLink.textContent = item.title;
                                titleLink.target = "_blank";
                            }
                            
                            if (metaEl) {
                                const displayTime = timeAgo(item.pubDate);
                                let domain = "";
                                try {
                                    domain = new URL(item.link).hostname.replace('www.', '');
                                } catch(e) {
                                    domain = item.author || "Source";
                                }
                                metaEl.textContent = `${domain} • ${displayTime}`;
                            }
                        }
                    });

                    // 3. Latest Intelligence (initial batch of 8 cards: index 4 to 12)
                    const initialArticles = allRssItems.slice(4, 12);
                    if (articlesContainer) {
                        articlesContainer.innerHTML = '';
                        initialArticles.forEach((item, idx) => {
                            const articleHtml = createArticleHTML(item, idx + 4);
                            articlesContainer.insertAdjacentHTML('beforeend', articleHtml);
                        });
                        // Observe new articles
                        articlesContainer.querySelectorAll('.scroll-animate').forEach(el => observer.observe(el));
                    }

                    currentRenderIndex = 12;
                    
                    // 4. Load More Feature
                    if (allRssItems.length > currentRenderIndex) {
                        if (loadMoreBtn) {
                            loadMoreBtn.classList.remove('hidden');
                            loadMoreBtn.onclick = () => {
                                const nextBatch = allRssItems.slice(currentRenderIndex, currentRenderIndex + 8);
                                nextBatch.forEach((item, idx) => {
                                    const articleHtml = createArticleHTML(item, currentRenderIndex + idx);
                                    articlesContainer.insertAdjacentHTML('beforeend', articleHtml);
                                });
                                
                                currentRenderIndex += nextBatch.length;
                                
                                if (currentRenderIndex >= allRssItems.length) {
                                    loadMoreBtn.classList.add('hidden');
                                }
                                
                                // Observe newly loaded items
                                articlesContainer.querySelectorAll('.scroll-animate').forEach(el => observer.observe(el));
                            };
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error loading content from proxy backend:", error);
            if (heroTitle) heroTitle.textContent = "PHP Proxy execution failed";
            if (heroDesc) heroDesc.innerHTML = "Make sure you are running a PHP server (XAMPP/Hostinger). Standard local servers like Live Server cannot execute backend logic.";
        }
    }

    // --- Theme Toggle Logic ---
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Apply saved theme on load
    if (localStorage.getItem('theme') === 'light') {
        body.classList.add('light-theme');
        document.documentElement.classList.add('light-theme');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('light-theme');
            document.documentElement.classList.toggle('light-theme');
            const isLight = body.classList.contains('light-theme');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
        });
    }



    initFeed();
});
