FROM        node
MAINTAINER  docker@alanc.net
RUN mkdir -p /etc/angry-caching-proxy
RUN npm install -g angry-caching-proxy
RUN mkdir /angry-caching-proxy
COPY triggers.js /etc/angry-caching-proxy/triggers.js
COPY config.json /etc/angry-caching-proxy/config.json
EXPOSE 8080
CMD angry-caching-proxy
