#!/bin/bash

# https://docs.astral.sh/uv/guides/integration/aws-lambda/#deploying-a-zip-archive

SKIP_S3_UPLOAD=false
ARCHIVE_NAME="package.zip"
S3_ZIP_NAME="mbd-api.zip"

while getopts "sf" opt; do
    case ${opt} in
        s )
            SKIP_S3_UPLOAD=true
            ;;
        f )
            echo "Cleaning build..."
            rm -rf packages
            rm -f ${ARCHIVE_NAME}
            ;;
        \? )
            echo "Usage: $0 [-s]"
            echo "  -s: Skip S3 upload"
            echo "  -f: Clean build, deleting the packages directory"
            echo "  -h: Show this help message"
            exit 1
            ;;
    esac
done


uv export --frozen --no-dev --no-editable -o requirements.txt
uv pip install \
   --no-installer-metadata \
   --no-compile-bytecode \
   --python-platform x86_64-manylinux2014 \
   --python 3.11 \
   --target packages \
   -r requirements.txt

cd packages
zip -r ../${ARCHIVE_NAME} .
cd ..

cd app
zip -r ../${ARCHIVE_NAME} .
cd ..

if [ "$SKIP_S3_UPLOAD" = false ]; then
    # Add your S3 upload commands here
    echo "Uploading to S3..."
    aws s3 cp ${ARCHIVE_NAME} s3://mbd-lambda-deployments/${S3_ZIP_NAME}
else
    echo "Skipping S3 upload."
fi