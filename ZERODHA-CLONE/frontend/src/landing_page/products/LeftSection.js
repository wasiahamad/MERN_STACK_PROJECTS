import React from "react";

function LeftSection({
    imgURL,
    productName,
    productDescription,
    tryDemo,
    learnMore,
    googlePlay,
    appStore,
}) {
    return (
        <div className="container mb-5">
            <div className="row">
                <div className="col-6 p-5">
                    <img src={imgURL} alt="hero"/>
                </div>
                <div className="col-6 p-5">
                    <h1>{productName}</h1>
                    <p>{productDescription}</p>
                    <div className="mt-5 d-flex gap-5">
                        <a href={tryDemo} style={{ textDecoration: "none"}}>Try a demo <i className="fa-solid fa-arrow-right"></i></a>
                        <a href={learnMore} style={{ textDecoration: "none"}}>Learn more <i className="fa-solid fa-arrow-right"></i></a>
                    </div>
                    <div className="mt-3 d-flex gap-5">
                        <a href={googlePlay} style={{ textDecoration: "none" }}><img src="media\image\googlePlayBadge.svg" alt="googlePlay" /></a>
                        <a href={appStore} style={{ textDecoration: "none" }}><img src="media\image\appstoreBadge.svg" alt="appStore" /></a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LeftSection;
