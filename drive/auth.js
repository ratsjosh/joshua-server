const {
  google,
} = require('googleapis');
const express = require('express');
const opn = require('opn');

const oauth2Client = new google.auth.OAuth2(
  process.env.G_CLIENT_ID,
  process.env.G_CLIENT_SECRET,
  process.env.G_REDIRECT_URL,
);

// generate a url that asks permissions for Google+ and Google Calendar scopes
const scopes = [
  'https://www.googleapis.com/auth/drive.readonly',
];

const app = express();

const url = oauth2Client.generateAuthUrl({
  // 'online' (default) or 'offline' (gets refresh_token)
  access_type: 'offline',

  // If you only need one scope you can pass it as a string
  scope: scopes,
});

const server = app.listen(3000, () => {
  // open the browser to the authorize url to start the workflow
  opn(url, {
    wait: false,
  });
});


/**
 * Lists the names and IDs of up to 10 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function listFiles(auth) {
  const service = google.drive('v3');
  service.files.list({
    auth,
    pageSize: 10,
    fields: 'nextPageToken, files(id, name)',
    q: 'mimeType = \'application/vnd.google-apps.folder\' and name contains \'Joshua-server-photos\'',
  },
  (err, res) => {
    if (err) {
      console.error('The API returned an error.');
      throw err;
    }
    const {
      files,
    } = res.data;
    if (files.length === 0) {
      console.log('No files found.');
    } else {
      console.log('Files:');
      files.map(file => console.log(`${file.name} (${file.id})`));
    }
  });
}

// Open an http server to accept the oauth callback. In this
// simple example, the only request to our webserver is to
// /oauth2callback?code=<code>
app.get('/oauth2callback', (req, res) => {
  const {
    code,
  } = req.query;
  oauth2Client.getToken(code, async (err, tokens) => {
    if (err) {
      console.error('Error getting oAuth tokens:');
      throw err;
    }
    oauth2Client.credentials = tokens;
    server.close();
    listFiles(oauth2Client);
    res.redirect('http://localhost:8080/');
  });
});
