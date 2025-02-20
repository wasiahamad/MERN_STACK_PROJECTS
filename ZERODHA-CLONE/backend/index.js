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

// Define routes for post orders
app.post("/newOrder", async (req, res) => {
    try {
        const order = await OrderModel.create(req.body);
        res.json(order);
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ error: "Error creating order" });
    }
}); 

app.get("/allOrders", async (req, res) => {
    try {
        const orders = await OrderModel.find({});
        res.json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ error: "Error fetching orders" });
    }
});

    


// Define routes for orders

app.listen(port, () => {
    console.log(`Server is running on port ${3002}`);
});
