# Authelia

  [![license](https://img.shields.io/github/license/mashape/apistatus.svg?maxAge=2592000)][MIT License]
  [![Build](https://travis-ci.org/clems4ever/authelia.svg?branch=master)](https://travis-ci.org/clems4ever/authelia)
  [![Gitter](https://img.shields.io/gitter/room/badges/shields.svg)](https://gitter.im/authelia/general?utm_source=share-link&utm_medium=link&utm_campaign=share-link)

**Authelia** is a complete HTTP 2-factor authentication server for proxies like
Nginx or Traefik. It has been designed to be proxy agnostic so that you can 
use whichever proxy supporting authentication forwarding.

# Table of Contents
1. [Features summary](#features-summary)
2. [Deployment](#deployment)
    1. [With NPM](#with-npm)
    2. [With Docker](#with-docker)
3. [Getting started](#getting-started)
    1. [Pre-requisites](#pre-requisites)
    2. [Run it!](#run-it)
4. [Features in details](#features-in-details)
    1. [First factor with LDAP and ACL](#first-factor-with-ldap-and-acl)
    2. [Second factor with TOTP](#second-factor-with-totp)
    3. [Second factor with U2F security keys](#second-factor-with-u2f-security-keys)
    4. [Password reset](#password-reset)
    5. [Access control](#access-control)
    6. [Single factor authentication](#single-factor-authentication)
    7. [Session management with Redis](#session-management-with-redis)
4. [Security](#security)
5. [Documentation](#documentation)
    1. [Authelia configuration](#authelia-configuration)
    2. [API documentation](#api-documentation)
6. [Contributing to Authelia](#contributing-to-authelia)
7. [License](#license)

---

## Features summary
* Two-factor authentication using either 
**[TOTP] - Time-Base One Time password -** or **[U2F] - Universal 2-Factor -** 
as 2nd factor.
* Password reset with identity verification using email.
* Single and two factors authentication methods available. 
* Access restriction after too many authentication attempts.
* User-defined access control per subdomain and resource.
* Support of [basic authentication] for endpoints protected by single factor.
* High-availability using a highly-available distributed database and KV store.

## Deployment

If you don't have any LDAP and/or nginx setup yet, I advise you to follow the 
[Getting Started](#Getting-started) section. That way, you can test it right away 
without even configuring anything.

Otherwise, here are the available steps to deploy **Authelia** on your machine given 
your configuration file is **/path/to/your/config.yml**. Note that you can create your 
own the configuration file from [config.template.yml] at the root of the repo.

### With NPM

    npm install -g authelia
    authelia /path/to/your/config.yml

### With Docker

    docker pull clems4ever/authelia
    docker run -v /path/to/your/config.yml:/etc/authelia/config.yml -v /path/to/data/dir:/var/lib/authelia clems4ever/authelia

where **/path/to/data/dir** is the directory where all user data will be stored.

## Getting started

The provided example is docker-based so that you can deploy and test it very 
quickly.

### Pre-requisites

#### npm
Make sure you have npm and node installed on your computer.

#### Docker
Make sure you have **docker** and **docker-compose** installed on your machine.
For your information, here are the versions that have been used for testing:

    docker --version

gave *Docker version 17.03.1-ce, build c6d412e*.

    docker-compose --version

gave *docker-compose version 1.14.0, build c7bdf9e*.

#### Available port
Make sure you don't have anything listening on port 8080 (webserver) and 8085 (webmail).

#### Subdomain aliases

Add the following lines to your **/etc/hosts** to alias multiple subdomains so that nginx can redirect request to the correct virtual host.

    127.0.0.1       home.example.com
    127.0.0.1       public.example.com
    127.0.0.1       dev.example.com
    127.0.0.1       admin.example.com
    127.0.0.1       mx1.mail.example.com
    127.0.0.1       mx2.mail.example.com
    127.0.0.1       single_factor.example.com
    127.0.0.1       login.example.com

### Run it!
    
Deploy the **Authelia** example with one of the following commands:

Build Docker container from current commit:

    ./scripts/build-dev.sh
    ./scripts/example-commit/deploy-example.sh

Use provided container on [DockerHub](https://hub.docker.com/r/clems4ever/authelia/):

    ./scripts/example-dockerhub/deploy-example.sh
    
After few seconds the services should be running and you should be able to visit 
[https://home.example.com:8080/](https://home.example.com:8080/).

When accessing the login page, a self-signed certificate exception should appear, 
it has to be trusted before you can get to the target page. The certificate
must also be trusted for each subdomain, therefore it is normal to see the exception
 several times.

Below is what the login page looks like:

<img src="https://raw.githubusercontent.com/clems4ever/authelia/master/images/first_factor.png" width="400">

## Features in details

### First factor using an LDAP server
**Authelia** uses an LDAP server as the backend for storing credentials.
When authentication is needed, the user is redirected to the login page which
corresponds to the first factor. Authelia tries to bind the username and password
against the configured LDAP backend.

You can find an example of the configuration of the LDAP backend in [config.template.yml].

<img src="https://raw.githubusercontent.com/clems4ever/authelia/master/images/second_factor.png" width="400">


### Second factor with TOTP
In **Authelia**, you can register a per user TOTP (Time-Based One Time Password) secret before 
authenticating. To do that, you need to click on the register button. It will 
send a link to the user email address stored in LDAP. Since this is an example, the email is sent 
to a fake email address you can access from the webmail at [http://localhost:8085](http://localhost:8085). 
Click on **Continue** and you'll get your secret in QRCode and Base32 formats. You can use 
[Google Authenticator] 
to store them and get the generated tokens with the app.

**Note:** If you're testing with **npm**, you will not have access to the fake webmail. You can use the filesystem notifier (option available [config.template.yml]) that will create a file containing the validation URL instead of sending an email. Please only use it for testing.

<img src="https://raw.githubusercontent.com/clems4ever/authelia/master/images/totp.png" width="400">

### Second factor with U2F security keys
**Authelia** also offers authentication using U2F (Universal 2-Factor) devices like [Yubikey](Yubikey) 
USB security keys. U2F is one of the most secure authentication protocol and is 
already available for Google, Facebook, Github accounts and more.

Like TOTP, U2F requires you register your security key before authenticating. 
To do so, click on the register button. This will send a link to the 
user email address. Since this is an example, the email is sent 
to a fake email address you can access from the webmail at [http://localhost:8085](http://localhost:8085).
Click on **Continue** and you'll be asking to touch the token of your device 
to register. Upon successful registration, you can authenticate using your U2F 
device by simply touching the token. Easy, right?!

**Note:** If you're testing with **npm**, you will not have access to the fake webmail. You can use the filesystem notifier (option available [config.template.yml]) that will create a file containing the validation URL instead of sending an email. Please only use it for testing.

<img src="https://raw.githubusercontent.com/clems4ever/authelia/master/images/u2f.png" width="400">

### Password reset
With **Authelia**, you can also reset your password in no time. Click on the 
**Forgot password?** link in the login page, provide the username of the user requiring 
a password reset and **Authelia** will send an email with an link to the user 
email address. For the sake of the example, the email is delivered in a fake webmail deployed
for you and accessible at [http://localhost:8085](http://localhost:8085).
Paste the link in your browser and you should be able to reset the password.

**Note:** If you're testing with **npm**, you will not have access to the fake webmail. You can use the filesystem notifier (option available [config.template.yml]) that will create a file containing the validation URL instead of sending an email. Please only use it for testing.

<img src="https://raw.githubusercontent.com/clems4ever/authelia/master/images/reset_password.png" width="400">

### Access Control
With **Authelia**, you can define your own access control rules for finely restricting 
user access to some resources and subdomains. Those rules are defined and fully documented 
in the configuration file. They can apply to users, groups or everyone.
Check out [config.template.yml] to see how they are defined.

### Single factor authentication
Authelia allows you to customize the authentication method to use for each 
sub-domain.The supported methods are either "single_factor" or "two_factor". 
Please see [config.template.yml] to see an example of configuration.

It is also possible to use [basic authentication] to access a resource 
protected by a single factor.

### Session management with Redis
When your users authenticate against Authelia, sessions are stored in a Redis key/value store. You can specify your own Redis instance in [config.template.yml].

## Security

### Protection against cookie theft

Authelia uses two mechanism to protect against cookie theft:
1. session attribute `httpOnly` set to true make client-side code unable to
read the cookie.
2. session attribute `secure` ensure the cookie will never be sent over an
unsecure HTTP connections.

### Protection against multi-domain cookie attacks

Since Authelia uses multi-domain cookies to perform single sign-on, an
attacker who poisonned a user's DNS cache can easily retrieve the user's
cookies by making the user send a request to one of the attacker's IPs.

To mitigate this risk, it's advisable to only use HTTPS connections with valid
certificates and enforce it with HTTP Strict Transport Security ([HSTS]) so
that the attacker must also require the certificate to retrieve the cookies.

Note that using [HSTS] has consequences. That's why you should read the blog
post nginx has written on [HSTS].

### More protections measures

You can also apply the following headers to your nginx configuration for
improving security. Please read the documentation of those headers before
applying them blindly.

```
# We don't want any credentials / TOTP secret key / QR code to be cached by
# the client
add_header Cache-Control "no-store";
add_header Pragma "no-cache";

# Clickjacking / XSS protection

# We don't want Authelia's login page to be rendered within a <frame>, 
# <iframe> or <object> from an external website.
add_header X-Frame-Options "SAMEORIGIN";

# Block pages from loading when they detect reflected XSS attacks.
add_header X-XSS-Protection "1; mode=block";
```

## Documentation
### Authelia configuration
The configuration of the server is defined in the file 
[config.template.yml]. All the details are documented there.
You can specify another configuration file by giving it as first argument of 
**Authelia**.

    authelia config.custom.yml

### API documentation
There is a complete API documentation generated with 
[apiDoc](http://apidocjs.com/) and embedded in the repo under the **doc/** 
directory. Simply open index.html locally to watch it.

## Contributing to Authelia
Follow [contributing](CONTRIBUTORS.md) file.

## License
**Authelia** is **licensed** under the **[MIT License]**. The terms of the license are as follows:

    The MIT License (MIT)

    Copyright (c) 2016 - Clement Michaud

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
    WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
    CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


[MIT License]: https://opensource.org/licenses/MIT
[TOTP]: https://en.wikipedia.org/wiki/Time-based_One-time_Password_Algorithm
[U2F]: https://www.yubico.com/about/background/fido/
[Yubikey]: https://www.yubico.com/products/yubikey-hardware/yubikey4/
[auth_request]: http://nginx.org/en/docs/http/ngx_http_auth_request_module.html
[Google Authenticator]: https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en
[config.template.yml]: https://github.com/clems4ever/authelia/blob/master/config.template.yml
[HSTS]: https://www.nginx.com/blog/http-strict-transport-security-hsts-and-nginx/
[basic authentication]: https://en.wikipedia.org/wiki/Basic_access_authentication
