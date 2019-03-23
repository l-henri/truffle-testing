const ticketingSystem = artifacts.require('./ticketingSystem.sol')

let tryCatch = require("./exceptions.js").tryCatch;
let errTypes = require("./exceptions.js").errTypes;

contract('Creating artist profile', function (accounts) {

    // Setup before each test
    beforeEach('setup contract for each test', async function () {
        // Deploying contract
        TicketingSystemInstance = await ticketingSystem.new({from: accounts[0]})
    })

    // Tests routines start with "it"
    it('Create an artist profile', async function (){
    artist1Name = "Electric Octopus"
    artist2Name = "David Bowie"
    artistCategory = 1

    // Creating an artist profile
    // function createConcert(uint _artistId, uint _venueId, uint _concertDate, uint _ticketPrice)
    await TicketingSystemInstance.createArtist(web3.utils.fromAscii(artist1Name), artistCategory, {from: accounts[0]}); 
    await TicketingSystemInstance.createArtist(web3.utils.fromAscii(artist2Name), artistCategory, {from: accounts[1]}); 

    // Retrieving newly created artists info
    retrievedArtist1Info = await TicketingSystemInstance.artistsRegister(1)
    retrievedArtist2Info = await TicketingSystemInstance.artistsRegister(2)

    // Checking the artists names
    assert.equal(web3.utils.toUtf8(retrievedArtist1Info.name),artist1Name)
    assert.equal(web3.utils.toUtf8(retrievedArtist2Info.name),artist2Name)

    // Checking artist category
    assert.equal(retrievedArtist1Info.artistCategory,artistCategory)

    // Checking artists ownership
    assert.equal(retrievedArtist1Info.owner,accounts[0])
    assert.equal(retrievedArtist2Info.owner,accounts[1])

    })
    it('Modifying an artist profile', async function (){
    artist1Name = "Electric Octopus"
    artist2Name = "David Bowie"
    artistCategory = 1
    newArtistCategory = 2;

    // Creating a new artist and checking it happened correctly
    await TicketingSystemInstance.createArtist(web3.utils.fromAscii(artist1Name), artistCategory, {from: accounts[0]}); 
    retrievedArtist1Info = await TicketingSystemInstance.artistsRegister(1)
    assert.equal(web3.utils.toUtf8(retrievedArtist1Info.name),artist1Name)
    
    // Trying to modify artists with an account different than owner
    //function modifyArtist(uint _artistId, bytes32 _name, uint _artistCategory, address payable _newOwner) 
    await tryCatch(TicketingSystemInstance.modifyArtist(1, web3.utils.fromAscii(artist2Name), newArtistCategory, accounts[2], {from: accounts[2]} ), errTypes.revert);
    
    // Modifying artist profile
    await TicketingSystemInstance.modifyArtist(1, web3.utils.fromAscii(artist2Name), newArtistCategory, accounts[2] )

    // Checking modification were registered
    retrievedArtist2Info = await TicketingSystemInstance.artistsRegister(1);
    assert.equal(web3.utils.toUtf8(retrievedArtist2Info.name),artist2Name)
    assert.equal(retrievedArtist2Info.artistCategory,newArtistCategory)
    assert.equal(retrievedArtist2Info.owner,accounts[2])
    })


})