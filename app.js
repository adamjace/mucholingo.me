const express = require('express')
const minifyHTML = require('express-minify-html')
const path = require('path')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const routes = require('./routes/index')
const translate = require('./routes/translate')
const sitemap = require('./routes/sitemap')
const hbs = require('hbs')
const fs = require('fs')

const app = express()

// minify
app.use(minifyHTML({
  override: true,
  htmlMinifier: {
    removeComments: true,
    collapseWhitespace: true,
    collapseBooleanAttributes: true,
    removeAttributeQuotes: true,
    removeEmptyAttributes: true,
    minifyJS: true
  }
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')

// partial views
registerPartials(['header', 'footer', 'button', 'device'])

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', routes)
app.use('/translate', translate)
app.use('/sitemap.txt', sitemap)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500)
    res.render('error', {
      message: err.message,
      error: err
    })
  })
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500)
  res.render('error', {
    message: err.message,
    error: {}
  })
})

// registerPartials
function registerPartials(names) {
  hbs.registerPartials(__dirname + '/views/partials')
  names.forEach((name) => {
    hbs.registerPartial(name, fs.readFileSync(__dirname + `/views/partials/${name}.hbs`, 'utf8'))
  })
}

module.exports = app
