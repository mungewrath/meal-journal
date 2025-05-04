resource "aws_dynamodb_table" "mbd_user_preferences" {
  name                        = "mbd_user_preferences"
  billing_mode                = "PAY_PER_REQUEST"
  hash_key                    = "user_id"
  deletion_protection_enabled = true

  attribute {
    name = "user_id"
    type = "S"
  }
}

resource "aws_dynamodb_table" "mbd_meals" {
  name                        = "mbd_meals"
  billing_mode                = "PAY_PER_REQUEST"
  hash_key                    = "user_id"
  range_key                   = "date_time"
  deletion_protection_enabled = true

  attribute {
    name = "user_id"
    type = "S"
  }

  # Define date as a range key
  attribute {
    name = "date_time"
    type = "S"
  }
}

resource "aws_dynamodb_table" "mbd_foods" {
  name                        = "mbd_foods"
  billing_mode                = "PAY_PER_REQUEST"
  hash_key                    = "user_id"
  deletion_protection_enabled = true

  attribute {
    name = "user_id"
    type = "S"
  }
}

resource "aws_dynamodb_table" "mbd_symptoms" {
  name                        = "mbd_symptoms"
  billing_mode                = "PAY_PER_REQUEST"
  hash_key                    = "user_id"
  range_key                   = "date_time"
  deletion_protection_enabled = true

  attribute {
    name = "user_id"
    type = "S"
  }

  # Define date as a range key
  attribute {
    name = "date_time"
    type = "S"
  }
}
