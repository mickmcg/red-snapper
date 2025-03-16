#!/bin/bash

get_cpu_count() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        CPU_COUNT=$(sysctl -n hw.ncpu)
    elif command -v nproc &>/dev/null; then
        # Linux (nproc is available on most distros)
        CPU_COUNT=$(nproc)
    elif command -v lscpu &>/dev/null; then
        # Alternative for Linux
        CPU_COUNT=$(lscpu | awk '/^CPU\(s\):/ {print $2}')
    elif command -v sysctl &>/dev/null; then
        # Generic Unix (BSD-based systems)
        CPU_COUNT=$(sysctl -n hw.ncpu)
    elif [[ -f "/proc/cpuinfo" ]]; then
        # Linux (fallback)
        CPU_COUNT=$(grep -c "^processor" /proc/cpuinfo)
    else
        echo "Could not determine CPU count."
        exit 1
    fi

    echo "CPU Cores: $CPU_COUNT"
}

get_cpu_count
