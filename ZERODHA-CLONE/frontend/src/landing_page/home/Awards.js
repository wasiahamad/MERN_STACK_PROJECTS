import React from 'react';

const Awards = () => {
    return (
        <div className="container mt-5">
            <div className="row">
                <div className='col-6 p-5'>
                    <img src="media/image/largestBroker.svg" alt="award" className='mb-5' />

                </div>
                <div className='col-6 p-5 mt-3'>
                    <h1>Longest stock broker in india</h1>
                    <p className='mb-5'>That's why 1.5+ crore customers trust Zerodha with ₹4.5+ lakh crores of equity investments and contribute to 15% of daily retail exchange volumes in India.</p>
                    <div className='row'>
                        <div className='col-6'>
                            <ul>
                                <li>
                                    <p>Futures and options trading</p>
                                </li>
                                <li>
                                    <p>Commudity derivatives</p>
                                </li>
                                <li>
                                    <p>Current derivatives</p>
                                </li>
                            </ul>
                        </div>
                        <div className='col-6'>
                            <ul>
                                <li>
                                    <p>Stocks & IPOs</p>
                                </li>
                                <li>
                                    <p>Direct mutual funds</p>
                                </li>
                                <li>
                                    <p>Bounds and Govt. securities</p>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <img src='media\image\pressLogos.png' alt="press" style={{width:"90%", marginTop:"20px"}}/>

                </div>
            </div>
        </div>
    );
};

export default Awards;