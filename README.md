# ssrfable-server

## Warning
Hopefully it goes without saying but please don't use this code in production or for anything
serious; the normal [GPLv3+](https://www.gnu.org/licenses/gpl-3.0.en.html) warnings apply here.

## How to Contribute
Have an idea or want to see something else here? Make a pull request or open an issue please :)

0. Identify the CVE(s), CWE(s), or other vulnerable things you'd like to reproduce in Node here
1. Code up your commits, preferably including tests to prove your addition works (fails) as intended
2. Document what you did and how the endpoint or functionality added is meant to be vulnerable, with references, in https://github.com/kaoudis/vulnparty-js/blob/main/doc/vulns.md.
3. (optional) Add your name or handle to CREDITS.md
4. Open your PR

### Note
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
If you try to just run this web server and black box it, you're probably gonna be frustrated.

This app is designed as a grey box or even white box set of exercises where each endpoint has a series of things wrong with it. If you are truly stuck, please feel free to file an issue here or DM on Twitter. 

#### Recommended route
Pick an endpoint, and read the code and possibly the [vuln documentation](https://github.com/kaoudis/vulnparty-js/blob/main/doc/vulns.md) entry. Then run the server and test the endpoint with your tooling of choice (anything that can send an http request will do). What vulnerabilities do you spot? Do you see similarities to what is documented? Do you see anything that is undocumented and obviously wrong, broken, or bad practice?

#### You can:
- practice your code auditing and documentation skills
- practice your grey-box web app hacking
- practice your vulnerable coding; PRs that add vulnerable features and describe why the code is vulnerable and how you exploited it are welcome!
- practice your JS coding standards; I'd like this app to follow https://google.github.io/styleguide/jsguide.html eventually
- even just spin the app up and use it as a test ground for payloads, once you understand what the endpoints do

See [vuln documentation here](https://github.com/kaoudis/vulnparty-js/blob/main/doc/vulns.md)

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

## Why is Axios trying to connect to 127.0.0.1:80?
If Axios cannot find the address/IP/whatever you're trying to forge a request to, it'll
default to 127.0.0.1:80. So if you're trying to hit a port on your local machine but that 
port isn't open, you might see ECONNREFUSED to 80 instead of whatever the port you were 
trying to hit was.

# How to run

## Warning: if you just spin up and black box this app, you will probably not get much out of it.

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

## Let's forge some requests?
The only required query param for most of the server endpoints (which is what we'll be SSRFing) is `nextRequest`. The ftp endpoint also needs a filename to retrieve.

You'll want to watch both the server output log and the clientside output to get a sense of what's happening.

## Start the server (dependencies up to date)

```
npm run start
```

You'll see some console output in the server tab which may be helpful. There's also more verbose output in `server_log.json`, which you can `tail -f` if you like.

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
