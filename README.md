# ssrfable-server
A cute little node server to throw ssrf payloads at. Have an idea or want to see something else here? Make a pull request or open an issue please :)

# FAQs

## What is SSRF?
An attacker can achieve ssrf when they can make arbitrary requests of one form or another from the server to anywhere they like. The destination will see the request source as the server.

This test server was initially built to demonstrate some specific SSRF scenarios.
- private-ip failures
- ssrf via path segment
- [more coming soon]

Please play around and enjoy yourself - sometimes multiple variants of ssrf are possible on the same endpoint.

## What is private-ip?
Private-ip is a little guardian package to tell you if an IP address should be internal-only or is part of the external internet, generally speaking. In [November of 2020](https://github.com/frenchbread/private-ip/pull/2) Sick Codes and Nick Sahler hardened private-ip's IPv4 check after John Jackson and Harold Hunt confirmed a flaw in it via the Shutterstock bug bounty program (see also: [advisory](https://github.com/sickcodes/security/blob/master/advisories/SICK-2020-022.md)).

## Why is Axios trying to connect to 127.0.0.1:80?

If Axios cannot find the address/IP/whatever you're trying to forge a request to, it'll default to 127.0.0.1:80. So if you're trying to hit a port on your local machine but that port isn't open, you might see ECONNREFUSED to 80 instead of whatever that port is.

# How to run

## Install needed dependencies and start the server (first time use)
```
npm install && node server.js
```
You can alternately use `npm run start` to run the server.

## Let's forge some requests?
The only required query param (which is what we'll be SSRFing) is `nextRequest`.

## Start the server (dependencies up to date)
```
node server.js
```
you'll see some console output in the server tab which may be helpful. There's also more verbose output in `server_log.json`.

## Example usage with clientside output
```
$ curl "localhost:8888/public?nextRequest=127.0.0.1"
problemas: will not request 127.0.0.1%
```

```
$ curl "localhost:8888/private?nextRequest=127.0.0.1"
attempted to hit 127.0.0.1%
```

