var http = require('http')
var qs = require('querystring')
var resolve = require('path').resolve;
var xtend = require('xtend');


var defaults = {
  host: 'api.wavefarm.org',
  port: 80,
  path: '/'
}

module.exports = function (config) {
  var wf = {}

  config = xtend(defaults, config)

  wf.req = function (path, options, cb) {
    if (!cb) {
      cb = options
      options = {}
    }

    options = xtend(config, options)
    options.path = resolve(options.path, path);
    options.withCredentials = false;

    var req = http.request(options, function (res) {
      if (res.statusCode == 404) return cb(new Error('[API] Not Found'))
      var data = ''
      res.on('error', cb)
      res.on('data', function (d) {data += d})
      res.on('end', function() {
        try {
          data = JSON.parse(data)
        } catch (e) {
          return cb(new Error('[API] Could not parse data:\n' + data))
        }
        if (res.statusCode == 500) return cb(new Error('[API] ' + data.message))
        cb(null, data)
      })
    })
    req.on('error', cb)
    if (options.json) req.end(options.json)
    else req.end()
  }

  wf.search = function (params, cb) {
    wf.req('search?'+qs.stringify(params), cb)
  }

  wf.get = function (id, cb) {
    wf.req(id, cb)
  }

  wf.put = function (id, item, cb) {
    wf.req(id, {
      method: 'put',
      json: item
    }, cb)
  }

  wf.schemas = function (cb) {
    wf.req('schemas', cb)
  }

  return wf
}
