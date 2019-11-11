const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcryptjs')

const db = require('./database/dbConfig.js');
const Users = require('./users/users-model.js');

const server = express();

server.use(helmet());
server.use(express.json());
server.use(cors());

server.get('/', (req, res) => {
  res.send("It's alive!");
});

server.post('/api/register', (req, res) => {
  let user = req.body;

  //validate user

  //hash password
  const hash = bcrypt.hashSync(user.password, 8)
  //override password with hash
  user.password = hash

  
  // if(!user || !bcrypt.compareSync(user.password, user.password)){
  //   return res.status(401).json({error: 'Wrong Buddy'})
  // } 

  Users.add(user)
    .then(saved => {
      res.status(201).json(saved);
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

server.post('/api/login', (req, res) => {
  let { username, password } = req.body;

  Users.findBy({ username })
   
    .first()
    .then(user => {
      //password from body, user.password from body
      
      if (user && bcrypt.compareSync(password, user.password)) {
        res.status(200).json({ message: `Welcome ${user.username}!` });
      } else {
        res.status(401).json({ message: 'Invalid Credentials' });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

server.get('/api/users', protected, (req, res) => {
  Users.find()
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});

server.get('/hash', (req, res) => {
  //read a password from the Authorization header
  const password = req.headers.authorization
  //return an object with the password hashed by bcrypt
  if(password){
  const hash = bcrypt.hashSync(password, 14)
  //{hash: mmmmmm}
  res.status(200).json({hash})
  } else {
  res.status(400).json({message: 'Please include password'})
  }
})

//middleware takes req, res, next
function protected(req, res, next){
  let {username, password} = req.headers
  if(!username || !password){
    res.status(500).json({message:"Include username and password"})
  } else if 
  (username && password){
    Users.findBy({username})
    .first()
    .then(user => {
      if(user && bcrypt.compareSync(password, user.password)){
        next()
      } else {
      res.status(401).json({message: 'You cannot pass'})
    }
  })
  .catch(error => {
    res.status(500).json(error)
  })
  } else{
    res.status(400).json({message: 'please provide creditials'})
  }
}

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`));
