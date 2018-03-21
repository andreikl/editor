#!/bin/bash

cd ./../client
#ng build -prod
cd ./dist

#mkdir ./temp
#mkdir ./temp/scripts
#cp ./*.js ./temp/scripts
#mkdir ./temp/styles
#cp ./*.css ./temp/styles

#cp ./index.html ./temp/index.html
#cp ./favicon.png ./temp/favicon.png
#cp ./3rdpartylicenses.txt ./temp/3rdpartylicenses.txt

file=$(<./index.html)
#styles.24ffafd5641e7cfa6398.bundle.css
#echo ${file//^(styles.[a-z\d].bundle.css)/}
echo ${file//^styles./}

read line
echo $line