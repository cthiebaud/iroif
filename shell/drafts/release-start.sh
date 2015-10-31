#!/bin/bash
# "This will cause the shell to exit immediately if a simple command exits with a nonzero exit value." 
# http://stackoverflow.com/questions/821396/aborting-a-shell-script-if-any-command-returns-a-non-zero-value
set -e
git checkout -B master
mvn external.atlassian.jgitflow:jgitflow-maven-plugin:1.0-m5.1:release-start \
    -DreleaseVersion=1.1.0 \
    -DdevelopmentVersion=1.1.1-SNAPSHOT \
    -DallowSnapshots=true \
    -Deol=native \
    -B \
    -DenableSshAgent=true
