#!/bin/bash

list_installed_packages() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS (Homebrew and MacPorts)
        if command -v brew &>/dev/null; then
            echo "Listing installed Homebrew packages with versions:"
            brew list --versions
        fi
        if command -v port &>/dev/null; then
            echo "Listing installed MacPorts packages with versions:"
            port installed
        fi
    elif command -v dpkg &>/dev/null; then
        # Debian-based distros (Ubuntu, Debian, etc.)
        echo "Listing installed Debian packages with versions:"
        dpkg-query -W -f='${Package} ${Version}\n'
    elif command -v rpm &>/dev/null; then
        # RHEL-based distros (CentOS, Fedora, RHEL, etc.)
        echo "Listing installed RPM packages with versions:"
        rpm -qa --qf '%{NAME} %{VERSION}-%{RELEASE}\n'
    elif command -v pacman &>/dev/null; then
        # Arch Linux
        echo "Listing installed Arch Linux packages with versions:"
        pacman -Q
    elif command -v apk &>/dev/null; then
        # Alpine Linux
        echo "Listing installed Alpine Linux packages with versions:"
        apk list --installed
    elif command -v pkg &>/dev/null; then
        # FreeBSD
        echo "Listing installed FreeBSD packages with versions:"
        pkg info --raw | awk -F'|' '{print $2, $3}'
    elif command -v opkg &>/dev/null; then
        # OpenWRT and embedded systems
        echo "Listing installed OpenWRT packages with versions:"
        opkg list-installed
    else
        echo "Unknown package manager. Unable to list installed packages."
        exit 1
    fi
}

list_installed_packages
