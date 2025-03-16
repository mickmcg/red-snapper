#!/bin/bash

get_main_ip() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        IP=$(ipconfig getifaddr en0 2>/dev/null)
    elif command -v ip &>/dev/null; then
        # Linux (ip command)
        IP=$(ip route get 1.1.1.1 | awk '{print $7; exit}')
    elif command -v ifconfig &>/dev/null; then
        # Generic Unix (ifconfig)
        IP=$(ifconfig | awk '/inet / && $2 !~ /127.0.0.1/ {print $2; exit}')
    else
        echo "Could not determine IP address."
        exit 1
    fi

    echo "$IP"
}

get_main_ip
