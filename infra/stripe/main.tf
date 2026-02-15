terraform {
  required_providers {
    stripe = {
      source  = "stripe/stripe"
      version = "~> 0.0"
    }
    stripealt = {
      source  = "andrewbaxter/stripe"
      version = "~> 0.0"
    }
  }
}

provider "stripe" {
  api_key = var.stripe_api_key
}

provider "stripealt" {
  token = var.stripe_api_key
}

resource "stripe_product" "example_product" {
  name        = "Fine Art Print"
  description = "Parent object for fine art print variants"
  active      = true
}

resource "stripe_price" "variant_small" {
  product     = stripe_product.example_product.id
  currency    = "usd"
  unit_amount = 1000
  active      = true
}

resource "stripe_price" "variant_medium" {
  product     = stripe_product.example_product.id
  currency    = "usd"
  unit_amount = 2000
  active      = true
}

resource "stripe_price" "variant_large" {
  product     = stripe_product.example_product.id
  currency    = "usd"
  unit_amount = 3000
  active      = true
}

resource "stripe_payment_link" "variant_small_only" {
  provider = stripealt
  line_items {
    price    = stripe_price.variant_small.id
    quantity = 1
  }
}

resource "stripe_payment_link" "variant_medium_only" {
  provider = stripealt
  line_items {
    price    = stripe_price.variant_medium.id
    quantity = 1
  }
}

resource "stripe_payment_link" "variant_large_only" {
  provider = stripealt
  line_items {
    price    = stripe_price.variant_large.id
    quantity = 1
  }
}

output "product_id" {
  value       = stripe_product.example_product.id
  description = "Stripe product ID"
}

output "price_ids" {
  value = {
    small  = stripe_price.variant_small.id
    medium = stripe_price.variant_medium.id
    large  = stripe_price.variant_large.id
  }
  description = "Stripe price IDs for each variant"
}

output "payment_link_ids" {
  value = {
    small_only   = stripe_payment_link.variant_small_only.id
    medium_only  = stripe_payment_link.variant_medium_only.id
    large_only   = stripe_payment_link.variant_large_only.id
  }
  description = "Payment link IDs for the product and variants"
}

data "external" "payment_link_small_only_url" {
  program = ["sh", "-c", "curl -s -u ${var.stripe_api_key}: https://api.stripe.com/v1/payment_links/${stripe_payment_link.variant_small_only.id} | jq -c '{url: .url}'"]
}

data "external" "payment_link_medium_only_url" {
  program = ["sh", "-c", "curl -s -u ${var.stripe_api_key}: https://api.stripe.com/v1/payment_links/${stripe_payment_link.variant_medium_only.id} | jq -c '{url: .url}'"]
}

data "external" "payment_link_large_only_url" {
  program = ["sh", "-c", "curl -s -u ${var.stripe_api_key}: https://api.stripe.com/v1/payment_links/${stripe_payment_link.variant_large_only.id} | jq -c '{url: .url}'"]
}

output "payment_link_urls" {
  value = {
    small_only   = data.external.payment_link_small_only_url.result.url
    medium_only  = data.external.payment_link_medium_only_url.result.url
    large_only   = data.external.payment_link_large_only_url.result.url
  }
  description = "Payment link URLs for the product and variants"
}

variable "stripe_api_key" {
  description = "Stripe API key"
  type        = string
  sensitive   = true
}
