# Meal Journal backend

## Backend prerequisites
- `uv sync` - Installs packages
- `uv lock` - Updates uv.lock file for consistent dependencies
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) for local debugging

## Debugging Backend
You should be able to use VS Code to debug with breakpoints.
1. Ensure your console session has access to the environment you're debugging
  1. An easy way to do this is `export AWS_PROFILE=mbd-stage`, if you have access keys configured with that profile name
1. Hit debug in VS Code

To run locally, you need the AWS CLI configured so DynamoDB can be accessed.
- Set up an AWS profile for the environment you will hit (stage or prod): https://docs.aws.amazon.com/cli/latest/userguide/cli-authentication-user.html
- In the VS Code terminal, run `export AWS_PROFILE=<name of your profile>`
- After this, you should be able to use VS Code to debug with breakpoints.
    - An alternative is to run directly from the terminal: `./run.sh`

## Building and Deploying (From Local)

- Make sure you have the Toolchain AWS account configured
- `./build-and-deploy.sh` does all the steps needed for deploying:
    - Packages the lambda into a zip file
    - Runs `terraform apply`, updating AWS infrastructure
    - Deploys the latest lambda code
