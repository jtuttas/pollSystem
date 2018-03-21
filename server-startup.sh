#!/bin/sh
echo "*** Set MONGODB Server to $1 ***" 
echo "prepare config.js" 
sed -i "s|mongodb://localhost:27017|"$1"|g" /usr/src/app/config.js 
echo "Change to Server Folder" 
cd /usr/src/app/Server/ 
echo "Start Server...." 
npm start
