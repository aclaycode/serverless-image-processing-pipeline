// Creates a CloudFront Origin Access Control to securely connect CloudFront to private S3
resource "aws_cloudfront_origin_access_control" "frontend_oac" {
  name                              = "frontend-oac" // Friendly name for the OAC
  origin_access_control_origin_type = "s3" // Origin is an S3 bucket
  signing_behavior                  = "always" // Always sign requests
  signing_protocol                  = "sigv4" // Use AWS Signature Version 4
}

// Defines the CloudFront distribution that serves your frontend
resource "aws_cloudfront_distribution" "frontend_cdn" {
  enabled             = true // Enable the distribution
  default_root_object = "index.html" // Serve this file at the root (e.g., /)

  origin {
    domain_name              = aws_s3_bucket.frontend.bucket_regional_domain_name // S3 bucket domain
    origin_id                = "frontendS3" // An internal identifier for this origin
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend_oac.id // Secure access via OAC
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"] // Allowed HTTP methods
    cached_methods         = ["GET", "HEAD", "OPTIONS"] // Methods that CloudFront caches
    target_origin_id       = "frontendS3" // Match the origin_id defined above
    viewer_protocol_policy = "allow-all" // Allow both HTTP and HTTPS

    forwarded_values {
      query_string = true // Forward query strings to origin
      cookies {
        forward = "all" // Forward all cookies to origin
      }
    }
  }

  price_class = "PriceClass_100" // Use cheapest regional edge locations (dev-friendly)

  viewer_certificate {
    cloudfront_default_certificate = true // Use default *.cloudfront.net HTTPS cert
  }

  restrictions {
    geo_restriction {
      restriction_type = "none" // No geo restrictions
    }
  }
}