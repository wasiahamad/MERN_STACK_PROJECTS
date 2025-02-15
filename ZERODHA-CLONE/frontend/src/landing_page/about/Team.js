import React from "react";

function Team() {
    return (
        <div className="container">
            <div className="row">
                <h1 className="fs-3 text-center">People</h1>
            </div>

            <div
                className="row p-5 text-muted"
                style={{ lineHeight: "1.8", fontSize: "17px" }}
            >
                <div className="col-6 p-3 text-center">
                    <img
                        src="media\image\nithinKamath.jpg"
                        alt="Hero"
                        style={{ width: "50%", borderRadius: "50%" }}
                    />
                    <p className="mt-5 fs-4">Nithin Kamath</p>
                    <p>Founder, CEO</p>
                </div>
                <div className="col-6 p-3">
                    <p>
                        Nithin bootstrapped and founded Zerodha in 2010 to overcome the
                        hurdles he faced during his decade long stint as a trader. Today,
                        Zerodha has changed the landscape of the Indian broking industry..{" "}
                        <br />
                        <br />
                        He is a member of the SEBI Secondary Market Advisory Committee
                        (SMAC) and the Market Data Advisory Committee (MDAC).
                        <br />
                        <br />
                        Playing basketball is his zen.
                    </p>

                    <p>
                        Connect on {" "} 
                        <a href="https://www.linkedin.com/in/nithinkamath/">LinkedIn</a> 
                        {" / "}
                        <a href="https://twitter.com/nithinkamath">Twitter</a> 
                        {" / "}
                        <a href="https://www.instagram.com/nithinkamath/">Instagram</a>

                    </p>
                </div>
            </div>
        </div>
    );
}

export default Team;
