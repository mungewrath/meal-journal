#!/bin/bash -x
# Used for running the tests in CI/CD.
# For some reason, the direct commands don't work; only if they are wrapped in a script.

uv python install -v 3.11
uv export -q --frozen --no-editable -o requirements.txt
uv -v pip install --no-installer-metadata --no-compile-bytecode --python-platform x86_64-manylinux2014 --python 3.11 -r requirements.txt
uv run pytest