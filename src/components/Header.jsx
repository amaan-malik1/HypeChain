import { ethers } from 'ethers';
import { Wallet } from 'lucide-react';

const Header = ({ account, setAccount }) => {
    async function connectHandle() {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = ethers.getAddress(accounts[0]);
        setAccount(account);
    }

    return (
        <header className="flex justify-between items-center bg-gradient-to-r from-gray-900 via-black to-gray-900 text-yellow-400 px-6 py-4 shadow-lg border-b border-yellow-400/30 backdrop-blur-md">
            {/* Brand */}
            <div className="flex items-center gap-2">
                <Wallet className="w-6 h-6 text-yellow-400 animate-pulse" />
                <h1 className="text-2xl font-extrabold tracking-widest hover:text-yellow-300 transition-colors duration-200">
                    HypeChain
                </h1>
            </div>

            {/* Wallet Button */}
            {account ? (
                <button
                    className="bg-yellow-400/10 text-yellow-300 font-semibold px-4 py-2 rounded-xl border border-yellow-400/40 hover:bg-yellow-400/20 transition-all duration-200"
                    title={account}
                >
                    {account.slice(0, 5) + '....' + account.slice(38, 42)}
                </button>
            ) : (
                <button
                    onClick={connectHandle}
                    className="bg-yellow-400 text-black font-semibold px-6 py-2 rounded-xl shadow-lg hover:bg-yellow-300 active:scale-95 transition-all duration-200"
                >
                    Connect Wallet
                </button>
            )}
        </header>
    );
};

export default Header;
