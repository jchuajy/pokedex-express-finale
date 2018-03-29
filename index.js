/**
 * Entry point to Express web server.
 *
 * Import external library modules as needed (eg. body-parser, etc).
 */
//of course, you need to require express
const express = require('express');
//handle bars to render html pages
const handlebars = require('express-handlebars');
//require the db_config file... basically the pools config and to allow pools queries to be called from here
//do not require pg library as it is called in the db_config file
const db = require('./db_config');


/**
 * ===================================
 * Configurations and set up
 * ===================================
 */

// Init express app
const app = express();

// Set up middleware

// Set handlebars to be the default view engine
app.engine('handlebars', handlebars.create().engine);
app.set('view engine', 'handlebars');

/**
 * ===================================
 * Routes
 * ===================================
 */

// Import routes to match incoming requests
//allow index.js to access the routes.js file, and allow routes.js to use the constant app and db to access their respective libraries
require('./routes')(app, db);

// Root GET request (it doesn't belong in any controller file)
app.get("/", (request, response) => {
  //need to make a query to the postgres server
  //need to use the pool library in the db_configs file to get a query result in order to populate context. we use the constant db to reference the file.
  db.pool.query("SELECT * from pokemons", (error, queryResult) => {
    if (error) console.error("error!", error);
    //queryResult is the result of the pool.query, of which we only want the rows.

    //write a context that will allow the home page to show desired information using query from server
    //this is located within the pool.query function in order to prevent async issues (takes time for queryResult to return)
    let context = {
      pokemon: queryResult.rows
    };
    //render home page
    response.render("home", context);
  });
});

// Catch all unmatched requests and return 404 not found page

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

});