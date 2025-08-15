const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const splunkLogger = require("../configure/Splunk");
const router = express.Router();


router.post("/register", async (req,res) => {
    try {
        const {email, password, fullname} = req.body;
        const hash = await bcrypt.hash(password, 10);
        const user = await User.create({email, password: hash, fullname});
        splunkLogger.log({message: 'user registered successfully', user});
        res.status(201).json({message: 'user registered successfully', user});
    } catch (error) {
        res.status(400).json({error: error.message});
    }
})


router.post("/login", async (req,res) => {
    const {email, password} = req.body;
    const user = await User.findOne({where: {email}});
    if(!user) return res.status(401).json({message: 'user not found'});

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) return res.status(401).json({message: 'invalid credentials'});

    const token = jwt.sign({id: user.id}, process.env.JWT_SECRET);
    res.json({message: 'login successful', token});
})

module.exports = router;
