var BrowserWindow = require('browser-window');
var Dialog = require('dialog');
var Fs = require('fs');
var ipc = require("electron").ipcMain;
var path = require('path');
var temp = require('temp');
var request = require('request');
var querystring = require('querystring');
var escape = require('escape-regexp');

var rootURL = 'http://octopub.herokuapp.com'

var loadWindow = function(githubWindow, apiKey) {
  githubWindow.loadURL('file://' + __dirname + '/../comma-chameleon/views/github.html')
  githubWindow.webContents.on('dom-ready', function() {
    githubWindow.webContents.send('apiKey', apiKey)
  })
}

var checkForAPIKey = function(url) {
  regex = escape(rootURL + '/redirect?api_key=') + '([a-z0-9]+)'
  match = url.match(new RegExp(regex))
  return match
}

var writeData = function(csv) {
  tmpPath = temp.path({ suffix: '.csv' })
  Fs.writeFileSync(tmpPath, csv, 'utf8');
  return tmpPath
}

var postData = function(dataset, file, apiKey) {
  var opts = {
    url: rootURL + '/datasets',
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
      'files[][file]': Fs.createReadStream(file),
    }
  }

  request.post(opts, function(err, resp, body) {
    displayResult(body)
  })
}

var displayResult = function(dataset) {
  githubWindow.loadURL('file://' + __dirname + '/../comma-chameleon/views/github-success.html')
  githubWindow.webContents.on('dom-ready', function() {
    githubWindow.webContents.send('ghPagesUrl', dataset.gh_pages_url)
  })
}

var uploadToGithub = function(parentWindow, data, apiKey) {
  parentWindow.webContents.send('getCSV');

  ipc.once('sendCSV', function(e, csv) {
    dataset = querystring.parse(data);
    file = writeData(csv);
    postData(dataset, file, apiKey);
  })
}

var exportToGithub = function() {
  parentWindow = BrowserWindow.getFocusedWindow();

  githubWindow = new BrowserWindow({width: 450, height: 600, 'alwaysOnTop': true});
  githubWindow.loadURL(rootURL + '/auth/github?referer=comma-chameleon');

  githubWindow.webContents.on('did-get-redirect-request', function(event, oldUrl, newUrl){
    match = checkForAPIKey(newUrl);
    if (match) {
      loadWindow(githubWindow, match[1])
    }
  })

  ipc.on('sendToGithub', function(e, data, apiKey) {
    uploadToGithub(parentWindow, data, apiKey);
  })

  githubWindow.on('closed', function() {
    githubWindow = null;
  });
}

module.exports = {
  exportToGithub: exportToGithub
};

if (process.env.NODE_ENV === 'test') {
  module.exports._private = {
    loadWindow: loadWindow,
    checkForAPIKey: checkForAPIKey,
    writeData: writeData,
    postData: postData,
    uploadToGithub: uploadToGithub,
    request: request
  }
}
