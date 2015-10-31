#!/bin/bash
set +e
echo $1
if [ -z "$1" ]
  then
    echo "[error] No branch name argument supplied, e.g."
    echo "[error] \$ ./reset.sh s1/master [<branch to delete>  ... ]"
    exit 64  # command line usage error, cf. /usr/include/sysexits.h
fi
git checkout $1
shift 1
MRC_SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo $@
for arg in "$@"
do
$MRC_SCRIPT_DIR/../delete-local-branch.sh $arg
done
if [ -z ${MRC_RELEASE_BRANCH+x} ]
then 
   echo "[info] MRC_RELEASE_BRANCH is not set"
else 
  git push origin --delete refs/secret/$MRC_RELEASE_BRANCH
  git push origin --delete refs/heads/$MRC_RELEASE_BRANCH
  git push origin --delete refs/for/$MRC_RELEASE_BRANCH%submit
fi
