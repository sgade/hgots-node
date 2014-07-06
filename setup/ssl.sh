#!/bin/bash
# See http://www.akadia.com/services/ssh_test_certificate.html

echo "Enter the filename for the certificate (only name):"
read CERT_NAME
echo "This script will guide you through generating and self-signing a ssl-certificate."
echo ""
echo "Generating private key..."
openssl genrsa -des3 -out ssl/$CERT_NAME.key 1024

echo "Done."
echo "Generating Certificate Signing Request..."
openssl req -new -key ssl/$CERT_NAME.key -out ssl/$CERT_NAME.csr

echo "Signing key..."
# Signing for 10 years!
openssl x509 -req -days 3653 -in ssl/$CERT_NAME.csr -signkey ssl/$CERT_NAME.key -out ssl/$CERT_NAME.crt

echo "Key signed for 10 years. Have fun!"
