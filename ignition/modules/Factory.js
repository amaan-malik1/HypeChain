// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule }from"@nomicfoundation/hardhat-ignition/modules";
import{ ethers } from "hardhat";

const FEE = ethers.parseUnits("0.01", 18)

export default buildModule("FactoryModule", (m) => {
  // Get parameters
  const fee = m.getParameter("fee", FEE);

  // Define factory
  const factory = m.contract("Factory", [fee]);

  // Return factory
  return { factory };
})