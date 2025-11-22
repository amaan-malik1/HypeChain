import { ethers } from "ethers";
import React from "react";

const Token = ({ token, toggleTrade }) => {
  return (
    <div
      onClick={() => toggleTrade(token)}
      className="
        group cursor-pointer
        bg-black/40 backdrop-blur-xl
        border border-yellow-500/20
        rounded-3xl overflow-hidden
        p-5
        shadow-[0_0_20px_rgba(0,0,0,0.6)]
        transition-all duration-300
        hover:-translate-y-2
        hover:shadow-[0_0_35px_rgba(255,215,0,0.20)]
        hover:border-yellow-400/40
      "
    >
      {/* Image */}
      <div className="relative mb-5">
        <img
          src={token.image}
          alt={token.name}
          className="
            rounded-2xl w-full h-44 object-cover
            transition-all duration-300
            group-hover:scale-105
          "
        />

        {/* Glow overlay */}
        <div
          className="
            absolute inset-0 rounded-2xl bg-yellow-400/0 
            group-hover:bg-yellow-400/5
            transition-all duration-300
          "
        />
      </div>

      {/* Token Name */}
      <h3 className="text-2xl font-extrabold tracking-wide text-yellow-300 drop-shadow-[0_0_8px_rgba(255,215,0,0.25)]">
        {token.name}
      </h3>

      {/* Amount Raised */}
      <p className="text-neutral-400 mt-2 text-sm">
        Market Cap:{" "}
        <span className="text-yellow-300 font-semibold">
          {ethers.formatUnits(token.raised, 18)} ETH
        </span>
      </p>

      {/* Creator */}
      <p className="text-neutral-500 text-sm mt-2">
        Creator:{" "}
        <span className="text-neutral-300 font-medium">
          {token.creator.slice(0, 5) + "...." + token.creator.slice(38, 42)}
        </span>
      </p>

      {/* CTA */}
      <button
        className="
          w-full mt-6 py-2.5 rounded-xl
          bg-gradient-to-r from-yellow-400 to-yellow-300
          text-black font-semibold tracking-wide
          border border-yellow-500/30
          shadow-[0_0_18px_rgba(255,215,0,0.25)]
          transition-all duration-300
          group-hover:shadow-[0_0_25px_rgba(255,215,0,0.45)]
          group-hover:brightness-110
          active:scale-95
        "
      >
        Trade
      </button>
    </div>
  );
};

export default Token;
