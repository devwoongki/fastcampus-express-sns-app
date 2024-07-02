const passport = require('passport');
const User = require('../models/users.model');
const LocalStrategy = require('passport-local').Strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy
const KakaoStrategy = require('passport-kakao').Strategy


//req.login(user)
passport.serializeUser((user, done)=>{
    done(null, user.id) ;

})

//client=>session> request
passport.deserializeUser((id, done)=>{
    User.findById(id)
    .then(user => {
        done(null, user);
    })
})

const localStrategyConfig = new LocalStrategy({ usernameField: 'email', passwordField: 'password'}, 
    (email, password, done) =>{
        // User.findOne({
        //     email : email.toLocaleLowerCase()
        // }, (err, user) => {
        //     if(err) return done(err);

        //     if(!user){
        //         return done(null, false, {msg: `Email ${email} not found`});
        //     }

        //     user.comparePassword(password, (err, isMatch) => {
        //         if(err) return done(err);

        //         if(isMatch){
        //             return done(null, user);
        //         }

        //         return done(null, false, {msg: 'Invalid email or Password'});
        //     })
        // })


        User.findOne({
            email : email.toLocaleLowerCase()
        }).then(user => {
            if(!user){
                return done(null, false, {msg: `Email ${email} not found`});
            }


            user.comparePassword(password, (err, isMatch) => {
                if(err) return done(err);

                if(isMatch){
                    return done(null, user);
                }

                return done(null, false, {msg: 'Invalid email or Password'});
            })

        }).catch(err => {
            return done(err);
        });
        
        }
    )

    passport.use('local', localStrategyConfig);

    const googleClientID = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

    const googleStrategyConfig = new GoogleStrategy({
        clientID : googleClientID,
        clientSecret: googleClientSecret,
        callbackURL : '/auth/google/callback',
        scope : ['email', 'profile']
    }, (accessToken, refreshToken, profile, done) => {
        console.log('profile',profile);

        User.findOne({ 
            googleId: profile.id
        }).then(existingUser => {
            if(existingUser){
                return done(null, existingUser);
            }else{
                const user = new User();
                user.email = profile.emails[0].value;
                user.username= profile.displayName;
                user.firstName = profile.name.givenName;
                user.lastName = profile.name.familyName;
                user.googleId = profile.id;

                user.save().then(user => {
                    done(null, user);
                }).catch(err => {
                    console.log(err);
                    if(err) return done(err);
                    done(null, user);
                })

            }
        }).catch(err => {
            return done(err);
        })

    });

    passport.use('google', googleStrategyConfig);


    const kakaoStrategyConfig = new KakaoStrategy({
        clientID : process.env.KAKAO_CLIENT_ID,
        callbackURL : '/auth/kakao/callback'
    }, (accessToken, refreshToken, profile, done) => {
        console.log('profile',profile);

        User.findOne({ 
            kakaoId: profile.id
        }).then(existingUser => {
            if(existingUser){
                return done(null, existingUser);
            }else{
                const user = new User();
                user.nickname = profile._json.properties.nickname;
                user.profile_image = profile._json.properties.profile_image;
                user.thumbnail_image = profile._json.properties.thumbnail_image;
                user.kakaoId = profile.id;

                user.save().then(user => {
                    done(null, user);
                }).catch(err => {
                    console.log(err);
                    if(err) return done(err);
                    done(null, user);
                })

            }
        }).catch(err => {
            return done(err);
        })

    });

    passport.use('kakao', kakaoStrategyConfig);