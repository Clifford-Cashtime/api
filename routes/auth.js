const router = require('express').Router();
const User = require('../model/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const methodOverride = require('method-override')
const { registerValidation, loginValidation } = require('../validation');
const express = require('express');
const crypto = require('crypto');
const http = require('http');
const passport = require('passport');
const flash = require('express-flash')
const app = express();
const bodyParser = require('body-parser');


const ejs = require('ejs');


app.engine('ejs', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(flash())

const util = require("util");
const mongoose = require('mongoose');

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);


mongoose.connect('mongodb+srv://cashtime:cashtime@cluster0.hvlvg.mongodb.net/cluster0?retryWrites=true&w=majority', { useUnifiedTopology: true });


var urlencodedParser = bodyParser.urlencoded({ extended: false });

router.get('/', (req, res) => res.render('welcome.ejs'));
//get register

router.get('/welcome', (req, res) => {
    res.render('welcome.ejs');
});
router.get('/register', (req, res) => {
    res.render('register.ejs');
});

//REGISTER
router.post('/register', urlencodedParser, async(req, res) => {
    //console.log(req.body);
    //res.render('register', { qs: req.query });

    const { error } = registerValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    //Checking if user already exist in the database
    const emailExist = await User.findOne({ email: req.body.email });
    if (emailExist) return res.status(400).send('Email already exist');

    //Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword

    });
    try {
        const savedUser = await user.save();
        //res.send({ user: user._id });
        res.render('login.ejs');

    } catch (err) {
        res.status(400).send(err);

    }

});

//LOGIN
router.post('/login', urlencodedParser, async(req, res) => {
    //Validate user login data
    var files;
    const { error } = loginValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    //Checking if email already exist in the database
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send('Email is not found');

    //Check is password is correct
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) return res.status(400).send('Invalid Password')

    res.render('upload.ejs', { files: files });
    //Create and assign a token...Allows multiple requests
    //const token = jwt.sign({ _id: user._id }, "" + process.env.TOKEN_SECRET);
    //res.header('auth-token', token).send(token);
    successRedirect: '/'
    failureRedirect: '/login'
    failureFlash: true
});
//get login
router.get('/login', (req, res) => {
    res.render('login.ejs');
});

/*function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}*/

module.exports = router;