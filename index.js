var http = require('http')


var defaults = {
  host: 'api.wavefarm.org',
  port: 80
}

var merge = function (a, b) {
  if (!a) a = {}
  if (!b) b = {}
  for (var k in b) {
    if (!(k in a)) {
      a[k] = b[k]
    }
  }
  return a
}

module.exports = function (config) {
  var wf = {}

  config = merge(config, defaults)

  wf.req = function (path, options, cb) {
    if (!cb) {
      cb = options
      options = {}
    }

    options = merge(options, config)
    options.path = path

    var req = http.request(options, function (res) {
      console.log(options)
      if (res.statusCode == 404) return cb(new Error('[API] Not Found'))
      var data = ''
      res.on('error', cb)
      res.on('data', function (d) {data += d})
      res.on('end', function() {
        if (res.statusCode == 500) return cb(new Error('[API] ' + data.message))
        cb(null, data)
      })
    })
    req.on('error', cb)
    if (options.json) req.end(options.json)
    else req.end()
  }

  wf.search = function (query, cb) {
    var searchString = query ? '?q='+encodeURIComponent(query) : ''
    wf.req('/search'+searchString, cb)
  }

  wf.get = function (id, cb) {
    wf.req('/'+id, cb)
  }

  wf.put = function (id, item, cb) {
    wf.req('/'+id, {
      method: 'put',
      json: item
    }, cb)
  }

  wf.schemas = function (cb) {
    wf.req('/schemas', cb)
  }

  return wf
}
