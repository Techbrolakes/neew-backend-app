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
      clientSecret: "571327977366-fda046f96991qq89fo3i4nfgvp0id5b7.apps.googleusercontent.com",
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
