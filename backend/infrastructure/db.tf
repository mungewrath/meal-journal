# DynamoDB table for user preferences

resource "aws_dynamodb_table" "mj_user_preferences" {
  name         = "mj_user_preferences"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "user_id"

  attribute {
    name = "user_id"
    type = "S"
  }
}
