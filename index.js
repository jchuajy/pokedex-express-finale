/**
 * Entry point to Express web server.
 *
 * Import external library modules as needed (eg. body-parser, etc).
 */

//required libraries for app
const express = require('express');
const handlebars = require('express-handlebars');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const db = require('./db_config');
const bcrypt = require('bcrypt');

/**
 * ===================================
 * Configurations and set up
 * ===================================
 */

// Init express app
const app = express();

// Set up middleware
app.use(bodyParser.urlencoded({
      extended: true
}));
app.use(methodOverride('_method'));
app.use(cookieParser());

// Set handlebars to be the default view engine
app.engine('handlebars', handlebars.create().engine);
app.set('view engine', 'handlebars');


/**
 * ===================================
 * Functions
 * ===================================
 */

function goToHomePage(request, response) {
      //get the values of the cookies to get login status and display username if applicable
      let loggedIn = request.cookies['loggedIn'];
      let username = request.cookies['username'];
      //retrieve information from postgres about all pokemon
      //set up a queryString
      let queryString = "SELECT * FROM pokemons";
      let values = [];
      //const db links to db_config file. pool calls the function pool in the module_exports
      db.pool.query(queryString, values, (error, queryResult) => {
            if (error) console.error("Error getting all pokemon!", error);
            //assign queryResult to the context
            let context = {
                  pokemon: queryResult.rows,
                  loggedIn: loggedIn,
                  username: username
            };
            //render the home handlebars with context
            response.render("home", context);
      });
};

function goToUserCreation(request, response) {
      //render new handlebars
      response.render("user/new");
};

function saveNewUser(request, response) {
      //request.body refers to form data
      //hash the password before saving it into the db
      bcrypt.hash(request.body.password, 1, (err, hashedPassword) => {
                  //save form data + hashedPassword into postgres db
                  //set up a queryString
                  let queryString = "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)"
                  let values = [request.body.username, request.body.email, hashedPassword]
                  //const db links to db_config file. pool calls the function pool in the module_exports
                  db.pool.query(queryString, values, (error, queryResult) => {
                              //error log
                              if (error) {
                                    console.error('error getting user:', error);
                                    response.sendStatus(500);
                              };
                              //change cookies to reflect information entered
                              response.cookie('loggedIn', true);
                              response.cookie('username', request.body.username);
                              //redirect to home page
                              response.redirect("/");
                        });
                  });
      }

      /**
       * ===================================
       * Routes
       * ===================================
       */

      //create route for rendering home page
      app.get("/", goToHomePage);
      //create route for rendering new user form
      app.get("/users/new", goToUserCreation);
      //create route for saving new user into the database
      app.post("/users/new", saveNewUser);




      /**
       * ===================================
       * Listen to requests on port 3000
       * ===================================
       */
      const server = app.listen(3000, () => console.log('~~~ Tuning in to the waves of port 3000 ~~~'));

      // Run clean up actions when server shuts down
      server.on('close', () => {
            console.log('Closed express server');

            // close database connection pool
            db.pool.end(() => {
                  console.log('Shut down db connection pool');
            });
      });