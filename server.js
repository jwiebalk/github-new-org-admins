var http = require('http')
var createHandler = require('github-webhook-handler')
var handler = createHandler({ path: '/webhook', secret: (process.env.SHARED_SECRET)})

var adminArray = ['admin1','admin2']
var userArray = ['user1']

var impersonationToken = ""
var org = ""
var creator = ""


http.createServer(function (req, res) {
  handler(req, res, function (err) {
    console.log(err)
    res.statusCode = 404
    res.end('no such location')
  })
}).listen(3000)

handler.on('error', function (err) {
  console.error('Error:', err.message)
})

handler.on('organization', function (event) {
  if(event.payload.action == "created") {
    org = event.payload.organization.login
    creator = event.payload.sender.login
    console.log("Received webhook for new %s Organization", org)
    getImpersonation(creator)
  }
})

function getImpersonation(creator)
{

const https = require('https')
const data = JSON.stringify({
  scopes: ["admin:org"]
})

const options = {
  hostname: (process.env.GHE_HOST),
  port: 443,
  path: '/api/v3/admin/users/' + creator + "/authorizations",
  method: 'POST',
  headers: {
    'Authorization': 'token ' + (process.env.GHE_TOKEN),
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}
let body = [];
const req = https.request(options, (res) => {
  res.on('data', (chunk) => {
        body.push(chunk);
      }).on('end', () => {
        body = Buffer.concat(body).toString();
      impersonationToken = JSON.parse(body).token
      if( impersonationToken === null || impersonationToken === "null" || impersonationToken.length < 1 ) {
        console.log("impersonationToken failed")
      }
        adminLoop()
    })
})

req.on('error', (error) => {
  console.error(error)
})

 req.write(data)
req.end()

}

function adminLoop()
{
    var admin = 1
    adminArray.forEach(function(adminUser){
      addUsersToNewOrg(impersonationToken, org, adminUser, admin)
})

  userArray.forEach(function(user){
    admin = 0
    addUsersToNewOrg(impersonationToken, org, user, admin)
  })

//  deleteImpersonationToken(creator)

}

function addUsersToNewOrg(impersonationToken, org, user, admin)
{

  var data = ""
  const https = require('https')
  if (admin == 1) {
     data = JSON.stringify({
      role: "admin"
    })
  } else (
     data = JSON.stringify({
      role: "member"
    })
  )

  const options = {
    hostname: (process.env.GHE_HOST),
    port: 443,
    path: '/api/v3/orgs/' + org + "/memberships/"  + user,
    method: 'PUT',
    headers: {
      'Authorization': 'token ' + impersonationToken,
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  }
  let body = [];
  const req = https.request(options, (res) => {
    if (res.statusCode != 200) {
        console.log("Status code: %s", res.statusCode)
        console.log("Adding %s to %s failed", user, org)
        res.on('data', function (chunk) {
          console.log('BODY: ' + chunk)
          });
          // console.log(impersonationToken, org, user, admin)
          // addUsersToNewOrg(impersonationToken, org, user, admin)
    } else {
          console.log("Added %s to %s", user, org)
    }

  })

  req.on('error', (error) => {
    console.error(error)
  })

   req.write(data)
  req.end()
}

function deleteImpersonationToken(creator)
{
  const https = require('https')

  const options = {
    hostname: (process.env.GHE_HOST),
    port: 443,
    path: '/api/v3/admin/users/' + creator + "/authorizations",
    method: 'DELETE',
    headers: {
      'Authorization': 'token ' + (process.env.GHE_TOKEN),
      'Content-Type': 'application/json',
    }
  }
  let body = [];
  const req = https.request(options, (res) => {
    // console.log(`DELETE statusCode: ${res.statusCode}`)
  })

  req.on('error', (error) => {
    console.error(error)
  })

  req.end()
}
