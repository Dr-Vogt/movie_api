const express = require("express");
const app = express();
const http = require('http');
bodyParser = require('body-parser'),
uuid = require('uuid'),
morgan = require('morgan'),
  fs = require('fs'), 
  path = require('path');



const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})


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

let users = [
  {
    id: 1,
    name: "Nick",
    favoriteMovies: ["Howl\'s Moving Castle"]
  },
  {
    id: 2,
    name: "Justine",
    favoriteMovies: []
  },

]

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
  
  app.post('/users', (req, res) => {
    const newUser = req.body;

    if (newUser.name) {
      newUser.id = uuid.v4();
      users.push(newUser);
      res.status(201).json(newUser);
    } else {
      res.status(400).send('users need name')
    }

  });

  app.put('/users/:id', (req, res) => {
    const {id} =req.params;
    const updatedUser = req.body;

    let user = users.find( user=> user.id == id );

    if (user) {
      user.name = updatedUser.name;
      res.status(200).json(user);
    } else {
      res.status(400).send('no such user')
    }
  });

  app.post('/users/:id/:movieTitle', (req, res) => {
    const {id, movieTitle} =req.params;
    

    let user = users.find( user=> user.id == id );

    if (user) {
      user.favoriteMovies.push(movieTitle);
      res.status(200).send(`${movieTitle} has been added to user ${id}\'s array`);
    } else {
      res.status(400).send('no such user')
    }
  });
  
  app.delete('/users/:id/:movieTitle', (req, res) => {
    const {id, movieTitle} =req.params;
    

    let user = users.find( user=> user.id == id );

    if (user) {
      user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle );
      res.status(200).send(`${movieTitle} has been removed from user ${id}\'s array`);
    } else {
      res.status(400).send('no such user')
    }
  });

  app.delete('/users/:id', (req, res) => {
    const {id} =req.params;
    

    let user = users.find( user=> user.id == id );

    if (user) {
      users = users.filter( user => user.id != id );
      res.status(200).send(`user ${id} has been deleted`);
    } else {
      res.status(400).send('no such user')
    }
  });

  app.get('/movies', (req, res) => {
    res.status(200).json(movies);
  });

  app.get('/movies/:title', (req, res) => {
    const {title} =req.params;
    const movie = movies.find(movie => movie.Title === title );

    if (movie) {
      res.status(200).json(movie);
    } else {
      res.status(400).send('no such movie')
    }
  });

  app.get('/movies/genre/:genreName', (req, res) => {
    const {genreName} =req.params;
    const genre = movies.find(movie => movie.Genre.Name === genreName ).Genre;

    if (genre) {
      res.status(200).json(genre);
    } else {
      res.status(400).send('no such genre')
    }
  });

  app.get('/movies/directors/:directorName', (req, res) => {
    const {directorName} =req.params;
    const director = movies.find(movie => movie.Director.Name === directorName ).Director;

    if (director) {
      res.status(200).json(director);
    } else {
      res.status(400).send('no such director')
    }
  });

  app.use(express.static('public'));

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

  app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
  });