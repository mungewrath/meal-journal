provider "aws" {
  region = "us-west-2"
}

variable "region" {
  default = "us-west-2"
}

# resource "aws_lambda_function" "default_preferences" {
#   filename         = "lambda.zip"
#   function_name    = "default_preferences"
#   role             = aws_iam_role.lambda_exec.arn
#   handler          = "index.handler"
#   runtime          = "nodejs14.x"
#   source_code_hash = filebase64sha256("lambda.zip")
# }



# resource "aws_api_gateway_resource" "preferences" {
#   rest_api_id = aws_api_gateway_rest_api.mj_api.id
#   parent_id   = aws_api_gateway_rest_api.mj_api.root_resource_id
#   path_part   = "preferences"
# }

# resource "aws_api_gateway_method" "get_preferences" {
#   rest_api_id   = aws_api_gateway_rest_api.mj_api.id
#   resource_id   = aws_api_gateway_resource.preferences.id
#   http_method   = "GET"
#   authorization = "COGNITO_USER_POOLS"
#   authorizer_id = aws_api_gateway_authorizer.cognito.id
# }

# resource "aws_api_gateway_integration" "lambda" {
#   rest_api_id             = aws_api_gateway_rest_api.mj_api.id
#   resource_id             = aws_api_gateway_resource.preferences.id
#   http_method             = aws_api_gateway_method.get_preferences.http_method
#   type                    = "AWS_PROXY"
#   integration_http_method = "POST"
#   uri                     = aws_lambda_function.default_preferences.invoke_arn
# }

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
  callback_urls                        = ["http://localhost:5173", "https://${aws_cloudfront_distribution.mj_distribution.domain_name}"]
  supported_identity_providers         = ["COGNITO"]
}

resource "aws_cognito_user_pool_domain" "mj_user_pool_domain" {
  domain       = "mj-user-pool-domain"
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
resource "aws_s3_bucket" "mj_static_website" {
  bucket = "mbd-static-website"
}

# Upload all files in the dist folder as s3 objects
locals {
  content_type_map = {
    "js"   = "text/javascript"
    "html" = "text/html"
    "css"  = "text/css"
  }
}

resource "aws_s3_object" "mj_vite_app_files" {
  for_each = fileset("../../prototype-ui/dist", "**")

  bucket       = aws_s3_bucket.mj_static_website.bucket
  key          = each.value
  source       = "../../prototype-ui/dist/${each.value}"
  acl          = "public-read"
  content_type = lookup(local.content_type_map, split(".", "../../prototype-ui/dist/${each.value}")[5], "text/html")
}

# Cloudfront Distribution
resource "aws_cloudfront_distribution" "mj_distribution" {
  origin {
    domain_name = aws_s3_bucket.mj_static_website.bucket_regional_domain_name
    origin_id   = "S3Origin"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.mj_oai.cloudfront_access_identity_path
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
    Name = "mj_distribution"
  }
}

resource "aws_cloudfront_origin_access_identity" "mj_oai" {
  comment = "Origin Access Identity for Meal Journal"
}

output "cloudfront_domain_name" {
  value = aws_cloudfront_distribution.mj_distribution.domain_name
}
