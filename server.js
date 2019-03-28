var http = require('http')
var createHandler = require('github-webhook-handler')
var handler = createHandler({ path: '/webhook', secret: (process.env.SECRET)})

var adminArray = ['jwiebalk','baymax']

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
  adminArray.forEach(function(adminUser){
      addAdminsToNewOrg(impersonationToken, org, adminUser)
})

  deleteImpersonationToken(creator)

}

function addAdminsToNewOrg(impersonationToken, org, adminUser)
{

  const https = require('https')
  const data = JSON.stringify({
    role: "admin"
  })

  const options = {
    hostname: (process.env.GHE_HOST),
    port: 443,
    path: '/api/v3/orgs/' + org + "/memberships/"  + adminUser,
    method: 'PUT',
    headers: {
      'Authorization': 'token ' + impersonationToken,
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  }
  let body = [];
  const req = https.request(options, (res) => {
    console.log("Added %s to %s", adminUser, org)

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
