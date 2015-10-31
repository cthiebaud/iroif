#!/bin/bash

#-------------------------------------
set -e # exit shell immediately if a single command exits with a nonzero exit value
set -x # turns debugging on

if [ -z "$1" ]
then
    echo "[error] You must specify a non empty version."
    echo "[usage] tycho-set-version.sh <version>"
    exit 1
fi
mvn org.eclipse.tycho:tycho-versions-plugin:0.23.1:set-version -DnewVersion="$1"
