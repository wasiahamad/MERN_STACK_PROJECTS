const {Schema, model} = require('mongoose');

const OrderSchema = new Schema({
    name: String,   
    qty: Number,
    price: Number,
    model: String,
});

module.exports = {OrderSchema};