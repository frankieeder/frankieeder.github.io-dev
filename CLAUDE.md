# CLAUDE.md

Context for AI assistants (and humans) working in this repo.

## What this is

Static portfolio site for frankieeder.com. No build step. Vanilla HTML/CSS/JS rendered client-side from a single `content.js` data file via Mustache templates.

- **Production:** GitHub Pages serves `main` of the prod repo `frankieeder/frankieeder.github.io` at `frankieeder.com`.
- **Preview deploys:** This repo (`frankieeder.github.io-dev`) deploys every push to Cloudflare Workers Static Assets. Per-version URLs at `<8-char-version>-frankieeder-dev.frankkeeder.workers.dev`. The Worker's production URL (`frankieeder-dev.frankkeeder.workers.dev`) currently still serves Cloudflare's "Hello World" scaffold because no `wrangler deploy` has been run to promote a real version.

## Quick start

```sh
make run    # serve at localhost:8005
make open   # open in browser
```

## Repo layout

| Path | Purpose |
|---|---|
| `index.html` | Entry point + lightbox DOM |
| `render.js` | Runtime: navigation, mustache rendering, lightbox (image + video), BUY PRINT dropdown |
| `content.js` | Single source of truth for all content (~2300 lines of JS data) |
| `static/templates/*.mustache` | Partials: `contents`, `image`, `photo_scrollbox`, `vimeo_embed`, `youtube_embed`, etc. |
| `stylesheet.css` | All styles |
| `img/`, `art8/`, `fonts/`, `resume/`, `sci/` | Static assets |
| `infra/stripe/` | Terraform IaC for Stripe Payment Links (BUY PRINT) |
| `.github/workflows/` | CI: `stripe-plan.yml` (every PR), `stripe-sync.yml` (manual) |
| `wrangler.jsonc` | Cloudflare Workers Static Assets config |
| `.assetsignore` | Files excluded from the deployed Worker bundle (most importantly `.git/` — 1.5 GiB pack file would bust the 25 MiB asset limit) |
| `TODOS.md` | Prioritized outstanding tasks |
| `imgproc.py`, `requirements.txt` | Local dev tool for generating `_thumb` / `_lq` image variants — NOT deployed |

## How BUY PRINT works

Click photo thumbnail → lightbox opens → BUY PRINT button → hover-or-click reveals dropdown of 7 sizes (4×6 → 32×48) → click opens a real `buy.stripe.com/...` Payment Link with `?client_reference_id=<artwork_id>` so fulfillment knows which photo to print.

`render.js:loadPaymentLinks()` fetches `infra/stripe/payment_links.json` at page load. That JSON is committed; CI can regenerate it via `stripe-sync.yml`.

## How preview deploys work

Cloudflare Workers Static Assets (the NEW product, NOT classic Pages — different dashboard flow).

- Worker name: `frankieeder-dev`
- Account workers.dev subdomain: `frankkeeder.workers.dev` (note: double-k, not a typo)
- Build runs `npx wrangler versions upload` on PRs (creates a version, no traffic routing) and `npx wrangler deploy` on `main` (promotes to production traffic)
- Bundle = repo root minus `.assetsignore` entries
- Each build's preview URL: `https://<8-char-version-id>-frankieeder-dev.frankkeeder.workers.dev`

To find a build's version ID and preview URL, grep `Worker Version ID` in the build log or check the dashboard Deployments tab.

## Stripe IaC details (`infra/stripe/`)

Provisions 7 products + 7 prices + 3 shipping rate buckets + 7 payment links.

