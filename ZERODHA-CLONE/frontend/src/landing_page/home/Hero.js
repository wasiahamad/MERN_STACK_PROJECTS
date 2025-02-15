import React from 'react';

const Hero = () => {
    return (
        <div className="container p-5 mb-5">
            <div className="row text-center">
                <img src="media/image/homeHero.png" alt="Hero" className='mb-5' />
                <h1 className='mt-5'>Invest in everything</h1>
                <p>Online Plateform to invest in stock, derivatives, mutual funds and more.. </p>
                <button style={{"width": "200px", "margin": "0 auto"}} className="btn btn-primary mt-5 p-2 fs-5">Get Started</button>
            </div>
        </div>
    );
};

export default Hero;