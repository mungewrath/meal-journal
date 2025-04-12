#!/bin/bash -x

# https://docs.astral.sh/uv/guides/integration/aws-lambda/#deploying-a-zip-archive

SKIP_DEPLOY=false
ARCHIVE_NAME="api_lambda.zip"
S3_ZIP_NAME="mbd-api.zip"

while getopts "sf" opt; do
    case ${opt} in
        s )
            SKIP_DEPLOY=true
            ;;
        f )
            echo "Cleaning build..."
            rm -rf packages
            rm -f ${ARCHIVE_NAME}
            ;;
        \? )
            echo "Usage: $0 [-s]"
            echo "  -s: Skip deployment"
            echo "  -f: Clean build, deleting the packages directory"
            echo "  -h: Show this help message"
            exit 1
            ;;
    esac
done

uv python install -v 3.11
uv export -q --frozen --no-dev --no-editable -o requirements.txt
uv pip install -v \
   --no-installer-metadata \
   --no-compile-bytecode \
   --python-platform x86_64-manylinux2014 \
   --python 3.11 \
   --target packages \
   -r requirements.txt

# Both of these directories must have their contents at the root of the zip file, per AWS Lambda requirements
cd packages
zip -qr ../${ARCHIVE_NAME} .
cd ..

cd app
zip -qr ../${ARCHIVE_NAME} .
cd ..

if [ "$SKIP_DEPLOY" = false ]; then
    echo "Performing terraform deploy..."
    cd infrastructure
    terraform apply -auto-approve
else
    echo "Skipping terraform deploy."
fi