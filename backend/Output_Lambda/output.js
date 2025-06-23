// AWS SDK for interacting with AWS services. Don't need to install aws-sdk into directory by using this
const AWS = require('aws-sdk');

// Need to include sharp for image conversion
const sharp = require('sharp');

// Log sharp versions and info (optional but helpful)
console.log("Sharp version:", sharp.version);
console.log("Available formats:", sharp.format);

// Initialize S3 client instance. Match region to bucket
const s3 = new AWS.S3();

// Lambda function main handler. AWS automatically invokes this function when an event occurs.
exports.handler = async (event) => {
  try {
    // Retrieve output bucket name from environment variables
    const outputBucket = process.env.OUTPUT_BUCKET;
    console.log("Output bucket from env:", outputBucket);

    // Process each uploaded file
    for (const record of event.Records) {

      // Get the uploaded file's details from the event
      const bucket = record.s3.bucket.name;
      const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

      console.log(`New object uploaded: ${bucket}/${key}`);

      // Skip files that aren't .jpg or .jpeg
      if (!key.toLowerCase().endsWith('.jpg') && !key.toLowerCase().endsWith('.jpeg')) {
        console.log(`Unsupported file type. Skipping: ${key}`);
        continue;
      }

      console.log("Fetching image from S3...");
      const object = await s3.getObject({ Bucket: bucket, Key: key }).promise();
      console.log("Image fetched. Size:", object.ContentLength || object.Body.length);

      const inputBuffer = object.Body;

      console.log("Buffer type:", typeof inputBuffer, "Is Buffer:", Buffer.isBuffer(inputBuffer), "Byte length:", inputBuffer.length);
      console.log("Free memory (approx):", process.memoryUsage().heapFree || 'unknown');

      let processedImage;
      try {
        console.log("Running sharp conversion...");
        processedImage = await sharp(inputBuffer)
          .png({ compressionLevel: 9 })
          .toBuffer();
        console.log("Sharp conversion successful. Buffer size:", processedImage.length);
      } catch (sharpErr) {
        console.error("Sharp conversion failed:", sharpErr);
        console.error("Possible cause: native binaries incompatible or memory exceeded.");
        throw sharpErr;
      }

      const outputKey = key.replace(/\.[^/.]+$/, '') + '.png';
      console.log(`Uploading to ${outputBucket} as ${outputKey}...`);

      await s3.putObject({
        Bucket: outputBucket,
        Key: outputKey,
        Body: processedImage,
        ContentType: 'image/png'
      }).promise();
      console.log("Upload successful.");

      await s3.putObjectAcl({
        Bucket: outputBucket,
        Key: outputKey,
        ACL: 'public-read'
      }).promise();
      console.log("ACL set to public-read.");

      console.log(`Processed image saved as: ${outputKey}`);
    }
  } catch (err) {
    console.error('Image processing failed:', err);
    throw err;
  }
};
