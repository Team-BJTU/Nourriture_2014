module.exports = {
  "development" : {
    MANDRILL_USERNAME : 'your mandrill username',
    MANDRILL_API_KEY : 'your mandrill api key'
  },
  "production" : {
    // Set these env variables in your hosted environment
    MANDRILL_USERNAME : process.env.MANDRILL_USERNAME,
    MANDRILL_API_KEY : process.env.MANDRILL_API_KEY
  }
}