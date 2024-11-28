'use strict';

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const {check, validationResult} = require('express-validator');

const userDao = require('./dao-users'); // module for accessing the user table in the DB
const dao = require('./dao'); // module for accessing the page table in the DB

// init express
const app = new express();
app.use(morgan('dev'));
app.use(express.json());

const corsOptions = {   
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200,
  credentials: true
}
app.use(cors(corsOptions));

/*** Passport ***/

/** Authentication-related imports **/
const passport = require('passport');                              // authentication middleware
const LocalStrategy = require('passport-local');                   // authentication strategy (username and password)

/** Set up authentication strategy to search in the DB a user with a matching password.
 * The user object will contain other information extracted by the method userDao.getUser (i.e., id, username, name).
 **/
passport.use(new LocalStrategy(async function verify(username, password, callback) {
  const user = await userDao.getUser(username, password)
  if(!user)
    return callback(null, false, 'Incorrect username or password');  
    
  return callback(null, user); // NOTE: user info in the session (all fields returned by userDao.getUser, i.e, id, username, name)
}));

// Serializing in the session the user object given from LocalStrategy(verify).
passport.serializeUser(function (user, callback) { // this user is id + username + name 
  callback(null, user);
});

// Starting from the data in the session, we extract the current (logged-in) user.
passport.deserializeUser(function (user, callback) { // this user is id + email + name 
  // if needed, we can do extra check here (e.g., double check that the user is still in the database, etc.)
  // e.g.: return userDao.getUserById(id).then(user => callback(null, user)).catch(err => callback(err, null));

  return callback(null, user); // this will be available in req.user
});

/** Creating the session */
const session = require('express-session');

app.use(session({
  secret: "shhhhh... it's a secret!",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.authenticate('session'));


/** Defining authentication verification middleware **/
const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({error: 'Not authorized'});
}

/*** Utility Functions ***/

// This function is used to format express-validator errors as strings
const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
  return `${location}[${param}]: ${msg}`;
};

/*** Users APIs ***/

// POST /api/sessions 
// This route is used for performing login.
app.post('/api/sessions', function(req, res, next) {
  passport.authenticate('local', (err, user, info) => { 
    if (err)
      return next(err);
      if (!user) {
        // display wrong login messages
        return res.status(401).json({ error: info});
      }
      // success, perform the login and extablish a login session
      req.login(user, (err) => {
        if (err)
          return next(err);
        
        // req.user contains the authenticated user, we send all the user info back
        // this is coming from userDao.getUser() in LocalStratecy Verify Fn
        return res.json(req.user);
      });
  })(req, res, next);
});

// GET /api/sessions/current
// This route checks whether the user is logged in or not.
app.get('/api/sessions/current', (req, res) => {
  if(req.isAuthenticated()) {
    res.status(200).json(req.user);}
  else
    res.status(401).json({error: 'Not authenticated'});
});

// DELETE /api/session/current
// This route is used for loggin out the current user.
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.status(200).json({});
  });
});

// GET /api/pages
app.get('/api/pages', isLoggedIn, async (req, res) => {
  try {
    const pages = await dao.listPages(req.user);
    res.status(200).json(pages);
  } catch {
    res.status(500).json("err");
  }
});

// GET /api/pages/ordered
app.get('/api/pages/ordered', async (req, res) => {
  try {
    const pages = await dao.listPagesOrderd();
    res.status(200).json(pages);
  } catch {
    res.status(500).json("err");
  }
});

// GET /api/page/<id>
app.get('/api/pages/:id', 
[ check('id').isInt({min: 1}) ],    // check: is the id a positive integer?
 async (req, res) => {
  try {
    const page = await dao.getPage(req.params.id);  
    if (page.error) {
      res.status(404).json(page);
    } else {
      res.json(page);
    }
  } catch {
    res.status(500).end();
  }
});

// GET /api/page/<id>/ToEdit
app.get('/api/pages/:id/ToEdit', 
[ check('id').isInt({min: 1}) ],    // check: is the id a positive integer?
 async (req, res) => {
  try {
    const page = await dao.getPageToEdit(req.params.id, req.user);  
    if (page.error) {
      res.status(404).json(page);
    } else {
      res.json(page);
    }
  } catch {
    res.status(500).end();
  }
});

