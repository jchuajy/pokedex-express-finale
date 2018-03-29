/**
 * Routes file.
 *
 * All routes you want to match in the app should appear here.
 * Upon match, a corresponding controller method should be called.
 *
 * Export as a function using `module.exports`,
 * to be imported (using `require(...)`) in `index.js`.
 */

//allow the users constant to point to the controller/user file
const users = require('./controllers/user');

//allow routes to be accessed by whatever file calls it
//we pass the parameters app and db to reference the libraries called in the index.js
module.exports = (app, db) => {
      /*
       *  =========================================
       *  Users
       *  =========================================
       */

       //if index.js heard a /users/new request, point to the constant users, which is inside user.js within the controller folder, and run the function showNewForm
       app.get("/users/new", users.showNewForm);

}