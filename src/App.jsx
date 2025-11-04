import { ethers } from 'ethers'
import { useEffect, useState } from 'react';

import Header from './components/Header'
import List from './components/List';
import Trade from './components/Trade';
import Token from './components/Token';


//contract things
import config from './config.json';
import Factory from './abis/Factory.json';
import images from './images.json';

function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [factory, setFactory] = useState(null);
  const [fee, setFee] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [tokens, setTokens] = useState([]);
  const [showTrade, setShowTrade] = useState(false);
  const [token, setToken] = useState([]);



  async function toggleCreate() {
    showCreate ? setShowCreate(false) : setShowCreate(true);
  }

  async function toggleTrade(token) {
    // when the token get set the modal will pop-up
    setToken(token);
    showTrade ? setShowTrade(false) : setShowTrade(true);
  }

  async function loadBlockchainData() {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask!");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);

      const network = await provider.getNetwork();
      console.log("Network:", network);

      // Convert BigInt chainId to string for JSON lookup
      const chainId = network.chainId.toString();
      console.log("Chain ID:", chainId);

      // If chain not in config → prompt user to switch
      if (!config[chainId]) {
        console.error(`No config found for chain ID ${chainId}`);

        // Try auto-switch to Hardhat network (31337)
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x7A69" }], // 31337 in hex
          });
        } catch (err) {
          alert("Please switch MetaMask to Hardhat network (chainId: 31337)");
        }

        return;
      }

      // Load Factory contract
      const factoryAddress = config[chainId].factory.address;
      console.log("Factory Address:", factoryAddress);

      const factory = new ethers.Contract(factoryAddress, Factory.abi, provider);
      setFactory(factory);
      console.log("Factory contract instance created ✅");

      // Load fee and tokens
      const fee = await factory.fee();
      setFee(fee);

      const totalToken = await factory.totalToken();
      console.log("Total tokens created:", totalToken.toString());

      const tokensAll = [];

      // Load up to 6 tokens
      for (let i = 0; i < totalToken; i++) {
        if (i >= 6) break;

        const tokenSale = await factory.getTokenSale(i);

        const tokenDetails = {
          token: tokenSale.token,
          name: tokenSale.name,
          creator: tokenSale.creator,
          sold: tokenSale.sold,
          raised: tokenSale.raised,
          isOpen: tokenSale.isOpen,
          image: images[i] || null,
        };

        tokensAll.push(tokenDetails);
      }

      setTokens(tokensAll.reverse());
    } catch (error) {
      console.error("❌ Error loading blockchain data:", error);
    }
  }


  useEffect(() => {
    loadBlockchainData();
  }, [showCreate, showTrade]);



  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-yellow-400 transition-all duration-700">
      {/* Header Component */}
      <Header account={account} setAccount={setAccount} />

      {/* Token showcasing component */}
      <main className="flex flex-col items-center justify-center mt-10 space-y-3">
        <h2 className="text-3xl font-bold tracking-wide">Welcome to HypeChain </h2>

        {/* Create your own hype campaigns and let the world back your ideas! */}
        <div className="create">
          <button onClick={factory && toggleCreate} className='btn--fancy'>
            {!factory ? (
              "[ Contract not deployed ]"
            ) : (
              !account ? (
                "[ Please connect ]"
              ) : (
                "[ Start a new Token ]"
              )
            )}
          </button>
        </div>

        <div className='listing'>
          <h2>New Listings</h2>

          <div className='tokens'>
            {!account ? (
              <p>Please Connect wallet</p>
            ) : (
              tokens.length === 0 ? (
                <p> No token listed yet</p>
              ) : (
                tokens.map((token, index) => {
                  return <Token key={index} token={token} toggleTrade={toggleTrade} />;
                })
              )
            )}

          </div>
        </div>
      </main>

      {/* listing components for the token */}
      {
        showCreate && factory && provider && (
          <List toggleCreate={toggleCreate} fee={fee} provider={provider} factory={factory} />
        )
      }

      {/* show the trade for the token */}
      {
        showTrade && (
          <Trade toggleTrade={toggleTrade} token={token} factory={factory} provider={provider} />
        )
      }


    </div>
  )
};

export default App

