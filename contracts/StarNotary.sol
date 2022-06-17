pragma solidity ^0.8.0;

import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";

contract StarNotary is ERC721 {

    struct Star {
        string name;
    }

    mapping(uint256 => Star) public _tokenToStarInfo;
    mapping(uint256 => uint256) public _starsForSale;

    constructor() ERC721("StarNotary", "STAR") {}

    function createStar(string memory name, uint256 tokenID) public {
        Star memory star = Star(name);
        _tokenToStarInfo[tokenID] = star;
        _mint(msg.sender, tokenID);
        setApprovalForAll(address(this), true);
    }

    function putStarForSale(uint256 tokenID, uint256 price) public {
        require(ownerOf(tokenID) == msg.sender, 'Sender is not the owner of the star');
        _starsForSale[tokenID] = price;
    }

    function buyStar(uint tokenID) public payable {
        // Making sure the token (star) is for sale.
        require(_starsForSale[tokenID] > 0, "The star is not for sale.");

        // Making sure the offered value covers the required price.
        uint256 starCost = _starsForSale[tokenID];
        require(msg.value >= starCost, "The offered price is less than required price.");        
        
        // Getting the current owner of the token and making the transfer.
        address starOwner = ownerOf(tokenID);

        // Transferring token to the sender.
        transferFrom(starOwner, msg.sender, tokenID);        

        // Transferring price to the owner.
        address payable starOwnerPayable = payable(starOwner);
        starOwnerPayable.transfer(starCost);        

        // Returning any extra value to the sender.
        if(msg.value > starCost){
            payable(msg.sender).transfer(msg.value - starCost);
        }

        // Removing the star from the mappings of the stars put for sale.
        _starsForSale[tokenID] = 0;
    }

    // We need a function here to get all the available stars from the mapping.
    // We need a function here to get all the stars put for sale with their required prices.
    // We need to get all the stars owned the sender.
}