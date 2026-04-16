document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('header');
    const newsletterForm = document.querySelector('.newsletter-form');

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
            const email = newsletterForm.querySelector('input').value;
            const button = newsletterForm.querySelector('button');
            
            button.textContent = 'Subscribed!';
            button.classList.add('success');
            newsletterForm.querySelector('input').value = '';
            
            setTimeout(() => {
                button.textContent = 'Join the Team';
                button.classList.remove('success');
            }, 3000);
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
                    ${thumb ? `<img src="${thumb}" alt="${item.title}" loading="lazy" width="300" height="170" decoding="async">` : `<div class="no-thumb"></div>`}
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
        const feedMap = {
            'home': 'https://rss.app/feeds/v1.1/tAvdAEe4jLTt429x.json',
            'invest': 'https://rss.app/feeds/v1.1/tl7MoLQhnGEFcOmG.json',
            'banking': 'https://rss.app/feeds/v1.1/t92EFiZcyYPRlBQo.json',
            'tax': 'https://rss.app/feeds/v1.1/tDJ9qkTwFBEa5qgd.json',
            'crypto': 'https://rss.app/feeds/v1.1/tEqNMH248OaZyjwA.json'
        };

        const category = document.body.getAttribute('data-category') || 'home';
        const RSS_JSON_URL = feedMap[category] || feedMap['home'];
        
        const heroTitle = document.getElementById('hero-title');
        const heroDesc = document.getElementById('hero-description');
        const heroImg = document.getElementById('hero-image');
        const loadMoreBtn = document.getElementById('load-more');
        const articlesContainer = document.getElementById('articles-container');

        try {
            const response = await fetch(RSS_JSON_URL);
            const data = await response.json();

            if (data.items && data.items.length > 0) {
                console.log("JSON RSS Feed Parsed: " + data.items.length + " items found.");
                
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
                    const initialArticles = allRssItems.slice(4, 14);
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
            console.error("Feed Error:", error);
            // If direct fetch fails due to CORS, we can fallback to a proxy if needed
            // but rss.app usually allows direct access for their JSON feeds.
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

    // Section Search Filtering
    const searchToggle = document.getElementById('search-toggle');
    const searchInput = document.getElementById('articles-search');
    const articlesContainer = document.getElementById('articles-container');
    const loadMoreBtn = document.getElementById('load-more');

    if (searchToggle && searchInput) {
        searchToggle.addEventListener('click', () => {
            searchInput.classList.toggle('active');
            if (searchInput.classList.contains('active')) {
                searchInput.focus();
            } else {
                // Clear search when closing
                searchInput.value = '';
                searchInput.dispatchEvent(new Event('input'));
            }
        });

        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            
            if (!searchTerm) {
                // Restore original list if search is empty
                if (articlesContainer && allRssItems.length > 0) {
                    articlesContainer.innerHTML = '';
                    const initialArticles = allRssItems.slice(4, currentRenderIndex);
                    initialArticles.forEach((item, idx) => {
                        const articleHtml = createArticleHTML(item, idx + 4);
                        articlesContainer.insertAdjacentHTML('beforeend', articleHtml);
                    });
                    
                    if (loadMoreBtn) {
                        if (currentRenderIndex < allRssItems.length) {
                             loadMoreBtn.classList.remove('hidden');
                        } else {
                             loadMoreBtn.classList.add('hidden');
                        }
                    }
                    
                    // Re-observe
                    articlesContainer.querySelectorAll('.scroll-animate').forEach(el => observer.observe(el));
                }
                return;
            }

            // Searching entire feed
            if (allRssItems.length > 0) {
                const matches = allRssItems.filter(item => {
                    const title = (item.title || "").toLowerCase();
                    const desc = (item.description || "").toLowerCase();
                    return title.includes(searchTerm) || desc.includes(searchTerm);
                });

                if (articlesContainer) {
                    articlesContainer.innerHTML = '';
                    
                    if (matches.length > 0) {
                        matches.forEach((item, idx) => {
                            const articleHtml = createArticleHTML(item, idx);
                            articlesContainer.insertAdjacentHTML('beforeend', articleHtml);
                        });
                        // Observe new items
                        articlesContainer.querySelectorAll('.scroll-animate').forEach(el => observer.observe(el));
                    } else {
                        articlesContainer.innerHTML = `<div class="no-results" style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">No articles found for "${searchTerm}"</div>`;
                    }
                    
                    // Hide load more during search
                    if (loadMoreBtn) loadMoreBtn.classList.add('hidden');
                }
            }
        });
    }

    initFeed();
});
