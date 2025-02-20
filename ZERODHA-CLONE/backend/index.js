require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

// Import models
const { PositionsModel } = require("./model/PositionsModel");
const { HoldingsModel } = require("./model/HoldingsModel"); // Ensure this is pointing to the correct file
const {OrderModel} = require("./model/OrderModel");

const port = process.env.PORT || 3002;
const uri = "mongodb+srv://mdwasia98Zerodha:UCLwK1xnlpBOn1QlZerodha@zerodhaclonecluster.0quer.mongodb.net/zerodhaClone?retryWrites=true&w=majority&appName=ZerodhaCloneCluster";

const app = express();

app.use(cors());
app.use(bodyParser.json());


// Connect to MongoDB

mongoose
    .connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error);
    });

// Define routes for holdings
app.get("/allHoldings", async (req, res) => {
    try {
        const holdings = await HoldingsModel.find({});
        res.json(holdings);
    } catch (error) {
        console.error("Error fetching holdings:", error);
        res.status(500).json({ error: "Error fetching holdings" });
    }
});

// Define routes for positions
app.get("/allPositions", async (req, res) => {
    try {
        const positions = await PositionsModel.find({});
        res.json(positions);
    } catch (error) {
        console.error("Error fetching positions:", error);
        res.status(500).json({ error: "Error fetching positions" });
    }
});

// Define routes for orders
app.post("/newOrder", async (req, res) => {
    let newOrder = new OrderModel({
        name: req.body.name,
        qty: req.body.qty,
        price: req.body.price,
        mode: req.body.mode 
    });

    try {
        await newOrder.save();
        res.json(newOrder);
    } catch (error) {
        console.error("Error saving order:", error);
        res.status(500).json({ error: "Error saving order" });
    }

})

// Define routes for orders

app.listen(port, () => {
    console.log(`Server is running on port ${3002}`);
});
