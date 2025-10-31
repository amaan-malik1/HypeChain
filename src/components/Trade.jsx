import { ethers } from 'ethers';
import React, { useEffect, useRef, useState } from 'react'

const Trade = ({ token, toggleTrade, provider, factory }) => {
  const [target, setTarget] = useState(0);
  const [limit, setLimit] = useState(0);
  const [cost, setCost] = useState(0);

  const amountRef = useRef();

  async function getSaleDetails(token) {
    const target = await factory.TARGET();
    const limit = await factory.LIMIT_TOKEN();
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

    const cost = await factory.getCost(token.sold);
    const totalCost = cost * BigInt(amount);

    const signer = await provider.getSigner(signer);
    const transation = await factory.connnect(signer).buy(
      token.token,
      ethers.parseUnits(amount, 18),
      { value: totalCost }
    )

    await transation.wait();
    alert(`You have successfully purchased ${amount} ${token.symbol} tokens`);

    toggleTrade();
  }

  return (
    <div className='trade'>
      <h2>Trade</h2>
      <div className='token__details'>
        <p className='name'>{token.name}</p>
        <p>Creator: {token.creator.slice(0, 5) + "...." + token.creator.slice(38, 42)}</p>
        <img src={token.image} alt="Token Img" width={256} height={256} />
        <p>Market cap:{ethers.formatUnits(token.raised, 18)} ETH</p>
        <p>Base Cost:{ethers.formatUnits(token.cost, 18)} ETH</p>
      </div>

      {token.sold >= limit || token.raised >= target ? (
        <p className="disclaimer">Target reached!</p>
      ) : (
        <form action={buyHandler}>
          <input ref={amountRef} type="number" name='amount' min={1} max={10000} placeholder='1' />
          <input type="submit" value={"[ Buy ]"} />
        </form>
      )}
      <button onClick={toggleTrade} className='btn--fancy'>[ Cancel ]</button>
    </div>
  )
}

export default Trade

