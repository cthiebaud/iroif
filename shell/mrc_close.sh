#!/bin/bash

#-------------------------------------
set -e # exit shell immediately if a single command exits with a nonzero exit value
set -x # turns debugging on

#-------------------------------------
# get release branch name from env
#
if [ -z ${MRC_RELEASE_BRANCH} ]
then 
   echo "[error] MRC_RELEASE_BRANCH is not set or empty"
   exit 64  # command line usage error, cf. /usr/include/sysexits.h
else 
   echo "[info] MRC_RELEASE_BRANCH is '$MRC_RELEASE_BRANCH'"
fi

#-------------------------------------
# get jgitflow release-finish last commit 
# that has been pushed to remote refs/secret/... by mrc_open.sh script
# 
git fetch origin refs/secret/$MRC_RELEASE_BRANCH:refs/secret/$MRC_RELEASE_BRANCH

#-------------------------------------
# points HEAD to jgitflow release-finish last commit 
# 
git checkout refs/secret/$MRC_RELEASE_BRANCH

#-------------------------------------
# rebase remote release branch on top of HEAD
#  
git rebase origin/$MRC_RELEASE_BRANCH

#-------------------------------------
# push the result of the rebase
#  
git push origin HEAD:refs/for/$MRC_RELEASE_BRANCH%submit

#-------------------------------------
# delete the local and remote secret ref, 
# so that a ref with the same name can be re-created 
# by another execution of the mrc_open.sh script)
#
git push origin :refs/secret/$MRC_RELEASE_BRANCH
git update-ref -d refs/secret/$MRC_RELEASE_BRANCH
