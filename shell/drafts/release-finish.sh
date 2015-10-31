#!/bin/bash
# "This will cause the shell to exit immediately if a simple command exits with a nonzero exit value." 
# http://stackoverflow.com/questions/821396/aborting-a-shell-script-if-any-command-returns-a-non-zero-value
set -e
mvn external.atlassian.jgitflow:jgitflow-maven-plugin:1.0-m5.1:release-finish \
  -DnoReleaseBuild=true \
  -DnoDeploy=true \
  -DnoTag=true \
  -Deol=native \
  -Dsquash=true \
  -DenableSshAgent=true \
  -B
git branch -D master
