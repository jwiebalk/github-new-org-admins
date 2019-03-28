# Auto add site-admins to new Organization

Nodejs app that listens for `Organization.create` webhooks from a GitHub Enterprise Server and adds a specified list of users as owners.


## Build the image

* Build the image locally

```
git clone https://github.com/jwiebalk/github-new-org-admins.git
cd github-new-org-admins
sudo docker build --rm=true -t github-new-org-admins .
```

* Export needed environment variables

```
export SHARED_SECRET=<webhook secret>
export GHE_HOST=<hostname>
export GHE_TOKEN=<site admin token>
```

* Run container

```
sudo docker run -d -p 3000:3000 -e GHE_HOST=$GHE_HOST -e GHE_TOKEN=$GHE_TOKEN -e SHARED_SECRET=$SHARED_SECRET -t github-new-org-admins

```

You can then check the `docker logs $container` to see webhook status

