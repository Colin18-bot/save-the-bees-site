(function () {
  if (!window.beezKneesBlogPosts) return;

  const currentSlug = window.location.pathname
    .split("/")
    .pop()
    .replace(".html", "");

  const post = window.beezKneesBlogPosts.find(function (item) {
    return item.slug === currentSlug;
  });

  if (!post) return;

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "author": {
      "@type": "Person",
      "name": "Colin Chorley"
    },
    "publisher": {
      "@type": "Organization",
      "name": "BeezKnees",
      "url": "https://beezknees.co.uk"
    },
    "datePublished": post.isoDate || "2026-06-18",
    "dateModified": post.isoModified || post.isoDate || "2026-06-18",
    "image": "https://beezknees.co.uk/blog/" + post.image,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://beezknees.co.uk/blog/posts/" + post.slug
    }
  };

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
})();