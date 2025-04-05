#!/bin/bash -x

export PYTHONPATH=.
export ENVIRONMENT=dev
cd app
uv run fastapi dev
