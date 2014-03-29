# hgots-node

[![Build Status](https://travis-ci.org/sgade/hgots-node.svg)](https://travis-ci.org/sgade/hgots-node) [![Build Status](https://drone.io/github.com/sgade/hgots-node/status.png)](https://drone.io/github.com/sgade/hgots-node/latest) [![Code Climate](https://codeclimate.com/github/sgade/hgots-node.png)](https://codeclimate.com/github/sgade/hgots-node) [![Dependency Status](https://david-dm.org/sgade/hgots-node.png?theme=shields.io)](https://david-dm.org/sgade/hgots-node) [![devDependency Status](https://david-dm.org/sgade/hgots-node/dev-status.png?theme=shields.io)](https://david-dm.org/sgade/hgots-node#info=devDependencies) [![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

*Door lock system in nodejs.*

This application is still in **very** early development.

# Setup

`node setup`

This will setup everything you need, including running `npm install` and installing `grunt` and `bower`.

### The central configuration

Everything important is defined in the file named `config.json` which is located in the root of the project.
The setup script should have created such a file for you, so before you first run the application you should go ahead and adjust the values according to your setup.

# How to run in production

1. `git clone https://github.com/sgade/hgots-node.git`
2. `npm install --production`
4. `bower install`
5. `grunt build`
6. `npm start`

# How to develop

1. `git clone https://github.com/sgade/hgots-node.git`
2. `npm install`
3. `bower install`
4. `grunt dev` and `node src/app`

# Generate documentation

Use `grunt doc` and look in the `./doc/` directory.

# Contributors
* [sgade](https://github.com/sgade)
* [jhbruhn](https://github.com/jhbruhn)

# How to nginx.

To use this application behind an nginx-server, you should first install nginx with Phusion Passenger enabled (there are a lot of docs for this out there). Your nginx config file should look similar to this:
```
http {
    passenger_root /usr/local/opt/passenger/libexec/lib/phusion_passenger/locations.ini; # get this via "passenger-config --root"
    passenger_ruby /usr/bin/ruby;
    passenger_nodejs /usr/local/bin/node;
    include       mime.types;
    default_type  application/octet-stream;

    sendfile        on;

    keepalive_timeout  65;

    gzip  on;

    server {
        listen       8080; # probably 80
        server_name  localhost;

        passenger_app_root /webapps/hgots-node/; # change this to the root-dir of the app
        root /webapps/hgots-node/src/web/public/; # and this to the root dir + "/src/web/public"
        passenger_enabled on;
        passenger_app_type node;
        passenger_startup_file src/app.js;  
    }

}

```
