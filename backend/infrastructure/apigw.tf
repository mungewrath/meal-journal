# Create an API Gateway HTTP API
resource "aws_api_gateway_rest_api" "mbd_rest_api" {
  name        = "MealJournalAPI"
  description = "API Gateway for Meal Journal"
}


# API Gateway Resource
resource "aws_api_gateway_resource" "proxy" {
  rest_api_id = aws_api_gateway_rest_api.mbd_rest_api.id
  parent_id   = aws_api_gateway_rest_api.mbd_rest_api.root_resource_id
  path_part   = "{proxy+}" # Proxy resource for all paths
}

# API Gateway Method
resource "aws_api_gateway_method" "proxy" {
  rest_api_id   = aws_api_gateway_rest_api.mbd_rest_api.id
  resource_id   = aws_api_gateway_resource.proxy.id
  http_method   = "ANY" # Accept all HTTP methods
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id

  request_parameters = {
    "method.request.path.proxy" = true
  }
}

# Allow OPTIONS method for CORS
resource "aws_api_gateway_method" "proxy_options" {
  rest_api_id   = aws_api_gateway_rest_api.mbd_rest_api.id
  resource_id   = aws_api_gateway_resource.proxy.id
  http_method   = "OPTIONS"
  authorization = "NONE" # No authorization for OPTIONS requests
}

# Lambda Integration to API Gateway
resource "aws_api_gateway_integration" "proxy" {
  rest_api_id             = aws_api_gateway_rest_api.mbd_rest_api.id
  resource_id             = aws_api_gateway_resource.proxy.id
  http_method             = aws_api_gateway_method.proxy.http_method
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.mbd_api_lambda_handler.invoke_arn
  integration_http_method = "POST"

  request_parameters = {
    "integration.request.path.proxy" = "method.request.path.proxy"
  }
}

# Integration for OPTIONS
resource "aws_api_gateway_integration" "proxy_options" {
  rest_api_id = aws_api_gateway_rest_api.mbd_rest_api.id
  resource_id = aws_api_gateway_resource.proxy.id
  http_method = aws_api_gateway_method.proxy_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }

  # response_parameters = {
  #   "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  #   "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'"
  #   "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,Authorization'"
  # }

  # response_templates = {
  #   "application/json" = ""
  # }
}

# Response for OPTIONS
resource "aws_api_gateway_method_response" "proxy_options" {
  rest_api_id = aws_api_gateway_rest_api.mbd_rest_api.id
  resource_id = aws_api_gateway_resource.proxy.id
  http_method = aws_api_gateway_method.proxy_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Headers" = true
  }
}
# Integration response for mock integration
resource "aws_api_gateway_integration_response" "options" {
  rest_api_id = aws_api_gateway_rest_api.mbd_rest_api.id
  resource_id = aws_api_gateway_resource.proxy.id
  http_method = aws_api_gateway_method.proxy_options.http_method
  status_code = "200"

  # Set the appropriate CORS headers in the mock response
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,Authorization'"
  }
}

# API Gateway Deployment
resource "aws_api_gateway_deployment" "main" {
  depends_on  = [aws_api_gateway_integration.proxy]
  rest_api_id = aws_api_gateway_rest_api.mbd_rest_api.id

  triggers = {
    redeployment = sha1(jsonencode({
      rest_api_id  = aws_api_gateway_rest_api.mbd_rest_api.id
      resources    = aws_api_gateway_resource.proxy.id
      methods      = [aws_api_gateway_method.proxy.http_method, aws_api_gateway_method.proxy_options.http_method]
      integrations = aws_api_gateway_integration.proxy.uri
    }))
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "prod" {
  deployment_id = aws_api_gateway_deployment.main.id
  rest_api_id   = aws_api_gateway_rest_api.mbd_rest_api.id
  stage_name    = "prod"
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
