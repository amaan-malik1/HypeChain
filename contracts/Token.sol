// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    address public creator;

    constructor(
        address _creator,
        string memory _name,
        string memory _symbol,
        uint256 _supply
    ) ERC20(_name, _symbol) {
        creator = _creator;
        _mint(msg.sender, _supply);
    }
}
