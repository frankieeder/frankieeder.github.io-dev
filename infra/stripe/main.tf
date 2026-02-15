terraform {
  required_providers {
    stripe = {
      source  = "stripe/stripe"
      version = "~> 0.0"
    }
    # stripealt = {
    #   source  = "andrewbaxter/stripe"
    #   version = "~> 0.0"
    # }
  }
}

provider "stripe" {
  api_key = var.stripe_api_key
}

# provider "stripealt" {
#   token = var.stripe_api_key
# }

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

locals {
  payment_link_configs = {
    small_only = {
      price_id = stripe_price.variant_small.id
    }
    medium_only = {
      price_id = stripe_price.variant_medium.id
    }
    large_only = {
      price_id = stripe_price.variant_large.id
    }
  }

  custom_fields = [
    {
      key         = "piece"
      type        = "text"
      name        = "Piece Name"
      placeholder = null
      optional    = false
    },
  ]

  custom_field_params_list = flatten([for idx, field in local.custom_fields : concat([
    "-d \"custom_fields[${idx}][key]=${field.key}\"",
    "-d \"custom_fields[${idx}][type]=${field.type}\"",
    "-d \"custom_fields[${idx}][label]=${field.name}\"",
    "-d \"custom_fields[${idx}][optional]=${tostring(field.optional)}\""
  ], field.placeholder != null ? ["-d \"custom_fields[${idx}][placeholder]=${field.placeholder}\""] : [])])
  
  custom_field_params_json = jsonencode(local.custom_field_params_list)
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

data "external" "payment_links" {
  for_each = local.payment_link_configs

  program = ["sh", "-c", <<-EOT
    params_json='${local.custom_field_params_json}'
    params=""
    if [ "$params_json" != "[]" ] && [ "$params_json" != "" ]; then
      for param in $(echo "$params_json" | jq -r '.[]'); do
        params="$params \\\n      $param"
      done
      # Remove leading space and backslash
      params=$(echo "$params" | sed 's/^ *\\\\n *//')
    fi
    response=$(curl -s -X POST https://api.stripe.com/v1/payment_links \
      -u ${var.stripe_api_key}: \
      -d "line_items[0][price]=${each.value.price_id}" \
      -d "line_items[0][quantity]=1"$params)
    
    if ! echo "$response" | jq -e '.id' > /dev/null 2>&1; then
      echo "Error: Invalid response from Stripe API" >&2
      echo "$response" >&2
      echo '{"id":"","url":""}'
      exit 1
    fi
    
    echo "$response" | jq -c '{id: .id, url: .url}'
  EOT
  ]
}

output "payment_link_ids" {
  value = {
    for key, data in data.external.payment_links : key => data.result.id
  }
  description = "Payment link IDs for the product and variants"
}

output "payment_link_urls" {
  value = {
    for key, data in data.external.payment_links : key => data.result.url
  }
  description = "Payment link URLs for the product and variants"
}

variable "stripe_api_key" {
  description = "Stripe API key"
  type        = string
  sensitive   = true
}
