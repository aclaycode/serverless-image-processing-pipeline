// Builds a policy document allowing CloudFront to access the private S3 bucket
data "aws_iam_policy_document" "frontend_s3_policy" {
  statement {
    actions   = ["s3:GetObject"] // Allow CloudFront to read objects from S3
    resources = ["${aws_s3_bucket.frontend.arn}/*"] // Grant access to all objects in the S3 bucket

    principals {
      type        = "Service" // The principal is a service (CloudFront)
      identifiers = ["cloudfront.amazonaws.com"] // Specifies that CloudFront is allowed
    }

    condition {
      test     = "StringEquals" // Apply condition that limits access
      variable = "AWS:SourceArn" // Only allow access if the request comes from this specific CloudFront distribution
      values   = [aws_cloudfront_distribution.frontend_cdn.arn]
    }
  }
}

// Applies the policy above to the frontend S3 bucket
resource "aws_s3_bucket_policy" "frontend_policy" {
  bucket = aws_s3_bucket.frontend.id // Targets the S3 bucket we created
  policy = data.aws_iam_policy_document.frontend_s3_policy.json // Uses the custom IAM policy we built above
}