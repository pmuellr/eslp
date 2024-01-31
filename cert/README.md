# create a self-signed wildcard tls certificate for https eslp usage

Run `build-cert.sh`.

Creates files 
- `eslp-private.crt` 
- `eslp-private.key` 
- `ca-private.pem`

The first two need to be referenced in your `eslp.toml` file
as the `cert` and `key` file names, respectively.  
The Node.js server uses these to run the https server locally.

The last one is a CA certificate.  On a Mac, you can load this into
the Keychain Access app and mark it as trusted.  Since the certificate
Node.js uses is signed by this CA, access to the server locally will
be considered "trusted".

The certificate will be valid for host names matching `*.eslp.local`
