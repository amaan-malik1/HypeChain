import { ethers } from 'ethers'
import React, { useRef } from 'react'

const List = ({ toggleCreate, fee, provider, factory }) => {
  const nameRef = useRef()
  const tickerRef = useRef()

  //handler function  for token data
  async function listHandler() {
    const name = nameRef.current.value;
    const ticker = tickerRef.current.value;
    if (!name || !ticker) {
      return alert("both name and ticker is required!");
    };

    // sign the transation
    const singer = await provider.getSigner();
    const transation = await factory.connect(singer).create(name, ticker, { value: fee });
    await transation.wait();

    alert(`token created. with ${name} and symbol ${ticker}`);
  }

  return (
    <div className='list'>
      <h2>List new Token </h2>
      <div className='list_description'>
        <p>fee: {ethers.formatUnits(fee, 18)} ETH</p>
      </div>

      <form action={listHandler}>
        <input required ref={nameRef} type="text" name='name' placeholder='Name' />
        <input required ref={tickerRef} type="text" name='ticker' placeholder='ticker' />
        <input type="submit" value='[List]' />
      </form>

      <button onClick={toggleCreate} className='btn--fancy'> [Cancel]</button>
    </div>
  )
}

export default List
