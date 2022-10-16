eslp - Elastic Stack Local Proxy
================================================================================

`eslp` is a localhost proxy to elastic stack servers.  It provides:

- an unauthenticated CORS-friendly http server running on localhost
- that proxies to authenticated elastic servers running elsewhere
- via a URL path name prefix

Obviously, this server should not be exposed outside your own machine,
and you should shut it down when it's not needed.

The reason it exists is to make it easy to access elasticsearch servers from
"web apps" like Notebooks, which can easily communicate with a CORS-friendly
localhost server, 

usage
================================================================================

    eslp [options] <config-file>

`<config-file>` is the name of a file with the configuration to use.  See
below for the format.  If a config file is not provided, it's assumed a 
config file named `eslp.yaml` exists in the current directory.

options:

| option | description |
| ------ | ----------- |
| `-h --help`    | display help
| `-d --debug`   | generate verbose output when running
| `-v --version` | print version


config file
================================================================================

The config file is a YAML file describing the operation of eslp.  See the
sample [`eslp.yaml`](eslp.yaml) file for more information on it's structure.


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