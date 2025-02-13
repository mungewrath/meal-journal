#!/bin/bash -x

export PYTHONPATH=./app
uv run fastapi dev
