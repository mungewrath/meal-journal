# Create an API Gateway HTTP API
resource "aws_apigatewayv2_api" "mbd_http_api" {
  name          = "MBD HTTP API"
  protocol_type = "HTTP"
}

# Integrate HTTP API with Lambda
resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id                 = aws_apigatewayv2_api.mbd_http_api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.mbd_api_lambda_handler.arn
  payload_format_version = "2.0"
}

# Route all API Gateway traffic (ANY method for all paths) to Lambda
resource "aws_apigatewayv2_route" "default_route" {
  api_id    = aws_apigatewayv2_api.mbd_http_api.id
  route_key = "$default" # This acts as a catch-all for all routes
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

# Create a default stage for API Gateway
resource "aws_apigatewayv2_stage" "default_stage" {
  api_id      = aws_apigatewayv2_api.mbd_http_api.id
  name        = "$default"
  auto_deploy = true # Enable automatic deployment
}

# Give API Gateway permission to invoke Lambda
resource "aws_lambda_permission" "apigateway_lambda" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.mbd_api_lambda_handler.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.mbd_http_api.execution_arn}/*/*"
}

output "api_url" {
  value = aws_apigatewayv2_api.mbd_http_api.api_endpoint
}
