const StarNotary = artifacts.require('StarNotary');

contract('StarNotary', accs => {
    let accounts = accs;
    let owner = accounts[0];

    it('Creates a star successfully', async () => {
        let instance = await StarNotary.deployed();
        let tokenID = 1;
        await instance.createStar('Twinkle Star', tokenID, { from: owner });
        let createdStar = await instance._tokenToStarInfo.call(tokenID);
        // assert.exist(createdStar);
        assert.equal(createdStar, 'Twinkle Star');
    })

    it("Allows the owner to put the star for sale", async () => {
        let instance = await StarNotary.deployed();
        let user1 = accounts[1];
        let starID = 2;
        let starPrice = web3.utils.toWei(".01", "ether");

        // Creating the star by the owner.
        await instance.createStar("Awesome Star", starID, { from: user1 });
        // Putting the star for sale.
        await instance.putStarForSale(starID, starPrice, { from: user1 });
        // Getting the price of the star.
        let starSalePrice = await instance._starsForSale.call(starID);
        // Asserting the star is put for sale for the correct price.
        assert.equal(starPrice, starSalePrice);
    })

    // it("It allows only the owner to put the star for sale", async () => {
    //     let instance = await StarNotary.deployed();
    //     let user1 = accounts[1];
    //     let starPrice = web3.utils.toWei("0.01", "ether");
    //     let starID = 3;

    //     await instance.createStar('Star 2', starID, { from: owner });
    //     // assert.throws(await instance.putStarForSale(starID, starPrice, { from: user1 }));
    //     expect(await instance.putStarForSale(starID, starPrice, { from: user1 })).to.throw();
    // })

    it("Lets user1 becomes the owner of the star after purchasing.", async () => {
        let instance = await StarNotary.deployed();
        let user1 = accounts[1];
        let user2 = accounts[2];
        let starID = 3;
        let starPrice = web3.utils.toWei(".01", "ether");
        let balance = web3.utils.toWei(".05", "ether");

        // Creating the star.
        await instance.createStar('awesome star', starID, { from: user1 });
        await instance.putStarForSale(starID, starPrice, { from: user1 });

        // User 2 buys the star.
        await instance.approve(user2, starID, { from: user1 });
        await instance.buyStar(starID, { from: user2, value: balance });

        // Checking the current owner of the star.
        let currentOwner = await instance.ownerOf(starID);
        assert.equal(currentOwner, user2);
    })

    it('lets user1 get the funds after the sale', async () => {
        let instance = await StarNotary.deployed();
        let user1 = accounts[1];
        let user2 = accounts[2];
        let starID = 4;

        let starPrice = web3.utils.toWei(".01", "ether");
        let payedPrice = web3.utils.toWei(".05", "ether");

        // Creating the star.
        await instance.createStar('awesome star', starID, { from: user1 });
        await instance.putStarForSale(starID, starPrice, { from: user1 });

        // User 2 buying the star.
        let user1BeforeBalance = await web3.eth.getBalance(user1);
        console.log('Here is the balance before:', user1BeforeBalance);
        await instance.approve(user2, starID, { from: user1 });
        await instance.buyStar(starID, { from: user2, value: payedPrice });
        let user1AfterBalance = await web3.eth.getBalance(user1);
        console.log('Here is the balance after:', user1AfterBalance);
        console.log('Here is the difference:', Number(user1AfterBalance) - Number(user1BeforeBalance));

        // Checking balances.
        let value1 = Number(user1AfterBalance) - Number(starPrice);
        let value2 = Number(user1BeforeBalance);
        assert.equal(value1, value2);
    })

    it('lets user2 buy a star and decreases its balance in ether', async () => {
        let instance = await StarNotary.deployed();
        let user1 = accounts[1];
        let user2 = accounts[2];
        let starID = 5;
        let starPrice = web3.utils.toWei(".01", "ether");
        let balance = web3.utils.toWei(".05", "ether");

        // Creating the star by user1.
        await instance.createStar('awesome star', starID, { from: user1 });
        await instance.putStarForSale(starID, starPrice, { from: user1 });

        // User2 buying the star.
        const user2BeforeBalance = await web3.eth.getBalance(user2);
        await instance.approve(user2, starID, { from: user1 });
        await instance.buyStar(starID, { from: user2, value: balance, gasPrice: 0 });
        const user2AfterBalance = await web3.eth.getBalance(user2);

        // Checking the balance of user2
        let value = Number(user2BeforeBalance) - Number(user2AfterBalance);
        assert.equal(value, starPrice);
    });


    // Test Cases: 
    // * The star can be created successfully.
    // * The star can be put on sale successfully.
    // * The star can be put OFF sale successfully.
    // * The star can NOT be put on sale by any user other than the owner.
    // * The star can NOT be bought when it is not on sale
    // * The star can't be bought when the price is lower than requested.
    // * the star can be bought bought when the money is larger than the requested price and 
    // the extra money is returned back to the sender.
    // * The star can be bought when money is exactly equal to the value of the price requested.
})