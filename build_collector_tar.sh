#!/bin/bash

DIR="$(cd "$(dirname "$0")" && pwd)"

if [[ "$(uname)" == "Darwin" ]]; then
    xattr -c "$OUTPUT_DIR"/*.out 2>/dev/null
    COPYFILE_DISABLE=1
    export COPYFILE_DISABLE  # Prevents tar from storing Apple metadata
fi

# Change version when building
SNAP_VERSION="0.2"
sed -i.bak "s/^SNAP_VERSION=[0-9]/SNAP_VERSION=$SNAP_VERSION/" red-snapper-collector/snapshot.sh
tar --exclude='red-snapper-collector/snapshots' --exclude='red-snapper-collector/snapshot.sh.bak' -czvf collector-releases/red-snapper-collector-$SNAP_VERSION.tar.gz red-snapper-collector/
mv red-snapper-collector/snapshot.sh.bak red-snapper-collector/snapshot.sh