### Two-provider hack
- `stripe/stripe` (official) — products, prices, shipping rates
- `andrewbaxter/stripe` (`stripealt`) — payment links (the official provider doesn't support `stripe_payment_link`)

### `data "external"` block
Neither provider exposes the payment link `url` attribute, so a shell `curl` against the Stripe API reads it back. API key is passed via `query` (sent as JSON to stdin), NOT via the `environment` argument — that arg does not exist on `hashicorp/external 2.x` (common mistake; `terraform validate` will flag it).

### State backend
Cloudflare R2 (S3-compatible) at `s3://frankieeder-com/stripe/terraform.tfstate`. Credentials come from `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` env vars (set as GitHub secrets for CI; export locally for `terraform plan` / `apply`).

### Drift suppression on `stripe_payment_link`
The `stripe_payment_link` resource explicitly pins `consent_collection_terms_of_service`, `currency`, `submit_type`, `after_completion_type`, `billing_address_collection`, `customer_creation`, `payment_method_collection`. **Do not remove these.** The `andrewbaxter/stripe 0.0.24` provider populates them in state from Stripe but treats config-side absence as drift. Three of them are `# forces replacement` → would destroy + recreate all 7 payment links → new `buy.stripe.com` URLs → break any committed or customer-bookmarked links.

### Do NOT
- Run `terraform apply` from a fresh state — duplicates everything in Stripe
- Skip the drift suppression — see above
- Commit `payment_links.json` from a local `terraform apply` without verifying URLs haven't churned

## CI workflows

| Workflow | Trigger | What it does |
|---|---|---|
| `stripe-plan.yml` | Every PR (relevance-gated to `infra/stripe/**`) | `terraform fmt -check` + `init` + `validate` + `plan`. Posts plan output as PR comment. Required status check on `main`. |
| `stripe-sync.yml` | Manual dispatch only | `terraform apply -auto-approve` + auto-commits refreshed `payment_links.json` to the triggering branch |
| `Workers Builds: frankieeder-dev` | Every push (Cloudflare-managed) | Deploys preview to a per-version URL |

## Branch protection

`main_protection` ruleset on `main` requires:
- Approving review (1)
- `Stripe Plan / plan` status check to pass
- No bypass

`ifr-devbot` (AI bot) authors PRs; the user's personal `frankieeder` GitHub account approves before merge.

## Conventions worth knowing

- **Typo preserved**: `lighbox-request-print` (one `t`) is the historical ID. Element was removed from `index.html`, but a few null-safe references in `render.js` still spell it that way. Match the typo if reintroducing, or rename everywhere.
- **YouTube `controls=0`**: intentional; don't change without intent.
- **Vimeo embed**: `background=1` only for thumbnails, normal mode for main embeds.
- **`content.js` shape**: every content card is a `.content` div with text fields (h2/h4/h6/h5 with `.content-text-element` class) followed by media (image/video/etc.). The lightbox's `populateLightboxText()` walks up from the click target to `.content` and reads those fields. Both image and video lightboxes use this pattern.
- **Multi-PR dev cycle pattern**: complex changes use a goal branch (`frankieeder-com/<goal>`) with sub-PRs targeting the goal branch, then a single goal→main PR. Squash-merge each step.

## Video lightbox internals

A few non-obvious things future-you (or another agent) will trip on:

- **`render.js:constrainVideoHeights()` mutates `.iframe-container` post-render.** It reads each tile's inline `style="padding-top: X%"` (the original `aspect_ratio` field from `content.js`), then *overwrites* the inline style with `padding-top: 0` plus explicit pixel `width`/`height`. So **the original aspect-ratio data is GONE from the DOM after page render.** Any code or test that wants the source aspect must either (a) read it before `constrainVideoHeights` runs, or (b) get it from a stable surface — the iframe `src` URL (video ID is immutable) is a good one.

- **`render.js:fitVideoToLightbox()` JS-sizes the video lightbox container.** CSS `.lightbox-video-container { width: min(95vw, ...); aspect-ratio: ... }` is only a fallback before JS runs. The real sizing reads actual caption height (post-layout), computes a M = `max(24px, 5vmin)` margin reservation on all four sides, and sets explicit `width`/`height` to the largest aspect-correct box that fits. The invariant: **min margin around the video on all four sides equals M.** Other margins may be larger when source aspect doesn't match the available rectangle (e.g. square video in 16:9 viewport).

- **`data-fit-done="1"` is the sync marker** set by `fitVideoToLightbox()` at the end of its work. Tests synchronize on this attribute (`page.wait_for_selector("#lightbox-video-container[data-fit-done='1']")`) rather than racing `offsetHeight > 0` — the latter fires the moment CSS gives the element a size, *before* the rAF-deferred JS fit has run.

## E2E tests (Playwright + pytest)

- **`make test`** runs `tests/` against headless Chromium. Workflow at `.github/workflows/lightbox-tests.yml` runs the same on PRs touching `render.js` / `stylesheet.css` / `content.js` / `static/templates/**` / `tests/**`.
- **`tests/conftest.py`** spins up `python -m http.server` on a random free port serving the repo root. Tests hit localhost, no Cloudflare dependency.
- **Pinned video IDs in tests must satisfy two constraints**:
  1. The video exists in `content.js` with the `aspect_ratio` you're targeting.
  2. The post containing it has `frankie_eder` in its `tags` array — otherwise `filteredContent()` (default filter is `frankie_eder`) silently filters it out of the rendered homepage and the test skips with "not found in DOM."
  Both constraints are codebase-specific gotchas; verify both when changing pinned IDs.

## Where things live elsewhere

- **Prod hosting**: `frankieeder/frankieeder.github.io` (do not push without explicit intent — production traffic goes here)
- **Project notes / vault**: `frankieeder/life_automation` (Obsidian vault). Project hub at `brain/01_projects/frankieeder.com/`. Video lightbox archaeology in vault PR #113 (lives at `10_Projects/frankieeder.com/video-lightbox-archaeology.md` after merge).
- **Stripe state**: Cloudflare R2 bucket `frankieeder-com`, key `stripe/terraform.tfstate`
- **Stripe API key**: GitHub repo secret `STRIPE_API_KEY`
- **R2 credentials**: GitHub repo secrets `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`

## Known follow-ups

See `TODOS.md`.
