const StarNotary = artifacts.require('StarNotary');

contract('StarNotary', accs => {
    let accounts = accs;
    let owner = accounts[0];

    it('Creates a star successfully', async () => {
        let instance = await StarNotary.deployed();
        await instance.createStar('Twinkle Star', { from: owner });
    })
})