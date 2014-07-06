#!/bin/bash
# See http://www.akadia.com/services/ssh_test_certificate.html

echo "This script will guide you through generating and self-signing a ssl-certificate."
echo ""
echo "Generating private key..."
openssl genrsa -des3 -out ssl/server.key 1024

echo "Done."
echo "Generating Certificate Signing Request..."
openssl req -new -key ssl/server.key -out ssl/server.csr

echo "Signing key..."
# Signing for 10 years!
openssl x509 -req -days 3653 -in ssl/server.csr -signkey ssl/server.key -out ssl/server.crt

echo "Key signed for 10 years. Have fun!"
