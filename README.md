# ssrfable-server
Have an idea or want to see something else here? Make a pull request or open an issue please :)

## Warning
Hopefully it goes without saying but please don't use this code in production or for anything
serious; the normal [GPLv3+](https://www.gnu.org/licenses/gpl-3.0.en.html) warnings apply here.

## Note
PRs to fix the app vulns or upgrade from vulnerable dependency versions will be rejected

## Overview
This web server code is intentionally vulnerable. 

The idea I'm exploring here in general is: `what happens when user input validation is
improperly implemented or not implemented at all?` 

### Theory
I have this idea that to learn to code securely, it's useful to learn to write
vulnerable code, hack it to prove it's vulnerable, then intentionally *write secure code*
next time.

### What's this good for? 
You can:
- practice your code audit and documentation skills
- practice your grey-box web app hacking
- practice your vulnerable coding; PRs that add vulnerable features and describe why the code is vulnerable and how you exploited it are welcome!
- practice your JS coding standards; I'd like this app to follow https://google.github.io/styleguide/jsguide.html eventually
- just spin the app up and use it as a test ground for any payloads you like

### Why did you build this?
Even though apps like DVWA and Juice Shop are awesome, someone else already implemented them.

To deeply learn how an attack works, my strategy so far has been to find a CVE or 
vulnerable app or package, reverse engineer the attack, and try to implement something 
broken in the same way. 

I also wanted to write some NodeJS.

This project started when I wanted to really understand why SSRF can happen beyond 
"yeah I can test for that and find it" in late 2020 - early 2021.

This test server was initially built to demonstrate some specific SSRF scenarios... 
and then it mutated and grew! Please play around and enjoy yourself!

## What is private-ip?
Private-ip is a little guardian package to tell you if an IP address should be internal-only or is part of the external internet, generally speaking. In [November of 2020](https://github.com/frenchbread/private-ip/pull/2) Sick Codes and Nick Sahler hardened private-ip's IPv4 check after John Jackson and Harold Hunt confirmed a flaw in it via the Shutterstock bug bounty program (see also: [advisory](https://github.com/sickcodes/security/blob/master/advisories/SICK-2020-022.md)).

See also: [DEF CON 29 talk about IP parsing confusion referencing private-ip and others](https://www.youtube.com/watch?v=_o1RPJAe4kU)

## Why is Axios trying to connect to 127.0.0.1:80?
If Axios cannot find the address/IP/whatever you're trying to forge a request to, it'll
default to 127.0.0.1:80. So if you're trying to hit a port on your local machine but that 
port isn't open, you might see ECONNREFUSED to 80 instead of whatever the port you were 
trying to hit was.

# How to run

## Install needed dependencies and start the server (first time use)
If you have dependency-related issues or issues running the server in order to try payloads against it, please file an issue in this repository.

```
DEBIAN / UBUNTU
sudo apt-get install libcurl4-gnutls-dev && \
npm install && \
npm run start

ARCH
pacman -S libcurl-gnutls && \
npm install && \
npm run start
```

Alternately you can use `node server.js` to run the server.

## Let's forge some requests?
The only required query param for most of the server endpoints (which is what we'll be SSRFing) is `nextRequest`. The ftp endpoint also needs a filename to retrieve.

You'll want to watch both the server output log and the clientside output to get a sense of what's happening.

## Start the server (dependencies up to date)
```
node server.js
```
You'll see some console output in the server tab which may be helpful. There's also more verbose output in `server_log.json`.

## Example client usage for a few of the endpoints
This is just to get you started. Try using lots of different stuff to fill out 
the nextRequest parameter. You might even try fuzzing it to find categories of 
bad input!

(with server running in another terminal tab or window)

```
$ curl "localhost:8888/public?nextRequest=127.0.0.1"
```

```
$ curl "localhost:8888/private?nextRequest=127.0.0.1"
```

Logs for debugging will be appended to `server_log.json` in the server working directory.
