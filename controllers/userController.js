const User = require('../models/user')
const Order = require('../models/order')
const crypto = require("crypto")
const nodemailer = require("nodemailer")
const jwt = require('jsonwebtoken')

const sendVerificationEmail = async (email, verificationToken) => {
    const transporter = nodemailer.createTransport({
        service:"gmail",
        auth: {
            user: "frankzeal33@gmail.com",
            pass: "evzxadtbrhwjczxi"
        }
    })

    //compose the email
    const mailOptions = {
        from: "amazon.com",
        to: email,
        subject: "Email Verification",
        text: `Please click the following link to verify your email: http://localhost:5000/verify/${verificationToken}`
    }

    //send the mail
    try {
        await transporter.sendMail(mailOptions)
    } catch (error) {
       console.log(error) 
    }
}

const registerUser = async (req, res) => {
    try {
       const {name, email, password} = req.body;
       
       const existingUser = await User.findOne({email});
       if(existingUser){
        return res.status(400).json({message:"Email already registered"})
       }

       const verificationToken = crypto.randomBytes(20).toString("hex")

        const newUser = await User.create({name, email, password, verificationToken})

        if(newUser){
            sendVerificationEmail(newUser.email, newUser.verificationToken)
        }

        res.status(201).json({message:"Registration successful"})
       
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Registration failed"})
    }
}

const verifyEmail = async (req, res) => {
    try {
        const token = req.params.token;

        const user = await User.findOne({verificationToken: token})
        if(!user){
            return res.status(404).json({message:"Invalid verification token"})
        }
        user.verified = true;
        user.verificationToken = undefined
        await user.save()
        res.status(200).json({message: "Email verified sucessfully"})
    } catch (error) {
        res.status(500).json({message: "Email verification failed"})
    }
}

const loginUser = async (req, res) => {
    try {
        const {email, password} = req.body

        const user= await User.findOne({email})
        if(!user){
            return res.status(401).json({message:"Invalid email or password"})
        }

        if(user.password !== password){
            return res.status(401).json({message:"Invalid email or password"})
        }

        const token = jwt.sign({userId:user._id}, process.env.JWT_SECRET_KEY)

        res.status(200).json({token})
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Login failed"})
    }
}

const addAddresses = async (req, res) => {
    try {
        const {userId, address} = req.body;

        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({message:"User not found"})
        }

        user.addresses.push(address)

        await user.save()

        res.status(201).json({message:"Address creeated Successfully"})
    } catch (error) {
        res.status(500).json({message: "Error adding address"})
    }
}

const getAddresses = async (req, res) => {
    try {
        const userId = req.params.userId;

        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({message:"User not found"})
        }

        const addresses = user.addresses;

        res.status(201).json({addresses})
    } catch (error) {
        res.status(500).json({message: "Error retrieving the addresses"})
    }
}

const getUserProfile = async (req, res) => {
    try {
        const userId = req.params.userId;

        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({message:"User not found"})
        }

        res.status(201).json({user})
    } catch (error) {
        res.status(500).json({message: "Error retrieving profile"})
    }
}

const orders = async (req, res) => {
    try {
        const {userId, cartItems, totalPrice, shippingAddress, paymentMethod} = req.body;

        const user = await User.findById(userId)

        if(!user){
            return res.status(404).json({message:"User not found"})
        }

        const products = cartItems.map((item) => ({
            name: item?.title,
            quantity: item?.quantity,
            price: item?.price,
            image: item?.image
        }))

        const order = new Order({
            user:userId,
            products: products,
            totalPrice: totalPrice,
            shippingAddress: shippingAddress,
            paymentMethod: paymentMethod
        })

        await order.save()

        res.status(200).json({message: "Order created successfully"})

    } catch (error) {
        res.status(500).json({message: "Error creating orders"})
    }
}

const getOrders = async (req, res) => {
    try {
        const userId = req.params.userId;

        const orders = await Order.find({user: userId}).populate("user")

        if(!orders || orders.length === 0){
            return res.status(404).json({message:"No orders found"})
        }

        res.status(201).json({orders})
    } catch (error) {
        res.status(500).json({message: "Error retrieving orders"})
    }
}



module.exports = { registerUser, verifyEmail, loginUser, addAddresses, getAddresses, getUserProfile, orders, getOrders }