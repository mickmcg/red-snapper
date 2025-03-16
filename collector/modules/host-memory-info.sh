#!/bin/bash

get_ram() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        RAM=$(sysctl -n hw.memsize)
        RAM=$((RAM / 1024 / 1024))  # Convert bytes to MB
        echo "Total RAM: ${RAM} MB"
    elif command -v free &>/dev/null; then
        # Linux
        RAM=$(free -m | awk '/^Mem:/ {print $2}')
        echo "Total RAM: ${RAM} MB"
    elif command -v vmstat &>/dev/null; then
        # Generic Unix
        RAM=$(vmstat -s | awk '/total memory/ {print $1}')
        RAM=$((RAM / 1024))  # Convert KB to MB
        echo "Total RAM: ${RAM} MB"
    else
        echo "Could not determine RAM size."
        exit 1
    fi
}

get_ram
