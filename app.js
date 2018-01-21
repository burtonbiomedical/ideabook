/*REFERENCE APPLICATION FOR MY LEARNING AND FUTURE REVISION
In this application I will be using ES6 syntax, so you will see the use of
ES6 arrow functions for example*/

//MODULE DECLARATIONS
/*Whenever you import a new module, you have to import it with the require function and 
declare it as a constant*/
const express = require('express');
//Bring in express handlebars; this is used to render HTML templates on the server
const exphbs = require('express-handlebars');
//Bring in mongoose
const mongoose = require('mongoose');
//Bring in body-parser. This will allow use to fetch input from forms and pass them using a post request
const bodyParser = require('body-parser');
//Bring in the method override module
const methodOverride = require('method-override');
//Bring in express connect-flash - this will allow me to display flash messages to inform the user when tasks are complete
const flash = require('connect-flash');
const session = require('express-session');
//Bring in passport module
const passport = require('passport');
//You then assign that to a new object with a call to the variable you just declared
const app = express();

//HOW MIDDLEWARE WORKS
/*Whenever we use modules we're always going to do it in three steps, we bring in the module using the require function
and then we decalre the middleware, and then use the module code*/
/*An express application is basically a set of middleware function calls;
these are functions that have access to the request and response objects, and
the next middleware function in the request-response cycle*/
//EXAMPLE:
/*app.use(function(request, reponse, next){
  //If we included the line below, every time the page loads, the current datetime will be printed to console
  console.log(Date.now());
  //If we add a value to the request object here, we can acccess it later on
  request.name = 'Rossco';
  //And the commented code in the get calls show how we could access the value declared above

  Call the next bit of middleware to run
  next();
});*/

//DATABASE CONFIG
//Check if using local dev or remote production database
const db = require('./config/database');

//CONNECT TO MONGOOSE
//We pass into the connect function the path for our database as so
//Also, always pass an object with the property useMongoClient: true
/*Connect responses with a promise, you can revise promises here: https://www.youtube.com/watch?v=swdWUWtGxR4
when we use a promise we have to catch it with a .then, we also put a .catch in to catch any errors,
this process is the same as using callbacks, except its much cleaner and generally better practice*/
//Map global promise - gets rid of depreciation error
mongoose.Promise = global.Promise;
mongoose.connect(db.mongoURL, {
  useMongoClient: true
})
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err));

//CONNECT TO MODELS
//the dot means we are looking in the current directory that we are in
require('./models/Idea')
const Idea = mongoose.model('ideas');

//HANDLEBARS MIDDLEWARE
//This is just telling the system that we want to use the handlebars template engine
app.engine('handlebars', exphbs({
  //We create a directory in our project folder called views, this will contain all our handlebar templates
  //Within this directory we have another directory called layouts.Layouts wrap around all our other views.
  //The default layout will be set to main
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

//BODY PARSER MIDDLEWARE
app.use(bodyParser.urlencoded({encoded: false}));
app.use(bodyParser.json());

//METHOD OVERRIDE MIDDLEWARE
app.use(methodOverride('_method'));

//SESSION and FLASH MIDDLEWARE
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true
}));
app.use(flash());

//PASSPORT MIDDLEWARE
//This MUST be declared after the express session middleware
app.use(passport.initialize());
app.use(passport.session());

//GLOBAL VARS
//Here I just define some global variables that will be used by the flash messages
//There is a partial for messages and errors in the partial directory
app.use(function(request, response, next){
  response.locals.success_msg = request.flash('success_msg');
  response.locals.error_msg = request.flash('error_msg');
  response.locals.error = request.flash('error');
  response.locals.user = request.user || null;
  next();
});

//SETTING ROUTES
/*We make a get request (HTTP reminder, get retrieves data, post is submitting data to a server,delete to delete data, 
and put is updating existing data)
Get takes in two parameters in the callback function, a request object and a response object*/
//The send method for the response object is going to send something to the browser

//Index route
app.get('/', (request, response) => {
  
  //The call below would send 'INDEX' to browser
  //response.send("INDEX");

  //This will call the index handlebars template in views
  //We also pass in a dynamic variable called title, which will be passed into the template when rendered
  const title = "Welcome"
  response.render('index', {
    title: title
  });

  //NOTE
  //We can access parameters of the object we defined in the middleware above
  //When index loads, the console will print not just the datetime, but also the name 'Rossco'
  //console.log(request.name);
})

//About route
app.get('/about', (request, response) => {
  response.render("about");
});


//All other routes are contained in the route folder, and accessed through the express.Router method
const ideas = require('./routes/ideas');
app.use('/ideas', ideas);

const users = require('./routes/users');
app.use('/users', users);

//PASSPORT CONFIG
//We are taking passport, and passing it into the config function that is exported from the passport config file
require('./config/passport')(passport);

//SET PORT
//You set a port for your listen method
const port = process.env.PORT || 5000;

//LISTEN METHOD
//Pass in the port value, and then pass in a callback function
app.listen(port, () => {
  /*Back ticks allows you to declare a template string, which can 
  include variables implicitly within the dolar sign and curly brackets*/
  console.log(`Server started on port ${port}`)
});