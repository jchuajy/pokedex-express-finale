/**
 * User model functions.
 *
 * Any time a database SQL query needs to be executed
 * relating to a user (be it C, R, U, D, or Login),
 * one or more of the functions here should be called.
 *
 * NOTE: You can add authentication logic in this model.
 *
 * Export all functions as a module using `module.exports`,
 * to be imported (using `require(...)`) in `db.js`.
 */

 //require bcrypt library
const bcrypt = require('bcrypt');

/**
 * ===========================================
 * Export model functions as a module
 * ===========================================
 */

 module.exports = (dbPool) => {
       //return results of each function to whereever it is called
       return {
            create: (user, callback) => {
                  bcrypt.hash(user.password, 1, (err, hashedPassword) => {
                        if (err) console.error("error!", err);

                        //set up query
                        const queryString = "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)";
                        //insert the relevant information + hashed password
                        const values = [user.name, user.email, hashedPassword];

                        //execute query
                        dbPool.query(queryString, values, (error, queryResult) => {
                              //invoke callback function with results after query has been executed
                              callback(error, queryResult);
                        });
                  });
            }
       };
 };