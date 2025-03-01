import React from "react";
import { Link } from "react-router-dom";

const Orders = () => {
  return (
    <div className="orders">
      <div className="no-orders">
        

       
        <p>You haven't placed any orders today</p>

        <Link to={"https://investx-bo4d.onrender.com/allOrders"} className="btn" onClick={() => { window.location.href = "https://investx-bo4d.onrender.com/allOrders" }}>
          Get started
        </Link>
      </div>
    </div>
  );
};

export default Orders;