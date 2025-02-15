import React from "react";

function Hero() {
    return (
        <div className="container p-5 mb-5 border-bottom">
            <div className="text-center p-5 mt-5">
            <h1>Zerodha Products</h1>
            <h3 className="mt-3 text-muted fs-4">Sleek, modern, and intuitive trading platforms</h3>
            <p className="mt-3 text-muted">
                Check out our{" "}
                <a href="https://www.zerodha.com/products" style={{ textDecoration: "none" }}> investment offerings</a>{" "}
                <i className="fa-solid fa-arrow-right"></i>{" "}
            </p>
            </div>
        </div>
    );
}

export default Hero;
