#!/bin/bash 
# -vxe
# echo off  > /dev/null

# "This will cause the shell to exit immediately if a simple command exits with a nonzero exit value." 
# http://stackoverflow.com/questions/821396/aborting-a-shell-script-if-any-command-returns-a-non-zero-value
set -e

HOOK="$PWD/.git/hooks/commit-msg"
git filter-branch --force --msg-filter "
    cat - >/tmp/mymessage &&
    '$HOOK' /tmp/mymessage &&
    cat /tmp/mymessage
"