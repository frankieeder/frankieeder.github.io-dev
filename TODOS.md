# TODOS

Outstanding follow-ups from recent work. P0 = blocking / accessibility-breaking, P1 = should fix soon, P2 = nice-to-have. See `LAYOUT_REVIEW.md` for the underlying architectural assessment.

## P0

- **Keyboard navigation into and out of lightbox** — Tile `<a>` tags have no `href` (not in tab order); close button is a `<span>` (not focusable); no Escape handler exists. Keyboard-only users cannot open or close the lightbox at all. Fix: add `tabindex="0"` + `role="button"` (or use `<button>`), use `<button>` for close, add a `keydown` Escape listener.

- **`alt="pic"` on every image** — `static/templates/image.mustache:4-5` hardcodes `alt="pic"` on both thumbnail and full-res `<img>` tags. Screen readers announce every photo identically. The `caption` field already exists on some `content.js` entries (e.g., `content.js:554-558`) — plumb it through.

## P1

- **Tablet breakpoint missing** — Layout has mobile (<768px) and desktop styles but no intermediate ~1024px breakpoint. Tile sizing can look awkward there.

- **10 mustache template fetches per page load** — `render.js:getTemplates()` does 10 parallel `fetch()` calls every page render. Bundle into one JSON-of-strings (or inline at build time, if a build step is ever introduced).

- **Cloudflare build runs `pip install -r requirements.txt`** unnecessarily on every deploy (~90s tax). Disable by setting the dashboard Build command to `echo skip` (Workers & Pages → `frankieeder-dev` → Settings → Builds & deployments).

- **Production Cloudflare Worker still serves Hello World** — `frankieeder-dev.frankkeeder.workers.dev` keeps serving Cloudflare's scaffold until `wrangler deploy` runs against a merged PR. Currently only `wrangler versions upload` runs (on PR branches). If preview deploys are sufficient, leave as-is; if production-on-Cloudflare is desired alongside GitHub Pages, configure a deploy step.

## P2

- **Cosmetic Terraform plan drift** — `stripe_payment_link` has a few optional fields (e.g., `application_fee_amount = 0 -> null`) that show as in-place updates in `terraform plan` but don't change anything. Plan output will keep showing this until the fields are explicitly added to config. Harmless.

- **`hashicorp/setup-terraform@v3` action pin** — Major-version pin; could tighten to SHA for supply-chain hardening.

- **Auto-trigger of `stripe-sync.yml`** — Currently manual-dispatch only. Consider gating on a merged PR with `infra/stripe/**` changes if you start using Stripe IaC more frequently.

- **`stripe-plan.yml` posts new comment per push** — Could use a find-or-create-comment pattern for cleaner PR comment history (requires another third-party action).

- **`mustache.js` submodule is unused** — Repo declares the `mustache.js` git submodule but loads `mustache.min.js` from the repo root directly. Remove the submodule.

- **`.htaccess` is dead code** — Apache rewrite rules at repo root. Neither GitHub Pages nor Cloudflare Workers honor `.htaccess`. Delete.

- **1.5 GiB git pack file** — `.git/objects/pack/pack-*.pack` is huge, likely from historical large-image commits. Slows clones and CI's `Cloning repository` step. Investigate:
  ```sh
  git rev-list --objects --all \
    | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' \
    | awk '$1=="blob" && $3 >= 5242880 {print $3, $4}' \
    | sort -nr | head -20
  ```

## In flight (open PRs at time of writing)

- **PR #11** — Original `new-layout` WIP branch. Most content has been ported via #16 + #24 + #25. Close once #26 merges.
- **PR #26** — Photo tile / content card layout + video lightbox (goal→main bundle of #23 + #24 + #25). Awaits approving review from `frankieeder` account.
- **PR #27** — Tighten video lightbox margins + populate captions. Targets the goal branch of #26. Merge before #26 ships.

## Decisions worth not re-litigating

- **BUY PRINT uses Stripe Payment Links**, not Checkout Sessions. Payment Links require no backend; the static site can link directly.
- **Cloudflare Workers Static Assets** (not Pages classic) was the path Cloudflare's dashboard wired into. Migration to Pages classic is possible but not needed.
- **R2 for Terraform state**, not Terraform Cloud or local: the user already uses Cloudflare for DNS, so this keeps vendor count down.
- **Multi-PR dev cycle pattern**: goal branch + sub-PRs targeting goal + final goal→main PR. Used twice (BUY PRINT extract, new-layout extract).
- **`ifr-devbot` does the work, `frankieeder` approves**: explicit choice to keep a human in the merge loop. Non-bypassable approving-review rule on both this repo's main and the vault's main.
