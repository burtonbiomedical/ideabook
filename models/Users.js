//CREATING MODELS
/*A noSQL database like mongodb does not require you to define a schema at the database level, but it is good practice to define the schema at an applicaiton level instead, and this is what models are for. This is the model for our users. When creating a model it is good practice to capitalise the first letter of the name. It is also good practice to use CapsCase for each model object*/

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//CREATE SCHEMA
//We pass in an object to the schema, where each property represents the columns we would have if this was a table
const UserSchema = new Schema({
  //We create a property called title, which is mapped to an object that is a string
  //it is also a requirement, so it cannot be left blank
  //and you do this for each property of your schema
  name:{
    type: String,
    required: true
  },
  email:{
    type: String,
    required: true
  },
  password:{
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});
//We then create the model with a name and connect it to our schema by passing the schema object
mongoose.model('users', UserSchema);