# Meal Journal backend

## Backend prerequisites
- `uv sync` - Installs packages
- `uv lock` - Updates uv.lock file for consistent dependencies
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) for local debugging
- Access keys an an AWS_PROFILE configured in the CLI for each environment:
    - Stage: AWS profile should be named `mealjournal-stage`
    - Prod: AWS profile should be named `mealjournal-prod`
    - Run `aws configure --profile <name of the profile>`

## Testing

### Running Tests
To run the full test suite from the backend/ directory:
```bash
# This will generate coverage report
uv run pytest
```

### Debugging Tests in VS Code
The project is configured to use the "Testing" menu which allows discovery and debugging of all tests.

### Writing New Tests
Tests are located in the `tests/` directory. Follow these guidelines when writing new tests:

1. Create test files with the naming pattern `test_*.py`
1. Use fixtures from `conftest.py` for common test setup
1. Mock external dependencies using `unittest.mock`
1. For API tests, use the `client` fixture to make requests:
   ```python
   def test_endpoint(client):
       response = client.get("/some-endpoint")
       assert response.status_code == 200
   ```

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

- **Note: This will also overwrite the latest Frontend code with your local build. Since that's most likely the localhost version it will break the Cloudfront site! If you do need to deploy everything from local, build the mbd-web frontend with the correct environment first**
- Make sure you have the Toolchain AWS account configured
- `./build-and-deploy.sh` does all the steps needed for deploying:
    - Packages the lambda into a zip file
    - Runs `terraform apply`, updating AWS infrastructure
    - Deploys the latest lambda code
