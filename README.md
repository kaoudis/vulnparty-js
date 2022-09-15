# vulnparty
This Node app is a toy project I have occasionally added onto 
to explore what certain web app vulnerabilities might look like in source code, 
especially SSRF, LFI, and RFI. 
[GPLv3.0 link](https://github.com/kaoudis/vulnparty-js/blob/main/LICENSE) (c) 2022  @kaoudis

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

## Overview
In my very much continuing journey to learn to write secure code, I've found the following 
are useful foundation to know deeply what a type of vulnerability actually is:
- understanding what it means to write *vulnerable* code
- knowing what the specific type of vuln might look like in source code in the wild
- understanding what output might look like when vulnerable source code is run (and when 
it would or would *not* differ from output from source code that is not vulnerable!)

### Assumptions
You will probably be able to get something out of this vulnerable toy app if you have:
- familiarity with web apps and the client-server model in a distributed environment where 
the server makes requests to other servers (if you read the [examples](https://github.com/kaoudis/vulnparty-js#example-client-usage-for-a-few-of-the-endpoints) below and they do not 
make sense, I would recommend you learn about these topics, and then come back!)
- a little familiarity with writing Javascript or at least willingness to read it, especially Node
- high-level/basic understanding of web app attacks, especially SSRF, LFI, RFI
- willingness to explore and play around!

### What's this good for then?
#### You can:
- practice your code auditing and documentation skills
- practice your grey-box web app hacking
- practice your vulnerable coding; PRs that add vulnerable features and describe why the code is 
vulnerable and how you exploited it are welcome!
- practice your JS coding standards; I'd like this app to follow some consistent styleguide eventually
- use the app as a test ground for payloads, once you understand what the endpoints do

#### More
This app is a rough draft of a grey box or even white box set of small exercises where each endpoint 
has a series of things wrong with it. If you are truly stuck, please feel free to file an issue 
here or DM [on Twitter](https://twitter.com/kaoudis). As in "real" apps, there's no definite set of 
right answers, and currently no real spoilers (if you'd like to create an answer key writeup, that 
would also be welcome).

I wrote this app over time in bits and pieces to teach myself more deeply about how web app vulns 
actually work. I'm publishing it in the hopes it is also useful to others. However, 
it is not written to any particular coding standard, you might already know 
everything here, or you might not even have the needed web programming context. As the 
GPL says, "This program is distributed in the hope that it will be useful, but ... without 
even the implied warranty of FITNESS FOR A PARTICULAR PURPOSE."

If you don't want to or cannot yet read JS, I would redirect you to either a Node tutorial or 
one of the many great apps and platforms intended to teach black box web app hacking instead. 
If you're a programmer and interested in learning secure coding or learning to spot 
vulnerabilities in source code, let's goooo :)

### Recommended route
0. Pick an endpoint from server.js
1. Trace the code path through and try understand how the endpoint should work if it wasn't 
intended to be vulnerable
3. Try to spot and categorize what might be wrong!
4. Check out the [vuln documentation](https://github.com/kaoudis/vulnparty-js/blob/main/doc/vulns.md) 
for the endpoint
6. If you would like to see the behaviour of the endpoint live, run the server and test 
the endpoint with your tooling of choice (anything that can send an http request will do).
5. Go back and look at the source code again. Does what you saw live make sense with your initial 
understanding?

What issues do you spot? Do you see similarities to what is documented? Do you see 
anything that is undocumented and obviously wrong, broken, or bad practice?

See [vuln documentation here](https://github.com/kaoudis/vulnparty-js/blob/main/doc/vulns.md)

# How to run
The only required query param for most of the server endpoints is `nextRequest`. 
The ftp endpoint also needs a filename to retrieve.

You'll see some console output in the server tab. There's also more verbose 
output in `server_log.json`, which you can `tail -f` if you would like, but 
which is likely not necessary to look at to understand what the server is doing.

You'll want to watch both the server output log in the window where you're running
the server, and the clientside output to get the best sense of what's happening.

If you have dependency-related issues or issues running the server, please file an 
issue in this repository.

## Note: this app is not really intended to be black boxed, so you probably won't get much from just bombing it with payloads

## Install needed dependencies and start the server (first time)
```
$ npm install && npm run start
```

## Just start the server (after the first install)
```
$ npm run start
```

You should see something like the following output when starting the server: 
```
npm WARN npm npm does not support Node.js v10.24.0
npm WARN npm You should probably upgrade to a newer version of node as we
npm WARN npm can't make any promises that npm will work with this version.
npm WARN npm Supported releases of Node.js are the latest release of 4, 6, 7, 8, 9.
npm WARN npm You can find the latest version at https://nodejs.org/

> vulnparty-server@0.1.0 start /home/user/vulnparty-js
> node server.js

{ message: 'Starting CORS Anywhere Proxy on 127.0.0.1:8889',
  level: 'info',
  timestamp: '2022-09-15T00:43:31.279Z' }
```
This bad npm output is okay. In this particular case, we want the vulns! The second message about 
CORS Anywhere is about a secondary service we also start locally at runtime.

## Example client usage for a few of the endpoints
These examples both involve the client (curl) causing the server (vulnparty) to make a request 
on the client's behalf; both of the endpoints in these examples are vulnerable to 
[SSRF](https://portswigger.net/web-security/ssrf). 

Try using anything you like to fill out the `nextRequest` parameter, not just what we use here 
in the examples. You might even try fuzzing the `nextRequest` parameter to find categories of bad 
input!

### Example 1: `/public`
```
$ curl "localhost:8888/public?nextRequest=127.0.0.1"
```

#### `/public` expected outcome
You should see the following output appear appended to the log text in the window where you are 
running the server, given the `127.0.0.1` input to the `nextRequest` parameter:

```
{ message: 'would not request 127.0.0.1\n',
  level: 'error',
  timestamp: '2022-09-15T00:47:21.551Z' }
```

Curl should print the following output in the window where you are running it, and then 
close its connection to the server: 
```
would not request 127.0.0.1
```

This happens because you have requested a location (127.0.0.1) that the `/public` endpoint 
considered a [private IP address](https://www.omnisecu.com/tcpip/what-are-private-ip-addresses.php). 

Generally speaking, an IP address that is considered part of a "private" range is not accessible 
from the broader internet, since LANs and other not publicly accessible networks reuse private 
ranges. Addresses inside the private range used on the LAN should generally only be accessible from 
another location inside the LAN in question. Public IP addresses on the other hand should be 
publicly reachable and searchable through various tools. 

IPv4-related RFCs that might be interesting if you're not sure what a public or private IPv4 range is: 
- https://www.rfc-editor.org/rfc/rfc1918
- https://www.rfc-editor.org/rfc/rfc1597

As a side note, IPv6 also has "private" addresses which aren't routed on the broader internet.

#### Getting started attacking the `/public` endpoint
Let's say we are interested in tricking this endpoint into making a request to a private 
IP address, even though it is only intended to proxy requests to public IP addresses. How might 
we encode or change the value of our submitted `nextRequest` so that the endpoint makes the 
request anyway?

### Example 2: `/private`
```
$ curl "localhost:8888/private?nextRequest=127.0.0.1"
```

#### `private` expected outcome
Appended serverside output should look something like the following:

```
{ message: 'Did not successfully GET http://127.0.0.1',
  level: 'error',
  timestamp: '2022-09-15T00:55:52.169Z' }
{ message: 'ECONNREFUSED',
  level: 'error',
  timestamp: '2022-09-15T00:55:52.171Z' }
{ message:
   { url: 'http://127.0.0.1',
     method: 'get',
     headers:
      { Accept: 'application/json, text/plain, */*',
        'User-Agent': 'axios/0.21.0' },
     proxy: false,
     transformRequest: [ [Function: transformRequest] ],
     transformResponse: [ [Function: transformResponse] ],
     timeout: 0,
     adapter: [Function: httpAdapter],
     xsrfCookieName: 'XSRF-TOKEN',
     xsrfHeaderName: 'X-XSRF-TOKEN',
     maxContentLength: -1,
     maxBodyLength: -1,
     validateStatus: [Function: validateStatus],
     data: undefined },
  level: 'error',
  timestamp: '2022-09-15T00:55:52.171Z' }
```

Oh no! An error!?

The ECONNREFUSED in the server log doesn't mean the vulnparty server is broken, 
rather that it did exactly what you told it to - make an HTTP GET request to 
127.0.0.1 and then proxy back the response to you. The error is that nothing is 
running on the default port for Axios on your local machine. Since this request was 
to an IP in one of the "private" ranges, the `/private` endpoint tried to make it on 
your behalf and has now told you that it couldn't connect to anything running there.

Curl client output (followed by curl closing the connection to vulnparty):
```
attempting to request (private=true) 'nextRequest' location 127.0.0.1
```

#### Getting started attacking the `/private` endpoint
Let's say we are interested in tricking the `/private` endpoint into making a request 
to a *public* IP address, one that is not found within a private range, even though it
is only intended to proxy requests to private IP addresses. How might we encode or change 
the value of our submitted `nextRequest` so that the endpoint makes the request anyway?

#### Why is Axios trying to connect to 127.0.0.1:80?
If Axios cannot find the address/IP/whatever you're trying to forge a request to, it may
default to 127.0.0.1:80. So if you're trying to hit a port on your local machine but that 
port isn't open, you might see ECONNREFUSED to 80 instead of whatever the port you were 
trying to hit was.

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
- clean up the coding style to follow [the google JS style guide](https://google.github.io/styleguide/jsguide.html)

### Warning
PRs to 'fix' any app vulns or upgrade from vulnerable dependency versions will be rejected
