#!/usr/bin/env bash

# https://www.brainbytez.nl/tutorials/linux-tutorials/create-a-self-signed-wildcard-ssl-certificate-openssl/

# creates eslp-private.crt, eslp-private.key, eslp-private-ca.pem

# get the directory of the script, and cd into it
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

# set the subject from environment variable or default to something
SUBJ=${SUBJ:-"/C=US/ST=NC/L=Apex/O=MuellerWare/OU=dev/CN=eslp.local"}
SUBJ_CA="$SUBJ CA"

# set days from environment variable or default to 365
DAYS=${DAYS:-365}

# Step 1 : Create the CA Private Key
echo "Creating the CA Private Key"
openssl genrsa -out eslp-private-ca.key 2048

# Step 2: Generate the CA Root certificate
echo "Generating the CA Root certificate"
openssl req -x509 -new -nodes \
  -days $DAYS \
  -subj "$SUBJ_CA" \
  -key eslp-private-ca.key \
  -out eslp-private-ca.pem

# Step 3 : Create a Private Key
echo "Creating a Private Key"
openssl genrsa -out eslp-private.key 2048

echo "Generate the CSR"
# Step 4 : Generate the CSR
openssl req -new \
  -subj "$SUBJ" \
  -extensions v3_ca \
  -key eslp-private.key \
  -out eslp-request.csr

# Step 5: Create extensions file to specify subjectAltName

# File already created: cert-extensions.cnf

# Step 6: Generate the Certificate using the CSR

echo "Generating the Certificate using the CSR"
openssl x509 -req -sha256 \
  -days $DAYS \
  -CAcreateserial \
  -extfile cert-extensions.cnf \
  -in      eslp-request.csr \
  -CA      eslp-private-ca.pem \
  -CAkey   eslp-private-ca.key \
  -out     eslp-private.crt

echo "generated: eslp-private.crt"
echo "generated: eslp-private-ca.pem"