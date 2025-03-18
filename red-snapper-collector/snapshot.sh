#!/bin/bash

DIR="$(cd "$(dirname "$0")" && pwd)"
SNAP_VERSION=0 # Set by build_collector_tar.sh

MODULES_DIR="$DIR/modules"  # Change this to your actual modules directory
OUTPUT_DIR="$DIR/snapshots"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
TAR_FILE="${OUTPUT_DIR}/${TIMESTAMP}_snapshot.tar.gz"

# Ensure output directory exists
mkdir -p "$OUTPUT_DIR"

# Loop through all shell scripts in the modules directory
for script in "$MODULES_DIR"/*.sh; do
    if [[ -f "$script" ]]; then
        script_name=$(basename "$script")
        output_file="${OUTPUT_DIR}/${script_name%.sh}.out"

        # Execute the script and save output
        bash "$script" > "$output_file"

        # Print the output file name
        echo "Created: $output_file"
    fi
done

# Create metadata.out
SNAP_HOSTNAME=$(cat "${OUTPUT_DIR}/hostname.out" 2>/dev/null || echo "UNKNOWN")
SNAP_IPADDR=$(cat "${OUTPUT_DIR}/main-ip.out" 2>/dev/null || echo "UNKNOWN")
SNAP_OS_NAME=$(grep SNAP_OS_NAME "${OUTPUT_DIR}/operating-system.out" | cut -d'=' -f2 2>/dev/null || echo "UNKNOWN")
SNAP_OS_VERSION=$(grep SNAP_OS_VERSION "${OUTPUT_DIR}/operating-system.out" | cut -d'=' -f2 2>/dev/null || echo "UNKNOWN")

echo "SNAP_VERSION=$SNAP_VERSION" > "${OUTPUT_DIR}/metadata.out"
echo "SNAP_HOSTNAME=$SNAP_HOSTNAME" >> "${OUTPUT_DIR}/metadata.out"
echo "SNAP_IPADDR=$SNAP_IPADDR" >> "${OUTPUT_DIR}/metadata.out"
echo "SNAP_OS_NAME=$SNAP_OS_NAME" >> "${OUTPUT_DIR}/metadata.out"
echo "SNAP_OS_VERSION=$SNAP_OS_VERSION" >> "${OUTPUT_DIR}/metadata.out"
echo "Created: ${OUTPUT_DIR}/metadata.out"

# Detect macOS and remove extended attributes
if [[ "$(uname)" == "Darwin" ]]; then
    xattr -c "$OUTPUT_DIR"/*.out 2>/dev/null
    COPYFILE_DISABLE=1
    export COPYFILE_DISABLE  # Prevents tar from storing Apple metadata
fi

# Create tar.gz archive of all .out files
if find "$OUTPUT_DIR" -maxdepth 1 -name "*.out" | grep -q .; then
    if [[ "$(uname)" == "Darwin" ]]; then
        tar --disable-copyfile -czvf "$TAR_FILE" -C "$OUTPUT_DIR" $(find "$OUTPUT_DIR" -maxdepth 1 -name "*.out" | xargs -I {} basename {})
    else
        tar -czvf "$TAR_FILE" -C "$OUTPUT_DIR" $(find "$OUTPUT_DIR" -maxdepth 1 -name "*.out" | xargs -I {} basename {})
    fi
    echo "Created tar: $TAR_FILE"
else
    echo "No .out files found, skipping tar creation."
fi

# Remove the .out files
rm -f "$OUTPUT_DIR"/*.out
