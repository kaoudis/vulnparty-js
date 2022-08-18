# Vulnerabilities

The following document describes the vulnerabilities intentionally included in this server, but may not fully encompass everything that could be fixed within vulnparty.

As you might notice, the main foci here are SSRF, RFI, LFI, and open redirects, though some endpoints are exploitable additional ways. Addition of other types of vulns is welcome, but addition of related vulns or new and weird varities of vulns already demoed here would be especially awesome.

## The Endpoints

### GET /private
This endpoint relies on a vulnerable version of the `private-ip` JS package. It also does some entirely inappropriate things when returning error responses.

#### What is private-ip?
`private-ip`'s interface is designed to the question of whether an IP address is private or public, but the implementation was flawed.

#### Inspirational References
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
- https://sick.codes [advisory](https://github.com/sickcodes/security/blob/master/advisories/SICK-2020-022.md)
- [private-ip fix PR](https://github.com/frenchbread/private-ip/pull/2) (Sick Codes, Nick Sahler)

### GET /public
This endpoint is the inverse of `/private`. It allows you to make the `nextRequest` only if the private-ip based filter judges the provided IP address is not part of a private range.

#### References
(See [GET /private](https://github.com/kaoudis/vulnparty-js/blob/main/doc/vulns.md#get-private)).

### GET /safe_private
This endpoint (and `GET /safe_public`) are intended to demonstrate what might happen if a feature team were provided some kind of security report - maybe a CVE, maybe a ticket from some kind of internal system or internal security team - about their HTTP API without any useful security guidance. Or, perhaps the team were resistant to making business logic changes as part of fixing the vulnerable endpoint. Our imaginary team, instead of bumping the vulnerable dependency, chooses to switch to a different library for the same purpose and roll their own IP address range filtering. 

As noted in the [Hardening cors-anywhere](https://github.com/kaoudis/vulnparty-js/blob/main/doc/vulns.md#hardening-cors-anywhere) guidelines below, this endpoint exemplifies the inherent issues with denylisting (and, but to a slightly lesser degree, allowlisting): alternative nomenclature forms for IPs and URLs, as well as other methodologies for allowlist/denylist filter bypass, are a thing. 

#### References
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2021-28918
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2021-29418
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2021-29424
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2011-1499
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2003-0993
- See also [GET / private](https://github.com/kaoudis/vulnparty-js/blob/main/doc/vulns.md#get-private) list of related
- https://github.com/ospfranco/link-preview-js/pull/117

### GET /safe_public 
(See [GET /safe_private](https://github.com/kaoudis/vulnparty-js/blob/main/doc/vulns.md#get-safe_private)).

### GET /next/:nextRequest
This endpoint demonstrates the core issue I observe with an open proxy or reverse proxy: it is *open*, hence a clever attacker can use it to launder their requests.

Further notice that this endpoint (and several of the others) involve a DNS lookup to ensure the location is advertised. We can defeat this through DNS rebinding if we choose. We might also not even bother to introduce that extra layer of indirection in some situations. If something is available on intranet DNS and we're on a system on the intranet, chances are dns.lookup() will happily find intranet resources for us. 

#### References
- https://highon.coffee/blog/ssrf-cheat-sheet/#dns-rebinding-attempts
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2022-25876
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2019-5464

### GET /cors-anywhere
The intended goal of this package as can be inferred from its documentation on Github is to proxy a request to anywhere, but including CORS headers. 

I'm not intending to be rude to the package maintainer or say their software is bad. The maintainer/creator built something that is rather useful for its intended purpose! If you set up a proxy or reverse proxy without any security hardening or restriction on what can be requested through your proxy you may however end up unintentionally enabling LFI, RFI, attackers who wish to map your internal network, and other variants on request forgery.

#### Hardening `cors-anywhere`
Some general guidance for safer usage of `cors-anywhere`:
- configure rate-limiting of proxied requests so that you don't inadvertently become DoS-as-a-Service thus a nuisance to other locations on the Internet (probably also important if you happen to pay for your compute usage!)
- configure an Origin "whitelist" (allowlist) to restrict what can be proxied to only the resources you need
- If you choose to denylist ("blacklist") instead of allowlist, consult a few SSRF cheat sheets to get a good idea of what to baseline-deny. Please do note though that it's better to deny all by default and allow just what you intend (allowlist), than to deny just a few things by default and allow everything else (denylist), since it's easier to understand what the expected happy-path and failure results are in an allowlist scenario.
- Also keep in mind that allowlist and denylist filter bypasses are [still very much a thing](https://highon.coffee/blog/ssrf-cheat-sheet/)

#### References 
- https://github.com/Rob--W/cors-anywhere
- 

### GET /library/books/:bookFileName
This endpoint demonstrates LFI.

#### References
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2022-32409

### GET /ftp

### POST /curl
TBD

### PATCH /host
The `Host`, `Location`, `X-Forwarded`, or `X-Forwarded-For` headers can potentially be vulnerable to SSRF since these headers are frequently in use for application-layer routing purposes. Sometimes SSRF is possible through other headers, but I find that large hosting providers may consider an "open reverse proxy" like this a feature rather than a bug. 

#### Further References
- https://aws.amazon.com/blogs/security/defense-in-depth-open-firewalls-reverse-proxies-ssrf-vulnerabilities-ec2-instance-metadata-service/
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2020-23776
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2020-1925
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2017-10973

### GET /redirect/:nextRequest
TBD


#### Further References
- https://docs.aws.amazon.com/amplify/latest/userguide/redirects.html

## Even More References
- https://www.hahwul.com/phoenix/ssrf-open-redirect/
- https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html
- https://highon.coffee/blog/ssrf-cheat-sheet/
