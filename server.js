'use strict';

require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const morgan = require('morgan');
const passport = require('passport');
const metaget = require('metaget');
const fs = require('fs');
const path = require('path');

const {DATABASE_URL, PORT} = require('./config/config');
const {Resources} = require('./models/model');
const {User} = require('./users/models')

mongoose.Promise = global.Promise;
var MongoClient = require('mongodb').MongoClient;
MongoClient.connect(DATABASE_URL, function(err, db) {
  console.log("Connected succesfully to Mongo server");
  // db.close;
})

const app = express();

//User Routers 

const {router: usersRouter} = require('./users');
const {router: authRouter, basicStrategy, jwtStrategy} = require('./auth');


// Logging
app.use(morgan('common'));

// CORS
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  if (req.method === 'OPTIONS') {
      return res.send(204);
  }
  next();
});

app.use(passport.initialize());
passport.use(basicStrategy);
passport.use(jwtStrategy);

app.use('/api/users/', usersRouter);
app.use('/api/auth/', authRouter);

function getImage(url) {
  metaget.fetch(url, function (err, meta_response) {
    if(err){
        console.log(err);
    }
    else{
        let imgageLink = meta_response['og:image'];
        console.log(imgageLink);
        return imgageLink;
    }
  });
}


// A protected endpoint which needs a valid JWT to access it
app.get(
  '/api/protected',
  passport.authenticate('jwt', {session: false}),
  (req, res) => {
      return res.json({
          data: 'rosebud'
      });
  }
);

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

////////////////////////////////
////////List of Users///////////
////////////////////////////////

app.get('/app/testing', (req, res) => {
  console.log(`${req.method} request for ${req.url}`);
  res.sendFile(path.join(__dirname+'/public/index.html'));
});
/*
app.get('/app/:id', (req, res) => {
  let userId = req.params.id;
  let ret = [];
  let rej = [];
  User
    .findById(userId)
    .catch(err => {
      console.error(err);
      res.status(404).json({error: 'Sorry. That user ID could not be found.'});
    })
  Resources
    .find()
    .then(post => {
      for (var i = 0; i < post.length; i++) {
        if (post[i].author == userId) {
          ret.push(post[i]);
        }
        else {
          rej.push(post[i]);
        }
      }
      res.json(ret);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'something went horribly awry'});
    });
})
*/
app.get('/api/users', (req, res) => {
  User
    .find()
    .then(post => res.json({sorry: 'Users do not have access to this page'}))
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'Internal Server Error'});
    });
});

app.get('/api/links', (req, res) => {
  Resources
  .find()
  .then(posts => {
    res.json({
      posts: posts.map(post => post.apiGet())
    });
  })
  .catch(err => {
    console.error(err);
    res.status(500).json({error: 'Internal Server Error'});
  });
});

////////////////////////////////
////////User by ID//////////////
////////////////////////////////

app.get('/api/users/:id', (req, res) => {
  User
    .findById(req.params.id)
    .then(post => res.json(post.apiRepr()))
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'Sorry. That user could not be located'});
    })
});

////////////////////////////////
//////User Links Get Request////
////////////////////////////////

app.get('/api/users/:id/links', (req, res) => {
  let userId = req.params.id;
  let ret = [];
  let rej = [];
  User
    .findById(userId)
    .catch(err => {
      console.error(err);
      res.status(404).json({error: 'Sorry. That user ID could not be found.'});
    })
  Resources
    .find()
    .then(post => {
      for (var i = 0; i < post.length; i++) {
        if (post[i].author == userId) {
          ret.push(post[i]);
        }
        else {
          rej.push(post[i]);
        }
      }
      res.json(ret);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'something went horribly awry'});
    });
});



app.post('/api/users/:id/', (req, res) => {
  let id = req.params.id;
  const requiredFields = ['title', 'content', 'link'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }
  // getImage(req.body.link);
  let link = req.body.link;
  console.log(link)
  var imageLink = "Empty Link";
  metaget.fetch(req.body.link, function (err, meta_response) {
    if(err){
        console.log(err);
    }
    else {
        // let imgageLink = meta_response['og:image'];
        imageLink = meta_response['og:image'];
        console.log(`The picture can be found here: ${imageLink}`);
    }
    Resources
    .create({
      title: req.body.title,
      content: req.body.content,
      link: req.body.link,
      author: id,
      image: imageLink
    })
    .then(resourcePost => res.status(201).json(resourcePost.apiGet()))
    .catch(err => {
        console.error(err);
        res.status(500).json({error: 'Something went wrong'});
    });
    console.log(`Here is the image link: ${imageLink}`)
  });
  console.log("A post has been submitted");
});

app.delete('/api/:id', (req, res) => {
  Resources
    .findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).json({message: 'success'});
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'Internal Server Error'});
    });
  console.log(`A Delete Request has been made`);
});


app.put('/api/:id', (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({
      error: 'Request path id and request body id values must match'
    });
  }

  const updated = {};
  const updateableFields = ['title', 'content', 'link'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  Resources
    .findByIdAndUpdate(req.params.id, {$set: updated}, {new: true})
    .then(updatedPost => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Something went wrong'}));
});

app.use('*', function(req, res) {
  res.status(404).json({message: 'Not Found'});
});

app.post('/users')

// closeServer needs access to a server object, but that only
// gets created when `runServer` runs, so we declare `server` here
// and then assign a value to it in run

let server;

// this function connects to the database, then starts the server
function runServer(databaseUrl=DATABASE_URL, port=PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
function closeServer() {
  return mongoose.disconnect().then(() => {
     return new Promise((resolve, reject) => {
       console.log('Closing server');
       server.close(err => {
           if (err) {
               return reject(err);
           }
           resolve();
       });
     });
  });
}

http.createServer(function(req, res) {
  
    console.log(`${req.method} request for ${req.url}`);
  
    if (req.url === "/") {
      console.log(`Home page should be loaded`);
      fs.readFile("./public/index.html", "UTF-8", function(err, html) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(html);
      });
  
    } else if (req.url.match(/.css$/)) {
  
      var cssPath = path.join(__dirname, 'public', req.url);
      var fileStream = fs.createReadStream(cssPath, "UTF-8");
  
      res.writeHead(200, {"Content-Type": "text/css"});
  
      fileStream.pipe(res);
  
    } else if (req.url.match(/.jpg$/)) {
  
      var imgPath = path.join(__dirname, 'public', req.url);
      var imgStream = fs.createReadStream(imgPath);
  
      res.writeHead(200, {"Content-Type": "image/jpeg"});
  
      imgStream.pipe(res);
  
    } else {
      res.writeHead(404, {"Content-Type": "text/plain"});
      res.end("404 File Not Found");
    }
  
});

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {runServer, app, closeServer};