import React from "react";

const Stats = () => {
    return (
        <div>
            <div className="container p-5">
                <div className="row p-5">
                    <div className="col-6 p-5">
                        <h2 className="fs-2">Trust with confidence</h2>
                        <div className="mt-5">
                            <h3 className="fs-4">Customer-first always</h3>
                            <p className="text-muted">
                                That's why 1.5+ crore customers trust Zerodha with ₹4.5+ lakh
                                crores of equity investments and contribute to 15% of daily
                                retail exchange volumes in India.
                            </p>
                        </div>
                        <div className="mt-4">
                            <h3 className="fs-4">No spam or gimmicks</h3>
                            <p className="text-muted">
                                No gimmicks, spam, "gamification", or annoying push
                                notifications. High quality apps that you use at your pace, the
                                way you like.
                            </p>
                        </div>
                        <div className="mt-4">
                            <h3 className="fs-4">The Zerodha universe</h3>
                            <p className="text-muted">
                                Not just an app, but a whole ecosystem. Our investments in 30+
                                fintech startups offer you tailored services specific to your
                                needs.
                            </p>
                        </div>
                        <div className="mt-4">
                            <h3 className="fs-4">Do better with money</h3>
                            <p className="text-muted">
                                With initiatives like Nudge and Kill Switch, we don't just
                                facilitate transactions, but actively help you do better with
                                your money.
                            </p>
                        </div>
                    </div>
                    <div className="col-6">
                        <img
                            src="media/image/ecosystem.png"
                            alt="Stats"
                            style={{ width: "100%" }}
                        />
                        <a className="mx-5" style={{ textDecoration: "none" }}>
                            Explore our products <i className="fa-solid fa-arrow-right"></i>
                        </a>
                        <a className="mx-5" style={{ textDecoration: "none" }}>
                            Try Kite demo
                            <i className="fa-solid fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Stats;
