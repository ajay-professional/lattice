const SignUp = require('../Group Chat Models/signupData.js');
const groupChatMsgs=require('../Group Chat Models/groupChatMsgs.js');
let dotenv = require('dotenv');
dotenv.config();
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
exports.addSignUpDetailsInDatabase = (req, res, next) => {
    const { username, email, phone, password } = req.body;
    const saltRounds = 10;
    bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(password, salt, function (err, hash) {
            if (err) {
                console.log('Unable to create new user');
                return res.json({ message: 'Unable to create new user' });
            }
            SignUp.create({
                username,
                email,
                phone,
                password: hash
            }).then((result) => {
                console.log('Added Product to the database');
                console.log(result);
                res.json({
                    status: "Successfully signed up"
                });
            }).catch(err => {
                console.log(err);
                console.log('Error in controller');
                res.json({
                    status: "User already exists, Please Login"
                });
            });
        });
    });
};

exports.loginByUser = (req, res, next) => {
    const email2 = req.body.email2;
    const password2 = req.body.password2;
    SignUp.findByPk(email2).then((user) => {
        bcrypt.compare(password2, user.password, function (err, result) {
            if (err) {
                console.log(err);
                res.json({ success: false, message: 'Something went wrong' });
            }
            if (result) {
                var token = jwt.sign({ username: user.username, email: user.email }, process.env.SECRET_KEY, {
                    expiresIn: "2d"
                });
                res.json({ status: "Login Successful", success: true, userData: { username: user.username, email: user.email, phone: user.phone, ispremiumuser: user.ispremiumuser }, token });
            } else {
                console.log('passwords do not match');
                res.sendStatus(401);
            }
        });
    }).catch(err => {
        console.log(err);
        console.log('Error in controller login');
        res.sendStatus(404);
    });
};

exports.authenticateUser = (req, res, next) => {
    try {
        const token = req.header('authorization');
        console.log(token);
        const userDet = jwt.verify(token, process.env.SECRET_KEY);
        console.log(JSON.stringify(userDet));
        myusername = userDet.username;
        mymail = userDet.email;
        next();
    } catch (err) {
        console.log(err);
        return res.status(401).json({ success: false })
    }
};

exports.groupChatMessage = (req, res, next) => {
    const msgs = req.body.msgs;
    groupChatMsgs.create({
        msgs:msgs,
        username: myusername,
        signupEmail: mymail
    }).then(groupChatMsgs => {
        console.log(groupChatMsgs);
        res.json(groupChatMsgs);
    }).catch(err => {
        console.log(err);
    });
};