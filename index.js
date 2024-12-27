const express = require("express")
const mongoose = require("mongoose")
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors')
const { registerUser, verifyEmail, loginUser, addAddresses, getAddresses, orders, getUserProfile, getOrders } = require("./controllers/userController")

const app = express()
const port = 5000;

app.use(cors())

app.use(express.json());
app.use(express.urlencoded({extended: true}))

mongoose.connect("mongodb+srv://frankzeal33:cA8X4euxTzzX3j0J@ecommerce.o9yju.mongodb.net/ecommerce").then(() => {
    console.log("connected to MongoDB")
}).catch((error) => {
    console.log("Error connecting to MongoDB", error)
})

app.post("/register", registerUser)
app.get("/verify/:token", verifyEmail)
app.post("/login", loginUser)
app.post("/addresses", addAddresses)
app.get("/addresses/:userId", getAddresses)
app.post("/orders", orders)
app.get("/profile/:userId", getUserProfile)
app.get("/orders/:userId", getOrders)

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})


