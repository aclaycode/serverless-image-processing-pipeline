terraform {
  backend "s3" {
    bucket         = "image-pipeline-terraform-state"
    key            = "image-pipeline/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}
