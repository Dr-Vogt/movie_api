const express = require("express");
const app = express();
const http = require('http');
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

mongoose.connect('mongodb://localhost:27017/cFDB', {useNewUrlParser: true, useUnifiedTopology: true});


app.use(morgan('combined', {stream: accessLogStream}));

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Welcome to my app!');
});

app.get('/documentation', (req, res) =>{
  res.sendFile('public/documentation.html', { root: __dirname });
});

app.get('/secreturl', (req, res) => {
  res.send('This is a secret url with super top-secret content.');
});

//let users = [
  //{
    //id: 1,
   // name: "Nick",
   // favoriteMovies: ["Howl\'s Moving Castle"]
 // },
  //{
  //  id: 2,
   // name: "Justine",
   // favoriteMovies: []
  //},

//]

let movies = [
    {
      "Title": 'Spirited Away',
      "Description": "A movie",
      "Genre": {
        "Name": "Fantasy",
        "Description": "Imagination unleashed, conjuring magical worlds, mythical beings, and epic adventures beyond reality's bounds."
      },
      "Director": { 
        "Name": "Hayao Miyazaki", 
        "Bio": "Hayao Miyazaki is a legendary Japanese animator and filmmaker, born on January 5, 1941, in Tokyo. Co-founding Studio Ghibli, he's known for timeless masterpieces like Spirited Away, My Neighbor Totoro, and Princess Mononoke. His hand-drawn animations and profound storytelling, often centered on nature and human experience, have earned global acclaim, making him an icon in the world of animation.",
        "Birth": 1941.0
      },
    },

    {
      "Title": 'Howl\'s Moving Castle',
      "Description": "A movie",
      "Genre": {
        "Name": "Fantasy",
        "Description": "Imagination unleashed, conjuring magical worlds, mythical beings, and epic adventures beyond reality's bounds."
      },
      "Director": { 
        "Name": "Hayao Miyazaki", 
        "Bio": "Hayao Miyazaki is a legendary Japanese animator and filmmaker, born on January 5, 1941, in Tokyo. Co-founding Studio Ghibli, he's known for timeless masterpieces like Spirited Away, My Neighbor Totoro, and Princess Mononoke. His hand-drawn animations and profound storytelling, often centered on nature and human experience, have earned global acclaim, making him an icon in the world of animation.",
        "Birth": 1941.0
      },
    },
    {
      "Title": 'Twilight',
      "Director": 'Catherine Hardwicke'
    },
    {
      "Title": 'One Piece Film: Red',
      "Director": 'Goro Taniguchi'  
    },
    {
      "Title": 'Kiki\'s Delivery Service',
      "Director": 'Hayao Miyazaki'
    },
    {
      "Title": 'Porco Rosso',
      "Director": 'Hayao Miyazaki'
    },
    {
      "Title": 'Ponyo',
      "Director": 'Hayao Miyazaki'  
    },
    {
      "Title": 'Barbie',
      "Director": 'Greta Gerwig'  
    },
    {
      "Title": 'If I Stay',
      "Director": 'R. J. Cutler'  
    },
    {
      "Title": 'Godzilla',
      "Director": 'Ishiro Honda'  
    },
  ];
  
  
  app.get('/', (req, res) => {
    res.send('Welcome to my movie club!');
  });
  
  app.post('/users', async (req, res) => {
    await Users.findOne({ Username: req.body.Username})
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + 'already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: req.body.Password,
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

  app.get('/users', async (req, res) => {
    await Users.find()
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
  });

  app.get('/users/:Username', async (req, res) => {
    await Users.findOne({ Username: req.params.Username })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });

  app.put('/users/:Username', async (req, res) => {
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

  app.post('/users/:Username/movies/:MovieID', async (req, res) => {
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
  
  app.delete('/users/:Username/movies/:MovieID', async (req, res) => {
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

  app.delete('/users/:Username', async (req, res) => {
    await Users.findOneAndRemove({ Username: req.params.Username })
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

  app.get('/movies', (req, res) => {
    Movies.find()
      .then((movies) =>{
        res.status(201).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });

  app.get('/movies/:Title', async (req, res) => {
    Movies.findOne({ Title: req.params.Title })
    .then ((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
  });

  app.get('/movies/genre/:genreName', (req, res) => {
    Movies.findOne({ 'GenreName': req.params.GenreName })
    .then ((movies) => {
      res.status(201).json(movies.Genre);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
  });

  app.get('/movies/director/:directorName', (req, res) => {
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

  app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
  });