import { ethers } from 'ethers'
import React from 'react'

const Token = ({ token, toggleTrade }) => {
    return (
        <div>
            <button onClick={() => { toggleTrade(token) }} className="token">
                <div className="token__details">
                    <img src={token.image} alt="Token Img" />
                    <p>Created by: {token.creator.slice(0, 5) + "...." + token.creator.slice(38, 42)}</p>
                    <p>Market cap: {ethers.formatUnits(token.raised, 18)} ETH</p>
                    <p className='name'>{token.name}</p>
                </div>
            </button>

        </div>
    )
}

export default Token
