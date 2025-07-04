# Serverless Image Processing Pipeline

This full-stack serverless application converts .jpg/.jpeg image files to .png format using AWS Lambda, S3, and other cloud services. The frontend is built with React, the backend uses Node.js-based Lambda functions, and the infrastructure is defined in Terraform with CI/CD via GitHub Actions. The architecture is event-driven and globally delivered through S3 and CloudFront.

**Use the Image Converter Here**: [Image Converter](https://dlp3grxh7samf.cloudfront.net)

---

## How to Use

1. **Drag and drop** one or more `.jpg` or `.jpeg` files into the upload area (download a .jpg file from the Test Image folder in this repo)
2. **Click "Upload Files"** to start the upload process.
3. Wait a few seconds for automatic conversion to `.png`.
4. **Click the provided link** to preview the `.png` image in a new browser tab.
5. **Right-click** the image and choose **"Save As..."** to download.

---

## Tech Stack

This project uses a modern serverless architecture:

- **Frontend**:  
  Built with React for a fast, responsive drag-and-drop user interface.

- **Backend**:  
  Node.js Lambda functions handle upload URL generation and image conversion.

- **Image Processing**:  
  The Sharp Node.js library is used for .jpg/.jpeg to .png conversion. Since Sharp includes native binaries that must match the Lambda runtime, I used Docker to install it inside a simulated Amazon Linux environment. This ensured that the node_modules directory contained a version of Sharp compatible with AWS Lambda’s execution environment.

- **Infrastructure as Code**:  
  Defined and managed with Terraform, including state management in S3 and locking via DynamoDB.

- **Deployment & CI/CD**:  
  Initial deployment was performed manually using Terraform. During this process, many AWS permissions and IAM policies had to be manually configured and adjusted through the AWS Console to get the infrastructure working correctly with Terraform.

  GitHub Actions was later integrated to automate updates to the **AWS infrastructure only**—not the React frontend, which was manually built and uploaded to the S3 bucket.

  This GitHub Actions configuration was created primarily to gain hands-on experience with CI/CD tooling. Although it currently runs `terraform apply` on every push—which worked well for early experimentation—this approach is **not recommended for production environments**.

  A more robust and production-grade CI/CD pipeline should:

  - Run `terraform plan` as part of pull requests to preview infrastructure changes  
  - Require team approval and code review before merging  
  - Apply changes using `terraform apply` **only after** the pull request has been approved and merged into the main branch  

  While this current setup is not production-ready, it successfully provided foundational experience and helped build familiarity with GitHub Actions and infrastructure automation best practices.




- **Cloud Services (AWS)**:
  - **S3** – stores original and converted image files
  - **Lambda** – serverless compute for pre-signed URLs and image processing
  - **API Gateway** – connects the frontend to backend Lambda functions
  - **CloudFront** – globally distributes the frontend site for low-latency access
  - **CloudWatch** – used for debugging Sharp package realted issue during devlopment
  - **IAM** – manages access control for Lambdas and Terraform
  - **DynamoDB** – used to safely lock Terraform state during concurrent deployments

---
## Architecture
![Architecture Diagram](https://github.com/aclaycode/serverless-image-processing-pipeline/blob/0a0526b6134321f7aa95052327b1385175950101/diagram/Image_Converter_Architecture_Diagram.png)

-----

## System Flow

This application uses an event-driven architecture to fully automate image uploads, processing, and delivery:

1. **User Interaction via React Frontend**  
   Users drag and drop one or more `.jpg` or `.jpeg` images into the browser interface. After confirming their selection, they click the **"Upload Files"** button. This triggers the frontend to request a pre-signed S3 URL (via API Gateway → Lambda), then upload each image directly to the **input S3 bucket** using a `PUT` request.

2. **Image Conversion Triggered by S3 Event**  
   Once an image is uploaded, the input bucket automatically triggers a **Lambda function** via an S3 event. This function fetches the file and uses the **Sharp** image processing library to convert it to `.png` format entirely in memory.  
   The converted `.png` file is compressed using Sharp's compression level of 9 setting to reduce file size without losing image quality, with a slight increase in processing time as a tradeoff.

3. **Output Handling and Public Access**  
   The converted `.png` image is saved to an **output S3 bucket**, and an **object-level ACL** is applied with `public-read` permission. This grants anyone on the internet the ability to view the file without credentials. The frontend constructs and displays the expected public URL for each file, enabling preview and download.

4. **Frontend Hosting and Global Delivery**  
   The React frontend is deployed as static assets in an **S3 bucket**, and distributed worldwide using Cloudfront for low-latency access.

5. **Infrastructure and Deployment**  
   AWS resources—including Lambda functions, S3 buckets, API Gateway, CloudFront, IAM role—are provisioned using Terraform. Additional AWS access policies were refined manually during development for security and interoperability.

6. **Security**  
   Uploads are performed using **pre-signed S3 URLs** that expire after 60 seconds, ensuring temporary and secure upload access from the client browser only.


---

## CI/CD

- **Terraform** uses a remote S3 backend with **DynamoDB for state locking**.
- **GitHub Actions** triggers Terraform deployments on every push to the main branch, with AWS credentials managed securely via GitHub Secrets.
![GitHub Actions Screenshot](https://github.com/aclaycode/serverless-image-processing-pipeline/blob/7c2296c5c9084b17e3f51291d8a058d3510457b3/README%20Images/GitHub_Actions_Integration.png)

---
## Lessons Learned & Key Takeaways

This project provided valuable hands-on experience across AWS services, infrastructure-as-code, image processing, and CI/CD pipelines. Here are some of the major challenges I encountered and what I learned from them:

- **AWS Service Permissions & Terraform Deployment**   
  Getting Terraform to successfully deploy the project’s AWS infrastructure for most of the AWS services used in this project. Many permissions and resource policies had to be manually created or modified in the AWS Console during initial development to resolve deployment errors and access issues. While not ideal, this process gave me greater familiarity with the AWS Console and highlighted how precise and granular AWS permission management needs to be, especially when designing with least-privilege in mind.

- **Native Package Compatibility & Runtime Debugging**  
  The image processing function initially failed silently. Images uploaded fine, but no .png files appeared in the output S3 bucket. By adding logging to the Lambda function and reviewing logs in CloudWatch, I discovered the issue stemmed from the Sharp package, which relies on native binaries that must match the Lambda runtime. I first attempted to use Sharp as a Lambda layer but couldn’t get it working. Ultimately, I bundled Sharp into the image processing Lambda directory and used Docker to install a compatible version directly into `node_modules`, simulating the Lambda environment. This required multiple trial-and-error deployments to verify a compatible Sharp installation but taught me how to manage native dependencies in serverless workflows effectively.

- **GitHub Actions Integration & State Locking with DynamoDB**  
  After deploying the infrastructure manually with Terraform, I later introduced GitHub Actions to automate future updates. Because the initial deployment was done outside of CI/CD, GitHub Actions couldn’t track the existing state, which led to workflow conflicts/errors. To fix this, I configured a remote backend in S3 and set up a DynamoDB table to enable state locking. This allowed Terraform to safely share and lock state across environments, making GitHub Actions deployments consistent and reliable going forward.

