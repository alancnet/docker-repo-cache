# docker-apt-cache
A utility to transparently alter the `docker build` process to use a local apt-cacher.

## Installing

    ~$ docker build -t apt-cacher .
    ~$ docker run -d -p 3142:3142 --restart always --name apt-cacher-run apt-cacher
    ~$ cp docker /usr/local/bin/docker

## How does it work?
`/usr/local/bin/docker` will be called before `/usr/bin/docker` any time you run `docker`. It will detect if the command is a `docker build`, find the Dockerfile that docker would use, create a copy called `Dockerfile.tmp~~` that contains `ENV http_proxy=http://172.17.42.1:3142` at the beginning, and `ENV http_proxy=` at the end, modify the command line to use `Dockerfile.tmp~~`, call the original docker at `/usr/bin/docker`, delete the temp file, and exit with the code returned from docker.

*You're welcome.* -Alan
