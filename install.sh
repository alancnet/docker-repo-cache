#!/bin/bash
sudo /usr/bin/docker build -t docker-repo-cache . && \
sudo mkdir -p /opt/docker-repo-cache && \
sudo /usr/bin/docker run \
  --publish 3142:8080 \
  --detach \
  --name docker-repo-cache \
  --restart always \
  --volume /opt/docker-repo-cache:/angry-caching-proxy \
  docker-repo-cache && \
sudo cp docker /usr/local/bin/docker
