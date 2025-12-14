import boto3

from botocore.exceptions import ClientError

import os

# Use environment variables from docker-compose
endpoint_url = "http://localhost:4566"
aws_access_key = os.getenv("AWS_ACCESS_KEY_ID", "test")
aws_secret_key = os.getenv("AWS_SECRET_ACCESS_KEY", "test")
region = os.getenv("AWS_DEFAULT_REGION", "us-east-1")

bucket_name = "alramy-blog-media"

# Initialize S3 client
s3_client = boto3.client(
    "s3",
    endpoint_url=endpoint_url,
    aws_access_key_id=aws_access_key,
    aws_secret_access_key=aws_secret_key,
    region_name=region
)

# Create bucket (idempotent)
try:
    s3_client.create_bucket(Bucket=bucket_name)
    print(f"✓ Created bucket: {bucket_name}")
except ClientError as error:
    if error.response['Error']['Code'] == 'BucketAlreadyOwnedByYou':
        print(f"✓ Bucket already exists: {bucket_name}")
    else:
        raise

# Configure CORS for browser uploads
cors_configuration = {
    'CORSRules': [{
        'AllowedHeaders': ['*'],
        'AllowedMethods': ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
        'AllowedOrigins': ['*'],  # Restrict in production
        'ExposeHeaders': ['ETag'],
        'MaxAgeSeconds': 3000
    }]
}
s3_client.put_bucket_cors(Bucket=bucket_name, CORSConfiguration=cors_configuration)
print(f"✓ Configured CORS for {bucket_name}")

# Set public read ACL for development
s3_client.put_bucket_acl(Bucket=bucket_name, ACL='public-read')
print(f"✓ Set public-read ACL for {bucket_name}")

print(f"\n✓ S3 initialization complete!")
print(f"  Bucket URL: {endpoint_url}/{bucket_name}")