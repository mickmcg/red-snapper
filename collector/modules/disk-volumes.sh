#!/bin/bash

get_disk_volumes() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS: Use `df -h` and filter for mounted volumes
        df -h | awk 'NR==1 || /^\/dev\// {print $1, $2, $6}'
    elif command -v lsblk &>/dev/null; then
        # Linux: Use `lsblk` (preferred)
        lsblk -o NAME,SIZE,MOUNTPOINT | awk 'NR==1 || $3 {print $1, $2, $3}'
    elif command -v df &>/dev/null; then
        # Generic Unix: Use `df -h`
        df -h | awk 'NR==1 || /^\/dev\// {print $1, $2, $6}'
    else
        echo "Could not determine disk volumes and sizes."
        exit 1
    fi
}

echo "Disk Volumes and Sizes:"
get_disk_volumes
