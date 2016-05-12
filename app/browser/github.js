var BrowserWindow = require('browser-window');
var Dialog = require('dialog');
var Fs = require('fs');
var ipc = require('ipc');
var path = require('path');
var temp = require('temp');
var request = require('request');
var querystring = require('querystring');
var escape = require('escape-regexp');

var exportToGithub = function() {
  var window = BrowserWindow.getFocusedWindow();
  var rootURL = 'http://git-data-publisher.herokuapp.com'

  github = new BrowserWindow({width: 450, height: 600, 'always-on-top': true});
  github.loadUrl(rootURL + '/auth/github?referer=comma-chameleon');

  github.webContents.on('did-get-redirect-request', function(event, oldUrl, newUrl){
    regex = escape(rootURL + '/redirect?api_key=') + '([a-z0-9]+)'
    match = newUrl.match(new RegExp(regex))
    if (match) {
      api_key = match[1]
      github.loadUrl('file://' + __dirname + '/../comma-chameleon/views/github.html')
      github.webContents.on('dom-ready', function() {
        github.webContents.send('apiKey', api_key)
      })
    }
  })

  github.on('closed', function() {
    datapackage = null;
  });

  ipc.on('sendToGithub', function(e, data, apiKey) {
    window.webContents.send('getCSV');
    var tmpPath = temp.path({ suffix: '.csv' })
    ipc.once('sendCSV', function(e, csv) {
      Fs.writeFileSync(tmpPath, csv, 'utf8');

      dataset = querystring.parse(data)

      var opts = {
        url: rootURL + '/datasets',
        method: 'POST',
        json: true,
        formData: {
          'api_key': apiKey,
          'dataset[name]': dataset.name,
          'dataset[description]': dataset.description,
          'dataset[publisher-name]': dataset['publisher-name'],
          'dataset[publisher-url]': dataset['publisher-url'],
          'dataset[license]': dataset.license,
          'dataset[frequency]': dataset.frequency,
          'files[][title]': 'a file',
          'files[][description]': 'some words',
          'files[][file]': Fs.createReadStream(tmpPath),
        }
      }

      console.log(opts)

      request(opts, function(err, resp, body) {
        console.log(err, body);
      })
    })
  })
}

module.exports = {
  exportToGithub: exportToGithub
};
