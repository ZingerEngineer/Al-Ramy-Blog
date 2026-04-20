import boto3
from botocore.exceptions import ClientError
import os

# Use environment variables passed from podman-setup.sh
endpoint_url = "http://localhost:4566"
aws_access_key = os.getenv("AWS_ACCESS_KEY_ID", "test")
aws_secret_key = os.getenv("AWS_SECRET_ACCESS_KEY", "test")
region = os.getenv("AWS_DEFAULT_REGION", "us-east-1")

# EMAIL_FROM is the sender address used by the webapp (e.g. noreply@alramyblog.local)
# It must be verified in SES before any email can be sent from it.
email_from = os.getenv("EMAIL_FROM", "noreply@alramyblog.local")

# Initialize SES client pointing at LocalStack
ses_client = boto3.client(
    "ses",
    endpoint_url=endpoint_url,
    aws_access_key_id=aws_access_key,
    aws_secret_access_key=aws_secret_key,
    region_name=region,
)

# Verify the sender email identity (idempotent — safe to run on every startup)
try:
    ses_client.verify_email_identity(EmailAddress=email_from)
    print(f"✓ Verified SES email identity: {email_from}")
except ClientError as error:
    print(f"✗ Failed to verify SES email identity: {error}")
    raise

print("\n✓ SES initialization complete!")
print(f"  Verified sender: {email_from}")
