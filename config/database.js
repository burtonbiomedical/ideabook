if(process.env.NODE_ENV === 'production'){
  module.exports = {mongoURL: 'mongodb://admin:ideabook_admin91225@ds211588.mlab.com:11588/ideabook-prod'}
}else{
  module.exports = {mongoURL: 'mongodb://localhost/ideabook-dev'}
}