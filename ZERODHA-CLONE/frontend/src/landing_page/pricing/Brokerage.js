import React from 'react';

function Brokerage() {
    return (
        <div className="container mb-5">
            <div className="row">
                <div className="col-8 p-5">
                    <img src="media\image\kite.png" alt="brokerage" className='mb-5' />
                </div>
                <div className="col-4 p-5 mt-3">
                    <h1>Brokerage</h1>
                    <p>Flat ₹ 20 or 0.03% (whichever is lower) per executed order on intraday trades across equity, currency, and commodity trades. Flat ₹20 on all option trades.</p>
                    <div className="mt-3 d-flex gap-5">
                        <a href="#" style={{ textDecoration: "none" }}><img src="media\image\googlePlayBadge.svg" alt="googlePlay" /></a>
                        <a href="#" style={{ textDecoration: "none" }}><img src="media\image\appstoreBadge.svg" alt="appStore" /></a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Brokerage;