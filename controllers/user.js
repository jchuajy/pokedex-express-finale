/**
 * User controller functions.
 *
 * Each user-related route in `routes.js` will call
 * one controller function here.
 *
 * Export all functions as a module using `module.exports`,
 * to be imported (using `require(...)`) in `routes.js`.
 */

/**
 * ===========================================
 * Controller logic
 * ===========================================
 */

//the function showNewForm is a get request, so should use the parameters (request, response)
function showNewForm(request, response) {
      //respond to the request made by the user by rendering the "new" handlebars in the views/user folder
       response.render("user/new");
 };


 /**
 * ===========================================
 * Export controller functions as a module
 * ===========================================
 */

//no need to pass any parameter here as we do not access the database
//showNewForm becomes available to any files that require this user.js file
module.exports = {
      showNewForm
    };
    