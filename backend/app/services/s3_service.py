import os
import uuid
import boto3


AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
S3_BUCKET = os.getenv(
    "S3_BUCKET_NAME",
    "geovision-ai-images-2026-chaitanya"
)

s3_client = boto3.client(
    "s3",
    region_name=AWS_REGION
)


def upload_image(file_object, filename, content_type):
    """
    Upload an image file to the GeoVision-AI S3 bucket.
    """

    if not S3_BUCKET:
        raise RuntimeError("S3_BUCKET_NAME is not configured")

    # Generate a unique S3 filename
    extension = os.path.splitext(filename)[1].lower()
    unique_name = f"{uuid.uuid4().hex}{extension}"

    s3_key = f"uploads/{unique_name}"

    s3_client.upload_fileobj(
        file_object,
        S3_BUCKET,
        s3_key,
        ExtraArgs={
            "ContentType": content_type
        }
    )

    return {
        "bucket": S3_BUCKET,
        "key": s3_key,
        "region": AWS_REGION
    }