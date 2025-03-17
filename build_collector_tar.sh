#!/bin/bash

if [[ "$(uname)" == "Darwin" ]]; then
    xattr -c "$OUTPUT_DIR"/*.out 2>/dev/null
    COPYFILE_DISABLE=1
    export COPYFILE_DISABLE  # Prevents tar from storing Apple metadata
fi

tar --exclude='collector/snapshots' -czvf collector.tar.gz collector/