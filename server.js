var http = require('http')
var createHandler = require('github-webhook-handler')
var handler = createHandler({ path: '/webhook', secret: (process.env.SECRET)})

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

// handler.on('*', function (emitData) {
//   console.log(prettyjson.render(emitData, options))
//  })

function addAdmins(org, creator)
{
  console.log('Received an organization event for %s from %s',
    org, creator)
}
