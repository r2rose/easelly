require('dotenv').config();
const express = require("express"); //imports the express module
const app = express(); //creates the express application object
const path = require('path');
app.use(express.static(path.join(__dirname, 'html')));//register easelly_app as the directory for static files
console.log("Serving static files from:", path.join(__dirname, 'html')); //debugging
app.use(express.urlencoded({ extended: true }));
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