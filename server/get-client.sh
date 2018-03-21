#!/bin/bash

cd ./../client
ng build -prod
cd ./dist
ls

read line
echo $line