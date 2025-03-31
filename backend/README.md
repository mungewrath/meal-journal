# Meal Journal backend

## Backend local setup
`uv sync` - Installs packages
`uv lock` - Updates uv.lock file for consistent dependencies

## Debugging Backend
You should be able to use VS Code to debug with breakpoints.
1. Ensure your console session has access to the environment you're debugging
  1. An easy way to do this is `export AWS_PROFILE=mbd-stage`, if you have access keys configured with that profile name
1. Hit debug in VS Code

To run directly from the terminal: `./run.sh`

## Building and Deploying

`./build-and-upload.sh` does all the steps needed for deploying:
- Packages the lambda into a zip file
- Runs `terraform apply`, updating AWS infrastructure
- Deploys the latest lambda code