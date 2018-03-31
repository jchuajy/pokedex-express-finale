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

function createNewUser(db) {
      return (request, response) => {
            db.user.create(request.body, (error, queryResult) => {
                  // queryResult of creation is not useful to us, so we ignore it
                  // (console log it to see for yourself)
                  // (you can choose to omit it completely from the function parameters)

                  if (error) {
                        console.error('error getting user:', error);
                        response.sendStatus(500);
                  };

                  //if there is a query result,
                  if (queryResult.rowCount >= 1) {
                        //log that it was create successfully
                        console.log('User created successfully');

                        // create cookies to set login status and login id
                        response.cookie('loggedIn', true);
                        response.cookie('username', request.body.name);
                  } else {
                        console.log('User could not be created');
                  };
                  // redirect to home page after creation
                  response.redirect('/');
            });
      };
};

function goToLogin(request, response) {
      response.render("user/login")
}

function login(db) {
      return (request, response) => {
            //request.body refers to the form data
            db.user.login(request.body, (error, queryResult) => {
                  
            })
      }
}

/**
 * ===========================================
 * Export controller functions as a module
 * ===========================================
 */

//no need to pass any parameter here as we do not access the database
//all functions becomes available to any files that require this user.js file
module.exports = {
      showNewForm,
      createNewUser,
      goToLogin,
      login
};