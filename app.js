const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const path = require('path');

const app = express();

require('dotenv').config();

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

require('./drive/auth');

app.get('/', (req, res) => {
  res.render('home');
});
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.listen(8080, () => console.log('Server started...'));
