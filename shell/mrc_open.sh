#!/bin/bash

#-------------------------------------
set -e # exit shell immediately if a single command exits with a nonzero exit value
set -x # turns debugging on

#-------------------------------------
# get script directory
# http://stackoverflow.com/questions/59895/can-a-bash-script-tell-what-directory-its-stored-in
#
MRC_SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# just to check in the logs that we are back to original directory:
echo "[info] current directory is $( pwd )" 

#-------------------------------------
# get release version from env
#
if [ -n "${MRC_RELEASE_VERSION+set}" ]
then 
   echo "[info] MRC_RELEASE_VERSION is '$MRC_RELEASE_VERSION'"
else 
   echo "[error] MRC_RELEASE_VERSION is not set (nb. it can be empty, but it must be set)"
   echo "[usage] export MRC_RELEASE_VERSION=..."
   exit 64  # command line usage error, cf. /usr/include/sysexits.h
fi

#-------------------------------------
# get release branch name from env
#
if [ -z ${MRC_RELEASE_BRANCH} ]
then 
   echo "[error] MRC_RELEASE_BRANCH is not set or empty"
   echo "[usage] export MRC_RELEASE_BRANCH=..."
   exit 64  # command line usage error, cf. /usr/include/sysexits.h
else 
   echo "[info] MRC_RELEASE_BRANCH is '$MRC_RELEASE_BRANCH'"
fi

#-------------------------------------
# check that  
#     refs/secret/$MRC_RELEASE_BRANCH
#     refs/heads/$MRC_RELEASE_BRANCH
# do not exist on remote
#
$MRC_SCRIPT_DIR/check_remote_branch_does_not_exist.sh refs/secret/$MRC_RELEASE_BRANCH
if [ -n "${MRC_RELEASE_VERSION}" ]; then
    echo "MRC_RELEASE_VERSION is set to a non-empty string: $MRC_RELEASE_VERSION"
    $MRC_SCRIPT_DIR/check_remote_branch_does_not_exist.sh refs/heads/$MRC_RELEASE_BRANCH
fi

#-------------------------------------
# get starting branch
# http://git-blame.blogspot.de/2013/06/checking-current-branch-programatically.html
#
if START_BRANCH=$( git symbolic-ref --short -q HEAD )
then
    echo "[info] START_BRANCH is '$START_BRANCH'"
else
    echo "[info] not on any branch"
fi

#-------------------------------------
# get current commit hash
#
if START_COMMIT=$( git rev-parse HEAD )
then
  echo "[info] START_COMMIT is '$START_COMMIT'"
else
   echo "[error] not on any commit"
   exit 1
fi

#-------------------------------------
# jgitflow maven plugin will work on 3 local branches : 'develop', 'master' and 'release/$MRC_RELEASE_VERSION'
# to prevent any clash later in this script, delete these local branches if they exists 
#
LOCAL_BRANCHES_TO_DELETE=( develop master release/$MRC_RELEASE_VERSION )
for LOCAL_BRANCH_TO_DELETE in "${LOCAL_BRANCHES_TO_DELETE[@]}"
do
  if [[ $START_BRANCH == $LOCAL_BRANCH_TO_DELETE ]]
  then 
    echo "[info] cannot delete START_BRANCH ('$START_BRANCH')"   
  else 
    $MRC_SCRIPT_DIR/delete-local-branch.sh $LOCAL_BRANCH_TO_DELETE
  fi
done

#-------------------------------------
# create branch "master" if it does not exist, otherwise, reset it 
git checkout -B master

# log git status for debugging 
git status 

# to enable handy switching between jgitflow versions
JGITFLOW_VERSION=1.0-m5.1

#-------------------------------------
# jgitflow release-start
#
if [ -z "${MRC_RELEASE_VERSION-unset}" ]
then
    echo "MRC_RELEASE_VERSION is set to the empty string"
    mvn external.atlassian.jgitflow:jgitflow-maven-plugin:$JGITFLOW_VERSION:release-start \
        -DallowSnapshots=true \
        -DnoTag=true \
        -Deol=native \
        -DenableSshAgent=true \
        -B -U
else
    mvn external.atlassian.jgitflow:jgitflow-maven-plugin:$JGITFLOW_VERSION:release-start \
        -DreleaseVersion=$MRC_RELEASE_VERSION \
        -DallowSnapshots=true \
        -DnoTag=true \
        -Deol=native \
        -DenableSshAgent=true \
        -B -U
fi

#-------------------------------------
# jgitflow release-finish
#
mvn external.atlassian.jgitflow:jgitflow-maven-plugin:$JGITFLOW_VERSION:release-finish \
    -DnoDeploy=true \
    -DallowSnapshots=true \
    -DnoReleaseBuild=true \
    -DnoTag=true \
    -Deol=native \
    -Dsquash=true \
    -DenableSshAgent=true \
    -B

# log git status for debugging 
git status 

#-------------------------------------
# rewrite commits created by jgitflow with a gerrit ChangeId
# cf. http://blog.polettix.it/gerrit-import-the-hard-way/
#
GIT_REPO_TOP_LEVEL_DIR=$( git rev-parse --show-toplevel )
UNIQUE_TMP_FILE_PATH=/tmp/tmp_mrc_message_$( basename $GIT_REPO_TOP_LEVEL_DIR )_$( date +%s%3N )
HOOK="$GIT_REPO_TOP_LEVEL_DIR/.git/hooks/commit-msg"
git filter-branch --force --msg-filter "
    cat - >$UNIQUE_TMP_FILE_PATH &&
    '$HOOK' $UNIQUE_TMP_FILE_PATH &&
    cat $UNIQUE_TMP_FILE_PATH
" $START_COMMIT..HEAD
rm $UNIQUE_TMP_FILE_PATH

#-------------------------------------
# push stuff
#
git push origin HEAD:refs/secret/$MRC_RELEASE_BRANCH
git push origin $START_COMMIT:refs/heads/$MRC_RELEASE_BRANCH
git push origin HEAD~1:refs/for/$MRC_RELEASE_BRANCH%submit

# log versions for debugging
$MRC_SCRIPT_DIR/log_versions.sh \
"   starting from version " $START_COMMIT \
"         release version " $( git rev-parse HEAD~1 ) \
"next development version " $( git rev-parse HEAD )

