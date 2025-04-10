terraform {
  backend "s3" {
    bucket = "mbd-terraform-state"
    key    = "tfstate"
    region = "us-west-2"
  }
}

variable "workspace_iam_roles" {
  default = {
    stage = "arn:aws:iam::412381782673:role/terraform"
    prod  = "arn:aws:iam::034362048865:role/terraform"
  }
}

provider "aws" {
  region = "us-west-2"

  assume_role {
    role_arn = var.workspace_iam_roles[terraform.workspace]
  }
}

variable "region" {
  default = "us-west-2"
}

# Environment-specific values #
variable "mbd_web_bucket_name" {
  default = {
    stage = "mbd-static-website-stage"
    prod  = "mbd-static-website"
  }
}

variable "aws_cognito_user_pool_domain" {
  default = {
    stage = "mbd-user-pool-domain-stage"
    prod  = "mj-user-pool-domain"
  }
}

# Managed Cognito User Pool #
resource "aws_cognito_user_pool" "mj_user_pool" {
  name = "mj_user_pool"
}

resource "aws_cognito_user_pool_client" "mj_user_pool_client" {
  user_pool_id                         = aws_cognito_user_pool.mj_user_pool.id
  name                                 = "user_pool_client"
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = ["phone", "email", "openid", "profile"]
  callback_urls                        = ["http://localhost:3000", "https://${aws_cloudfront_distribution.mbd_web_distribution.domain_name}"]
  logout_urls                          = ["http://localhost:3000", "https://${aws_cloudfront_distribution.mbd_web_distribution.domain_name}"]
  supported_identity_providers         = ["COGNITO"]

  access_token_validity = 1
  id_token_validity = 1
  refresh_token_validity = 30

  token_validity_units {
    access_token = "days"
    id_token     = "days"
    refresh_token = "days"
  }
}

resource "aws_cognito_user_pool_domain" "mj_user_pool_domain" {
  domain       = var.aws_cognito_user_pool_domain[terraform.workspace]
  user_pool_id = aws_cognito_user_pool.mj_user_pool.id
}

resource "aws_iam_role" "lambda_exec" {
  name = "lambda_exec_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_policy" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Cloudfront Website Hosting #
resource "aws_s3_bucket" "mbd_web" {
  bucket = var.mbd_web_bucket_name[terraform.workspace]
}

resource "aws_s3_bucket_ownership_controls" "mbd_web_bucket_ownership" {
  bucket = aws_s3_bucket.mbd_web.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_public_access_block" "mbd_web_public_access_block" {
  bucket = aws_s3_bucket.mbd_web.id

  block_public_acls = false
  # block_public_policy     = false
  # ignore_public_acls      = false
  # restrict_public_buckets = false
}

resource "aws_s3_bucket_acl" "mbd_web_acl" {
  depends_on = [
    aws_s3_bucket_ownership_controls.mbd_web_bucket_ownership,
    aws_s3_bucket_public_access_block.mbd_web_public_access_block,
  ]

  bucket = aws_s3_bucket.mbd_web.id
  acl    = "public-read"
}

# Upload all files in the dist folder as s3 objects
locals {
  content_type_map = {
    "js"    = "text/javascript"
    "html"  = "text/html"
    "css"   = "text/css"
    "ico"   = "image/vnd.microsoft.icon"
    "txt"   = "text/plain"
    "woff2" = "font/woff2"
  }
}

resource "aws_s3_object" "mbd_web_build" {
  for_each = fileset("../../mbd-web/out", "**")

  bucket       = aws_s3_bucket.mbd_web.bucket
  key          = each.value
  source       = "../../mbd-web/out/${each.value}"
  acl          = "public-read"
  content_type = lookup(local.content_type_map, split(".", "../../mbd-web/out/${each.value}")[5], "text/html")
  etag         = filemd5("../../mbd-web/out/${each.value}")
}

# Cloudfront Distribution
resource "aws_cloudfront_distribution" "mbd_web_distribution" {
  origin {
    domain_name = aws_s3_bucket.mbd_web.bucket_regional_domain_name
    origin_id   = "S3Origin"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.mbd_oai.cloudfront_access_identity_path
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  default_cache_behavior {
    target_origin_id       = "S3Origin"
    viewer_protocol_policy = "redirect-to-https"

    allowed_methods = [
      "GET",
      "HEAD",
      "OPTIONS",
      "PUT",
      "PATCH",
      "POST",
      "DELETE",
    ]

    cached_methods = [
      "GET",
      "HEAD",
    ]

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    min_ttl                   = 0
    default_ttl               = 300
    max_ttl                   = 31536000
    compress                  = true
    field_level_encryption_id = ""
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Name = "mbd_web_distribution"
  }
}

resource "aws_cloudfront_origin_access_identity" "mbd_oai" {
  comment = "Origin Access Identity for My Belly's Diary"
}

output "mbd_web_cloudfront_domain_name" {
  value = aws_cloudfront_distribution.mbd_web_distribution.domain_name
}
