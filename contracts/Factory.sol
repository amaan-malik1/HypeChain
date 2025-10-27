// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Token} from "./Token.sol";

contract Factory {
    uint256 public immutable fee;
    address owner;
    uint256 totalTokens;
    address[] public tokens;

    mapping(address => TokenSale) public tokenToSale;

    struct TokenSale {
        address token;
        string name;
        address creator;
        uint256 sold;
        uint256 raised;
        bool isOpen;
    }

    event TokenCreated(address indexed token);
    event Buy(address indexed tokenAddress, uint256 amount);

    constructor(uint256 _fee) {
        fee = _fee;
        owner = msg.sender;
    }

    function getTokenSale(
        uint256 _index
    ) public view returns (TokenSale memory) {
        return tokenToSale[tokens[_index]];
    }

    //_sold is the current cost of the token
    function getCost(uint _sold) public pure returns (uint256) {
        uint256 floor = 0.0001 ether;
        uint256 step = 0.0001 ether;
        uint256 increment = 10000;

        uint256 cost = (step * (_sold / increment)) + floor;
        return cost;
    }

    function create(
        string memory _name,
        string memory _symbol
    ) external payable {
        //make to pay the fee
        require(msg.value >= fee, "creator's fee not payed yet!");

        //create a new token and store it in "token var"
        Token token = new Token(msg.sender, _name, _symbol, 1_000_000 ether);

        // save the token on the blockchain
        tokens.push(address(token));
        totalTokens++;

        //list the token for the sale purpose
        TokenSale memory sale = TokenSale(
            address(token),
            _name,
            msg.sender,
            0,
            0,
            true
        );

        tokenToSale[address(token)] = sale;

        // tell people it's live
        emit TokenCreated(address(token));
    }

    function buyToken(address _tokenAddress, uint256 _amount) external payable {
        TokenSale storage sale = tokenToSale[_tokenAddress];

        //calculate the price of 1 token
        uint256 cost = getCost(sale.sold);

        uint256 price = cost * (_amount / 10 ** 18);

        //make sure enough eth is sent

        //update the sale
        sale.sold += _amount;
        sale.raised += price;

        Token(_tokenAddress).transfer(msg.sender, _amount);

        //emit the evnt
        emit Buy(_tokenAddress, _amount);
    }
}
