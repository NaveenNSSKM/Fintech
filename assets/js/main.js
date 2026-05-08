document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('nav ul');
    if (nav) {
        const links = nav.querySelectorAll('li a');
        const indicator = document.createElement('div');
        indicator.classList.add('nav-indicator');
        nav.style.position = 'relative';
        nav.appendChild(indicator);

        function moveIndicator(element) {
            if (!element) {
                indicator.style.opacity = '0';
                return;
            }
            const rect = element.getBoundingClientRect();
            const navRect = nav.getBoundingClientRect();
            
            indicator.style.width = `${rect.width}px`;
            indicator.style.left = `${element.offsetLeft}px`;
            indicator.style.opacity = '1';
        }

        const activeLink = nav.querySelector('a.active');
        if (activeLink) {
            setTimeout(() => moveIndicator(activeLink), 100);
        }

        links.forEach(link => {
            link.addEventListener('mouseenter', (e) => moveIndicator(e.target));
            link.addEventListener('mouseleave', () => {
                const currentActive = nav.querySelector('a.active');
                moveIndicator(currentActive);
            });
        });

        window.addEventListener('resize', () => {
            const currentActive = nav.querySelector('a.active');
            if (currentActive) moveIndicator(currentActive);
        });
    }

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
            background: rgba(0,0,0,0.9); backdrop-filter: blur(8px);
            display: flex; justify-content: center; align-items: center;
            z-index: 9999; opacity: 0; visibility: hidden; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .modal-overlay.visible { opacity: 1; visibility: visible; }
        .modal-content {
            background: #0f172a; border: 1px solid rgba(255,255,255,0.1);
            border-radius: 24px; padding: 50px 40px; max-width: 480px; width: calc(100% - 30px);
            max-height: 90vh; overflow-y: auto;
            position: relative; text-align: center; box-shadow: 0 25px 50px rgba(0,0,0,0.5);
            box-sizing: border-box;
            color: #ffffff;
        }
        .modal-close {
            position: absolute; top: 20px; right: 20px;
            background: none; border: none; color: #94a3b8; font-size: 24px; cursor: pointer;
            transition: color 0.2s ease;
        }
        .modal-close:hover { color: #fff; }
        .modal-content h3 { color: #ffffff; margin-bottom: 15px; font-family: 'Lexend Deca', sans-serif; font-size: 28px; }
        .modal-content p { color: var(--text-muted); margin-bottom: 30px; font-size: 15px; line-height: 1.6; }
        
        #popup-newsletter-form {
            display: flex;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 100px;
            padding: 6px;
            margin-bottom: 15px;
            transition: all 0.3s ease;
            backdrop-filter: blur(5px);
        }
        #popup-newsletter-form:focus-within {
            border-color: rgba(194, 24, 255, 0.5);
            box-shadow: 0 0 20px rgba(194, 24, 255, 0.2);
        }
        .modal-content input {
            flex: 1; padding: 12px 25px; border: none;
            background: transparent;
            color: #ffffff; box-sizing: border-box;
            font-family: 'Lexend Deca', sans-serif;
            outline: none;
            font-size: 15px;
        }
        .modal-content input::placeholder { color: rgba(255,255,255,0.4); }
        .btn-modal-subscribe {
            padding: 12px 30px; border: none; border-radius: 100px;
            background: linear-gradient(90deg, #ff008c 0%, #ff1493 25%, #c218ff 60%, #5b2dff 100%);
            color: #fff; font-weight: 700; cursor: pointer;
            transition: all 0.3s ease;
            white-space: nowrap;
            font-family: 'Lexend Deca', sans-serif;
            font-size: 15px;
            box-shadow: 0 4px 15px rgba(194, 24, 255, 0.3);
        }
        .btn-modal-subscribe:hover { 
            transform: scale(1.05);
            filter: brightness(1.1); 
            box-shadow: 0 6px 20px rgba(194, 24, 255, 0.5);
        }
        .modal-status { margin-top: 15px; font-size: 14px; opacity: 0; transition: opacity 0.3s ease; }
        .modal-status.visible { opacity: 1; }
        .modal-status.success { color: #4bb543; }
        .modal-status.error { color: #ff3333; }
        
        @media (max-width: 480px) {
            .modal-content {
                padding: 40px 15px;
                border-radius: 20px;
                width: 95%;
                max-width: 350px;
            }
            .modal-content h3 { font-size: 20px; }
            .modal-content p { font-size: 13px; margin-bottom: 20px; }
            #popup-newsletter-form {
                flex-direction: row;
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 100px;
                padding: 4px;
                gap: 0;
            }
            .modal-content input {
                padding: 10px 12px;
                font-size: 12px;
                flex: 1;
                width: 100%;
                text-align: left;
            }
            .btn-modal-subscribe {
                padding: 10px 15px;
                font-size: 12px;
                border-radius: 100px;
                width: auto;
            }
        }
    `;

    const modalHTML = `
        <div id="subscribe-modal" class="modal-overlay">
            <div class="modal-content">
                <button class="modal-close" id="modal-close" aria-label="Close modal">&times;</button>
                <h3>Subscribe to FinTech Pulse</h3>
                <p>Get the latest tech and finance news delivered securely to your inbox.</p>
                <form id="popup-newsletter-form">
                    <input type="email" placeholder="Enter your email address" required aria-label="Email address for subscription" />
                    <button type="submit" class="btn-modal-subscribe">Subscribe</button>
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
            
            // Close mobile menu if open
            const mobileMenu = document.getElementById('mobile-menu');
            const mobileToggle = document.getElementById('mobile-toggle');
            if (mobileMenu && mobileMenu.classList.contains('active')) {
                mobileMenu.classList.remove('active');
                const icon = mobileToggle ? mobileToggle.querySelector('i') : null;
                if (icon) icon.className = 'fa-solid fa-bars';
                document.body.style.overflow = '';
            }
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
                    button.textContent = 'Subscribe';
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
        
        // Skip RSS fetch for Blog page (handled by blog.js)
        if (category === 'blog') return;
        
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





    initFeed();
});
