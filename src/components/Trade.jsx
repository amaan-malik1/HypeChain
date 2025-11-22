import { ethers } from 'ethers';
import React, { useEffect, useRef, useState } from 'react';

const Trade = ({ token, toggleTrade, provider, factory }) => {
  const [target, setTarget] = useState(0);
  const [limit, setLimit] = useState(0);
  const [cost, setCost] = useState(0);

  const amountRef = useRef();

  async function getSaleDetails(token) {
    const target = await factory.TARGET();
    const limit = await factory.TOKEN_LIMIT();
    const cost = await factory.getCost(token.sold);

    setTarget(target);
    setLimit(limit);
    setCost(cost);
  }

  useEffect(() => {
    getSaleDetails(token);
  }, []);

  async function buyHandler(e) {
    e.preventDefault();
    const amount = amountRef.current.value;

    if (!amount || Number(amount) <= 0) {
      alert("Enter a valid amount");
      return;
    }

    // wallet must be connected
    await window.ethereum.request({ method: "eth_requestAccounts" });

    const unitAmount = ethers.parseUnits(amount, 18);
    const costPerToken = await factory.getCost(token.sold);
    const totalCost = costPerToken * BigInt(amount);

    const freshProvider = new ethers.BrowserProvider(window.ethereum);
    const signer = await freshProvider.getSigner();
    const contract = factory.connect(signer);

    const network = await freshProvider.getNetwork();
    if (network.chainId !== 31337n) {
      alert("Switch to Hardhat network (31337)");
      return;
    }


    const tx = await contract.buyToken(
      token.token,
      unitAmount,
      { value: totalCost }
    );

    await tx.wait();
    alert(`You successfully purchased ${amount} ${token.name} tokens`);
    toggleTrade();
  }


  return (
    <div
      className="
        fixed inset-0 z-50 flex justify-center items-center 
        bg-black/80 backdrop-blur-sm
        animate-[fadeIn_0.25s_ease-out]
      "
    >
      {/* MODAL */}
      <div
        className="
          w-[90%] sm:w-[480px]
          bg-black/50 backdrop-blur-2xl
          border border-yellow-500/30
          rounded-3xl px-8 py-7
          shadow-[0_0_40px_rgba(255,215,0,0.18)]
          animate-[scaleIn_0.25s_ease-out]
        "
      >
        {/* Title */}
        <h2 className="text-3xl font-extrabold text-yellow-300 mb-6 text-center tracking-wider">
          Trade {token.name}
        </h2>

        {/* Token Details */}
        <div className="flex flex-col items-center gap-3 text-sm text-neutral-300 mb-7">
          <img
            src={token.image}
            alt="Token"
            className="w-40 h-40 object-cover rounded-2xl shadow-[0_0_20px_rgba(255,215,0,0.2)]"
          />

          <p className="mt-2 font-semibold text-neutral-400">
            Creator:{" "}
            <span className="text-neutral-200">
              {token.creator.slice(0, 5)}…{token.creator.slice(38, 42)}
            </span>
          </p>

          <p>
            Raised:{" "}
            <span className="text-yellow-300 font-semibold">
              {ethers.formatUnits(token.raised, 18)} ETH
            </span>
          </p>

          <p>
            Current Cost:{" "}
            <span className="text-yellow-300 font-semibold">
              {ethers.formatUnits(cost, 18)} ETH
            </span>
          </p>
        </div>

        {/* Buy Form / Target reached */}
        {token.sold >= limit || token.raised >= target ? (
          <p className="text-center text-red-400 font-medium mb-6">
            Target reached — trading closed.
          </p>
        ) : (
          <form onSubmit={buyHandler} className="flex flex-col gap-4 mb-6">
            <input
              ref={amountRef}
              type="number"
              min={1}
              placeholder="Amount (1 - 10000)"
              className="
                bg-black/40 border border-yellow-500/25
                text-yellow-200 placeholder-neutral-500
                rounded-xl px-4 py-2
                focus:outline-none focus:border-yellow-400
                transition-all duration-200
              "
            />

            <button
              type="submit"
              className="
                w-full py-2.5 rounded-xl text-black font-semibold tracking-wide
                bg-gradient-to-r from-yellow-400 to-yellow-300
                shadow-[0_0_18px_rgba(255,215,0,0.26)]
                hover:shadow-[0_0_28px_rgba(255,215,0,0.42)]
                transition-all duration-300 active:scale-95
              "
            >
              Buy
            </button>
          </form>
        )}

        {/* Cancel button */}
        <button
          onClick={toggleTrade}
          className="
            w-full py-2 rounded-xl text-yellow-400 font-medium
            border border-yellow-400/40
            hover:bg-yellow-400/10
            transition-all duration-200 active:scale-95
          "
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default Trade;
