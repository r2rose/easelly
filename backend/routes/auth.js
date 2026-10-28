// import express module for building web server and handling routing
const express = require("express");
// import node.js built in crypto module to hash passwords
const crypt = require("crypto");
// create a router (for managing routes)
const router = express.Router();
// create an express app instance 
const app = express();
// have the app parse incoming url encoded data (such as the form data)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// tell app where to find static files (such as HTML pages)
app.use(express.static("html"));

// import mysql2 library for node.js to communicate with mysql db
const mysql = require("mysql2");

// define hashing parameters
const hashRounds = 100;
const hashLength=64;
const salt = "salt";

// receive db conn as a parameter 
module.exports = function(conn) {
    // REGISTRATION ENDPOINT - handle POST requests to /register
    router.post("/register", function(req, res) {
        // extract form field values
        let username = req.body.username;
        let email = req.body.email;
        let plainPass = req.body.password;

        // hash password
        let hashedPass = crypt.pbkdf2Sync(plainPass, salt, hashRounds, hashLength, 'sha512').toString('hex');

        // write the sql query to insert the new user's info into the database
        let sql = "INSERT INTO users (username, email, password, salt) VALUES (?, ?, ?, ?)";

        // execute sql query (pass user's info safely using placeholders)
        conn.query(sql, [username, email, hashedPass, salt], function(err, result) {
            // if there is an error, log in console
            if (err) {
                console.log("There was an error saving the user", err);
            return res.status(500).send('<p>Registration failed (Username or email may already exist). <a href="register.html">Try again</a></p>');
            } else {
                res.send('<p>You have successfully registered! <a href="login.html">Login here</a></p>');
            }
        });
    });

    // LOGIN ENDPOINT - handle post requests to /login
    router.post("/login", function(req, res) {
        // extract form field values
        let plainPass = req.body.password; 
        let username = req.body.username;
        
        // hash the entered password using the exact same algorithm and salt to compare it against the database
        let hashedPass = crypt.pbkdf2Sync(plainPass, salt, hashRounds, hashLength, 'sha512').toString('hex');
        
        // write a sql query to search for a user matching both the username and hashed password
        let sql = 'SELECT * FROM users WHERE username = ? AND password = ?';

        // execute the query using the username and newly hashed password
        conn.query(sql, [username, hashedPass], function(err, result) {
            // ff the query itself fails, send the error back as a response
            if(err)
                res.send(err);
            else {
                // if the result array is empty, it means no matching user/password combination was found
                if (result.length === 0) {
                    // send error message and a link back to login.html
                    res.send('<p>The login credentials were incorrect. Please try again.<br><a href="login.html">Login here</a></p>');	
                } 
                // if a match is found, send success message
                else {
                    res.send('<p>You have logged in successfully</p>');
                }
            } 
        });
    });

    // export the configured router so it can be used in app.js
    return router;
};