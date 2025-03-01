import React, { useState } from "react";
import { Link } from "react-router-dom";

import axios from "axios";

import GeneralContext from "./GeneralContext";
// import envirment from "../envirment";

import "./BuyActionWindow.css";

const BuyActionWindow = ({ uid }) => {
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState(0.0);
   

  const /* `handleBuyClick` is a function that is triggered when the "Buy" button is clicked. Inside
  this function, an HTTP POST request is made to the specified URL
  (`https://investx-bo4d.onrender.com/newOrder`) with the data including the user ID (`uid`),
  stock quantity (`stockQuantity`), stock price (`stockPrice`), and the mode set to "BUY".
  After the POST request is sent, the `GeneralContext.closeBuyWindow()` function is called to
  close the buy action window. */
  handleBuyClick = (e) => {
    axios.post(`https://investx-bo4d.onrender.com/newOrder`, {
      name:  uid,
      qty: stockQuantity,
      price: stockPrice,
      mode: "BUY",
    });

    GeneralContext.closeBuyWindow();
  };

  const handleSellClick = () => {
    axios.post( `https://investx-bo4d.onrender.com/newOrder`, {
      name: uid,
      qty: stockQuantity,
      price: stockPrice,
      mode: "SELL",
    });

    GeneralContext.closeBuyWindow();
  };

  const handleCancelClick = () => {
    GeneralContext.closeBuyWindow();
  };

  return (
    <div className="container" id="buy-window" draggable="true">
      <div className="regular-order">
        <div className="inputs">
          <fieldset>
            <legend>Qty.</legend>
            <input
              type="number"
              name="qty"
              id="qty"
              onChange={(e) => setStockQuantity(e.target.value)}
              value={stockQuantity}
            />
          </fieldset>
          <fieldset>
            <legend>Price</legend>
            <input
              type="number"
              name="price"
              id="price"
              step="0.05"
              onChange={(e) => setStockPrice(e.target.value)}
              value={stockPrice}
            />
          </fieldset>
        </div>
      </div>

      <div className="buttons">
        <span>Margin required ₹140.65</span>
        <div>
          <Link to="orders" className="btn btn-blue" onClick={handleBuyClick}>
            Buy
          </Link>
          <Link className="btn btn-grey" onClick={handleSellClick}>
            Sell
          </Link>
          <Link to="" className="btn btn-grey" onClick={handleCancelClick}>
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BuyActionWindow;