# ssrfable-server

Hopefully it goes without saying but please don't deploy this server anywhere public facing; it is 
a toy intended for test and learning purposes only. The normal 
[GPLv3+](https://www.gnu.org/licenses/gpl-3.0.en.html) warnings apply here.

## Overview
In my very much continuing journey to learn to write secure code, I've found the following 
are necessary foundation:
- understanding what it means to write *vulnerable* code
- understanding what a vulnerability of a specific type in source code actually might 
look like in the wild
- understanding what output might look like when vulnerable source code is run (and when 
it would or would not differ from source code that is not vulnerable!)

### Assumptions
You will probably get the most out of this vulnerable app if you aren't a web app security expert, but **do have**:
- familiarity with web apps and the client-server model in a distributed environment where 
the server makes requests to other servers (if you read the [examples]() below and they do not 
make sense, I would recommend you learn about these topics, and then come back!)
- a little familiarity with writing Javascript or at least willingness to read it, especially Node
- high-level/basic understanding of web app attacks, especially SSRF, LFI, RFI
- willingness to explore and play around!

### What's this even good for?
This app is designed as a grey box or even white box set of small exercises where each endpoint 
has a series of things wrong with it. If you are truly stuck, please feel free to file an issue 
here or DM on Twitter. As in "real" apps, there's no definite set of right answers, and no answer 
key (but if you'd like to create an answer key that would be welcome too). 

If you don't want to or cannot yet read JS, I would redirect you to one of the many great 
apps and platforms intended to teach black box web app hacking instead. If you're a programmer 
and interested in leveraging your skills in web app security, either through coding 
securely or learning to spot vulnerabilities in source code, read on :)

#### Recommended route
0. Pick an endpoint from server.js
1. Trace the code path through and try understand how the endpoint would be intended to work if 
it wasn't written intentionally vulnerably
1.5 Try to spot and categorize what might be wrong!
2. Check out the [vuln documentation](https://github.com/kaoudis/vulnparty-js/blob/main/doc/vulns.md) entry
3. Finally, if you would like to see the behaviour of the endpoint live, run the server and test 
the endpoint with your tooling of choice (anything that can send an http request will do). 

What vulnerabilities do you spot? Do you see similarities to what is documented? Do you see 
anything that is undocumented and obviously wrong, broken, or bad practice?

#### You can:
- practice your code auditing and documentation skills
- practice your grey-box web app hacking
- practice your vulnerable coding; PRs that add vulnerable features and describe why the code is 
vulnerable and how you exploited it are welcome!
- practice your JS coding standards; I'd like this app to follow [The google JS style guid](https://google.github.io/styleguide/jsguide.html) eventually
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

## Note: this app is not really intended to be black boxed, and you probably won't learn much from just spinning it up and bombing it with payloads

## Install needed dependencies and start the server (first time)
If you have dependency-related issues or issues running the server in order to try payloads 
against it, please file an issue in this repository.

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
The only required query param for most of the server endpoints (which is what we'll be SSRFing) 
is `nextRequest`. The ftp endpoint also needs a filename to retrieve.

You'll want to watch both the server output log in the window where you're running
the server, and the clientside output to get the best sense of what's happening.

## Start the server (dependencies up to date)

```
npm run start
```

You'll see some console output in the server tab. There's also more verbose 
output in `server_log.json`, which you can `tail -f` if you would like, but 
which is likely not necessary to look at to understand what the server is doing.

## Example client usage for a few of the endpoints
These examples both involve the client (curl) causing the server (vulnparty) to make a request 
on the client's behalf.

Both of the endpoints in these examples are vulnerable to [SSRF](https://portswigger.net/web-security/ssrf). 

Try using anything you can imagine to fill out the `nextRequest` parameter, not just what we use here 
in the examples. You might even try fuzzing the `nextRequest` parameter to find categories of bad 
input!

### Example 1: `/public`
```
$ curl "localhost:8888/public?nextRequest=127.0.0.1"
```

#### `/public` curl expected outcome
You will see the following output in the window where you are running the server, given the 
`127.0.0.1` input to the `nextRequest` parameter:

```

```

Your curl client will get back the following output: 
```

```

This occurs because . 

#### Attack model
<>

### Example 2: `/private`
```
$ curl "localhost:8888/private?nextRequest=127.0.0.1"
```

#### `private` curl expected outcome
Server log output:

```

```

Curl client output:
```

```

This occurs because .

#### Attack model
<>

### Note 
Debug logs will be appended to `server_log.json` in the server working directory. `info` 
level logs will be output when the server runs.

## How to Contribute
Have an idea or want to see something else here? Make a pull request or open an issue 
please :)

0. Identify the CVE(s), CWE(s), or other vulnerable things you'd like to reproduce in Node 
here
1. Code up your commits, preferably including tests to prove your addition works (fails) as 
intended
2. Document what you did and how the endpoint or functionality added is meant to be 
vulnerable, with references, in https://github.com/kaoudis/vulnparty-js/blob/main/doc/vulns.md.
3. (optional) Add your name or handle to CREDITS.md
4. Open your PR

### Starting ideas for contribution / todos
- complete the unit tests and make an automatic command to run them (test for the bad / 
expected behaviour and verify it)
- add [Swagger](https://swagger.io/) documentation for the endpoints
- add new types of vulns or vulnerable dependencies that can be exploited

### Warning
PRs to 'fix' any app vulns or upgrade from vulnerable dependency versions will be rejected
