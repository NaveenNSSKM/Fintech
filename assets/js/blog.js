/**
 * blog.js - Optimized Blog logic
 * Handles Supabase blog fetching and dynamic rendering for FinTech Live.
 * Global UI logic (Mobile Menu, Subscriptions) is handled by main.js.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Only run if on the blog page
    if (document.body.getAttribute('data-category') !== 'blog') return;

    const containers = {
        grid: document.getElementById('latest-news-grid'),
        stories: document.getElementById('top-stories-list'),
        hero: {
            title: document.getElementById('hero-title'),
            desc: document.getElementById('hero-description'),
            img: document.getElementById('hero-image')
        }
    };

    /**
     * Renders the Blog layout from the fetched data
     */
    function renderBlog(posts) {
        if (!posts || posts.length === 0) return;

        // 1. Hero Section (Latest Post)
        const hero = posts[0];
        if (containers.hero.title) containers.hero.title.innerHTML = `<a href="javascript:void(0)" onclick="openBlogModal('${hero.id}')">${hero.title}</a>`;
        if (containers.hero.desc) containers.hero.desc.textContent = hero.description || hero.subtitle || "";
        if (containers.hero.img && hero.image) {
            containers.hero.img.src = hero.image;
            containers.hero.img.alt = hero.title;
        }

        // 2. Top Stories Sidebar (Items 2-4)
        if (containers.stories) {
            containers.stories.innerHTML = posts.slice(1, 4).map((post, index) => `
                <li class="top-story-item" onclick="openBlogModal('${post.id}')">
                    <span class="story-number">${index + 1}</span>
                    <div class="story-content">
                        <h4><a href="javascript:void(0)">${post.title}</a></h4>
                        <div class="article-meta-info">${post.subtitle || 'Insight'} • ${new Date(post.published_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                    </div>
                </li>
            `).join('');
        }

        // 3. Main Articles Grid (Remaining Items)
        if (containers.grid) {
            containers.grid.innerHTML = posts.slice(1).map((post, idx) => {
                const formattedDate = new Date(post.published_date || post.created_at).toLocaleDateString('en-US', { 
                    month: 'long', day: 'numeric', year: 'numeric' 
                }).toUpperCase();

                return `
                    <article class="article-item scroll-animate visible" onclick="openBlogModal('${post.id}')" style="transition-delay: ${0.05 * (idx % 4)}s">
                        <div class="article-thumb">
                            <img src="${post.image || ''}" alt="${post.title}" loading="lazy" width="300" height="170" decoding="async">
                        </div>
                        <div class="article-info">
                            <span class="article-date">${formattedDate}</span>
                            <h3 class="article-h3"><a href="javascript:void(0)">${post.title}</a></h3>
                            <div class="article-footer">
                                <div class="article-meta-info">${post.subtitle || 'FinTech Insights'}</div>
                            </div>
                        </div>
                    </article>
                `;
            }).join('');
        }

        // Store globally for detail view
        window.allBlogPosts = posts;
    }

    /**
     * Detail View / Modal logic
     */
    window.openBlogModal = function(postId) {
        const post = window.allBlogPosts.find(p => p.id === postId);
        if (!post) return;

        const mainGrid = document.querySelector('.main-grid');
        const heroSection = document.querySelector('.hero');
        const detailView = document.getElementById('blog-detail-view');
        const content = document.getElementById('blog-detail-content');
        
        if (!detailView || !content) return;

        const date = new Date(post.published_date || post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

        content.innerHTML = `
            <div class="blog-full-content" style="max-width: 800px; margin: 0 auto;">
                <header style="margin-bottom: 40px; text-align: center;">
                    <span class="label-breaking" style="margin-bottom: 15px;"><span class="label-text">${post.subtitle || 'Article'}</span></span>
                    <h1 style="font-size: 3.5rem; line-height: 1.1; margin-bottom: 25px; color: #fff; font-family: var(--font-display);">${post.title}</h1>
                    <div class="article-meta-info" style="font-size: 1.1rem; opacity: 0.7;">${date} • FinTech Live</div>
                </header>
                <div style="margin-bottom: 40px; border-radius: 24px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
                    <img src="${post.image || ''}" alt="${post.title}" style="width: 100%; height: auto; display: block;">
                </div>
                <div style="font-size: 1.25rem; line-height: 1.8; color: rgba(255,255,255,0.9); font-weight: 300;">
                    ${post.description || '<p>Content coming soon.</p>'}
                    <br><br>
                    <a href="${post.website}" target="_blank" class="btn-load-more" style="width: auto; display: inline-block;">Read Source</a>
                </div>
            </div>
        `;

        if (mainGrid) mainGrid.style.display = 'none';
        if (heroSection) heroSection.style.display = 'none';
        detailView.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Modal Back Button
    const backBtn = document.getElementById('back-to-blog');
    if (backBtn) {
        backBtn.onclick = () => {
            document.getElementById('blog-detail-view').style.display = 'none';
            const grid = document.querySelector('.main-grid');
            const hero = document.querySelector('.hero');
            if (grid) grid.style.display = 'grid';
            if (hero) hero.style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
    }

    // Fetch and render
    fetch('../api/data.php?type=blog')
        .then(res => res.json())
        .then(data => renderBlog(data))
        .catch(err => console.error("Blog Fetch Error:", err));
});
