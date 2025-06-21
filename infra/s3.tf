// Define S3 bucket for receiving user-uploaded images
resource "aws_s3_bucket" "upload_bucket" {
  bucket = "aclay-upload-image-bucket"
}

// Define S3 bucket for storing converted images
resource "aws_s3_bucket" "output_bucket" {
  bucket = "aclay-output-image-bucket"
}