# docker-apt-cache
A utility to transparently alter the `docker build` process to use a local cacher for HTTP requests.

## Installing
Install node using `sudo apt-get install nodejs-legacy` or [nvm](https://github.com/creationix/nvm).

    ~$ ./install.sh

## How does it work?
`/usr/local/bin/docker` will be called before `/usr/bin/docker` any time you run `docker`. It will detect if the command is a `docker build`, find the Dockerfile that docker would use, create a copy called `Dockerfile.tmp~~` that contains `ENV http_proxy=http://172.17.42.1:3142` at the beginning, and `ENV http_proxy=` at the end so that HTTP requests during the build will be served by a proxy server, except apt-get update's the first time after a reboot since they are deleted on startup, modify the command line to use `Dockerfile.tmp~~`, call the original docker at `/usr/bin/docker`, delete the temp file, and exit with the code returned from docker.

![You're welcome.](http://i.giphy.com/Q7y3K35QjxCBa.gif)

-Alan

