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
      // make sure wallet is connected
      await window.ethereum.request({ method: "eth_requestAccounts" });

      // ALWAYS reinitialize provider & signer before transaction (ethers v6)
      const freshProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await freshProvider.getSigner();

      // connect factory to signer (this replaces factoryWithSigner)
      const contract = factory.connect(signer);

      // send transaction
      const tx = await contract.create(name, ticker, { value: fee });
      await tx.wait();

      alert(`Token created successfully: ${name} (${ticker})`);
      toggleCreate();

    } catch (error) {
      console.error("Error creating token:", error);
      alert("Transaction failed! Check console for details.");
    }
  }


  return (
    <div
      className="
        fixed inset-0 z-50 flex justify-center items-center
        bg-black/80 backdrop-blur-sm
        animate-[fadeIn_0.25s_ease-out]
      "
    >
      <div
        className="
          w-[90%] sm:w-[450px]
          bg-black/55 backdrop-blur-2xl
          border border-yellow-500/25
          rounded-3xl px-8 py-8
          shadow-[0_0_40px_rgba(255,215,0,0.16)]
          animate-[scaleIn_0.25s_ease-out]
        "
      >
        {/* Title */}
        <h2 className="text-3xl font-extrabold text-yellow-300 mb-6 text-center tracking-wider">
          List a New Token
        </h2>

        {/* Fee */}
        <p className="text-center text-neutral-300 mb-6 text-sm">
          Listing Fee:{" "}
          <span className="text-yellow-300 font-semibold">
            {ethers.formatUnits(fee, 18)} ETH
          </span>
        </p>

        {/* Form */}
        <form onSubmit={listHandler} className="flex flex-col gap-4">
          <input
            ref={nameRef}
            type="text"
            placeholder="Token Name"
            className="
              bg-black/40 border border-yellow-500/25
              text-yellow-200 placeholder-neutral-600
              rounded-xl px-4 py-2 focus:border-yellow-400
              focus:outline-none transition-all
            "
            required
          />
          <input
            ref={tickerRef}
            type="text"
            placeholder="Token Symbol"
            className="
              bg-black/40 border border-yellow-500/25
              text-yellow-200 placeholder-neutral-600 uppercase
              rounded-xl px-4 py-2 focus:border-yellow-400
              focus:outline-none transition-all
            "
            required
          />

          <button
            type="submit"
            className="
              w-full py-3 rounded-xl text-black font-semibold tracking-wide
              bg-gradient-to-r from-yellow-400 to-yellow-300
              shadow-[0_0_20px_rgba(255,215,0,0.28)]
              hover:shadow-[0_0_30px_rgba(255,215,0,0.42)]
              transition-all duration-300 active:scale-95
            "
          >
            Create Token
          </button>
        </form>

        {/* Cancel */}
        <button
          onClick={toggleCreate}
          className="
            w-full mt-4 py-2 rounded-xl text-yellow-400
            border border-yellow-500/35
            hover:bg-yellow-500/10 active:scale-95
            transition-all duration-200
          "
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default List;
