require('dotenv').config();
const express = require("express"); //imports the express module
const app = express(); //creates the express application object
const path = require('path');

const session = require("express-session");	//import express-session for tracking user login states across requests
const cookieParser = require("cookie-parser");	//import cookie-parser for parsing cookies sent by browser

app.use(express.static(path.join(__dirname, 'html')));//register easelly_app as the directory for static files
console.log("Serving static files from:", path.join(__dirname, 'html')); //debugging
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());	//enable cookie-parser so app can read cookies
app.use(session({
	secret: process.env.SESSION_SECRET, // secret key to securely sign the session ID cookie
	resave: false, // prevent re-saving the session if nothing changed
	saveUninitialized: false, // prevent storing empty/uninitialized sessions
	cookie: {
		maxAge: 60000 * 60, //set the session cookie to last one hour
		httpOnly: true, // prevent cookie from being accessed by client-side js
		secure: false // set false for running locally, for now
	}
}));

const mysql = require("mysql2"); //uses new mysql package
// create the connection
const conn = mysql.createConnection(
{host:"localhost",user:"root",password:process.env.ROOTPASS,database:"art_platform",port:3306});

// try to connect to MySQL DB and handle an error
conn.connect(function(err)
{
	if(err)
		console.log("Couldnt connect to MySQL",err);
	else
		console.log("Database connection established");
	
});

// import the auth routes file and pass database connection (conn) into it
const authRoutes = require("./backend/routes/auth.js")(conn);
app.use("/", authRoutes);
// start Express web server
app.listen(3000);