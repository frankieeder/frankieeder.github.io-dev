terraform {
  required_providers {
    stripe = {
      source  = "stripe/stripe"
      version = "~> 0.1"
    }
    stripealt = {
      source  = "andrewbaxter/stripe"
      version = "~> 0.0.24"
    }
    local = {
      source  = "hashicorp/local"
      version = "~> 2.6"
    }
    external = {
      source  = "hashicorp/external"
      version = "~> 2.3"
    }
  }
}

provider "stripe" {
  api_key = var.stripe_api_key
}

provider "stripealt" {
  token = var.stripe_api_key
}


locals {
  variants = jsondecode(file("${path.module}/variants.json")).variants

  variants_map = {
    for variant in local.variants : variant.key => variant
  }

  width_to_shipping_rate = {
    for variant in local.variants : variant.key => (
      tonumber(split("_", variant.key)[0]) < 22 ? "us_standard_<22" : (
        tonumber(split("_", variant.key)[0]) <= 30 ? "us_standard_22-30" : "us_standard_>30"
      )
    )
  }

  payment_link_configs = {
    for variant in local.variants : "${variant.key}" => {
      price_id          = stripe_price.variants[variant.key].id
      shipping_rate_key = local.width_to_shipping_rate[variant.key]
    }
  }
}

resource "stripe_product" "variants" {
  for_each = local.variants_map

  name        = each.value.name
  description = "Fine Art Print, hand calibrated and printed on archival paper in collaboration with local San Francisco printer. Print only."
  active      = true
}

resource "stripe_price" "variants" {
  for_each = local.variants_map

  product     = stripe_product.variants[each.key].id
  currency    = each.value.currency
  unit_amount = each.value.unit_amount
  active      = true
}

output "product_ids" {
  value = {
    for key, product in stripe_product.variants : key => product.id
  }
  description = "Stripe product IDs for each variant"
}

output "price_ids" {
  value = {
    for key, price in stripe_price.variants : key => price.id
  }
  description = "Stripe price IDs for each variant"
}

resource "stripe_shipping_rate" "shipping_rates" {
  for_each = {
    "us_standard_<22" = {
      display_name        = "US Standard - <22"
      fixed_amount_amount = 1000
    }
    "us_standard_22-30" = {
      display_name        = "US Standard - 22-30"
      fixed_amount_amount = 1500
    }
    "us_standard_>30" = {
      display_name        = "US Standard - >30"
      fixed_amount_amount = 2000
    }
  }

  display_name = each.value.display_name
  type         = "fixed_amount"
  fixed_amount {
    amount   = each.value.fixed_amount_amount
    currency = "usd"
  }
  # tax_behavior = "inclusive": the shipping price already includes tax in the
  # displayed amount. If you intended to charge shipping + tax-on-top, set this
  # to "exclusive". TODO: confirm desired behavior with Frankie before going live.
  tax_behavior = "inclusive"
  tax_code     = "txcd_92010001"
  delivery_estimate {
    maximum {
      unit  = "business_day"
      value = 12
    }
    minimum {
      unit  = "business_day"
      value = 7
    }
  }
}

resource "stripe_payment_link" "payment_links" {
  for_each = local.payment_link_configs
  provider = stripealt

  automatic_tax_enabled                         = true
  shipping_address_collection_allowed_countries = ["US"]
  consent_collection_promotions                 = "auto"
  shipping_options {
    shipping_rate = stripe_shipping_rate.shipping_rates[each.value.shipping_rate_key].id
  }


  line_items {
    price    = each.value.price_id
    quantity = 1
  }
}

data "external" "payment_link_urls" {
  for_each = stripe_payment_link.payment_links

  # API key is passed via query (read from stdin as JSON) rather than
  # interpolated into the shell program string. Keeps the literal key out of
  # terraform plan output, debug logs, and the rendered "program" attribute.
  query = {
    api_key = var.stripe_api_key
  }

  program = ["sh", "-c", <<-EOT
    api_key=$(jq -r '.api_key')
    response=$(curl -s -X GET "https://api.stripe.com/v1/payment_links/${each.value.id}" \
      -u "$api_key:")

    if ! echo "$response" | jq -e '.url' > /dev/null 2>&1; then
      echo "Error: Invalid response from Stripe API" >&2
      echo "$response" >&2
      echo '{"url":""}'
      exit 1
    fi

    echo "$response" | jq -c '{url: .url}'
  EOT
  ]
}

output "payment_link_info" {
  value = {
    for key, link in stripe_payment_link.payment_links : key => {
      url = data.external.payment_link_urls[key].result.url
    }
  }
  description = "Payment link information for the product and variants"
}

resource "local_file" "payment_link_info_json" {
  content = jsonencode({
    for key, link in stripe_payment_link.payment_links : key => {
      url          = data.external.payment_link_urls[key].result.url,
      price_amount = stripe_price.variants[key].unit_amount
    }
  })
  filename = "${path.module}/payment_links.json"
}

variable "stripe_api_key" {
  description = "Stripe API key"
  type        = string
  sensitive   = true
}
