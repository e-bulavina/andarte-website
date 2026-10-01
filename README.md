# andARTE — website

Static site for **andarte glass** (Morena Andačić) — glass-fusion art, custom projects, workshops, and the book *Nulta točka*. Pure HTML/CSS/JS, no build step, no backend.

## Structure

```
index.html      main one-page site (all 6 sections, incl. the artwork grid)
terms.html      Uvjeti kupnje (purchase terms)
privacy.html    Politika privatnosti (privacy policy)
css/style.css   all styling
js/script.js    nav, lightbox gallery, reveal animations (progressive enhancement only)
images/         all photos (optimized JPGs) + logo/favicon
```

Everything — text, prices, mailto links, image references — is plain static HTML in `index.html`. There is no build step and no JavaScript rendering step: the page works even with JavaScript disabled (the only things JS adds are the mobile menu, the click-to-zoom photo lightbox, and the scroll-in animations — none of that is required to see content or use the buttons).

## How "buying" works

There's no shopping cart or payment backend — that matches the client's actual sales process (upit → ponuda → uplata → slanje, i.e. manual quote-then-bank-transfer). Every "Zanima me ova umjetnina" / "Zatraži ponudu" / "Pošalji upit" button is a plain `mailto:` link with a pre-filled subject and message addressed to **andarte.glass@gmail.com** — no JavaScript required, works the instant it's online, and works even if a browser or preview tool blocks scripts.

If later you want a real in-page contact form (so messages don't depend on the visitor having an email client configured), a free service like [Formspree](https://formspree.io) can be dropped into the `#contact-form` in `index.html` with a couple of line changes — happy to help with that when needed.

## Editing content

- **Artworks (prices, sold status, dimensions, photos):** each piece is one `<article class="art-card">` block in the "UMJETNINE" section of `index.html` — search for `id="art-grid"`. Copy an existing card to add a new piece, or edit one in place:
  - To mark a piece sold: replace its price block with `<div class="art-price sold">Prodano</div>` and delete the "Zanima me..." button; add `<span class="art-badge sold">Prodano</span>` right after the `<img>` tag.
  - To change a price: edit the number inside `<div class="art-price">`.
  - Each card's `mailto:` button link already encodes the artwork name/price/dims in its message — if you change those, regenerate the link text after `mailto:andarte.glass@gmail.com?subject=...` (or just ask for a hand editing it, since the text is URL-encoded).
- **Text content** (bio, workshop descriptions, book excerpt, contact info): edit directly in `index.html` — it's plain HTML, organized by section with clear comments.
- **Colors/fonts:** all defined as CSS variables at the top of `css/style.css` (`:root`).

## Publishing to GitHub Pages

1. Create a new repository on GitHub (e.g. `andarte-website`).
2. Upload everything **inside this `site` folder** to the repository root (not the folder itself — `index.html` should sit at the repo root).
3. In the repo, go to **Settings → Pages**, set **Source** to "Deploy from a branch", branch `main`, folder `/ (root)`, then Save.
4. GitHub gives you a live URL after a minute or two (`https://<username>.github.io/<repo-name>/`).
5. Optional: add a custom domain under Settings → Pages → Custom domain.

### Quick local preview before publishing

Any static file server works, e.g. with Python installed:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080` in a browser.

## Legal / business details on the site

Business details (obrt name, OIB, address) are shown on the **Uvjeti kupnje** page (`terms.html`), as required for a Croatian obrt selling online — sourced directly from the brief. Double-check these are current before publishing.
