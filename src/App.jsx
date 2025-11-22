import { ethers } from 'ethers'
import { useEffect, useState } from 'react';

import Header from './components/Header';
import List from './components/List';
import Trade from './components/Trade';
import Token from './components/Token';

import config from './config.json';
import Factory from './abis/Factory.json';
import images from './images.json';

function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState("");
  const [factory, setFactory] = useState(null);
  const [fee, setFee] = useState(0);
  const [tokens, setTokens] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showTrade, setShowTrade] = useState(false);
  const [token, setToken] = useState([]);

  const toggleCreate = () => setShowCreate(prev => !prev);
  const toggleTrade = (token) => {
    setToken(token);
    setShowTrade(prev => !prev);
  };

  /* ------------ Load Blockchain ------------ */
  async function loadBlockchainData() {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);

      const network = await provider.getNetwork();
      const chainId = network.chainId.toString();

      if (!config[chainId]) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x7A69" }],
          });
        } catch (err) {
          alert("Switch MetaMask to Hardhat (31337): " + err.message);
        }
        return;
      }

      const factory = new ethers.Contract(
        config[network.chainId].factory.address,
        Factory,
        provider
      );
      setFactory(factory);

      const fee = await factory.fee();
      setFee(fee);

      const total = await factory.totalTokens();
      const arr = [];

      for (let i = 0; i < total && i < 6; i++) {
        const t = await factory.getTokenSale(i);
        arr.push({
          token: t.token,
          name: t.name,
          creator: t.creator,
          sold: t.sold,
          raised: t.raised,
          isOpen: t.isOpen,
          image: images[i] || null,
        });
      }

      setTokens(arr.reverse());
    } catch (error) {
      console.error("Blockchain load failed →", error);
    }
  }

  useEffect(() => {
    loadBlockchainData();
  }, [showCreate, showTrade]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#050505] to-black text-yellow-400">

      {/* HEADER */}
      <Header account={account} setAccount={setAccount} />

      {/* HERO SECTION */}
      <main className="flex flex-col items-center pt-20 px-6 text-center">
        <h2 className="text-4xl sm:text-5xl font-extrabold drop-shadow-[0_0_16px_rgba(255,215,0,0.20)]">
          Welcome to <span className="text-yellow-300">HypeChain</span>
        </h2>

        <p className="max-w-2xl mt-4 text-neutral-300 text-base leading-relaxed">
          Your gateway to premium token launches — create, list, and trade live tokens through smart contracts.
        </p>

        <button
          onClick={factory && account ? toggleCreate : undefined}
          className={`
            mt-8 px-8 py-3 rounded-2xl font-semibold tracking-wide text-black
            bg-gradient-to-r from-yellow-400 to-yellow-300
            shadow-[0_0_25px_rgba(255,215,0,0.30)]
            hover:shadow-[0_0_35px_rgba(255,215,0,0.45)]
            transition-all duration-300 active:scale-95
            ${(!factory || !account) && "opacity-35 cursor-not-allowed shadow-none hover:shadow-none"}
          `}
        >
          {!factory
            ? "Contract Not Deployed"
            : !account
              ? "Connect Wallet to Start"
              : "Start a New Token"}
        </button>
      </main>

      {/* LISTINGS */}
      <section className="max-w-7xl mx-auto px-6 pb-24 pt-20">
        <h2 className="text-3xl font-bold mb-10 tracking-wide">Latest Listings</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {!account ? (
            <p className="col-span-full text-center text-neutral-400">
              Connect your wallet to view marketplace
            </p>
          ) : tokens.length === 0 ? (
            <p className="col-span-full text-center text-neutral-400">
              No tokens listed yet. Be the first!
            </p>
          ) : (
            tokens.map((t, i) => (
              <Token key={i} token={t} toggleTrade={toggleTrade} />
            ))
          )}
        </div>
      </section>

      {/* CREATE MODAL */}
      {showCreate && factory && provider && (
        <List toggleCreate={toggleCreate} fee={fee} provider={provider} factory={factory} />
      )}

      {/* TRADE MODAL */}
      {showTrade && (
        <Trade toggleTrade={toggleTrade} token={token} factory={factory} provider={provider} />
      )}
    </div>
  );
}

export default App;
