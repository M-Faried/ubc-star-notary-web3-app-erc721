pragma solidity ^0.8.0;

import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";

contract StarNotary is ERC721 {

    struct Star {
        string name;
    }

    mapping(uint256 => Star) private _tokenToStarInfo;
    mapping(uint256 => uint256) private _starsForSale;

    constructor() ERC721("StarNotary", "STAR") {}

    function createStar(string memory name, uint256 tokenID) public {
        Star memory star = Star(name);
        _tokenToStarInfo[tokenID] = star;
        _safeMint(msg.sender, tokenID);
    }

    function putStarForSale(uint256 tokenID, uint256 price) public {
        require(ownerOf(tokenID) == msg.sender);
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
        safeTransferFrom(starOwner, msg.sender, tokenID);

        // Transferring price to the owner.
        address payable starOwnerPayable = payable(starOwner);
        starOwnerPayable.transfer(starCost);

        // Returning any extra value to the sender.
        if(msg.value > starCost){
            payable(msg.sender).transfer(msg.value - starCost);
        }
    }     
}