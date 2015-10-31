#!/bin/bash
set +e
if [ -z "$1" ]
  then
    echo "[error] No full remote branch name argument supplied, e.g."
    echo "[error] \$ check_remote_branch_does_not_exist.sh ref/heads/dugenou"
    exit 64  # command line usage error, cf. /usr/include/sysexits.h
fi
git ls-remote --exit-code origin $1 
if [ $? -eq 2 ]
then
  echo "[info] cool, remote branch '$1' does not exist on remote origin"
  exit 0
else
  echo "[error] cannot continue : branch '$1' exists on remote origin"
  exit 1
fi
