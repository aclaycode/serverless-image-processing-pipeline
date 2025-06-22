// Create IAM role. NOT the same as IAM user.
// Key differences:
    // IAM Role: Temporary identity assumed by AWS services. No permanant credentials
    // IAM User: Long term identity for person or service. Permanant credentials
resource "aws_iam_role" "output_lambda_role_dev" { // image_conversion_role_dev is the terraform IAM role name
    // AWS IAM role name. Slightly different than Terraform for more flexibility/clarification across code bases
  name = "image_output_lambda_role"

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

// Define a Lambda Layer resource
resource "aws_lambda_layer_version" "sharp_layer" {
  filename = "../layers/sharp-layer-master.zip" // Path to the zipped Sharp layer package
  layer_name = "sharp-layer" // Name that will appear for this layer in AWS
  compatible_runtimes = ["nodejs18.x"] // Specifies which runtimes can use this layer

  // Hash of the layer file to detect changes and force redeployment when updated
  source_code_hash = filebase64sha256("../layers/sharp-layer-master.zip")
}


// Defines an AWS Lambda function resource using Terraform
resource "aws_lambda_function" "output_dev" {
  function_name = "output_role" // Name of the Lambda function that will appear in AWS Console
  runtime       = "nodejs18.x" // Specify Node.js runtime
  handler       = "output.handler" // Specify function handler in output.js

  // Attach IAM role that the Lambda assumes at runtime. Grabs the Amazon Resources Name (arn)
  // which is a unique identifier
  role          = aws_iam_role.output_lambda_role_dev.arn

  // Path to the zipped deployment package containing your Lambda code
  filename      = "../backend/Output_Lambda/output_function.zip"

  // Attach the Sharp layer (public or custom ARN)
  layers = [
    aws_lambda_layer_version.sharp_layer.arn
  ]

  // Environment variables passed into the Lambda function
  environment {
    variables = {
      // Name of the S3 bucket where the converted files are output
      OUTPUT_BUCKET = "aclay-output-image-bucket"
    }
  }
}