import React from 'react';

const Education = () => {
    return (
        <div className='container mt-5'>
            <div className='row'>
                <div className='col'>
                    <img src='media\image\education.svg'/>
                </div>
                <div className='col mt-5'>
                    <h1 className='mb-3 fs-2'>Free and open market education</h1>
                    <p className='mt-5'>Varsity, the largest online stock market education book in the world covering everything from the basics to advanced trading.</p>
                    <a className="mx-5" style={{ textDecoration: "none" }}>
                    Varsity
                            <i className="fa-solid fa-arrow-right"></i>
                    </a>
                    <p className='mt-5'>TradingQ&A, the most active trading and investment community in India for all your market related queries.</p>
                    <a className="mx-5" style={{ textDecoration: "none" }}>
                    TradingQ&A
                            <i className="fa-solid fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Education;