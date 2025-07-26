const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const db = require("./db");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const name = profile.displayName;
        const image =
          profile.photos && profile.photos.length > 0
            ? profile.photos[0].value
            : null;

        // Check if user already exists
        const [existingUser] = await db.query(
          "SELECT * FROM user WHERE email = ?",
          [email]
        );

        if (existingUser.length > 0) {
          return done(null, existingUser[0]); // user exists
        } else {
          // Create new user
          const [result] = await db.query(
            "INSERT INTO user (name, email, authProvider, image) VALUES (?, ?, ?, ?)",
            [name, email, "google", image]
          );

          const newUser = { id: result.insertId, name, email };
          return done(null, newUser);
        }
      } catch (err) {
        console.error(err);
        return done(err, null);
      }
    }
  )
);

// For managing session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const [rows] = await db.query("SELECT * FROM user WHERE id = ?", [id]);
    done(null, rows[0]);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
