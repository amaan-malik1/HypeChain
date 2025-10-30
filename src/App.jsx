import { ethers } from 'ethers'
import { useEffect, useState } from 'react';

import Header from './components/Header'
import List from './components/List';

//contract things
import config from './config.json';
import Factory from './abis/Factory.json';
import images from './images.json';

function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState("");
  const [factory, setFactory] = useState(true);
  const [fee, setFee] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [tokens, setTokens] = useState([]);


  async function loadBloackchainData() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    setProvider(provider);

    const network = await provider.getNetwork();

    const factory = new ethers.Contract(
      config[network.chainId]?.factory.address,
      Factory,
      provider
    );

    setFactory(factory);

    const fee = await factory.fee();
    setFee(fee);

    const totalToken = await factory.totalToken();
    console.log("Total Token created till now:", totalToken.toString());

    //get all the tokens data from the contract
    const tokens = [];

    for (let i = 0; i < totalToken; i++) {
      if (i >= 6) {
        break;
      }



      const tokenSale = await factory.getTokenSale(i);
      const tokenDetails = {
        token: tokenSale.token,
        name: tokenSale.name,
        creator: tokenSale.creator,
        sold: tokenSale.sold,
        raised: tokenSale.raised,
        isOpen: tokenSale.isOpen,
        image: images[i]
      }
      //pushing the token details into the "tokens array"
      tokens.push(tokenDetails);
    }

    //reversing the tokens array to get the most recent token created
    setTokens(tokens.reverse());
  }

  useEffect(() => {
    loadBloackchainData();
  }, []);

  async function toggleCreate() {
    showCreate ? setShowCreate(false) : setShowCreate(true);
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-yellow-400 transition-all duration-700">
      {/* Header Component */}
      <Header account={account} setAccount={setAccount} />

      {/* Example placeholder section for debugging */}
      <main className="flex flex-col items-center justify-center mt-10 space-y-3">

        <h2 className="text-3xl font-bold tracking-wide">Welcome to HypeChain</h2>

        {/* Create your own hype campaigns and let the world back your ideas! */}
        <div className="flex flex-col items-center">
          <button onClick={factory && toggleCreate} className='btn--fancy'>
            {!factory ? (
              "Contract not deployed yet"
            ) : (
              !account ? (
                "Please connect first"
              ) : (
                "Start a new Token"
              )
            )}
          </button>
        </div>

        <div className='listing'>
          <h2>New Listings Here</h2>
          <div className='tokens'>
            {!account ? (
              <p>Connect wallet</p>
            ) : (
              tokens.length === 0 ? (
                <p> No token listed yet</p>
              ) : (
                tokens.map((token, index) => {
                  <Token key={index} token={token} toggleTrade={() => { }} />
                })
              )
            )}

          </div>
        </div>
      </main>

      {/* list the token */}
      {
        showCreate && (
          <List toggleCreate={toggleCreate} fee={fee} provider={provider} factory={factory} />
        )
      }


    </div>
  )
};

export default App

