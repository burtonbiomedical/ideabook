//THIS FILE CONTAINS ALL ROUTES RELATED TO THE CREATION AND MANAGEMENT OF IDEAS
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

//LOAD HELPER
//Using the curly braces (called destructuring) allows us to access a function within auth directly by using its name
const {ensureAuthenticated} = require('../helpers/auth');

//CONNECT TO MODELS
//the dot means we are looking in the current directory that we are in
//N.B. two dots prior to the forward slash means to access the main directory when inside an embedded directory
require('../models/Idea')
const Idea = mongoose.model('ideas');

//Add idea form
router.get('/add', ensureAuthenticated, (request, response) => {
  response.render('ideas/add');
});

//Edit idea form
//We pass in the id as a placeholder in the url, so we can select a specific idea to edit
router.get('/edit/:id', ensureAuthenticated, (request, response) => {
  Idea.findOne({
    _id: request.params.id
  })
  .then(idea => {
    if(idea.user != request.user.id){
      request.flash('error_msg', 'Unauthorised access');
      response.redirect('/ideas')
    } else {
      response.render('ideas/edit', {idea:idea});
    }
  });
});

//Idea index page
router.get('/', ensureAuthenticated, (request, response) => {
  //We use our Idea model, and call the find method
  Idea.find({user: request.user.id})
  //This will return a promise and the  objects from the database
  //we also call sort, and pass in the property to sort by which is date, and specify it as descending order
  .sort({date:'desc'})
  .then(ideas => {
    //When we recieve those ideas we render the view, and pass the ideas object into the render
    response.render('ideas/index',{ideas:ideas});
  });
});

//PROCCESS FORM
// If you go to the handlebars file for the add form, you will see it makes a post request, and this is what we are processing here
router.post('/', ensureAuthenticated, (request, response) => {
  //Server side validation
  /*We create an array called errors, which will store any errors we encounter. We can then pass these errors back to the DOM
  when we re-render the form, and display them*/
  let errors = [];
  if(!request.body.title){
    errors.push({text:"Please include a title"});
  }
  if(!request.body.details){
    errors.push({text:"Please include some details"});
  }
  if(errors.length > 0){
    response.render('ideas/add', {
      errors: errors,
      title: request.body.title,
      details: request.body.details
    })
  } else {
    //If no errors, then save the idea to our mongo database using our Idea model we instantiated earlier
    const newUser = {
      title: request.body.title,
      details: request.body.details,
      user: request.user.id
    }
    new Idea(newUser)
    .save()
    //This save method is going to return a promise and the idea object, so we handle this with a .then
    .then(idea => {
      //We redirect to the /ideas route
      request.flash('success_msg', 'Idea saved successfully');
      response.redirect('/ideas');
    });
  }
});

//EDIT FORM PROCESS
//This will be a put request that will edit the existing data in the mongo database
//We can't just use a put method with our edit form, instead we have to use a module called method-override
router.put('/:id', ensureAuthenticated, (request, response) => {
  Idea.findOne({
    _id: request.params.id
  })
  .then(idea => {
    //new values
    idea.title = request.body.title,
    idea.details = request.body.details

    idea.save()
    .then(idea => {
      request.flash('success_msg', 'Idea updated successfully');
      response.redirect('/ideas')});
  });
});

//DELETE IDEA
router.delete('/:id', ensureAuthenticated, (request, response) => {
  Idea.remove({_id: request.params.id})
  .then(() => {
    request.flash('success_msg', 'Idea deleted');
    response.redirect('/ideas')
  })
});


//This command will export router so it can be accessed from other files
module.exports = router;