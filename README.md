# cura — Marketing Website

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

## About

This is the marketing/landing page for **cura**, a medication adherence app that groups medications into simple daily sessions, checks for drug-safety conflicts against a verified registry, and helps patients and caregivers stay confidently on schedule.

**Key sections:**
- Hero with a clear call to action
- Services overview (smart session scheduling, verified drug-safety checks, adherence insights, family care coordination)
- Testimonials carousel (swipeable on mobile, grid on desktop)
- Beta signup enquiry form with client-side validation, honeypot spam protection, and a [Formspree](https://formspree.io/) submission endpoint
- Fully responsive, accessible (skip link, focus management, `prefers-reduced-motion` support), and dependency-free

## Installation

This is a static site with no build step or dependencies.

```bash
git clone https://github.com/baemyungsoo/medappwebsite.git
cd medappwebsite
```

Open `index.html` directly in a browser, or serve it locally:

```bash
python -m http.server 8000
# then visit http://localhost:8000
```

## Credits

- Form handling via [Formspree](https://formspree.io/)
- Icons: hand-drawn inline SVG
- Author: [baemyungsoo](https://github.com/baemyungsoo)

## License

Licensed under the [MIT License](LICENSE).
