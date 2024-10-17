const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const FormDataModel = require('./models/FormData');
const jwt = require('jsonwebtoken'); // Importing JWT package

const app = express();
app.use(express.json());
app.use(cors());

const username = "new_user-01";
const password = "Krish2309";
const cluster = "cluster0";
const dbname = "LoginPage";

// JWT secret key (should be a strong and secure key)
const JWT_SECRET = 'abcdefghijklmnopqrstuvwxyz';

const uri = `mongodb+srv://${username}:${password}@${cluster}.hotzxyg.mongodb.net/${dbname}?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.connect(uri, {})
    .then(() => console.log('MongoDB Atlas connected'))
    .catch(err => console.log(err));

// Register endpoint
app.post('/register', (req, res) => {
    const { email, password } = req.body;
    FormDataModel.findOne({ email: email })
        .then(user => {
            if (user) {
                res.json("Already registered");
            } else {
                FormDataModel.create(req.body)
                    .then(log_reg_form => res.json(log_reg_form))
                    .catch(err => res.json(err));
            }
        });
});

// Login endpoint (with JWT implementation)
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    FormDataModel.findOne({ email: email })
        .then(user => {
            if (user) {
                if (user.password === password) {
                    // Generate JWT token
                    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
                    res.json({ message: "Success", token }); // Return the token on successful login
                } else {
                    res.json("Wrong password");
                }
            } else {
                res.json("No records found!");
            }
        })
        .catch(err => res.json(err));
});

// Middleware to verify JWT
const verifyJWT = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: "No token provided" });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Unauthorized access" });
        }
        req.userId = decoded.id;
        next();
    });
};

// Example of a protected route
app.get('/protected', verifyJWT, (req, res) => {
    res.json({ message: "This is a protected route", user: req.userId });
});

app.listen(3001, () => {
    console.log("Server listening on http://127.0.0.1:3001");
});
