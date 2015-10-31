#!/bin/bash 
# http://stackoverflow.com/questions/19542301/delete-all-tags-from-a-git-repository
git tag -l | xargs -n 1 git push --delete origin
git tag | xargs git tag -d