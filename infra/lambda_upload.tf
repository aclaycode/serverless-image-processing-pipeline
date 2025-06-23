// Create IAM role. NOT the same as IAM user.
// Key differences:
    // IAM Role: Temporary identity assumed by AWS services. No permanant credentials
    // IAM User: Long term identity for person or service. Permanant credentials
resource "aws_iam_role" "upload_lambda_role_dev" { // image_conversion_role_dev is the terraform IAM role name
    // AWS IAM role name. Slightly different than Terraform for more flexibility/clarification across code bases
  name = "image_upload_lambda_role"

    //Trust policy. // Converts Terraform map to JSON formatted data
  assume_role_policy = jsonencode({
    Version = "2012-10-17", // Standard version for AWS IAM policies

    //Statement defines the trust relationship. Who can assume the roles and under what conditions
    Statement = [{
      Effect = "Allow", // Allow Lambda to assume this role

      // Defines WHO is allowed to use this role
      Principal = {
        Service = "lambda.amazonaws.com" // Any lambda funciton in my AWS can use this role
      },
      Action = "sts:AssumeRole" // Specific action - Assume Role
    }]
  })
}

// Attach AWS-managed policy to allow upload Lambda to write logs to CloudWatch
resource "aws_iam_role_policy_attachment" "upload_lambda_logs" {
  role       = aws_iam_role.upload_lambda_role_dev.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

// Inline policy to allow upload Lambda to decrypt environment variables (KMS)
resource "aws_iam_role_policy" "upload_lambda_kms_policy" {
  name = "allow-kms-decrypt"
  role = aws_iam_role.upload_lambda_role_dev.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "kms:Decrypt",
          "kms:GenerateDataKey"
        ],
        Resource = "*"
      }
    ]
  })
}

// Defines an AWS Lambda function resource using Terraform
resource "aws_lambda_function" "upload_function_dev" {
  function_name = "presign_upload_role" // Name of the Lambda function that will appear in AWS Console
  runtime       = "nodejs18.x" // Specify Node.js runtime
  handler       = "presign_upload.handler" // Specify function handler in presignedURL.js

  // Attach IAM role that the Lambda assumes at runtime. Grabs the Amazon Resources Name (arn)
  // which is a unique identifier
  role          = aws_iam_role.upload_lambda_role_dev.arn

  // Path to the zipped deployment package containing your Lambda code
  filename      = "../backend/Upload_Lambda/upload_function.zip"

  kms_key_arn   = null

  // Environment variables passed into the Lambda function
  environment {
    variables = {
      // Name of the S3 bucket where the presigned URL will allow uploads
      UPLOAD_BUCKET = "aclay-upload-image-bucket"
    }
  }
}

// Outputs the name of the Lambda function to make it accessible from outside this module
output "lambda_function_name" {
  value = aws_lambda_function.upload_function_dev.function_name
}

// Outputs the invoke ARN of the Lambda function
// This is the full endpoint that API Gateway or other AWS services use to call the function
output "lambda_invoke_arn" {
  value = aws_lambda_function.upload_function_dev.invoke_arn
}
