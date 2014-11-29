#!/bin/sh

apt-get install mongodb;
apt-get install nodejs;

export LC_ALL=C
/usr/bin/mongod -dbpath ../data;
/usr/bin/node ../app.js;