#!/bin/bash
set +e
if [ -z "$1" ]
then
    echo "[error] No branch name argument supplied, e.g. "
    echo "[error] \$ delete-local-branch.sh <branch>"
    exit 64  # command line usage error, cf. /usr/include/sysexits.h
fi
git rev-parse --verify --quiet $1
if [ $? -eq 0 ]
then
    git branch -D "$1"
    if [ $? -eq 0 ]
    then
        echo "[info] deleted branch \"$1\""
    else
        echo "[error] failed deleting branch \"$1\""
        exit 1
    fi
else
    echo "[info] local branch \"$1\" does not exist, nothing to delete"
fi
