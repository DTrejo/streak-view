//
// this does two things
// compile dashboard.jade into a JS function, to be included in index.html
// compile static.jade, output it to /index.html or whatever
// that's it!

var http = require('http')
var path = require('path')
var fs = require('fs')
var sh = require('shelljs')
var parse = require('babyparse').parse
var jade = require('jade')
var PORT = 9001
var jadeRuntime = sh.cat(path.join(__dirname, 'node_modules/jade/runtime.js'))

// var parsed = parse(csv, { header: true })
// var render = jade.compile(index, options)
// var html = render({ csv: parsed })

function serve() {
  return http.createServer(function(req, res) {
    try {
      var indexHTML = compile()
      fs.writeFile('./index.html', indexHTML, 'utf8')
      return res.end(indexHTML, 'utf8')
    } catch (err) {
      return res.end('<pre>'+err.message+'</pre><br><br>', 'ascii')
    }
  }).listen(PORT, function(err) {
    if (err) return console.log(new Error(err.message))
    return sh.exec('open http://localhost:'+PORT)
  })

  function compile(parsed) {
    console.log('Compiling jade & jade JS template into html')
    // TODO make false
    var copts = { pretty: true, compileDebug: true, name: 'renderDashboard' }
    var renderDashboard = jade.compileFileClient(
      path.join(__dirname, 'dashboard.jade')
    , copts)
    var js = [jadeRuntime, renderDashboard].join(';')

    var index = sh.cat(path.join(__dirname, 'static.jade'))
    var options = { pretty: true , compileDebug: true }
    var render = jade.compile(index, options)
    var html = render({ csv: parsed, js: js })
    return html
  }
}

serve()
