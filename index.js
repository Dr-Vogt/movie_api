const express = require("express");
const app = express();
const { check, validationResult } = require('express-validator');
require('dotenv').config();
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

//mongoose.connect('mongodb://localhost:27017/cFDB', {useNewUrlParser: true, useUnifiedTopology: true});

mongoose.connect(process.env.CONNECTION_URI).then(() => console.log("connected to mongodb"));

app.use(morgan('combined', {stream: accessLogStream}));
app.use(express.json());
app.use(express.static('public'));

// app.use(express.urlencoded({ extended: true})); //<---


let allowedOrigins = ['http://localhost:8080', 'http://testsite.com', 'http://localhost:1234', 'https://drvogtflix.netlify.app', 'http://localhost:4200'];

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
  
  app.post('/signup', [check('Username', 'Username is required').isLength({min: 4}),
    check('Username', 'Username contains non alpanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()], 
    async (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }  
    let hashPassword = Users.hashPassword(req.body.Password);
    await Users.findOne({ Username: req.body.Username})
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + 'already exists');
        } else {
          Users.create({
              Username: req.body.Username,
              Password: hashPassword,
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

  // app.get('/users', passport.authenticate('jwt', {session: false}), (req, res) => {
  //    Users.find()
  //     .then((users) => {
  //       res.status(201).json(users);
  //     })
  //     .catch((err) => {
  //     console.error(err);
  //     res.status(500).send('Error: ' + err);
  //   });
  // });

  app.get('/users',  async (req, res) => {
   try {
    const users =  await Users.find()
    res.status(201).json(users);
   } catch (error) {
    console.error(error);
    res.status(500).send('Error: ' + error);
   }
  });


  app.get('/users/:Username', passport.authenticate('jwt', {session: false}), async (req, res) => {
    try {
     const users = await Users.findOne()
     res.status(201).json(users); 
    } catch (error) {
        console.error(error);
        res.status(500).send('Error: ' + error);
      };
  });

  app.put('/users/:Username', passport.authenticate('jwt', {session: false}), async (req, res) => {
    let hashPassword = Users.hashPassword(req.body.Password);
    await Users.findOneAndUpdate({ Username: req.params.Username}, {$set:
    {
      Username: req.body.Username,
      Password: hashPassword,
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

  app.put('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false}), async (req, res) => {
    await Users.findOneAndUpdate({ Username: req.params.Username }, { $push: { FavoriteMovies: req.params.MovieID }
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
    try {
      const movies = await Movies.find();
      res.json(movies);
    } catch (error) {
      console.error('Error', error);
      res.status(500).json({ error: 'Error' });
    }
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



  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

  const port = process.env.PORT || 8080;
  app.listen(port, '0.0.0.0',() => {
    console.log('Listening on port ' + port);
  });
