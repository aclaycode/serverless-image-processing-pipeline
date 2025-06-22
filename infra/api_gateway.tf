// Creates a new HTTP API using API Gateway v2
resource "aws_apigatewayv2_api" "upload_api" {
  name          = "image-upload-api" // Friendly name for the API
  protocol_type = "HTTP" // Specifies this is an HTTP (not WebSocket) API

    cors_configuration {
    allow_origins = ["*"] // Change to CloudFront domain later
    allow_methods = ["GET", "POST", "OPTIONS"]
    allow_headers = ["Content-Type"]
  }
}

// Connects the Lambda function to API Gateway as a backend integration
resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id                   = aws_apigatewayv2_api.upload_api.id // Ties this integration to the API defined above
  integration_type         = "AWS_PROXY" // Forwards the full request to Lambda (proxy mode)
  integration_uri          = aws_lambda_function.upload_function_dev.invoke_arn  // The Lambda function to invoke
  integration_method       = "POST" // HTTP method to use when calling Lambda
  payload_format_version   = "2.0" // Required for structured event object (query strings, etc.)
}

// Defines the route that maps a specific HTTP method and path to the Lambda integration
resource "aws_apigatewayv2_route" "upload_route" {
  api_id    = aws_apigatewayv2_api.upload_api.id // Attaches this route to your API
  route_key = "GET /upload" // Triggers on GET requests to /upload
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}" // Connects the route to the Lambda integration
}

// Creates a deployment stage that exposes the API to the public
resource "aws_apigatewayv2_stage" "default_stage" {
  api_id      = aws_apigatewayv2_api.upload_api.id // Uses the API created above
  name        = "$default" // Default stage name for simplified URL
  auto_deploy = true // Automatically deploys on any config change
}

// Gives API Gateway permission to invoke your Lambda function
resource "aws_lambda_permission" "allow_apigw_invoke" {
  statement_id  = "AllowExecutionFromAPIGatewayV4"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.upload_function_dev.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.upload_api.execution_arn}/*/*"

  depends_on = [
    aws_apigatewayv2_stage.default_stage
  ]
}