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

# API Gateway Method Response
resource "aws_api_gateway_method_response" "proxy" {
  rest_api_id = aws_api_gateway_rest_api.mbd_rest_api.id
  resource_id = aws_api_gateway_resource.proxy.id
  http_method = aws_api_gateway_method.proxy.http_method
  status_code = "200"

  response_models = {
    "application/json" = "Empty"
  }
}

# API Gateway Integration Response
resource "aws_api_gateway_integration_response" "proxy" {
  rest_api_id = aws_api_gateway_rest_api.mbd_rest_api.id
  resource_id = aws_api_gateway_resource.proxy.id
  http_method = aws_api_gateway_method.proxy.http_method
  status_code = aws_api_gateway_method_response.proxy.status_code

  response_templates = {
    "application/json" = ""
  }
}

# API Gateway Deployment
resource "aws_api_gateway_deployment" "main" {
  depends_on  = [
    aws_api_gateway_integration.proxy,
    aws_api_gateway_integration_response.proxy
  ]
  rest_api_id = aws_api_gateway_rest_api.mbd_rest_api.id

  triggers = {
    redeployment = sha1(jsonencode(aws_api_gateway_rest_api.mbd_rest_api.body))
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
