const express = require('express');
const connection = require('../connection');
const router = express.Router();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config()
const auth = require('../services/authenticate');
const checkRole = require('../services/checkRole');

//signup
router.post('/signup', (req, res) => {
    let users = req.body;
    query = "SELECT email, password, status, role FROM users WHERE email=?"
    connection.query(query, [users.email],(err, results) => {
        if (!err) {
            if(results.length <=0){
                query = "INSERT INTO users(name,contactNumber,email,password,status,role) values(?,?,?,?,'false','user')";
                connection.query(query,[users.name,users.contactNumber,users.email,users.password], (err, results) => {
                    if(!err){
                        return res.status(200).json({
                            message: "Successfully registered"
                        });
                    } else {
                        return res.status(500).json(err);
                    }
                });
            }
            else {
                return res.status(400).json({
                    message: 'Email already exists'
                })
            }
        }
        else {
            return res.status(500).json({
                message: "Something went wrong",
                error: err
            });
        }
    });
});

//login
router.post('/login', (req, res) => {
    const user = req.body;
    query = "SELECT email, password, role, status FROM users WHERE email=?";
    connection.query(query,[user.email],(err, results) => {
        if (!err){
            if (results.length <=0 || results[0].password !=user.password) {
                return res.status(401).json({
                    message:"Invalid Email or Password"
                });
            } else if (results[0].status === 'false') {
                return res.status(401).json({
                    message: "Wait for Admin Approval"
                });
            } else if (results[0].password == user.password) {
                const response = { email: results[0].email, role: results[0].role }
                const accessToken = jwt.sign(response, process.env.ACCESS_TOKEN, { expiresIn: '7h' });
                res.status(200).json({ 
                    token: accessToken 
                });
            } else {
                return res.status(400).json({
                    message: "Something went wrong"
                });
            }
        } else {
            return res.status(500).json(err);
        }
    });
});

const transporter = nodemailer.createTransport ({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});

//forgot password
router.post('/forgotPassword', (req, res) => {
    const user = req.body;
    query = "SELECT email, password FROM users WHERE email=?";
    connection.query(query,[user.email], (err, results ) => {
        if (!err){
            if (results.length <= 0)
            {
                return res.status(200).json({ 
                    message: "Password sent successfully to your email."
                });
            }
            else {
                const mailOptions = {
                    from: process.env.EMAIL,
                    to: results[0].email,
                    subject: "Password By Resturant System",
                    html: '<p><b>Your Login details for Resturant System</b><br><b>Email: </b>'+results[0].email+'<br><b>Password: </b>'+results[0].password+'<br><a href="http://localhost:4200/">Click here to Login</a></p>'
                };
                transporter.sendMail(mailOptions, function(error){
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: '+info.response);
                    }
                });
                return res.status(200).json({ 
                    message: "Password sent successfully to your email."
                });
            }
        } else {
            return res.status(500).json(err);
        }
    });
});

//Get All Users
router.get('/get', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    const query = "SELECT id, name, email, contactNumber, status FROM users WHERE role='user'";
    connection.query(query, (err, results) => {
        if(!err) {
            return res.status(200).json(results);
        } else {
            return res.status(500).json(err);
        }
    });
});

//Change User from true to false
router.patch('/update', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    const user = req.body;
    const query = "UPDATE users set status=? WHERE id=?";
    connection.query(query,[user.status, user.id],(err, results) => {
        if (!err){
            if (results.affectedRows == 0) {
                return res.status(404).json({
                    message: "User does not exist"
                });
            }
            return res.status(200).json({
                message: "User updated successfully"
            });
        } else {
            return res.status(500).json(err);
        }
    });
});

//Check the Token
router.get('/checkToken', auth.authenticateToken, (req, res) => {
    return res.status(200).json({
        message: "true"
    });
});

//Option to change the password
router.post('/changePassword', auth.authenticateToken, (req, res) => {
    const user = req.body;
    const email = res.locals.email;
    console.log(email);
    var query = "SELECT * FROM users WHERE  email=? and password=?";
    connection.query(query,[email, user.oldPassword], (err, results) => {
        if(!err) {
            if (results.length <= 0 ){
                return res.status(400).json({
                    message:"Wrong old Password!"
                });
            }
            else if (results[0].password == user.oldPassword){
                query = "UPDATE users set password=? WHERE email=?";
                connection.query(query,[user.newPassword,email],(err,results)=> {
                    if(!err){
                        return res.status(200).json({
                            message: "Password Updated Successfully."
                        });
                    } else {
                        return res.status(500).json(err);
                    }
                });
            }
            else {
                return res.status(400).json({
                    message: "Something went wrong, Please try again"
                });
            }
        } else {
            return res.status(500).json(err);
        }
    })
})

module.exports = router;