import pkg from "hardhat";
const { ethers } = pkg;

import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("Factory", function () {
  // ------------------------------------------------------
  // FIXTURE 1 — Deploys Factory + creates 1 token
  // ------------------------------------------------------
  async function deployFactoryFixture() {
    const [owner, creator, buyer] = await ethers.getSigners();

    const fee = ethers.parseEther("0.01");
    const Factory = await ethers.getContractFactory("Factory");
    const factory = await Factory.deploy(fee);
    await factory.waitForDeployment();

    // Creator creates token
    const tx = await factory
      .connect(creator)
      .create("Test Token", "TTK", { value: fee });
    await tx.wait();

    const tokenAddr = await factory.tokens(0);
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.attach(tokenAddr);

    return { factory, token, owner, creator, buyer, fee };
  }

  // ------------------------------------------------------
  // FIXTURE 2 — Deploys and makes 1 buy
  // ------------------------------------------------------
  async function buyTokenFixture() {
    const { factory, token, creator, buyer } = await loadFixture(
      deployFactoryFixture
    );

    const AMOUNT = ethers.parseUnits("10000", 18);
    const COST = ethers.parseEther("1");

    await factory
      .connect(buyer)
      .buyToken(await token.getAddress(), AMOUNT, { value: COST });

    return { factory, token, creator, buyer };
  }

  // ------------------------------------------------------
  // TESTS START
  // ------------------------------------------------------

  describe("Deployment", function () {
    it("Should set the fee correctly", async function () {
      const { factory, fee } = await loadFixture(deployFactoryFixture);
      expect(await factory.fee()).to.equal(fee);
    });

    it("Should set the owner correctly", async function () {
      const { factory, owner } = await loadFixture(deployFactoryFixture);
      expect(await factory.owner()).to.equal(owner.address);
    });
  });

  describe("Creating Tokens", function () {
    it("Should create token and set correct creator", async function () {
      const { factory, token, creator } = await loadFixture(
        deployFactoryFixture
      );
      const sale = await factory.tokenToSale(await token.getAddress());
      expect(sale.creator).to.equal(creator.address);
    });

    it("Should assign initial supply to factory", async function () {
      const { token, factory } = await loadFixture(deployFactoryFixture);
      const bal = await token.balanceOf(await factory.getAddress());
      expect(bal).to.be.gt(0n);
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
      expect(bal).to.be.gt(0n);
    });

    it("Should update sale details after purchase", async function () {
      const { factory, token } = await loadFixture(buyTokenFixture);
      const sale = await factory.tokenToSale(await token.getAddress());
      expect(sale.sold).to.be.gt(0n);
      expect(sale.raised).to.be.gt(0n);
    });

    it("Should correctly calculate next cost", async function () {
      const { factory } = await loadFixture(buyTokenFixture);
      const nextCost = await factory.getCost(ethers.parseUnits("10000", 18));
      expect(nextCost).to.be.gt(ethers.parseEther("0.0001"));
    });
  });

  // ------------------------------------------------------
  // 🧩 FIXED Depositing Test
  // ------------------------------------------------------
  describe("Depositing", function () {
    it("Should allow creator to deposit after sale closes", async function () {
      const { factory, token, creator, buyer } = await loadFixture(
        deployFactoryFixture
      );

      // Give buyer massive balance so no fund issues
      const hugeBalance = ethers.parseEther("1000000000000000");
      await ethers.provider.send("hardhat_setBalance", [
        buyer.address,
        "0x" + hugeBalance.toString(16),
      ]);

      const TARGET = await factory.TARGET();
      const AMOUNT = ethers.parseUnits("1000", 18);

      // 🧠 Keep buying until sale closes (sold >= TARGET)
      for (let i = 0; i < Number(TARGET); i++) {
        const sale = await factory.tokenToSale(await token.getAddress());
        if (!sale.isOpen) break; // stop when closed

        const costPerToken = await factory.getCost(sale.sold);
        const price = (AMOUNT * costPerToken) / 10n ** 18n;
        const costWithBuffer = price + (price / 100n); // small 1% buffer

        await factory.connect(buyer).buyToken(await token.getAddress(), AMOUNT, {
          value: costWithBuffer,
        });
      }

      // Confirm sale closed
      const saleAfter = await factory.tokenToSale(await token.getAddress());
      expect(saleAfter.isOpen).to.equal(false);

      // ✅ Deposit should now succeed
      await expect(
        factory.connect(creator).deposit(await token.getAddress())
      ).to.not.be.reverted;
    });
  });


  describe("Withdraw", function () {
    it("Owner can withdraw fees", async function () {
      const { factory, owner } = await loadFixture(deployFactoryFixture);
      const before = await ethers.provider.getBalance(owner.address);

      await factory.connect(owner).withdraw(ethers.parseEther("0.005"));
      const after = await ethers.provider.getBalance(owner.address);

      expect(after).to.be.gt(before);
    });
  });
});
