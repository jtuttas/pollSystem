#!/bin/sh
echo "*** Set Poll Client connect to Server $1 with Secret $2 ***" 
sed -i "s|http://localhost:3000/|"$1"|g" /usr/share/nginx/html/assets/config-client.js
sed -i "s|1234|"$2"|g" /usr/share/nginx/html/assets/config-client.js
nginx -g 'daemon off;'