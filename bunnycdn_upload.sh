#!/bin/bash
rclone copy episodes cdn-brams-dev:wanshow/episodes -P --include *.m4a
