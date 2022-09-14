# Introduction

I started putting this API server together in order to learn more about what makes people write vulnerable code and to learn more about what kinds of common mistakes I might be unintentionally making, by intentionally writing vulnerable code. I've listed some similar vulns and things I was thinking about with each endpoint under `References`. As with the rest of this repo, additions are welcome here.

I'm not intending to be rude to the package maintainers of any dependencies included here, nor am I trying to say their software is bad, since that would be a subjective - and incorrect - statement. A large percentage of software in the world, if stood up without thoughtful consideration for security, will be insecure when deployed with shipped defaults, even if there are optional countermeasure options someone could use to make that software more secure. 

[Insecure Design](https://owasp.org/Top10/A04_2021-Insecure_Design/) and [Security Misconfiguration](https://owasp.org/Top10/A05_2021-Security_Misconfiguration/) (along with [SSRF](https://owasp.org/Top10/A10_2021-Server-Side_Request_Forgery_%28SSRF%29/) directly, not to mention [Vulnerable and Outdated Components](https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/)!) are some of the most critical categories of vulnerability in web application security currently. I will be the first to admit I have a bit of a soapbox about [secure by default](https://en.wikipedia.org/wiki/Secure_by_default) design - that is, make the secure thing the easiest (or even only) possible thing, and make the insecure thing difficult to do, without impacting business-critical functionality.

# What's here?

The main foci here are redirect and request forgery related serverside vulnerabilities, though some endpoints are exploitable additional ways. 

The following may not fully encompass everything that could be fixed within vulnparty if someone were to try to make it as secure as possible (again, any PRs to do this will be rejected - only add insecurities and documentation to this repo please). 

I've included a bunch of links to similar vulnerabilities, categories of vulnerabilities, and guides on how to prevent (or exploit) vulns like these, in order to put things in the proper context.

## Contributing

Addition of related vulns or new and weird varieties of vulns already demoed here would be especially awesome. Addition of documentation for existing vulns in the codebase (or why some of the vulnerable depedencies are so) would also be welcome.

## Endpoints

### GET /private
This endpoint relies on a vulnerable version of the `private-ip` JS package. It also does some entirely inappropriate things when returning error responses.

#### What is private-ip?
`private-ip`'s interface is designed to answer the question of whether an IP address should be considered private or public. It functions as a somewhat rudimentary allowlist/denylist, or could be used as a component of a more finely grained allow/deny policy.

#### References
- https://github.com/frenchbread/private-ip
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2020-28360
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2021-23718
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2018-15895
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2018-14858
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2021-22970
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2022-35949
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2022-32457
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2022-30049
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2022-29188
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2022-32409
- [DEF CON 29 talk about IP parsing confusion referencing private-ip and others](https://www.youtube.com/watch?v=_o1RPJAe4kU)
- sick.codes [advisory](https://github.com/sickcodes/security/blob/master/advisories/SICK-2020-022.md), [private-ip fix PR](https://github.com/frenchbread/private-ip/pull/2)

### GET /public
This endpoint is the inverse of `/private`. It allows you to make the `nextRequest` only if the private-ip based filter judges the provided IP address is not part of a private range.

#### References
(See [GET /private](https://github.com/kaoudis/vulnparty-js/blob/main/doc/vulns.md#get-private)).

### GET /safe_private
This endpoint (and `GET /safe_public`) are intended to demonstrate what might happen if a feature team were provided some kind of security report - maybe a CVE, maybe a ticket from some kind of internal system or internal security team - about their HTTP API without any useful security guidance. Or, perhaps the team would not make other changes to the existing logic as part of fixing the vulnerable endpoint? Choose your own adventure. Let's say (without judgement) our imaginary feature team, instead of bumping the vulnerable dependency to the most recent (therefore likely safer) version and cleaning up the other potentially exploitable issues with this endpoint, chooses to switch from using private-ip to a new library, netmask, and decides to roll their own IP address range filtering, since that's what is the most broken in old versions of private-ip. 

As also noted in the [hardening cors-anywhere](https://github.com/kaoudis/vulnparty-js/blob/main/doc/vulns.md#hardening-cors-anywhere) guidelines below, this endpoint exemplifies the inherent issues with incomplete denylisting (and allowlisting): alternative nomenclature forms for IPs and URLs, as well as other methodologies for allowlist/denylist filter bypass, exist. 

#### References
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2021-28918
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2021-29418
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2021-29424
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2011-1499
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2003-0993
- See also [GET / private](https://github.com/kaoudis/vulnparty-js/blob/main/doc/vulns.md#get-private) references

### GET /safe_public 
(See [GET /safe_private](https://github.com/kaoudis/vulnparty-js/blob/main/doc/vulns.md#get-safe_private)).

### GET /next/:nextRequest
An open proxy or reverse proxy can be used to launder requests on behalf of an attacker.

Notice that this endpoint (and a few of the others) applies a DNS lookup to ensure the location requested is advertised over DNS. As the attacker, we might be able to defeat this not-terribly-effective precaution against requests for addresses like localhost through DNS rebinding. We might also not even bother to introduce that extra layer of indirection, though it might be useful in some situations. If something is available on intranet DNS and we're on a system on the intranet, chances are `dns.lookup()` may happily find intranet resources for us without any further work needed on our part. 

#### References
- https://highon.coffee/blog/ssrf-cheat-sheet/#dns-rebinding-attempts
- https://github.com/taviso/rbndr
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2022-25876
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2019-5464

### GET /cors-anywhere
The [cors-anywhere](https://github.com/Rob--W/cors-anywhere/blob/master/lib/help.txt) package proxies requests, but adds CORS headers, and automatically follows redirects.

If you set up a proxy or reverse proxy without any security hardening or restriction on what can be requested through your proxy you may unintentionally enable LFI, RFI, mapping your internal network, and other variants on request forgery.

#### Hardening `cors-anywhere`
Some general guidance for safer usage of `cors-anywhere`, expanding on their setup [documentation](https://github.com/Rob--W/cors-anywhere#documentation):
- Ideally, configure rate-limiting of proxied requests so that you don't inadvertently become DoS-as-a-Service thus a nuisance to other locations on the Internet (probably also important if you happen to pay for your compute usage!). This rate limiting may need to match serverside rate limiting the resource providers use, so that your address does not become banned or downlimited.
- Ideally, require the Origin header and configure an Origin "whitelist" (allowlist) to restrict what can be proxied to only the resources you need
- Second-best (compared to allowlisting) is to denylist ("blacklist") instead of allowlist. Consider consulting a few SSRF cheat sheets to get a good idea of what to baseline-deny. Please do note though that it's better to deny all by default and allow just what you intend (allowlist), than to deny just a few things by default and allow everything else (denylist), since it's easier to understand what the expected happy-path and failure results are in an allowlist scenario.
- Also keep in mind that allowlist and denylist filter bypasses are [very much a thing](https://highon.coffee/blog/ssrf-cheat-sheet/)

#### References 
- https://github.com/Rob--W/cors-anywhere
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2022-1213


### GET /library/books/:bookFileName
This API endpoint demonstrates LFI. 

As with several of the other endpoints, you might notice from the source code that the attacker can manipulate the overly verbose response messages, which differ by execution path taken when handling the client request, to figure out what is happening.

#### References
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2022-32409
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2022-36997
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2020-1631
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2018-14573

### GET /ftp
Request forgery shouldn't be considered limited to HTTP/S! Don't forget about the other application layer protocols of the web such as FTP and the various types of RPC.

#### References
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2021-33213
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2020-13970
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2013-1648

### PATCH /host
The `Host`, `Location`, `X-Forwarded`, or `X-Forwarded-For` headers can potentially be vulnerable to SSRF since these headers are frequently in use for application-layer routing purposes. Sometimes SSRF is possible through other headers, but I find that large hosting providers may consider an "open reverse proxy" like this a feature rather than a bug. 

#### References
- https://aws.amazon.com/blogs/security/defense-in-depth-open-firewalls-reverse-proxies-ssrf-vulnerabilities-ec2-instance-metadata-service/
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2020-23776
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2020-1925
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2017-10973

### GET /redirect/:nextRequest
TBD

#### References
- https://docs.aws.amazon.com/amplify/latest/userguide/redirects.html

## Even More References!
- https://www.hahwul.com/phoenix/ssrf-open-redirect/
- https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html
- https://highon.coffee/blog/ssrf-cheat-sheet/
- https://owasp.org/Top10/A10_2021-Server-Side_Request_Forgery_%28SSRF%29/
