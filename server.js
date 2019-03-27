var http = require('http')
var createHandler = require('github-webhook-handler')
var handler = createHandler({ path: '/webhook', secret: (process.env.SECRET)})
var impersonationToken = ""

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
    addAdmins(event.payload.organization.login, event.payload.sender.login)
  }
})

function addAdmins(org, creator)
{
  console.log('Received an organization event for %s from %s',
    org, creator)
  getImpersonation(creator)

}

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
  console.log(`statusCode: ${res.statusCode}`)
  res.on('data', (chunk) => {
        body.push(chunk);
      }).on('end', () => {
        body = Buffer.concat(body).toString();
  // at this point, `body` has the entire request body stored in it as a string
    parseJSON(body)
    })

})

req.on('error', (error) => {
  console.error(error)
})

 req.write(data)
req.end()

}

function parseJSON(body) {
  impersonationToken = JSON.parse(body).token
}
