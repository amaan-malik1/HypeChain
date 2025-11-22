import { useState } from "react";

const Header = ({ account, setAccount }) => {
  const [copied, setCopied] = useState(false);

  /* ---------- WALLET ---------- */
  async function connectHandler() {
    // if (!window.ethereum) return alert("Install MetaMask to continue.");

    // const target = "0x7a69"; // 31337
    // const currentChainId = await window.ethereum.request({ method: "eth_chainId" });

    // if (currentChainId !== target) {
    //   try {
    //     await window.ethereum.request({
    //       method: "wallet_switchEthereumChain",
    //       params: [{ chainId: target }],
    //     });
    //   } catch {
    //     return alert("Switch to Hardhat local network (31337)");
    //   }
    // }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    if (!accounts || !accounts.length) return alert("No MetaMask account found.");
    const account = accounts[0];
    setAccount(account);
  }

  async function copyToClipboard() {
    await navigator.clipboard.writeText(account);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <header className="bg-black/70 backdrop-blur-2xl border-b border-yellow-500/15 shadow-[0_0_25px_rgba(255,215,0,0.05)]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Brand */}
        <h1 className="text-[32px] font-extrabold tracking-[0.25em] text-yellow-400 select-none drop-shadow-[0_0_18px_rgba(255,215,0,0.35)]">
          HYPECHAIN
        </h1>

        <div className="flex items-center gap-4">

          {/* Network Badge */}
          {account && (
            <span className="text-[10px] uppercase tracking-wide bg-emerald-500/15 text-emerald-400 border border-emerald-400/30 px-3 py-1 rounded-full font-medium shadow-[0_0_8px_rgba(16,185,129,0.20)]">
              Hardhat
            </span>
          )}

          {/* Wallet Button */}
          {account ? (
            <button
              onClick={copyToClipboard}
              className="
                flex items-center gap-3
                px-6 py-2.5 rounded-full font-mono text-sm tracking-wide
                bg-neutral-900/70 hover:bg-neutral-800
                border border-yellow-500/20 hover:border-yellow-500/35
                shadow-[0_0_18px_rgba(255,215,0,0.12)]
                transition-all duration-200 active:scale-95
              "
            >
              <span className="text-yellow-300">
                {account.slice(0, 6)}…{account.slice(-4)}
              </span>

              {/* copy or success */}
              {copied ? (
                <svg className="w-4 h-4 text-green-400 animate-pulse" viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-yellow-300" viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16h9a2 2 0 002-2v-5a2 2 0 00-2-2h-1V6a2 2 0 00-2-2H8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          ) : (
            <button
              onClick={connectHandler}
              className="
                px-7 py-2.5 rounded-full text-black font-semibold text-sm tracking-wide
                bg-gradient-to-r from-yellow-400 to-yellow-300
                shadow-[0_0_28px_rgba(255,215,0,0.40)]
                hover:shadow-[0_0_35px_rgba(255,215,0,0.55)]
                transition-all duration-200 active:scale-95
              "
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
