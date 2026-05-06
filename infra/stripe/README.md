# infra/stripe

Terraform config for Stripe products, prices, shipping rates, and payment links.

## Stripe API key

Provide via any of:
- `export TF_VAR_stripe_api_key=sk_...` before running terraform
- A `terraform.tfvars` file (add to `.gitignore` — never commit)
- Interactive prompt (terraform will ask if the var is unset)

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
