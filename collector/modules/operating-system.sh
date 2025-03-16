#!/bin/bash

get_os_info() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        OS_NAME="macOS"
        OS_VERSION=$(sw_vers -productVersion)
    elif [[ -f "/etc/os-release" ]]; then
        # Linux (Debian-based, RHEL-based, etc.)
        . /etc/os-release
        OS_NAME=$NAME
        OS_VERSION=$VERSION
    elif [[ -f "/etc/lsb-release" ]]; then
        # Older Debian-based distros
        . /etc/lsb-release
        OS_NAME=$DISTRIB_ID
        OS_VERSION=$DISTRIB_RELEASE
    elif [[ -f "/etc/redhat-release" ]]; then
        # RHEL/CentOS-based
        OS_NAME=$(cat /etc/redhat-release | cut -d ' ' -f 1)
        OS_VERSION=$(cat /etc/redhat-release | sed 's/.*release //;s/ .*//')
    elif [[ -f "/etc/uname_release" ]]; then
        # Generic Unix
        OS_NAME="Unix"
        OS_VERSION=$(uname -r)
    else
        # Fallback
        OS_NAME="Unknown"
        OS_VERSION="Unknown"
    fi

    echo "OS Name: $OS_NAME"
    echo "OS Version: $OS_VERSION"
}

get_os_info
