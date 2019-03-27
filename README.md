# GitHub Enterprise Server new Organization admins

Nodejs app that listens for Organization.create webhooks from a GitHub Enterprise Server and adds a specified list of users as owners.


## Prerequisites

  - Install [Docker](https://www.docker.com/)

## Install from DockerHub

Rather than build it yourself, the full container is available on [DockerHub](https://hub.docker.com/r/jwiebalk/github-webhook-handler-docker/)

```
sudo docker pull jwiebalk/github-new-org-admins
sudo docker run -d -p 3000:3000 -e SECRET=$SHARED_SECRET -t jwiebalk/github-new-org-admins
```

You can then check the `docker logs $container` to see webhook status

## Build the image

Build the image locally

```
git clone https://github.com/jwiebalk/github-new-org-admins.git
cd github-new-org-admins
sudo docker build --rm=true -t github-new-org-admins .
```

