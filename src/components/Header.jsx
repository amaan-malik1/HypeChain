import { ethers } from 'ethers';
import React from 'react'

const Header = ({ account, setAccount }) => {
    async function connectHandle() {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = ethers.getAddress(accounts[0]);
        setAccount(account);
    }


    return (
        <div className='flex justify-between items-center text-yellow-400 px-3 py-6 w-full h-full'>
            <span className='brand'>HypeChain</span>
            {account ? (
                <button>[{account.slice(0, 5) + "...." + account.slice(38, 42)}]</button>
            ) : (
                <button onClick={connectHandle}>
                    [connect]
                </button>
            )}
        </div>
    )
}

export default Header
