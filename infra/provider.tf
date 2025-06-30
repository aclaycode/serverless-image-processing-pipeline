// Specify AWS provider and region
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.40"
    }
  }
}

provider "aws" {
  region  = "us-east-1"
//  profile = "image-pipeline-deployer" // ensures correct IAM identity is used
}