// DELETE /api/page/<id>
app.delete('/api/pages/:id', isLoggedIn, async (req, res) => {
  try {
    const num = await dao.deletePage(req.params.id, req.user);   
    if(num === 1) {
      res.status(200).end();
    } else {
      throw new Error();
    }
  } catch {
    console.log('delete doesnt work');
    res.status(503).end();
  }
});

// GET /api/titleWebApp
app.get('/api/titleWebApp', async (req, res) => {
  try {
    const page = await dao.getTitle();       
    res.json(page);
  } catch {
    res.status(500).end();
  }
});

// PUT /api/titleWebApp   update title webApp
app.put('/api/titleWebApp', isLoggedIn, async (req, res) => {
  try{
    const num = await dao.changeTitleWebApp(req.body, req.user.role);
    if(num === 1) {
      res.status(200).end();
    } else {
      throw new Error();
    }
  } catch {
    console.log('update doesnt work');
    res.status(500).end();
  }
});

// POST /api/pages/add    add
app.post('/api/pages/add', isLoggedIn, [
  check('title').notEmpty(),
  check('user').notEmpty(),
  check('creationdate').notEmpty(),
], async (req, res) => {
  // Is there any validation error?
  const errors = validationResult(req).formatWith(errorFormatter); // format error message
  if (!errors.isEmpty()) {
    return res.status(422).json({ error: errors.array().join(", ") }); // error message is a single string with all error joined together
  }

  // WARN: note that we expect watchDate with capital D but the databases does not care and uses lowercase letters, so it returns "watchdate"
  const page = {
    title: req.body.title,
    user: req.body.user,
    creationdate: req.body.creationdate, 
    pubdate: req.body.pubdate,
  };

  const blocks = req.body.blocks;

  try{
    const num = await dao.addPage(page, blocks); //num is equal to the last id
    if(num)
      res.status(200).end();
    else
      throw new Error();
  } catch {
    console.log('add doesnt work');
    res.status(500).end();
  }
});

//GET /api/blocks/:pageId
app.get('/api/blocks/:pageId', isLoggedIn, async (req, res) => {
  try {
    const blocks = await dao.getBlocks(req.params.pageId);       
    res.json(blocks);
  } catch {
    res.status(500).end();
  }
});

// GET /api/users
app.get('/api/users', isLoggedIn, async (req, res) => {
  try {
    const users = await dao.getUsersList();
    res.status(200).json(users);
  } catch {
    res.status(500).json("err");
  }
});

// PUT /api/pages/:pageId/edit   update page and blocks
/*app.put('/api/pages/:pageId/edit', isLoggedIn, async (req, res) => {

  const page = {
    title: req.body.title,
    user: req.body.user,
    creationdate: req.body.creationdate, 
    pubdate: req.body.pubdate,
  };

  const blocks = req.body.blocks;

  try{
    const num = await dao.editPage(page, blocks, req.params.pageId);
    if(num === 1) {
      res.status(200).end();
    } else {
      throw new Error();
    }
  } catch {
    console.log('update doesnt work');
    res.status(500).end();
  }
});*/
app.put('/api/pages/:pageId/edit',[
  check('title').notEmpty(),
  check('user').notEmpty(),
  check('creationdate').notEmpty(),
], isLoggedIn, async (req, res) => {
  // Is there any validation error?
  const errors = validationResult(req).formatWith(errorFormatter); // format error message
  if (!errors.isEmpty()) {
    return res.status(422).json({ error: errors.array().join(", ") }); // error message is a single string with all error joined together
  }
  
  const page = {
    title: req.body.title,
    user: req.body.user,
    creationdate: req.body.creationdate,
    pubdate: req.body.pubdate,
  };

  const blocks = req.body.blocks;

  try {
    await dao.editPage(page, blocks, req.params.pageId);
    res.status(200).end();
  } catch (error) {
    console.log('Error updating page:', error);
    res.status(500).end();
  }
});

// start the server
const PORT = 3001;
app.listen(PORT, () => console.log('API server started') );