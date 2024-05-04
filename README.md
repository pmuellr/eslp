eslp - Elastic Stack Local Proxy
================================================================================

`eslp` is a localhost proxy to elastic stack servers.  It provides:

- an unauthenticated CORS-friendly http server running on localhost
- that proxies to authenticated elastic servers running elsewhere
- via a locally available DNS host names

install
================================================================================

    npm install -g pmuellr/eslp

or run via

    npx pmuellr/eslp
    
usage
================================================================================

    eslp [options] 
    
options:

| short | long                 | description
| ----- |--------------------- | ---------------------------------------------
| `-h`  | `--help`             | display help
| `-d`  | `--debug`            | generate verbose output when running
| `-v`  | `--version`          | print version
| `-p`  | `--port <num>`       | use this port number instead of default 19200
| `-c`  | `--config <file>`    | use this config file instead of `~/.eslp.toml`
| `-o`  | `--output plain|env` | generate output in plain or env var format

Once started, the proxy will become available and populate local DNS
with host names for each proxy.  For example: (using `-o env`)

    eslp: handling servers:

    # local
    export ES_URL=http://local-es.eslp.local:19200
    export KB_URL=http://local-kb.eslp.local:19200

    # pmuellr-8-9-0
    export ES_URL=http://pmuellr-8-9-0-es.eslp.local:19200
    export KB_URL=http://pmuellr-8-9-0-kb.eslp.local:19200

    # pmuellr-8-9-0-apikey
    export ES_URL=http://pmuellr-8-9-0-apikey-es.eslp.local:19200
    export KB_URL=http://pmuellr-8-9-0-apikey-kb.eslp.local:19200

    eslp: server started on port 19200, access at https://proxy.eslp.local:19200/

Each host name is an alias to `localhost`, and so each HTTP request to
that port will be disambiguated via it's `Host` header.

The DNS entries are only available on your local network, given the [.local][]
suffix.  That's good and bad.  The proxies aren't available via DNS outside your
own local network which is great.  The proxies ARE available via DNS within your
own network, but the server only accepts connections from localhost.  That means
two separate machines on the same local network may fight over these names.  If
that becomes a problem, there is likely some straight-forward fix like allowing
another string in the DNS names.

When this program runs, it writes the names of the hosts it's proxying to stdout.
When you press the "Enter" key at the terminal this program is running, it will
reload the config file - but just the servers, not the port.  If you edit and
save the config file, the config file will also be reloaded, but the port (if
specified) will be ignored.

[.local]: https://en.wikipedia.org/wiki/.local

config file
================================================================================

The config file is a TOML file describing the operation of eslp.

It must be in mode '600' (user: read/write, group/world: no access).
To make your config file mode '600', use the command:

    chmod 600 my-config-file-name.toml

The following properties can be used:

- `port` - the port to run on, overrideable on the command line
- `cert` - TLS certificate file to run the servers as https
- `key` - TLS key file to run the servers as https
- `servers` - an array of server entries, see below.

The `cert` property should be a file name of a TLS certificate to use
when running the server as https servers instead of http servers.
See the `cert` directory for some instructions on building the
certificate, which should be self-signed and set up with a wild card
for all the hosts running under the server.

When using the `cert` property, you must also use the `key` property.
A key file is also generated in the `cert` directory.

The `server` property is an array of objects.  The default server objects
configured are specified as:

    port = 19200

    [[server]]
    name   = "local"
    es     = "http://localhost:9200"
    kb     = "http://localhost:5601"
    user   = "elastic"
    pass   = "changeme"

    [[server]]
    name   = "locals"
    es     = "https://localhost:9200"
    kb     = "https://localhost:5601"
    user   = "elastic"
    pass   = "changeme"

The `name` property will be used as the part of the host name of
proxy generated for this server.

The `es` and `kb` properties are the URLs to Elasticsearch and Kibana.
I guess there could be more later.

Rather than use `user` and `pass`, you can use `apiKey`.

change log
================================================================================

#### 1.0.6 - 2024-05-04

- add `--output` / `-o` option to output server in plain or env var format

#### 1.0.5 - 2024-02-01

- add http[s]://proxy.eslp.local to provide basic web page and JSON index

#### 1.0.4 - 2024-01-30

- add https support

#### 1.0.3 - 2023-09-06

- fix up a few things

#### 1.0.2 - 2023-09-01

- reload config file when expected

#### 1.0.1 - 2023-08-21

- remove interstitial `.eslp` from domain names (eg `http://local.es.eslp.eslp.local:19200`)

#### 1.0.0 - 2023-08-19

- initial working version

license
================================================================================

This package is licensed under the MIT license.  See the [LICENSE.md][] file
for more information.

contributing
================================================================================

Awesome!  We're happy that you want to contribute.

Please read the [CONTRIBUTING.md][] file for more information.


[LICENSE.md]: LICENSE.md
[CONTRIBUTING.md]: CONTRIBUTING.md
[CHANGELOG.md]: CHANGELOG.md