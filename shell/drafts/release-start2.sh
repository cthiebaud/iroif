#!/bin/bash 
git checkout -B master 1> logs/release-start.log 2>&1
mvn external.atlassian.jgitflow:jgitflow-maven-plugin:1.0-m5.1:release-start \
  -DallowSnapshots=true \
  -Deol=native \
  -B 1>> logs/release-start.log 2>&1
