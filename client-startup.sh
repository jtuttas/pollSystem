#!/bin/sh
echo "*** Set Poll-Client connect to Host $1 Port $2 with Secret $3 ***" 
sed -i "s|window.location.hostname|"$1"|g" /usr/share/nginx/html/assets/config-client.js
sed -i "s|:3000/|"$2"|g" /usr/share/nginx/html/assets/config-client.js
sed -i "s|1234|"$3"|g" /usr/share/nginx/html/assets/config-client.js
nginx -g 'daemon off;'
