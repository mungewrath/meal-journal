#!/bin/bash -x

uv python install -v 3.11
uv python list
uv export -q --frozen --no-editable -o requirements.txt
uv -v pip install --no-installer-metadata --no-compile-bytecode --python-platform x86_64-manylinux2014 --python 3.11 -r requirements.txt
uv run pytest