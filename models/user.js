var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , bcrypt = require('bcrypt')
  , SALT_WORK_FACTOR = 10;

var UserSchema = new Schema({
  createdAt : { type: Date, default: Date.now },
  username : { type: String, required: true, index: { unique: true } },
  firstName : { type: String, required: true, index: { unique: false } },
  lastName : { type: String, required: true, index: { unique: false } },
  email : { type: String, required: true, index: { unique: true } },
  password : { type: String, required: true },
  resetPasswordToken : { type: String, required: false },
  resetPasswordTokenCreatedAt : { type: Date }
});


UserSchema.pre('save', function(next) {
  var user = this;

  if (!user.isModified('password')) return next();

  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

UserSchema.methods.validPassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

UserSchema.methods.generatePerishableToken = function(cb){
  var user = this;
  var timepiece = Date.now().toString(36);
  var preHash = timepiece + user.email;
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) return cb(err);
    bcrypt.hash(preHash, salt, function(err, hash) {
      if (err) cb(err);
      else cb(null,hash);
    });
  });
}

module.exports = mongoose.model('User', UserSchema);