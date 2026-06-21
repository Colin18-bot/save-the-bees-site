document.addEventListener('DOMContentLoaded', function () {
  const input = document.getElementById('blogSearch');
  const results = document.getElementById('blogSearchResults');
  if (!input || !results || !window.beezKneesBlogPosts) return;
  input.addEventListener('input', function () {
    const q = input.value.trim().toLowerCase();
    results.innerHTML = '';
    if (q.length < 2) return;
    const matches = window.beezKneesBlogPosts.filter(p =>
      (p.title + ' ' + p.category + ' ' + p.date + ' ' + p.excerpt).toLowerCase().includes(q)
    );
    if (!matches.length) { results.innerHTML = '<p>No matching posts found.</p>'; return; }
    results.innerHTML = matches.map(p => `<div class="search-result-item"><strong><a href="/blog/posts/${p.slug}">${p.title}</a></strong><br><small>${p.date} · ${p.category}</small></div>`).join('');
  });
});
