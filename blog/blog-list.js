(function () {
  const posts = window.beezKneesBlogPosts || [];
  const postsPerPage = 9;
  let currentPage = 1;
  let currentQuery = "";

  const featuredContainer = document.getElementById("featuredPostContainer");
  const grid = document.getElementById("blogPostGrid");
  const pagination = document.getElementById("blogPagination");
  const searchInput = document.getElementById("blogSearch");

  function normaliseDate(dateText) {
    return new Date(dateText);
  }

  const sortedPosts = posts.slice().sort(function (a, b) {
    return normaliseDate(b.date) - normaliseDate(a.date);
  });

  function postUrl(post) {
  return "posts/" + post.slug;
  }

  function renderFeatured() {
    if (!featuredContainer || !sortedPosts.length) return;

    const post = sortedPosts[0];

    featuredContainer.innerHTML = `
      <div class="card featured-blog-card">
        <img src="${post.image}" alt="${post.alt || post.title}" width="1600" height="874" loading="lazy" decoding="async">
        <div class="featured-blog-content">
          <span class="hero-kicker">Featured Post</span>
          <h2>${post.title}</h2>
          <p class="article-meta">${post.date} · ${post.category}</p>
          <p>${post.excerpt}</p>
          <a class="btn btn-primary" href="${postUrl(post)}">Read More</a>
        </div>
      </div>
    `;
  }

  function getFilteredPosts() {
    const query = currentQuery.toLowerCase().trim();

    if (!query) return sortedPosts;

    return sortedPosts.filter(function (post) {
      const searchText = [
        post.title,
        post.category,
        post.date,
        post.excerpt,
        post.slug
      ].join(" ").toLowerCase();

      return searchText.includes(query);
    });
  }

  function renderPosts() {
    if (!grid) return;

    const filteredPosts = getFilteredPosts();
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
    const start = (currentPage - 1) * postsPerPage;
    const visiblePosts = filteredPosts.slice(start, start + postsPerPage);

    if (!visiblePosts.length) {
      grid.innerHTML = `
        <p>No blog posts found. Try a different search term.</p>
      `;
      renderPagination(totalPages);
      return;
    }

    grid.innerHTML = visiblePosts.map(function (post) {
      return `
        <article class="blog-card">
          <img src="${post.image}" alt="${post.alt || post.title}" width="800" height="533" loading="lazy" decoding="async">
          <div class="blog-card-content">
            <p class="blog-meta">${post.date} · ${post.category}</p>
            <h3>${post.title}</h3>
            <p>${post.excerpt}</p>
            <a class="btn btn-primary" href="${postUrl(post)}">Read More</a>
          </div>
        </article>
      `;
    }).join("");

    renderPagination(totalPages);
  }

  function renderPagination(totalPages) {
    if (!pagination) return;

    if (totalPages <= 1) {
      pagination.innerHTML = "";
      return;
    }

    let buttons = "";

    for (let i = 1; i <= totalPages; i++) {
      buttons += `
        <button class="blog-page-btn ${i === currentPage ? "active" : ""}" type="button" data-page="${i}">
          ${i}
        </button>
      `;
    }

    pagination.innerHTML = buttons;

    pagination.querySelectorAll("button").forEach(function (button) {
      button.addEventListener("click", function () {
        currentPage = Number(this.dataset.page);
        renderPosts();
        document.getElementById("latest-posts").scrollIntoView({ behavior: "smooth" });
      });
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      currentQuery = this.value;
      currentPage = 1;
      renderPosts();
    });
  }

  renderFeatured();
  renderPosts();
})();