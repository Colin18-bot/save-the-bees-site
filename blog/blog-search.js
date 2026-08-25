document.addEventListener('DOMContentLoaded', function () {
  const input = document.getElementById('blogSearch');
  const results = document.getElementById('blogSearchResults');

  if (!input || !results || !window.beezKneesBlogPosts) return;

  /*
   * Extra search terms for BeezKnees blog articles.
   *
   * These terms let visitors find an article using words that appear in the
   * full article even when those words are not present in blog-data.js.
   *
   * The key must exactly match the post's slug in blog-data.js.
   */
  const extraSearchTerms = {

    'how-i-use-apivar-strips-after-honey-harvest': [
      'Apivar',
      'amitraz',
      'Varroa',
      'Varroa destructor',
      'varroa mites',
      'varroa treatment',
      'mite treatment',
      'late summer treatment',
      'autumn treatment',
      'after honey harvest',
      'honey harvest',
      'extract honey',
      'honey extraction',
      'honey supers',
      'wet supers',
      'clean wet supers',
      'return supers for cleaning',
      'remove supers',
      'no supers during treatment',
      'brood area',
      'bee cluster',
      'single brood chamber',
      'two strips',
      '2 strips',
      'frames 3 4',
      'frames 7 8',
      'between frames 3 and 4',
      'between frames 7 and 8',
      'strip position',
      'reposition strips',
      '10 weeks',
      'ten weeks',
      '6 weeks',
      'six weeks',
      '6 8 weeks',
      'winter bees',
      'feeding during treatment',
      'honey withdrawal',
      'veterinary medicine',
      'medicine records',
      'treatment records',
      '27 July',
      '20 July',
      '22 July',
      '5 October',
      'UK beekeeping'
    ],

    'inspection-diary-1-nine-colonies-nine-different-stories': [
      'inspection diary',
      'apiary inspection',
      'hive inspection',
      'nine colonies',
      '9 colonies',
      'Peterston apiary',
      'July inspection',
      'honey production',
      'honey super',
      'honey supers',
      'nectar flow',
      'fresh eggs',
      'healthy larvae',
      'brood pattern',
      'solid brood',
      'queen',
      'queen status',
      'queenless',
      'queenless colony',
      'no fresh eggs',
      'laying queen',
      'defensive bees',
      'defensive colony',
      'Hive 9',
      'colony management',
      'jobs for next week',
      'UK beekeeping'
    ],

    'spotty-brood-pattern-european-foulbrood': [
      'European Foulbrood',
      'European foul brood',
      'EFB',
      'EFB bees',
      'foulbrood',
      'bee disease',
      'brood disease',
      'notifiable disease',
      'spotty brood',
      'spotty brood pattern',
      'patchy brood',
      'poor brood pattern',
      'healthy brood pattern',
      'twisted larvae',
      'yellow larvae',
      'discoloured larvae',
      'melted larvae',
      'sunken cappings',
      'low hive activity',
      'quiet colony',
      'weak colony',
      'bee inspector',
      'National Bee Unit',
      'shook swarm',
      'colony destruction',
      'infected comb',
      'hive hygiene',
      'biosecurity',
      'clean hive tools',
      'soda crystals',
      'disinfect equipment',
      'queen problem',
      'chilled brood',
      'varroa damage',
      'American Foulbrood',
      'AFB',
      'UK beekeeping'
    ],

    'how-beekeeping-helps-the-environment': [
      'environment',
      'beekeeping environment',
      'bees environment',
      'pollination',
      'pollinator',
      'pollinators',
      'pollen',
      'nectar',
      'flowers',
      'flowering plants',
      'biodiversity',
      'wildlife',
      'ecosystem',
      'ecosystems',
      'food production',
      'nature',
      'forage',
      'hedgerows',
      'wildflowers',
      'flowering trees',
      'gardens',
      'allotments',
      'pollinator friendly flowers',
      'bee conservation',
      'support bees',
      'provide water',
      'avoid chemicals',
      'honey bees',
      'UK beekeeping'
    ],

    'starting-your-own-beehive': [
      'start beekeeping',
      'starting beekeeping',
      'starting a beehive',
      'starting your own beehive',
      'first beehive',
      'first hive',
      'beginner beekeeper',
      'beginner beekeeping',
      'getting started',
      'buying bees',
      'garden swarm',
      'honey bee behaviour',
      'queen workers drones',
      'brood',
      'stores',
      'hive location',
      'where to put a hive',
      'sunlight',
      'shelter',
      'wind',
      'neighbours',
      'pets',
      'flight path',
      'hive type',
      'British National',
      'National hive',
      'beekeeping equipment',
      'regular hive inspections',
      'queen laying',
      'brood pattern',
      'swarm preparation',
      'UK beekeeping'
    ],

    'what-i-wish-i-knew-before-buying-my-first-bees': [
      'buying first bees',
      'first bees',
      'new beekeeper',
      'beginner beekeeper',
      'beginner beekeeping',
      'before keeping bees',
      'before buying bees',
      'beekeeping mistakes',
      'lessons learned',
      'garden swarm',
      'beekeeping course',
      'beekeeping association',
      'local beekeeping association',
      'beekeeping equipment',
      'bee suit',
      'smoker',
      'hive tool',
      'feeding equipment',
      'beekeeping cost',
      'cost of beekeeping',
      'expensive hobby',
      'honey extraction',
      'honey extractor',
      'uncapping tray',
      'uncapping knife',
      'settling tank',
      'honey bucket',
      'filters',
      'strainers',
      'honey jars',
      'labels',
      'packaging',
      'learning curve',
      'time commitment',
      'eggs larvae capped brood',
      'pollen stores',
      'nectar',
      'queen cells',
      'drone brood',
      'swarm control',
      'winter preparation',
      'UK beekeeping'
    ],

    'why-i-started-beekeeping': [
      'why I started beekeeping',
      'beekeeping journey',
      'my beekeeping journey',
      'fear of bees',
      'afraid of bees',
      'fear to fascination',
      'bee sting',
      'garden swarm',
      'swarm of honey bees',
      'first hive',
      'became a beekeeper',
      'becoming a beekeeper',
      'bee behaviour',
      'bee organisation',
      'honey bees',
      'nature',
      'beekeeping hobby',
      'learning beekeeping',
      'seasonal changes',
      'colony inspections',
      'bee health',
      'honey harvest',
      'swarm management',
      'BeezKnees',
      'why I created BeezKnees',
      'UK beekeeping'
    ],

    'garden-beekeeping-uk': [
      'garden beekeeping',
      'garden bees',
      'garden apiary',
      'beehive in garden',
      'keeping bees in garden',
      'back garden bees',
      'home apiary',
      'urban beekeeping',
      'suburban beekeeping',
      'hive location',
      'neighbours',
      'bee flight path',
      'garden hive',
      'UK garden beekeeping',
      'UK beekeeping'
    ],

    'best-beekeeping-apps-uk': [
      'beekeeping apps',
      'beekeeping app',
      'best beekeeping apps',
      'UK beekeeping apps',
      'hive inspection app',
      'apiary app',
      'hive records',
      'digital hive records',
      'colony records',
      'beekeeper software',
      'HiveTag',
      'HiveKeeper',
      'HiveTracks',
      'ApiNote',
      'HiveSense',
      'NFC',
      'NFC hive tags',
      'voice inspections',
      'offline use',
      'queen records',
      'colony health',
      'smartphone beekeeping',
      'mobile app',
      'free beekeeping app',
      'beekeeping technology',
      '2026'
    ]
  };

  /*
   * Normalise text so searches are forgiving of capital letters,
   * apostrophes, hyphens and punctuation.
   */
  function normalise(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[’'`]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  input.addEventListener('input', function () {
    const q = normalise(input.value);

    results.innerHTML = '';

    if (q.length < 2) return;

    /*
     * Split the visitor's search into individual words.
     *
     * This means a search such as:
     *
     * apivar winter bees
     *
     * can match a post even if those words are not next to one another.
     */
    const queryTerms = q.split(' ').filter(Boolean);

    const matches = window.beezKneesBlogPosts.filter(function (p) {
      const extraTerms = extraSearchTerms[p.slug] || [];

      const haystack = normalise([
        p.title,
        p.category,
        p.date,
        p.isoDate,
        p.excerpt,
        p.slug,
        p.alt,
        Array.isArray(p.keywords) ? p.keywords.join(' ') : p.keywords,
        extraTerms.join(' ')
      ].filter(Boolean).join(' '));

      /*
       * Every word entered by the visitor must appear somewhere
       * in the searchable information for the post.
       */
      return queryTerms.every(function (term) {
        return haystack.includes(term);
      });
    });

    if (!matches.length) {
      results.innerHTML = '<p>No matching posts found.</p>';
      return;
    }

    results.innerHTML = matches.map(function (p) {
      return `
        <div class="search-result-item">
          <strong>
            <a href="/blog/posts/${p.slug}">${p.title}</a>
          </strong>
          <br>
          <small>${p.date} · ${p.category}</small>
        </div>
      `;
    }).join('');
  });
});