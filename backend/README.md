# Meal Journal backend

## Backend local setup
`uv sync` - Installs packages
`uv lock` - Updates uv.lock file for consistent dependencies

## Debugging Backend
You should be able to use VS Code to debug with breakpoints.

To run directly from the terminal: `./run.sh`

## Building and Deploying

`./build-and-upload.sh -fs` - Packages the lambda into a zip file (later consumed by Terraform)
In infrastructure dir: `terraform apply`