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

function unmatchedPage(request, response) {
      response.render("404");
};

function goToHomePage(request, response) {
      //get the values of the cookies to get login status and display username if applicable
      let loggedIn = request.cookies['loggedIn'];
      let username = request.cookies['username'];
      //retrieve information from postgres about all pokemon
      //set up a queryString
      let queryString = "SELECT * FROM pokemons ORDER BY id ASC";
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
};

function goToLogin(request, response) {
      //render the login handlebars
      response.render("user/login")
};

function logInUser(request, response) {
      //request.body refers to form data
      //retrieve hashedPassword from postgres db
      //set query string
      let queryString = "SELECT * FROM users WHERE name=$1";
      let values = [request.body.username];
      db.pool.query(queryString, values, (error, queryResult) => {
            //error log
            if (error) {
                  console.error('error getting user:', error);
                  response.sendStatus(500);
            };

            //compare hashedPassword with clearText password
            bcrypt.compare(request.body.password, queryResult.rows[0].password, function (err, res) {
                  //if comparison passes
                  if (res === true) {
                        //change cookies to reflect information entered
                        response.cookie('loggedIn', true);
                        response.cookie('username', request.body.username);
                        //redirect to home page
                        response.redirect("/");
                  } else {
                        let context = {
                              failedMessage: "You have entered invalid login information. Please try again!"
                        };
                        response.render("login", context);
                  };
            });
      });
};

function logOutUser(request, response) {
      console.log("Logged out user")
      //change cookie values
      response.clearCookie("loggedIn", false);
      response.clearCookie("username");
      response.redirect("/");
};

function showAllPokemon(request, response) {
      //query postgres to get information of all pokemon
      //set up query string
      let queryString = "SELECT * from pokemons";
      let values = [];
      //query the server
      db.pool.query(queryString, values, (error, queryResult) => {
            //error log
            if (error) console.log("Error retrieving all pokemon", error);
            //write the context for rendering the page
            let context = {
                  pokemon: queryResult.rows
            };
            //render the page
            response.render("pokemon/all", context);
      });
};

//set up leading zeroes for id
function leadZero(number) {
      if (number < 10) {
            return ("0" + "0" + number);
      } else if (number < 100) {
            return ("0" + number);
      } else {
            return number;
      };
};

function showPokemonById(request, response) {
      //request.params.id refers to the id input into the url
      //set queryString
      let queryString = "SELECT * FROM pokemons WHERE num=$1";
      let values = [leadZero(request.params.id)];
      //query the server for pokemon info
      db.pool.query(queryString, values, (error, queryResult) => {
            //error log
            if (error) console.error("Error retrieving specified pokemon", error);
            //write the context for rendering page
            let context = {
                  pokemon: queryResult.rows[0]
            };

            response.render("pokemon/pokemon", context);
      });
};

function editPokemonById(request, response) {
      //request.params.id refers to id in url
      //set queryString
      let queryString = "SELECT * FROM pokemons WHERE num=$1";
      let values = [leadZero(request.params.id)];
      //query the server for pokemon info
      db.pool.query(queryString, values, (error, queryResult) => {
            //error log
            if (error) console.error("Error retrieving specified pokemon", error);
            //write the context for rendering page
            let context = {
                  pokemon: queryResult.rows[0]
            };
            response.render("pokemon/edit", context);
      });
};

function savePokemonEdits(request, response) {
      //request.body refers to form data
      //set queryString
      let queryString = "UPDATE pokemons SET num= $1, name = $2, img = $3, weight = $4, height = $5 WHERE id = " + request.params.id;
      let values = [request.body.num, request.body.name, request.body.img, request.body.weight, request.body.height];
      //save the values onto the server
      db.pool.query(queryString, values, (error, queryResult) => {
            //error log
            if (error) console.error("Error saving changes", error);
            //redirect to the page showing edited pokemon
            response.redirect("/pokemons/" + request.params.id);
      });
};

function deletePokemon(request, response) {
      //request.params.id refers to id at the url
      //set queryString
      let queryString = "DELETE FROM pokemons WHERE num = $1";
      let values = [leadZero(request.params.id)];
      //delete the information from the server
      db.pool.query(queryString, values, (error, queryResult) => {
            //error log
            if (error) console.error("Error deleting pokemon!", error);
            //redirect to the home page
            response.redirect("/");
      });
};

function goToPokemonCreation(request, response) {
      response.render("pokemon/new");
};

function createNewPokemon(request, response) {
      //request.body refers to form data
      //set queryString
      let queryString = "INSERT INTO pokemons (num, name, img, weight, height) VALUES ($1, $2, $3, $4, $5)";
      let values = [request.body.num, request.body.name, request.body.img, request.body.weight, request.body.height];
      //add the information to the server
      db.pool.query(queryString, values, (error, queryResult) => {
            //error log
            if (error) console.error("Error deleting pokemon!", error);
            //redirect to home page
            response.redirect("/");
      });
};

/**
 * ===================================
 * Routes
 * ===================================
 */

//USERS
//create route for rendering home page
app.get("/", goToHomePage);
//create route for rendering new user form
app.get("/users/new", goToUserCreation);
//create route for saving new user into the database
app.post("/users/new", saveNewUser);
app.get("/users/login", goToLogin);
app.post("/users/login", logInUser);
app.post("/users/logout", logOutUser);


//POKEMON
app.get("/pokemons/new", goToPokemonCreation);
app.put("/pokemons/:id", savePokemonEdits);
app.delete("/pokemons/:id", deletePokemon);
app.get("/pokemons/:id/edit", editPokemonById);
app.get("/pokemons/:id", showPokemonById);
app.get("/pokemons", showAllPokemon);
app.post("/pokemons", createNewPokemon);


//catchall for unmatched requests. return 404 page
app.get("*", unmatchedPage);


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