#!/bin/sh
echo "*** Set MONGODB Server to $1 with Secret $4 ***" 
sed -i "s|mongodb://localhost:27017|"$1"|g" /usr/src/app/config.js 
sed -i "s|benutzer|"$2"|g" /usr/src/app/config.js 
sed -i "s|geheim|"$3"|g" /usr/src/app/config.js 
sed -i "s|1234|"$4"|g" /usr/src/app/config.js 
cd /usr/src/app/Server/ 
npm start
