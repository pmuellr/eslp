eslp - Elastic Stack Local Proxy
================================================================================

`eslp` is a localhost proxy to elastic stack servers.  It provides:

- an unauthenticated CORS-friendly http server running on localhost
- that proxies to authenticated elastic servers running elsewhere
- via a locally available DNS host names

The reason it exists is to make it easy to access elasticsearch servers from
"web apps" like Notebooks, which can easily communicate with a CORS-friendly
localhost server.

It also avoids the need for authorization, handing both user/password and
API keys.

install
================================================================================

    npm install -g pmuellr/eslp
    
usage
================================================================================

    eslp [options] 
    
options:

| option               | description
| -------------------- | -----------
| `-h --help`          | display help
| `-d --debug`         | generate verbose output when running
| `-v --version`       | print version
| `-p --port <num>`    | use this port number instead of default 19200
| `-c --config <file>` | use this config file instead of `~/.eslp.toml`

Once started, the proxy will become available and populate local DNS
with host names for each proxy.  For example:

    eslp: handling servers:
    eslp:    local
    eslp:       elasticsearch: http://local.es.eslp.local:19200
    eslp:       kibana:        http://local.kb.eslp.local:19200
    eslp:    locals
    eslp:       elasticsearch: http://locals.es.eslp.local:19200
    eslp:       kibana:        http://locals.kb.eslp.local:19200
    eslp:    pmuellr-8-9-0
    eslp:       elasticsearch: http://pmuellr-8-9-0.es.eslp.local:19200
    eslp:       kibana:        http://pmuellr-8-9-0.kb.eslp.local:19200
    eslp:    pmuellr-8-9-0-apikey
    eslp:       elasticsearch: http://pmuellr-8-9-0-apikey.es.eslp.local:19200
    eslp:       kibana:        http://pmuellr-8-9-0-apikey.kb.eslp.local:19200

In this case, the `local` and `locals` entries are provided by default,
and `pmuellr-8-9-0` and `pmuellr-8-9-0-apikey` were provided by a 
config file.

Each host name is an alias to `localhost`, and so each HTTP request to
that port will be disambiguated via it's `Host` header.

The DNS entries are only available on your local network, given the [.local][]
suffix.  That's good and bad.  The proxies aren't available via DNS outside your
own local network which is great.  The proxies ARE available via DNS within your
own network, but the server only accepts connections from localhost.  That means
to separate machines on the same local network may fight over these names.  If
that becomes a problem, there is likely some straight-forward fix like allowing
another string in the DNS names.

[.local]: https://en.wikipedia.org/wiki/.local

config file
================================================================================

The config file is a TOML file describing the operation of eslp.  

There can be a property `port` specifing the port to run the proxy on,
which can be overridden by the `--port` option.

There also can be an array of `server` objects.  The default server objects
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