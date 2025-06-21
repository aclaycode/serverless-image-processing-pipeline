// AWS SDK for interacting with AWS services. Don't need to install aws-sdk into directory by using this
const AWS = require('aws-sdk');

const sharp = require('sharp'); // Need to include sharp for image conversion

// Initialize S3 client instance. Match region to bucket
const s3 = new AWS.S3();

// Lambda funciton main handler. AWS automatically invokes this function when an event occurs.
exports.handler = async (event) => {
  try {
    // Retrieve output bucket name from environment variables
    const outputBucket = process.env.OUTPUT_BUCKET;

    // Process each uploaded file
    for (const record of event.Records) {

    // Get the uploaded file's details from the event
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    console.log(`New object uploaded: ${bucket}/${key}`);

    // Get the image file from S3
    const object = await s3.getObject({ Bucket: bucket, Key: key }).promise(); // Retrieves file in S3 bucket

    // Placeholder for image processing logic
    const inputBuffer = object.Body;

    // Convert JPEG buffer to PNG with high (9) compression. Set to high for development to save on data in stored in S3. Can change later
    const processedImage = await sharp(inputBuffer)
      .png({ compressionLevel: 9 })
      .toBuffer();

    // Replace original extension with .png
    const outputKey = key.replace(/\.[^/.]+$/, '') + '.png';  

    await s3.putObject({
      Bucket: outputBucket,
      Key: outputKey,
      Body: processedImage,
      ContentType: 'image/png'
    }).promise();

    console.log(`Processed image saved as: ${outputKey}`);
  }
  } catch (err) {
    console.error('Image processing failed:', err);
    throw err;
  }
};