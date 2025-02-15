import React from "react";

function Hero() {
    return (
        <div className="container p-5">
            <div className="text-center p-3">
                <h1 className="mt-5">Charges</h1>
                <p className="mt-3 text-muted fs-5">List of all charges and taxes</p>
            </div>
            <div className="row text-center mt-5">
                <div className="col-4 p-3 mt-5">
                    <img src="media\image\pricing0.svg" alt="universe" />
                    <h2>Free equity delivery</h2>
                    <p className="mt-3 text-muted">
                        All equity delivery investments (NSE, BSE), are absolutely free — ₹
                        0 brokerage.
                    </p>
                </div>

                <div className="col-4 p-3 mt-5">
                    <img src="media\image\intradayTrades.svg" alt="universe" />
                    <h2>Intraday and F&O trades</h2>
                    <p className="mt-3 text-muted">
                        Flat ₹ 20 or 0.03% (whichever is lower) per executed order on
                        intraday trades across equity, currency, and commodity trades. Flat
                        ₹20 on all option trades.
                    </p>
                </div>

                <div className="col-4 p-3 mt-5">
                    <img src="media\image\pricing0.svg" alt="universe" />
                    <h2>Free direct MF</h2>
                    <p className="mt-3 text-muted">
                        All direct mutual fund investments are absolutely free — ₹ 0
                        commissions & DP charges.
                    </p>
                </div>
            </div>
        </div>
        
    );
}

export default Hero;
