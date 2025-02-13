# Package and upload the FastAPI app zip manually or via CI/CD into the bucket
# In this example, assume a prepackaged zip called `fastapi-app.zip` is uploaded
# resource "aws_s3_object" "lambda_zip" {
#   bucket = aws_s3_bucket.lambda_bucket.bucket
#   key    = "fastapi-app.zip"
#   source = "path-to-your-local-fastapi-app/fastapi-app.zip"  # Path to your zipped Lambda package
# }


variable "lambda_package_zip" {
  default = "../api_lambda.zip"
}

# Lambda IAM Role
resource "aws_iam_role" "lambda_role" {
  name = "mbd-api-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      },
    ]
  })
}

# Attach the basic Lambda execution policy
resource "aws_iam_policy_attachment" "lambda_basic_execution" {
  name       = "lambda_basic_execution"
  roles      = [aws_iam_role.lambda_role.name]
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "terraform_data" "lambda_upload_trigger" {
  input = base64sha256(filebase64(var.lambda_package_zip))
}

# Lambda Function
resource "aws_lambda_function" "mbd_api_lambda_handler" {
  function_name = "mbd-api-lambda-handler"
  role          = aws_iam_role.lambda_role.arn
  handler       = "main.handler"
  runtime       = "python3.11"
  memory_size   = 256
  timeout       = 10

  filename = var.lambda_package_zip

  lifecycle {
    replace_triggered_by = [terraform_data.lambda_upload_trigger]
  }
}
