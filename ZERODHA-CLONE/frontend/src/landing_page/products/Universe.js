import React from "react";

function Universe() {
    return (
        <div className="container p-5 mt-5">
            <div className="row text-center ">
                <h1 className="mt-5">The Zerodha Universe</h1>
                <p className="mt-3">
                    Extend your trading and investment experience even further with our
                    partner platforms
                </p>

                <div className="col-4 p-3 mt-5">
                    <img src="media\image\smallcaseLogo.png" alt="universe" />
                    <p className="mt-3 text-muted">
                        Thematic investing platform that helps you invest in diversified
                        baskets of stocks on ETFs
                    </p>
                </div>
                <div className="col-4 p-3 mt-5">
                    <img
                        src="media\image\streakLogo.png"
                        alt="universe"
                        style={{ width: "40%" }}
                    />
                    <p className="mt-3 text-muted">
                        Systematic trading platform that allows you to create and backtest
                        strategies without coding.
                    </p>
                </div>
                <div className="col-4 p-3 mt-5">
                    <img
                        src="media\image\zerodhaFundhouse.png"
                        alt="universe"
                        style={{ width: "40%" }}
                    />
                    <p className="mt-3 text-muted">
                        Our asset management venture that is creating simple and transparent
                        index funds to help you save for your goals.
                    </p>
                </div>

                <div className="col-4 p-3 mt-5">
                    <img
                        src="media\image\dittoLogo.png"
                        alt="universe"
                        style={{ width: "28%" }}
                    />
                    <p className="mt-3 text-muted">
                        Personalized advice on life and health insurance. No spam and no
                        mis-selling.
                    </p>
                </div>
                <div className="col-4 p-3 mt-5">
                    <img
                        src="media\image\goldenpiLogo.png"
                        alt="universe"
                        style={{ width: "40%" }}
                    />
                    <p className="mt-3 text-muted">
                        Thematic investing platform that helps you invest in diversified
                        baskets of stocks on ETFs
                    </p>
                </div>
                <div className="col-4 p-3 mt-5">
                    <img
                        src="media\image\sensibullLogo.svg"
                        alt="universe"
                        style={{ width: "40%" }}
                    />
                    <p className="mt-3 text-muted">
                        Thematic investing platform that helps you invest in diversified
                        baskets of stocks on ETFs
                    </p>
                </div>

                <button
                    className="btn btn-primary mb-5 mt-5 p-2 fs-5"
                    style={{ width: "200px", margin: "0 auto" }}
                >
                    Sign up for free
                </button>
            </div>
        </div>
    );
}

export default Universe;
