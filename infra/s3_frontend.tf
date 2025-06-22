// Creates a private S3 bucket for hosting the frontend React app
resource "aws_s3_bucket" "frontend" {
  bucket         = "my-frontend-site-dev" // Replace with your unique S3 bucket name
  force_destroy  = true                   // Allows Terraform to delete non-empty bucket during destroy
}

// Blocks all public access to the S3 bucket
resource "aws_s3_bucket_public_access_block" "frontend_block" {
  bucket                  = aws_s3_bucket.frontend.id
  block_public_acls       = true   // Block public access control lists (ACLs)
  block_public_policy     = true   // Block public bucket policies
  ignore_public_acls      = true   // Ignore any public ACLs already set
  restrict_public_buckets = true   // Prevent bucket from being made public in the future6
}

// Configures the bucket for static website hosting (required for CloudFront origin)
resource "aws_s3_bucket_website_configuration" "frontend_site" {
  bucket = aws_s3_bucket.frontend.id

  index_document {
    suffix = "index.html" // Default page when accessing the root URL
  }

  error_document {
    key = "index.html"     // Redirects error paths (e.g. React Router 404s) back to index.html
  }
}

