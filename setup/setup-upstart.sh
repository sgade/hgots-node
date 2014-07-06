#!/bin/bash

echo "Copying upstart config to /etc/init/..."
sudo cp setup/hgots-node.conf /etc/init/
echo "Done. Use initctl to control the process."
