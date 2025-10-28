// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Token} from "./Token.sol";

contract Factory {
    uint256 public constant TARGET = 3 ether; // max amount of token sale we have
    uint256 public constant TOKEN_LIMIT = 500_000 ether;

    uint256 public immutable fee;
    address public owner;
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

    //get the token sale details
    function getTokenSale(
        uint256 _index
    ) public view returns (TokenSale memory) {
        return tokenToSale[tokens[_index]];
    }

    //_sold is the current cost of the token
    function getCost(uint _sold) public pure returns (uint256) {
        uint256 floor = 0.0001 ether;
        uint256 step = 0.0001 ether; //itna increase hoga after
        uint256 increment = 10000; /// itne token sale

        uint256 cost = (step * (_sold / increment)) + floor;
        return cost;
    }

    //create a new token
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

    //buying token from the sale    
    function buyToken(address _tokenAddress, uint256 _amount) external payable {
        TokenSale storage sale = tokenToSale[_tokenAddress];

        //check if the sale is open
        require(sale.isOpen == true, "Factory: Buying closed");
        require(_amount >= 1 ether, "Factory: Amount is too low");
        require(_amount <= 10000 ether, "Factory: Amount exceed");

        //calculate the price of 1 token
        uint256 cost = getCost(sale.sold);

        uint256 price = cost * (_amount / 10 ** 18);

        //make sure enough eth is sent
        require(msg.value >= price, "Factory: Insufficient ETH recived");

        //update the sale
        sale.sold += _amount;
        sale.raised += price;

        ///check whether token or target limit reached ????
        if (sale.sold >= TOKEN_LIMIT || sale.raised >= TARGET) {
            sale.isOpen = false;
        }

        Token(_tokenAddress).transfer(msg.sender, _amount);

        //emit the evnt
        emit Buy(_tokenAddress, _amount);
    }

    //deposit the funds to the creator
    function deposit(address _token) external {
        //getting the token info using its map address
        Token token = Token(_token);
        TokenSale memory sale = tokenToSale[_token];

        require(sale.isOpen == false, "Factory: Target not reached");

        //Transfer token
        token.transfer(sale.creator, token.balanceOf(address(this)));

        //Transfer ETH raised
        (bool success, ) = payable(sale.creator).call{value: sale.raised}("");
        require(success, "Factory: ETH transfer failed");
    }

    //withdraw the funds only by owner
    function withdraw(uint256 _amount) external {
        require(msg.sender == owner, "Factory: Not Owner");

        //Transfer ETH raised
        (bool success, ) = payable(owner).call{value: _amount}("");
        require(success, "Factory: ETH transfer failed");
    }
}
