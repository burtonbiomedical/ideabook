//THIS FILE CONTAINS ALL ROUTES RELATED TO THE CREATION AND MANAGEMENT OF USERS
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');

//LOAD USER MODEL
require('../models/Users');
const User = mongoose.model('users')

//USER LOGIN ROUTE
router.get('/login', (request, response) => {
  response.render("users/login")
});

//USER REGISTER ROUTE
router.get('/register', (request, response) => {
  response.render("users/register")
});

//LOGIN FORM POST
router.post('/login', (request, response, next) => {
  //Here, we use the authenticate method of passport, and pass in the strategy. So here we will be using a local strategy,
  //aposed to something like logging in with Google or Facebook etc
  passport.authenticate('local', {
    //Pass in an object as the second parameter
    //Where to redirect too if successful
    successRedirect: '/ideas',
    failureRedirect: '/users/login',
    failureFlash: true
  })(request, response, next);
})

//REGISTER FORM POST
router.post('/register', (request, response) => {
  let errors = [];
  //Client side password validation
  if(request.body.password != request.body.passwordConf){
    errors.push({text: 'Passwords do not match'})
  }
  if(request.body.password.length < 8){
    errors.push({text: "Password must be at least 8 characters in length"})
  }
  //If any errors, re-render the form with entered information, but also display any errors
  if(errors.length > 0){
    response.render('users/register', {
      errors: errors,
      name: request.body.name,
      email: request.body.email
    })
  } else {
    //Check if user already exists
    User.findOne({email: request.body.email})
    .then(user => {
      if(user){
        request.flash('error_msg', "Email already registered");
        response.redirect('/users/register');
      } else {
        //If validation passed, create new object containing new user info
        const newUser = new User({
          name: request.body.name,
          email: request.body.email,
          password: request.body.password
        });
        //Then using bcrypt, we use the genSalt function to generate a hash for our password
        //We then make the newUser object password parameter equal to the hash
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if(err) throw err;
            newUser.password = hash;
            newUser.save()
            .then(user => {
              request.flash('success_msg', "You're now registered, and can login");
              response.redirect('/users/login');
            })
            .catch(err => {
              console.log(err);
              return;
            })
          })
        });
      }
    })
  }
});

//LOGOUT USER
router.get('/logout', (request, response) => {
  request.logout();
  request.flash('success_msg', "You have been logged out");
  response.redirect('/users/login');
});

module.exports = router;