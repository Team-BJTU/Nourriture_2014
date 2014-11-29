#!/bin/sh

apt-get install mongodb;
apt-get install nodejs;

/usr/bin/mongod -dbpath ../data;
/usr/bin/node ../app.js;