# Vulnerabilities

The following document describes the vulnerabilities intentionally included in this server, but may not fully encompass everything that could be fixed within vulnparty.

As you might notice, the main foci here are SSRF, RFI, LFI, and open redirects, though some endpoints are exploitable additional ways. Addition of other types of vulns is welcome, but addition of related vulns or new and weird varities of vulns already demoed here would be especially awesome.

## The Endpoints

### GET /private
This endpoint relies on a vulnerable version of the `private-ip` JS package. It also does some entirely inappropriate things when returning error responses.

#### What is private-ip?
`private-ip`'s interface is designed to the question of whether an IP address is private or public, but the implementation was flawed.

#### Related/Inspirational CVEs
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2020-28360
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2021-23718
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2018-15895
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2018-14858
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2021-22970
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2022-35949
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2022-32457
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2022-30049
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2022-29188

#### Other
- [DEF CON 29 talk about IP parsing confusion referencing private-ip and others](https://www.youtube.com/watch?v=_o1RPJAe4kU)
- [advisory](https://github.com/sickcodes/security/blob/master/advisories/SICK-2020-022.md)
- [private-ip fix PR](https://github.com/frenchbread/private-ip/pull/2): Sick Codes and Nick Sahler hardened private-ip's IPv4 check after John Jackson and Harold Hunt confirmed a flaw in the package via the Shutterstock bug bounty program.

### GET /public
This endpoint is the inverse of `/private`. It allows you to make the `nextRequest` only if the private-ip based filter judges the provided IP address is not part of a private range.

#### Related CVEs
(See `GET /private`).

### GET /safe_private
This endpoint (and `GET /safe_public`) are intended to demonstrate what might happen if a developer who's a service owner got some kind of security report - maybe a CVE, maybe a ticket from some kind of internal system or internal security team - without additional security guidance. Or, perhaps the team were resistant to making business logic changes as part of fixing the vulnerable endpoint. Our imaginary team, instead of bumping the vulnerable dependency, chose to switch to a different library for the same purpose and roll their own IP address range filtering. This new endpoint is very safe.

#### Related CVEs
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2021-28918
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2021-29418
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2021-29424
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2011-1499
- https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2003-0993
- See also `GET / private` list of related

### GET /safe_public 
(See `GET /safe_private`).

### GET /next/:nextRequest
This endpoint doesn't literally use `cors-anywhere`, but rather artistically reimplements the issue for comparison purposes.

To explore literal usage of `cors-anywhere`, try the `GET /cors-anywhere` endpoint.

Quoting the description of `cors-anywhere`, 

    CORS Anywhere is a NodeJS proxy which adds CORS headers to the proxied request.

    The url to proxy is literally taken from the path, validated and proxied. The protocol part of the proxied URI is optional, and defaults to "http". If port 443 is specified, the protocol defaults to "https".

    This package does not put any restrictions on the http methods or headers, except for cookies.

Check out the request examples in the `cors-anywhere` README for more.

#### References 
- https://github.com/Rob--W/cors-anywhere

### GET /cors-anywhere
TBD

### GET /library/books/:bookFileName

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

#### CVEs this endpoint is inspired by

#### Further References
- https://docs.aws.amazon.com/amplify/latest/userguide/redirects.html

## Even More References
- https://www.hahwul.com/phoenix/ssrf-open-redirect/

