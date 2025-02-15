import React from 'react';

function RightSection({
    imgURL,
    productName,
    productDescription,
    learnMore
}) {
    return ( 
        <div className="container">
            <div className="row ">
                <div className="col-6 d-flex flex-column justify-content-center ">
                    <h1>{productName}</h1>
                    <p>{productDescription}</p>
                    <div>
                        <a href={learnMore} style={{ textDecoration: "none"}}>Learn more <i className="fa-solid fa-arrow-right"></i></a>
                    </div>
                    
                </div>

                <div className="col-6">
                    <img src={imgURL} alt="hero"  />
                </div>
            </div>
        </div>
     );
}

export default RightSection;