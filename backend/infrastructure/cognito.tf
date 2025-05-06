

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

  access_token_validity  = 1
  id_token_validity      = 1
  refresh_token_validity = 30

  token_validity_units {
    access_token  = "days"
    id_token      = "days"
    refresh_token = "days"
  }
}

resource "aws_cognito_user_pool_domain" "mj_user_pool_domain" {
  domain       = var.aws_cognito_user_pool_domain[terraform.workspace]
  user_pool_id = aws_cognito_user_pool.mj_user_pool.id
}
