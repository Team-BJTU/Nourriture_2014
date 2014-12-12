var mongoose = require('mongoose')
  , User = mongoose.model('User')
  , passport = require('passport');

exports.login = function(req, res){
  res.render('users/login', { postAuthDestination : req.query.postAuthDestination || "" });
}

exports.dashboard = function(req, res){
  res.render('users/dashboard');
}

exports.authenticate = function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { 
      req.flash('error', info.message);
      return res.redirect(req.body.postAuthDestination ? '/login?postAuthDestination='+req.body.postAuthDestination : '/login');
    }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect(req.body.postAuthDestination ? req.body.postAuthDestination : '/dashboard');
    });
  })(req, res, next);
}

exports.user = function(req, res){

    if(!req.isAuthenticated()) return res.redirect('/');
}

exports.register = function(req, res){
  res.render('users/new', {user: new User({})});
}

exports.logout = function(req, res){
  req.logout();
  res.redirect('/');
}

exports.account = function(req,res){
  res.render('users/edit');
}

exports.list = function(req, res, next){
  User.find(function(err,users){
    if(err) return next(err);
    res.render('users/index',{
      users:users
    });
  });
}

exports.update = function(req, res, next){
  var user = req.user;
  if (!req.body.password) delete req.body.password;
  user.validPassword(req.body.currentPassword, function(err, isMatch){
    if(err) return next(err);
    if(isMatch) return updateUser();
    else return failedPasswordConfirmation();
  });
  function updateUser(){
    user.set(req.body);
    user.save(function(err, user){
      if (err && err.code == 11001){
        var duplicatedAttribute = err.err.split("$")[1].split("_")[0];
        req.flash('error', "That " + duplicatedAttribute + " is already in use.");
        return res.redirect('/account');
      }
      if(err) return next(err);
      req.flash('success', "Account updated successfully.");
      return res.redirect('/account');
    });
  }

  function failedPasswordConfirmation(){
    req.flash('error', "Incorrect current password.");
    return res.redirect("/account");
  }
}

exports.create = function(req, res, next){
  var newUser = new User(req.body);
  newUser.save(function(err, user){
    if (err && err.code == 11000){
      var duplicatedAttribute = err.err.split("$")[1].split("_")[0];
      req.flash('error', "That " + duplicatedAttribute + " is already in use.");
      return res.render('users/new', {user : newUser, errorMessages: req.flash('error')});
    }
    if(err) return next(err);
    req.login(user, function(err) {
      if (err) { return next(err); }
      req.flash('success', "Account created successfully!");
      return res.redirect('/dashboard');
    });
  });
}

exports.userValidations = function(req, res, next){
  var creatingUser = req.url == "/register";
  var updatingUser = !creatingUser;
  req.assert('email', 'You must provide an email address.').notEmpty();
  req.assert('firstName', 'First Name is required.').notEmpty();
  req.assert('lastName', 'Last Name is required.').notEmpty();
  req.assert('email', 'Your email address must be valid.').isEmail();
  req.assert('username', 'Username is required.').notEmpty();
  if(creatingUser || (updatingUser && req.body.password)){
    req.assert('password', 'Your password must be 6 to 20 characters long.').len(6, 20);
  }
  var validationErrors = req.validationErrors() || [];
  if (req.body.password != req.body.passwordConfirmation) validationErrors.push({msg:"Password and password confirmation did not match."});
  if (validationErrors.length > 0){
    validationErrors.forEach(function(e){
      req.flash('error', e.msg);
    });
    if (creatingUser) return res.render('users/new', {user : new User(req.body), errorMessages: req.flash('error')});
    else return res.redirect("/account");
  } else next();
}

exports.reset_password = function(req, res){
  res.render('users/reset_password');
}

exports.generate_password_reset = function(req, res, next){
  req.assert('email', 'You must provide an email address.').notEmpty();
  req.assert('email', 'Your email address must be valid.').isEmail();
  var validationErrors = req.validationErrors() || [];
  if (validationErrors.length > 0){
    validationErrors.forEach(function(e){
      req.flash('error', e.msg);
    });
    return res.redirect("/reset_password");
  }
  User.findOne({email:req.body.email}, function(err, user){
    if(err) return next(err);
    if(!user){
      req.flash('success', "You will receive a link to reset your password at "+req.body.email+".");
      return res.redirect('/');
    }
    user.generatePerishableToken(function(err,token){
      if(err) return next(err);
      user.update({
        resetPasswordToken : token,
        resetPasswordTokenCreatedAt : Date.now()
      }, function(err){
        if(err) return next(err);
        res.mailer.send('mailer/password_reset', {
            to: user.email,
            subject: 'Password Reset Request',
            username: user.username,
            token: token,
            urlBase: "http://"+req.headers.host+"/password_reset"
          }, function(err) {
            if(err) return next(err);
            req.flash('success', "You will receive a link to reset your password at "+req.body.email+".");
            res.redirect('/');
          });
      });
    });
  });
}

exports.password_reset = function(req, res, next){
  res.render("users/password_reset", {token : req.query.token, username : req.query.username});
}

exports.process_password_reset = function(req, res, next){
  User.findOne({username:req.body.username}, function(err, user){
    if(err) return next(err);
    if(!user){
      req.flash('error', "Password reset token invalid.");
      return res.redirect("/");
    }
    var tokenExpiration =  6 
    if(req.body.token == user.resetPasswordToken && Date.now() < (user.resetPasswordTokenCreatedAt.getTime() + tokenExpiration * 3600000)){
      req.assert('password', 'Your password must be 6 to 20 characters long.').len(6, 20);
      var validationErrors = req.validationErrors() || [];
      if (req.body.password != req.body.passwordConfirmation) validationErrors.push({msg:"Password and password confirmation did not match."});
      if (validationErrors.length > 0){
        validationErrors.forEach(function(e){
          req.flash('error', e.msg);
        });
        return res.render('users/password_reset', {errorMessages: req.flash('error'), token : req.body.token, username : req.body.username});
      }
      user.set(req.body);
      user.save(function(err, user){
        if(err) return next(err);
        req.login(user, function(err) {
          if (err) { return next(err); }
          req.flash('success', "Password updated successfully, you are now logged in.");
          return res.redirect('/dashboard');
        });
      });
    } else {
      req.flash('error', "Password reset token has expired.");
      return res.redirect("/");
    }
  });
}