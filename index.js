var request = require('request')


var defaults = {
  json: true,
  url: 'http://api.wavefarm.org'
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
    options.url = options.url + path

    request(options, function (err, res, body) {
      if (err) return cb(err)
      if (res.statusCode == 500) return cb(new Error('[API] ' + body.message))
      cb(null, res, body)
    })
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
