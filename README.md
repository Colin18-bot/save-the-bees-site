# 🐝 BeezKnees – Save the Bees Educational Website

**BeezKnees** is a fully responsive, content-rich educational website designed to
support new and experienced beekeepers across the UK. The site covers everything
from getting started with a hive to disease management and seasonal apiary tasks,
with a strong focus on bee welfare, good husbandry, and environmental stewardship.

🌐 **Live website:** https://beezknees.co.uk/

---

## 📘 Features

- 🐝 **Comprehensive Beekeeping Guides**  
  Getting started, equipment, hive management, varroa control, hygiene, and more.

- 🗓 **Year in the Apiary**  
  A full month-by-month guide to managing colonies throughout the seasons.

- ⚠️ **Bee Health & Diseases**  
  Detailed coverage of pests, mites, bacterial and viral diseases, and other common
  colony health issues.

- 🌸 **Help the Bees**  
  Bee-friendly gardening, reporting swarms, and options to support conservation.

- 🧠 **Educational Content**  
  Honeybee anatomy, behaviour, pollination, and how bees make honey.

- 📱 **Fully Responsive Layout**  
  Mobile-friendly design with a hamburger menu and dropdown navigation.

- 🔍 **SEO-Optimised Static Pages**  
  Clean HTML, structured navigation, metadata, favicons, and schema markup.

---

## 🔍 SEO & Page Rules (Important)

This site intentionally separates **indexable content pages** from **utility /
system pages**.

### ✅ Indexable content pages
Examples:
- Beekeeping guides
- Disease and health pages
- Monthly apiary task pages
- Educational content (facts, anatomy, behaviour)

Rules:
- `index, follow`
- Canonical URL present
- Included in `sitemap.xml`

### 🚫 Utility / system pages
Examples:
- `/thank-you`
- `/thanks`
- `/maybe-next-time`
- `/404`

Rules:
- `noindex, nofollow` (404 uses `noindex, follow`)
- Not included in the sitemap
- No canonical tags

These pages exist only for user flow (forms, errors, confirmations) and are
**intentionally excluded from search results**.

---

## 🔗 URL Structure (Pretty URLs)

The site uses **pretty URLs** with no `.html` extensions.

Example:

Pretty URLs are handled via server-side rewrites on the hosting platform.
Internal links must always use the clean `/slug` format.

---

## 📁 File Structure (Simplified)
/
├── index
├── about-us
├── year-in-the-apiary
├── january … december
├── beekeeping-guides
├── getting-started
├── equipment
├── hive-management
├── varroa-management
├── hygiene
├── bee-diseases
│ ├── bacterial-diseases
│ ├── viral-diseases
│ ├── bee-pests
│ ├── parasitic-mites
│ └── other-conditions
├── honeybee-facts
│ ├── anatomy
│ ├── behaviour
│ ├── how-bees-make-honey
│ └── pollination
├── help-the-bees
│ ├── bee-gardening
│ ├── donate
│ └── report-a-swarm
├── 404
├── css/
│ └── style.css
├── images/
├── js/
└── site.webmanifest


---

## 🚀 Deployment

The site is live at **https://beezknees.co.uk**  
Deployed using **Netlify** with static HTML pages and server-side rewrites
for pretty URLs.

---

## 🔐 Legal & Compliance Pages

- Privacy Policy
- Terms of Use

These pages are indexable but not included in the sitemap unless required.
They are written to align with UK GDPR requirements and the site’s use of
forms, cookies, and analytics.

---

## 🙏 Credits

- Website by **Colin Chorley**
- Contact: **cchorley19@gmail.co.uk**
- TikTok: [@colinchorley](https://www.tiktok.com/@colinchorley)
- Icons: [Font Awesome](https://fontawesome.com/)
- Hosting: [Netlify](https://www.netlify.com)

---

## 📬 Contact

For questions, feedback, or swarm reports, visit  
👉 **https://beezknees.co.uk/report-a-swarm**

