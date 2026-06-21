(function () {
  const container = document.getElementById("relatedPosts");

  if (!container || !window.beezKneesBlogPosts) return;

  const currentPage = window.location.pathname
    .split("/")
    .pop()
    .replace(".html", "");

  const posts = [...window.beezKneesBlogPosts];

  posts.sort(function (a, b) {
    return new Date(b.date) - new Date(a.date);
  });

  const relatedPosts = posts
    .filter(function (post) {
      return (
        post.title &&
        post.slug &&
        post.slug !== currentPage
      );
    })
    .slice(0, 3);

  container.innerHTML = `
    <div class="blog-grid">
      ${relatedPosts.map(post => `
        <article class="blog-card">
          <img
            src="../${post.image}"
            alt="${post.alt || post.title}"
            width="800"
            height="533"
            loading="lazy"
            decoding="async"
          >
          <div class="blog-card-content">
            <p class="blog-meta">${post.date} · ${post.category}</p>
            <h3>${post.title}</h3>
            <p>${post.excerpt}</p>
            <a class="btn btn-primary"
               href="/blog/posts/${post.slug}.html">
               Read More
            </a>
          </div>
        </article>
      `).join("")}
    </div>
  `;
})();