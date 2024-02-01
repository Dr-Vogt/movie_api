const express = require("express");
const app = express();
const http = require('http');
const { check, validationResult } = require('express-validator');
require('dotenv').config();
bodyParser = require('body-parser'),
uuid = require('uuid'),
morgan = require('morgan'),
  fs = require('fs'), 
  path = require('path');



const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})
const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

//mongoose.connect('mongodb://localhost:27017/cFDB', {useNewUrlParser: true, useUnifiedTopology: true});

mongoose.connect(process.env.CONNECTION_URI).then(() => console.log("connected to mongodb"));

app.use(morgan('combined', {stream: accessLogStream}));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true}));

const cors = require('cors');
let allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];

app.use(cors({
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1 ){
      let message = 'The CORS policy for this application doesn\'t allow access from origin' + origin;
      return callback(new Error(message), false);
    }
    return callback(null, true);
  }
}));

let auth = require('./auth')(app);

const passport = require('passport');
require('./passport');

app.get('/', (req, res) => {
  res.send('Welcome to my app!');
});

app.get('/documentation', (req, res) =>{
  res.sendFile('public/documentation.html', { root: __dirname });
});

app.get('/secreturl', (req, res) => {
  res.send('This is a secret url with super top-secret content.');
});

  
  
  app.get('/', (req, res) => {
    res.send('Welcome to my movie club!');
  });
  
  app.post('/users' [check('Username', 'Username is required').isLength({min: 4}),
    check('Username', 'Username contains non alpanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()], 
    async (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }  
    let hashedPassword = Users.hashedPassword(req.body.Password);
    await Users.findOne({ Username: req.body.Username})
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + 'already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: hashedPassword,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) =>{res.status(201).json(user) })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            })
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });

  app.get('/users', passport.authenticate('jwt', {session: false}), async (req, res) => {
    await Users.find()
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
  });

  app.get('/users/:Username', passport.authenticate('jwt', {session: false}), async (req, res) => {
    await Users.findOne({ Username: req.params.Username })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });

  app.put('/users/:Username', passport.authenticate('jwt', {session: false}), async (req, res) => {
    await Users.findOneAndUpdate({ Username: req.params.Username}, {$set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.params.Birthday,
    }
  },
  { new: true })
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });

  });

  app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false}), async (req, res) => {
    await Users.findOneAndUpdate({ Username: req.params.Username }, { $push: { FavoriteMovies: req.params.Title }
    },
    { new: true })
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
  });
  
  app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false}), async (req, res) => {
    await Users.findOneAndUpdate({ Username: req.params.Username }, {$pull: {FavoriteMovies: req.params.MovieID }
     },
     { new: true })
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
  });

  app.delete('/users/:Username', passport.authenticate('jwt', {session: false}), async (req, res) => {
    await Users.findOneAndDelete({ Username: req.params.Username })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Username + ' was not found');
        } else {
          res.status(200).send(req.params.Username + ' was deleted.');
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });

  app.get('/movies', passport.authenticate('jwt', {session: false}), async (req, res) => {
    Movies.find()
      .then((movies) =>{
        res.status(201).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });

  app.get('/movies/:Title', passport.authenticate('jwt', {session: false}), async (req, res) => {
    Movies.findOne({ Title: req.params.Title })
    .then ((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
  });

  app.get('/movies/genre/:genreName', passport.authenticate('jwt', {session: false}), (req, res) => {
    Movies.findOne({ 'GenreName': req.params.GenreName })
    .then ((movies) => {
      res.status(201).json(movies.Genre);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
  });

  app.get('/movies/director/:directorName', passport.authenticate('jwt', {session: false}), (req, res) => {
    Movies.findOne({ 'DirectorName': req.params.DirectorName })
    .then ((movies) => {
      res.status(201).json(movies.Director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
  });

  app.use(express.static('public'));

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

  const port = process.env.PORT || 8080;
  app.listen(port, '0.0.0.0',() => {
    console.log('Listening on port ' + port);
  });