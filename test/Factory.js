import pkg from "hardhat";
const { ethers } = pkg;

import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";


describe("Factory", function () {
  async function deployFactoryFixture() {
    const [owner, creator, buyer] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("Factory");
    const factory = await Factory.deploy();
    await factory.waitForDeployment();

    const fee = await factory.fee();

    // create token
    const tx = await factory
      .connect(creator)
      .createToken("Test Token", "TTK", { value: fee });
    await tx.wait();

    const tokenAddr = (await factory.tokens(0)).toString();
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.attach(tokenAddr);

    return { factory, token, owner, creator, buyer, fee };
  }

  async function buyTokenFixture() {
    const { factory, token, creator, buyer } = await loadFixture(deployFactoryFixture);

    // amount to buy
    const AMOUNT = ethers.parseUnits("10000", 18); // max allowed
    // initial cost per token = 0.0001 ether
    const COST = ethers.parseEther("1"); // 0.0001 * 10000 = 1 ETH

    const tx = await factory
      .connect(buyer)
      .buyToken(await token.getAddress(), AMOUNT, { value: COST });
    await tx.wait();

    return { factory, token, creator, buyer };
  }

  // -------------------
  // TESTS START HERE
  // -------------------

  describe("Deployment", function () {
    it("Should set the fee correctly", async function () {
      const { factory } = await loadFixture(deployFactoryFixture);
      expect(await factory.fee()).to.be.a("bigint");
    });

    it("Should set the owner correctly", async function () {
      const { factory, owner } = await loadFixture(deployFactoryFixture);
      expect(await factory.owner()).to.equal(owner.address);
    });
  });

  describe("Creating Tokens", function () {
    it("Should create token and set correct creator", async function () {
      const { factory, token, creator } = await loadFixture(deployFactoryFixture);
      const sale = await factory.tokenToSale(await token.getAddress());
      expect(sale.creator).to.equal(creator.address);
    });

    it("Should assign initial supply to factory", async function () {
      const { token, factory } = await loadFixture(deployFactoryFixture);
      const bal = await token.balanceOf(await factory.getAddress());
      expect(bal).to.be.gt(0);
    });

    it("Should update ETH balance after fee payment", async function () {
      const { factory, fee } = await loadFixture(deployFactoryFixture);
      const bal = await ethers.provider.getBalance(await factory.getAddress());
      expect(bal).to.equal(fee);
    });

    it("Should correctly store TokenSale data", async function () {
      const { factory, token } = await loadFixture(deployFactoryFixture);
      const sale = await factory.tokenToSale(await token.getAddress());
      expect(sale.isOpen).to.equal(true);
    });
  });

  describe("Buying Tokens", function () {
    it("Should transfer tokens to buyer", async function () {
      const { token, buyer } = await loadFixture(buyTokenFixture);
      const bal = await token.balanceOf(buyer.address);
      expect(bal).to.be.gt(0);
    });

    it("Should update sale details after purchase", async function () {
      const { factory, token } = await loadFixture(buyTokenFixture);
      const sale = await factory.tokenToSale(await token.getAddress());
      expect(sale.sold).to.be.gt(0);
      expect(sale.raised).to.be.gt(0);
    });

    it("Should correctly calculate next cost", async function () {
      const { factory } = await loadFixture(buyTokenFixture);
      const nextCost = await factory.getCost(ethers.parseUnits("10000", 18));
      expect(nextCost).to.be.gt(ethers.parseUnits("0.0001", 18));
    });
  });

  describe("Depositing", function () {
    it("Should allow creator to deposit after sale closes", async function () {
      const { factory, token, creator, buyer } = await loadFixture(deployFactoryFixture);

      // buy all tokens
      const AMOUNT = ethers.parseUnits("10000", 18);
      const COST = ethers.parseEther("1");
      await factory.connect(buyer).buyToken(await token.getAddress(), AMOUNT, { value: COST });

      // close sale manually
      await factory.connect(creator).closeSale(await token.getAddress());

      // deposit tokens back to factory (simulate)
      const depositAmount = ethers.parseUnits("5000", 18);
      await token.connect(creator).approve(await factory.getAddress(), depositAmount);
      await expect(factory.connect(creator).depositToken(await token.getAddress(), depositAmount))
        .to.emit(factory, "TokenDeposited");
    });
  });

  describe("Withdraw", function () {
    it("Owner can withdraw fees", async function () {
      const { factory, owner } = await loadFixture(deployFactoryFixture);
      const before = await ethers.provider.getBalance(owner.address);
      await factory.connect(owner).withdrawFee();
      const after = await ethers.provider.getBalance(owner.address);
      expect(after).to.be.gt(before);
    });
  });
});
