# infra/stripe

Terraform config for Stripe products, prices, shipping rates, and payment links.

## Stripe API key

Provide via any of:
- `export TF_VAR_stripe_api_key=sk_...` before running terraform
- A `terraform.tfvars` file (add to `.gitignore` — never commit)
- Interactive prompt (terraform will ask if the var is unset)

## State backend (Cloudflare R2)

State lives in the `frankieeder-com` R2 bucket under `stripe/terraform.tfstate`.

Credentials come from the standard AWS env vars (the s3 backend reads them):
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

Get these from Cloudflare → R2 → Manage R2 API Tokens → Create token (Object Read & Write, scoped to `frankieeder-com`). Save both values immediately — the secret is shown once.

In CI, set them as GitHub repo secrets (Settings → Secrets and variables → Actions). Locally:

```sh
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
```

### First-time migration from local state

If you have an existing local `terraform.tfstate` from before the backend was wired up, push it to R2:

```sh
cd infra/stripe
terraform init -migrate-state
# answer "yes" to copy local state to the new backend
```

After this, the local `terraform.tfstate` is moved to R2 and subsequent runs read/write there automatically.

### Fresh setup (no existing state)

If there's no local state file, run `terraform init` and accept that the next `apply` will treat all resources as new — meaning Stripe will end up with duplicates of the existing products/prices/links. **Don't do this if Stripe already has the resources.** Instead, either find your old state file or use `terraform import` to bring existing Stripe resources into the new state.

## Two providers

- `stripe/stripe` — used for products, prices, and shipping rates
- `andrewbaxter/stripe` (`stripealt`) — used for `stripe_payment_link`; the official provider does not support that resource

## `data "external"` block

Neither Stripe provider exposes the payment link `url` attribute as a readable output, so the `data "external"` blocks read it back directly from the Stripe API via `curl`/`jq` after `apply`.

## Regenerating `payment_links.json`

`.github/workflows/stripe-sync.yml` is the canonical path:
1. Go to **Actions → Stripe Sync → Run workflow** in GitHub
2. The workflow runs `terraform apply` and commits the refreshed `payment_links.json`

Local `terraform apply` is for development only. Do NOT commit changes to `payment_links.json` from a local run — let CI do it to avoid drift.
