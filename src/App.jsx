import { ethers } from 'ethers'

import Header from './components/Header'
import { useEffect, useState } from 'react';
function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState("");

  async function loadBloackchianData() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    setProvider(provider);

  }
  useEffect(() => {
    loadBloackchianData();
  }, [])


  return (
    <div className='bg-black'>
      <Header account={account} setAccount={setAccount} />
    </div>
  )
}

export default App
