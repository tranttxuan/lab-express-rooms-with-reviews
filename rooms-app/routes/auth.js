const express = require('express');
const router = express.Router();
const User = require('./../models/User');

const passport = require('passport');


const bcrypt = require('bcrypt');
const saltRounds = 10;

//signup
router.get("/signup", (req, res) => {
        res.render('auth/signup')
});

//login
router.get("/login", (req, res, next) => {
        res.render('auth/login', { errorMessage: req.flash("wrong") })
});

// router.post("/login", passport.authenticate("local", {
//         successRedirect: "/",
//         failureRedirect: "/login",
//         failureFlash: true,
//         passReqToCallback: true,
// }));

router.post('/login', (req, res, next) => {
        passport.authenticate('local', (err, theUser, failureDetails) => {

                if (err) {
                        // Something went wrong authenticating user
                        return next(err);
                }

                if (!theUser) {
                        // Unauthorized, `failureDetails` contains the error messages from our logic in "LocalStrategy" {message: '…'}.
                        res.render('auth/login', { errorMessage: 'Wrong password or username' });
                        return;
                }

                // save user in session: req.user
                req.login(theUser, (err) => {
                        if (err) {
                                // Session save went bad
                                return next(err);
                        }
                        // console.log("check----", theUser, "check2----", req.user)
                        // All good, we are now logged in and `req.user` is now set
                        res.redirect('/');
                });
        })(req, res, next);
});


//signup
router.post("/signup", (req, res, next) => {
        const { email, password, fullName } = req.body;


        //check inputs are not empty
        if (!email || !password || !fullName) {
                res.render("auth/signup", { errorMessage: 'All fields are required' });
        }
        //make sure password is strong
        const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
        if (!regex.test(password)) {
                res.render("auth/signup", { errorMessage: 'Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter.' });
        }

        //check user does not exist

        User.findOne({ email: email })
                .then((foundUser) => {
                        if (foundUser !== null) {
                                res.render("auth/signup", { errorMessage: "Email is already in taken" })
                        } else {
                                // encrypting password to 'hash' via bcrypt:
                                bcrypt
                                        .genSalt(saltRounds)
                                        .then(salt => bcrypt.hash(password, salt))
                                        .then(hash => User.create({ email: email, password: hash, fullName: fullName }))
                                        .then(newUser => {
                                                console.log({ newUser });
                                                req.session.user = newUser;
                                                res.redirect("/")
                                        })

                        }
                })
                .catch(err => next(err))
})

//logout
router.get("/logout", (req, res, next) => {
        // passport
        req.logout();
        res.redirect("/");
});


module.exports = router;