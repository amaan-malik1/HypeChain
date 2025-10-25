// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    address payable public Owner;
    address public Creator;

    constructor(
        address _creator,
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply
    ) ERC20(_name, _symbol) {
        Owner = payable(msg.sender);
        Creator = _creator;

        // mint function from ERC20
        _mint(Owner, _totalSupply);
    }
}
