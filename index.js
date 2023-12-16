const express = require("express");
const app = express();
const http = require('http');
morgan = require('morgan'),
  fs = require('fs'), 
  path = require('path');

const app = express();

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})


app.use(morgan('combined', {stream: accessLogStream}));

app.get('/', (req, res) => {
  res.send('Welcome to my app!');
});

app.get('/secreturl', (req, res) => {
  res.send('This is a secret url with super top-secret content.');
});

let topMovies = [
    {
      title: 'Spirited Away',
      director: 'Hayao Miyazaki'
    },
    {
      title: 'Howl\'s Moving Castle',
      director: 'Hayao Miyazaki'
    },
    {
      title: 'Twilight',
      director: 'Catherine Hardwicke'
    },
    {
      title: 'One Piece Film: Red',
      director: 'Goro Taniguchi'  
    },
    {
      title: 'Kiki\'s Delivery Service',
      director: 'Hayao Miyazaki'
    },
    {
      title: 'Porco Rosso',
      director: 'Hayao Miyazaki'
    },
    {
      title: 'Ponyo',
      director: 'Hayao Miyazaki'  
    },
    {
      title: 'Barbie',
      director: 'Greta Gerwig'  
    },
    {
      title: 'If I Stay',
      director: 'R. J. Cutler'  
    },
    {
      title: 'Godzilla',
      director: 'Ishiro Honda'  
    },
  ];
  
  
  app.get('/', (req, res) => {
    res.send('Welcome to my movie club!');
  });
  
 // app.get('/documentation', (req, res) => {                  
   // res.sendFile('public/documentation.html', { root: __dirname });
  //});
  
  app.get('/movies', (req, res) => {
    res.json(topMovies);
  });

  app.use(express.static('public'));

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

  app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
  });