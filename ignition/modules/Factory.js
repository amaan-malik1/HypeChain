// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("FactoryModule", (m) => {
  // Use plain string for 0.01 ETH fee (in wei)
  const fee = m.getParameter("fee", "10000000000000000"); // 0.01 ETH

  // Deploy Factory with the fee argument
  const factory = m.contract("Factory", [fee]);

  // Return the deployed contract instance
  return { factory };
});
