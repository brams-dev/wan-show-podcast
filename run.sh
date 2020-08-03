#!/bin/bash

echo "Using path:"
WANSHOW_DIR=$(dirname $0)
cd $WANSHOW_DIR

echo "Start download"
./download.sh

echo "Start processing"
./index.js

echo "Start upload"
./bunnycdn_upload.sh

echo "Start push"
./push.sh
