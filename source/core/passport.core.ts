import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: "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",
      clientSecret: "354745730971-7m8stefuln9oa2ldlqscv2s9jrc766rf.apps.googleusercontent.com",
      callbackURL: "http://localhost:9001/api/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      console.log("accessToken", accessToken);
      console.log("refreshToken", refreshToken);
      console.log("profile", profile);

      // Here, you can save the user info to your database or session
      done(null, profile);
    },
  ),
);

export default passport;
