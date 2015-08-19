#!/bin/bash
NODE=$(which node)
if [ "$NODE" == "" ] || [ "$1" == "--bin" ] || [ "$1" == "-b" ]; then
    INSTALL_BINARY=true
else
    INSTALL_BINARY=false
fi

sudo /usr/bin/docker build -t docker-repo-cache . && \
sudo mkdir -p /opt/docker-repo-cache && \
sudo /usr/bin/docker run \
  --publish 3142:8080 \
  --detach \
  --name docker-repo-cache \
  --restart always \
  --volume /opt/docker-repo-cache:/angry-caching-proxy \
  docker-repo-cache && \
if [ "$INSTALL_BINARY" == "true" ]; then
    wget http://www.alanc.net/download/docker/0.0.1/docker && \
    sudo cp docker /usr/local/bin/docker
else
    sudo cp docker.js /usr/local/bin/docker
fi
