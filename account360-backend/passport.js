const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/User');
require('dotenv').config();

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/auth/google/callback"
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
  email,
  password: 'google_oauth_login', // dummy
  contact: '0000000000', // dummy
  name: profile.displayName || 'Google User',
});
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

// Optional if you use sessions later
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});
