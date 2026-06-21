(function () {
  const sidebar = document.getElementById("latestPostsSidebar");

  if (!sidebar || !window.beezKneesBlogPosts) return;

  const currentPage = window.location.pathname
    .split("/")
    .pop()
    .replace(".html", "");

  const posts = [...window.beezKneesBlogPosts];

  posts.sort(function (a, b) {
    return new Date(b.date) - new Date(a.date);
  });

  const latestPosts = posts
    .filter(function (post) {
      return (
        post.title &&
        post.slug &&
        post.slug !== currentPage
      );
    })
    .slice(0, 5);

  sidebar.innerHTML = `
    <ul>
      ${latestPosts
        .map(post => `
          <li>
            <a href="/blog/posts/${post.slug}.html">
              ${post.title}
            </a>
          </li>
        `)
        .join("")}
    </ul>
  `;
})();