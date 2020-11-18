const express = require('express');
const app = express();
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

const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
//mongoose.connect("" + process.env.DB_CONNECT, { useNewUrlParser: true }, () => console.log("Connected to database"));

//Imports Routes
const uploadRoute = require('./routes/upload');
const authRoute = require('./routes/auth');
const postsRoutes = require('./routes/posts');
var urlencodedParser = bodyParser.urlencoded({ extended: false });

// Middleware
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');

app.use("/api/user", uploadRoute);
app.use("/api/user", authRoute);
app.use("/api/user", postsRoutes);
// Mongo URI
const mongoURI = process.env.DB_CONNECT;

// Create mongo connection
const conn = mongoose.createConnection(" " + mongoURI, { useNewUrlParser: true },
    () => console.log("Connected to database"));

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

// @route GET /
// @desc Loads form
/*app.get('/', (req, res) => {
    gfs.files.find().toArray((err, files) => {
        // Check if files
        if (!files || files.length === 0) {
            res.render('index', { files: false });
        } else {
            files.map(file => {
                if (
                    file.contentType === 'image/jpeg' ||
                    file.contentType === 'image/png'
                ) {
                    file.isImage = true;
                } else {
                    file.isImage = false;
                }
            });
            res.render('index', { files: files });
        }
    });
});

// @route POST /upload
// @desc  Uploads file to DB
/*post('/upload', upload.single('file'), urlencodedParser, async(req, res) => {
    // res.json({ file: req.file });
    res.redirect('/');
});

// @route GET /files
// @desc  Display all files in JSON
get('/files', (req, res) => {
    gfs.files.find().toArray((err, files) => {
        // Check if files
        if (!files || files.length === 0) {
            return res.status(404).json({
                err: 'No files exist'
            });
        }

        // Files exist
        return res.json(files);
    });
});

// @route GET /files/:filename
// @desc  Display single file object
get('/files/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        // Check if file
        if (!file || file.length === 0) {
            return res.status(404).json({
                err: 'No file exists'
            });
        }
        // File exists
        return res.json(file);
    });
});

// @route GET /image/:filename
// @desc Display Image
/*app.get('/image/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        // Check if file
        if (!file || file.length === 0) {
            return res.status(404).json({
                err: 'No file exists'
            });
        }

        // Check if image
        if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
            // Read output to browser
            const readstream = gfs.createReadStream(file.filename);
            readstream.pipe(res);
        } else {
            res.status(404).json({
                err: 'Not an image'
            });
        }
    });
});

// @route DELETE /files/:id
// @desc  Delete file
/*app.delete('/files/:id', (req, res) => {
    gfs.remove({ _id: req.params.id, root: 'uploads' }, (err, gridStore) => {
        if (err) {
            return res.status(404).json({ err: err });
        }

        res.redirect('/');
    });
});

/*function Authenticate(req, res, next) {
const token = req.header('auth-token');
if (!token) return res.status(401).send("Access Denied!");

try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    req.file = verified;
    next();
} catch (err) {
    res.status(400).send("Invalid Token");
}
}*/
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server up running"));