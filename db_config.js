/**
 * Postgres database configuration.
 *
 * Import models and `pg` package.
 * Initialise configuration object with database credentials.
 * Initialise the connection pool with config object.
 *
 * Export the pool and models as a module using `module.exports`.
 */

//declare the constant user to require the models/user file
// const user = require('./models/user');


//this is where the configs for all the pool queries are made

//require the pg library
const pg = require('pg');

//credentials for pg library to access the postgres server
const configs = {
      user: 'postgres',
      host: '127.0.0.1',
      database: 'pokemons_development',
      port: 5432
};

//declare constant pool to use pg library
const pool = new pg.Pool(configs);

//initiate pool, console log error if error occurs
pool.on('error', function (err) {
      console.log('idle client error', err.message, err.stack);
    });

//allow these "shortcuts" to be available to anything that references this file
//for instance, db_config.pool() is as good as using pool.Something in this file.
//when db.user is called, point to user.js file in models folder
module.exports = {
      pool: pool,
      //when db.user is called, point to user.js file in models folder. pass the parameter pool into the user.js file
      // user: user(pool)
    };