# Create an API Gateway HTTP API
resource "aws_api_gateway_rest_api" "mbd_rest_api" {
  name        = "MealJournalAPI"
  description = "API Gateway for Meal Journal"
}

# Root method
resource "aws_api_gateway_method" "root" {
  rest_api_id   = aws_api_gateway_rest_api.mbd_rest_api.id
  resource_id   = aws_api_gateway_rest_api.mbd_rest_api.root_resource_id
  http_method   = "ANY"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

# Root integration
resource "aws_api_gateway_integration" "root" {
  rest_api_id             = aws_api_gateway_rest_api.mbd_rest_api.id
  resource_id             = aws_api_gateway_rest_api.mbd_rest_api.root_resource_id
  http_method             = aws_api_gateway_method.root.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.mbd_api_lambda_handler.invoke_arn
}

# API Gateway Resource
resource "aws_api_gateway_resource" "proxy" {
  rest_api_id = aws_api_gateway_rest_api.mbd_rest_api.id
  parent_id   = aws_api_gateway_rest_api.mbd_rest_api.root_resource_id
  path_part   = "{proxy+}"
}

# API Gateway Method
resource "aws_api_gateway_method" "proxy" {
  rest_api_id   = aws_api_gateway_rest_api.mbd_rest_api.id
  resource_id   = aws_api_gateway_resource.proxy.id
  http_method   = "ANY"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id

  request_parameters = {
    "method.request.path.proxy" = true
  }
}

# OPTIONS method for CORS
resource "aws_api_gateway_method" "proxy_options" {
  rest_api_id   = aws_api_gateway_rest_api.mbd_rest_api.id
  resource_id   = aws_api_gateway_resource.proxy.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# OPTIONS Integration
resource "aws_api_gateway_integration" "proxy_options" {
  rest_api_id = aws_api_gateway_rest_api.mbd_rest_api.id
  resource_id = aws_api_gateway_resource.proxy.id
  http_method = aws_api_gateway_method.proxy_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

# OPTIONS Method Response
resource "aws_api_gateway_method_response" "proxy_options" {
  rest_api_id = aws_api_gateway_rest_api.mbd_rest_api.id
  resource_id = aws_api_gateway_resource.proxy.id
  http_method = aws_api_gateway_method.proxy_options.http_method
  status_code = "200"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

# OPTIONS Integration Response
resource "aws_api_gateway_integration_response" "proxy_options" {
  rest_api_id = aws_api_gateway_rest_api.mbd_rest_api.id
  resource_id = aws_api_gateway_resource.proxy.id
  http_method = aws_api_gateway_method.proxy_options.http_method
  status_code = aws_api_gateway_method_response.proxy_options.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS,POST,PUT,DELETE'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }

  depends_on = [
    aws_api_gateway_method_response.proxy_options
  ]
}

# Lambda Integration to API Gateway
resource "aws_api_gateway_integration" "proxy" {
  rest_api_id             = aws_api_gateway_rest_api.mbd_rest_api.id
  resource_id             = aws_api_gateway_resource.proxy.id
  http_method             = aws_api_gateway_method.proxy.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.mbd_api_lambda_handler.invoke_arn

  request_parameters = {
    "integration.request.path.proxy" = "method.request.path.proxy"
  }
}

# Method Response
resource "aws_api_gateway_method_response" "proxy" {
  rest_api_id = aws_api_gateway_rest_api.mbd_rest_api.id
  resource_id = aws_api_gateway_resource.proxy.id
  http_method = aws_api_gateway_method.proxy.http_method
  status_code = "200"

  response_models = {
    "application/json" = "Empty"
  }
}

# Integration Response
resource "aws_api_gateway_integration_response" "proxy" {
  rest_api_id = aws_api_gateway_rest_api.mbd_rest_api.id
  resource_id = aws_api_gateway_resource.proxy.id
  http_method = aws_api_gateway_method.proxy.http_method
  status_code = aws_api_gateway_method_response.proxy.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [
    aws_api_gateway_method.proxy,
    aws_api_gateway_integration.proxy,
    aws_api_gateway_method_response.proxy
  ]
}

# API Gateway Deployment
resource "aws_api_gateway_deployment" "main" {
  depends_on = [
    aws_api_gateway_rest_api.mbd_rest_api,
    aws_api_gateway_resource.proxy,
    aws_api_gateway_method.proxy,
    aws_api_gateway_integration.proxy,
    aws_api_gateway_method.root,
    aws_api_gateway_integration.root,
    aws_api_gateway_authorizer.cognito,
    aws_api_gateway_method_response.proxy,
    aws_api_gateway_integration_response.proxy,
    aws_api_gateway_method.proxy_options,
    aws_api_gateway_integration.proxy_options,
    aws_api_gateway_method_response.proxy_options,
    aws_api_gateway_integration_response.proxy_options
  ]
  rest_api_id = aws_api_gateway_rest_api.mbd_rest_api.id

  triggers = {
    redeployment = sha1(jsonencode({
      rest_api             = aws_api_gateway_rest_api.mbd_rest_api.body
      root_method          = aws_api_gateway_method.root.id
      root_integration     = aws_api_gateway_integration.root.id
      proxy_resource       = aws_api_gateway_resource.proxy.id
      proxy_method         = aws_api_gateway_method.proxy.id
      proxy_integration    = aws_api_gateway_integration.proxy.id
      authorizer           = aws_api_gateway_authorizer.cognito.id
      options_method       = aws_api_gateway_method.proxy_options.id
      method_response      = aws_api_gateway_method_response.proxy.id
      integration_response = aws_api_gateway_integration_response.proxy.id
      options_integration  = aws_api_gateway_integration.proxy_options.id
      options_response     = aws_api_gateway_method_response.proxy_options.id
    }))
  }

  lifecycle {
    create_before_destroy = true
  }
}

# Force the stage to be recreated when deployment changes
resource "aws_api_gateway_stage" "prod" {
  deployment_id = aws_api_gateway_deployment.main.id
  rest_api_id   = aws_api_gateway_rest_api.mbd_rest_api.id
  stage_name    = "prod"

  depends_on = [aws_api_gateway_deployment.main]
}

# TODO: This doesn't seem to have any effect
resource "aws_api_gateway_usage_plan" "usage_plan" {
  name = "mbd-usage-plan"

  throttle_settings {
    rate_limit  = 10 # Max requests per second
    burst_limit = 20
  }

  quota_settings {
    limit  = 1000
    period = "MONTH"
  }

  api_stages {
    api_id = aws_api_gateway_rest_api.mbd_rest_api.id
    stage  = aws_api_gateway_stage.prod.stage_name
  }
}

# Cognito Authorizer for API Gateway
resource "aws_api_gateway_authorizer" "cognito" {
  rest_api_id = aws_api_gateway_rest_api.mbd_rest_api.id
  name        = "cognito_authorizer"
  type        = "COGNITO_USER_POOLS"
  provider_arns = [
    aws_cognito_user_pool.mj_user_pool.arn
  ]
}

# Give API Gateway permission to invoke Lambda
resource "aws_lambda_permission" "apigateway_lambda" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.mbd_api_lambda_handler.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.mbd_rest_api.execution_arn}/*/*"
}

output "api_prod_url" {
  value = aws_api_gateway_stage.prod.invoke_url
}
