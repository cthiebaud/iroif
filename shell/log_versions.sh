#!/bin/bash
set +e
COUNTER=0
TITLE=""
echo "########"
echo "versions"
echo "--------"
for arg in "$@"
do
    if [ $((COUNTER%2)) -eq 0 ];
    then
        TITLE=$arg
    else
        git checkout $arg --quiet;
        echo "$TITLE: $( mvn help:evaluate -Dexpression=project.version | grep -Ev '(^\[|Download\w+:)' )"
    fi
    COUNTER=$[COUNTER + 1]
done
echo "########"
