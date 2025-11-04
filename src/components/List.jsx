import { ethers } from 'ethers';
import React, { useRef } from 'react';

const List = ({ toggleCreate, fee, provider, factory }) => {
  const nameRef = useRef();
  const tickerRef = useRef();

  async function listHandler(e) {
    e.preventDefault();

    const name = nameRef.current.value.trim();
    const ticker = tickerRef.current.value.trim();

    if (!name || !ticker) {
      alert("Both name and ticker are required!");
      return;
    }

    if (!factory || !provider) {
      alert("Blockchain not ready. Please wait or reconnect wallet.");
      return;
    }

    try {
      const signer = await provider.getSigner();
      const factoryWithSigner = factory.connect(signer);

      const tx = await factoryWithSigner.create(name, ticker, { value: fee });
      await tx.wait();

      alert(`✅ Token created successfully: ${name} (${ticker})`);
      toggleCreate();
    } catch (error) {
      console.error("❌ Error creating token:", error);
      alert("Transaction failed! Check console for details.");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-gray-900 text-yellow-400 rounded-2xl shadow-2xl p-8 w-[90%] sm:w-[400px] border border-yellow-400/30">
        <h2 className="text-2xl font-bold mb-4 text-center">List New Token</h2>

        <div className="text-center mb-4 text-sm opacity-80">
          <p>Listing Fee: <span className="font-semibold">{ethers.formatUnits(fee, 18)} ETH</span></p>
        </div>

        <form onSubmit={listHandler} className="flex flex-col gap-3">
          <input
            ref={nameRef}
            type="text"
            placeholder="Token Name"
            className="bg-gray-800 border border-yellow-400/30 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            required
          />
          <input
            ref={tickerRef}
            type="text"
            placeholder="Token Symbol"
            className="bg-gray-800 border border-yellow-400/30 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 uppercase"
            required
          />
          <button
            type="submit"
            className="bg-yellow-400 text-black font-semibold rounded-lg py-2 mt-2 hover:bg-yellow-300 active:scale-95 transition-all"
          >
            List Token
          </button>
        </form>

        <button
          onClick={toggleCreate}
          className="mt-4 w-full border border-yellow-400/40 text-yellow-300 py-2 rounded-lg hover:bg-yellow-400/10 transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default List;
