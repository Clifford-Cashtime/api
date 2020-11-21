const express = require('express');
const app = express();
const router = require('express').Router();
//const router = require('express').Router();
const dotenv = require("dotenv").config();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const crypto = require('crypto');
const bodyParser = require('body-parser');
let ejs = require('ejs');
app.engine('ejs', require('ejs').renderFile);
const multer = require('multer');
const path = require('path');
const methodOverride = require('method-override');
const passport = require('passport');

const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');


//mongoose.connect("" + process.env.DB_CONNECT, { useNewUrlParser: true }, () => console.log("Connected to database"));

// Mongo URI
const mongoURI = 'mongodb+srv://cashtime:cashtime@cluster0.hvlvg.mongodb.net/cluster0?retryWrites=true&w=majority' + { useUnifiedTopology: true };

// Create mongo connection
const conn = mongoose.createConnection(mongoURI, { useNewUrlParser: true },
    () => console.log("Connected to database"));

//Imports Routes

const authRoute = require('./routes/auth');
const uploadRoute = require('./routes/upload');

var urlencodedParser = bodyParser.urlencoded({ extended: false });

// Middleware
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.set('views', path.join(__dirname, 'views'));
app.set('views', './views');
app.set('view engine', 'ejs');


app.use(authRoute);
app.use(uploadRoute);

// Init gfs


let gfs;

conn.once('open', () => {
    // Init stream
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
});

// Create storage engine
const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads'
                };
                resolve(fileInfo);
            });
        });
    }
});
const upload = multer({ storage });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server up running ', PORT));