#!/bin/bash

MODULES_DIR="./modules"  # Change this to your actual modules directory
OUTPUT_DIR="/tmp"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
ZIP_FILE="${OUTPUT_DIR}/${TIMESTAMP}_snapshot.zip"

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
SNAP_VERSION=0.1
SNAP_HOSTNAME=`cat ${OUTPUT_DIR}/hostname.out`
SNAP_IPADDR=`cat ${OUTPUT_DIR}/main-ip.out`
echo "SNAP_VERSION=$SNAP_VERSION" > ${OUTPUT_DIR}/metadata.out
echo "SNAP_HOSTNAME=$SNAP_HOSTNAME" >> ${OUTPUT_DIR}/metadata.out
echo "SNAP_IPADDR=$SNAP_IPADDR" >> ${OUTPUT_DIR}/metadata.out
echo "Created: ${OUTPUT_DIR}/metadata.out"

# Zip all .out files
zip -j "$ZIP_FILE" "$OUTPUT_DIR"/*.out

# Print zip file name
echo "Created zip: $ZIP_FILE"

# Remove the .out files
#rm -f "$OUTPUT_DIR"/*.out
