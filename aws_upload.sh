#!/bin/bash
aws s3 sync episodes s3://aws.brams.dev/wanshow/episodes --exclude "*" --include "*.m4a"
