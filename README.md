# hgots-node

[![Build Status](https://travis-ci.org/sgade/hgots-node.svg)](https://travis-ci.org/sgade/hgots-node) [![Code Climate](https://codeclimate.com/github/sgade/hgots-node.png)](https://codeclimate.com/github/sgade/hgots-node) [![Dependency Status](https://david-dm.org/sgade/hgots-node.png?theme=shields.io)](https://david-dm.org/sgade/hgots-node) [![devDependency Status](https://david-dm.org/sgade/hgots-node/dev-status.png?theme=shields.io)](https://david-dm.org/sgade/hgots-node#info=devDependencies) [![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

*Door lock system in nodejs.*

This application is still in development.

# Target environment and usage

This application was written with a [raspberry pi](http://www.raspberrypi.org/) in mind.
The setup this application is tested with:

- 1x [Raspberry PI Model B](http://www.amazon.de/Raspberry-Pi-RBCA000-Mainboard-1176JZF-S/dp/B008PT4GGC/ref=sr_1_1?ie=UTF8&qid=1401914154&sr=8-1&keywords=raspberry+pi)
- 2x [USB to Serial Adapter](http://www.pollin.de/shop/dt/NTY5ODcyOTk-/Computer_und_Zubehoer/Hardware/Kabel_Stecker_Adapter/USB_Adapterkabel_auf_Seriell.html) to connect the Relais card and the RFID reader
- 1x [8-Pin Relais Card](http://www.conrad.de/ce/de/product/197720/Conrad-8fach-Relaiskarte-Baustein-12-24-VDC-8-Relaisausgaenge) to control the door and the LEDs
- 1x [RFID Reader](http://www.pollin.de/shop/dt/NzQ3OTgxOTk-/Bausaetze_Module/Bausaetze/Bausatz_RFID_Reader.html) to allow access via RFID tags
- Accessories, to power the raspberry pi and relais card etc.

# Install process

The install process is pretty easy, even for unexperienced users. All you need is a computer that has the `ssh` command available on the command line. Any GUI SSH client will do but I'm gonna explain everything on the command line.

To start the installation, please prepare your raspberry. Install Raspbian or any other OS and connect the Raspberry Pi to your local network. If you do not know how to do this, there are tons of tutorials out there that explain exactly how to do this.
Once the device is connected to the network, `ssh` into it. This is pretty easy. In the case of raspbian, the default user is called `pi` with the password set to `raspberry`.

1. `ssh pi@ipOfRaspberry`: Connect to the raspberry
2. `git clone https://github.com/sgade/hgots-node.git`: Clone the repository.
3. `cd hgots-node`: Go into the repository directory.
4. `sh setup.sh`: Run the production setup route.
5. `cp config.example.json config.json`: Copy the example configuration file and create the required one. **You should edit the config.json file to fit your needs!**
6. `node src/app`: You are ready to launch the application!

# Technical details

During the setup routine, the raspberry checks for ruby, node and other requirements and even tries to install those. It will tell you if it is not able to resolve any problems by itself.
Applications like `sass` (Ruby gem), `grunt` (npm package) and `bower` (npm package) are installed globally. See [setup.sh](https://github.com/sgade/hgots-node/blob/master/setup.sh) for further details.

## The central configuration

Everything important is defined in the file named `config.json` which is located in the root of the project. You should have created such a file and should be able to edit the details in there with applications like `nano` (-> `nano config.json`).

# How to develop

1. `git clone https://github.com/sgade/hgots-node.git`
2. `npm install`
3. `bower install`
4. `grunt dev` and `node src/app`

# Generate documentation

Use `grunt doc` and look in the `./doc/` directory.

# Contributors
* [@sgade](https://github.com/sgade)
* [@jhbruhn](https://github.com/jhbruhn)

# How to use with nginx (untested)

To use this application behind an nginx-server you should first install nginx with Phusion Passenger enabled (there are a lot of docs for this out there). Your nginx config file should look similar to this:
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
