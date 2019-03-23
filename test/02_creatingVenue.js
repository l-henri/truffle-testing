const ticketingSystem = artifacts.require('./ticketingSystem.sol')

let tryCatch = require("./exceptions.js").tryCatch;
let errTypes = require("./exceptions.js").errTypes;

contract('Creating Venue profile', function (accounts) {

    // Setup before each test
    beforeEach('setup contract for each test', async function () {
        // Deploying contract
        TicketingSystemInstance = await ticketingSystem.new({from: accounts[0]})
    })

    // Tests routines start with "it"
    it('Create a venue profile', async function (){
    venue1Name = "Elysee montmartre"
    venue2Name = "Olympia"
    venue1Capacity = 300
    venue2Capacity = 4000
    venue1comission = 2000
    venue2comission = 1500

    // Declaring venues
    //function createVenue(bytes32 _name, uint _capacity, uint _standardComission) 
    await TicketingSystemInstance.createVenue(web3.utils.fromAscii(venue1Name), venue1Capacity, venue1comission, {from: accounts[0]}); 
    await TicketingSystemInstance.createVenue(web3.utils.fromAscii(venue2Name), venue2Capacity, venue2comission, {from: accounts[1]}); 

    // Retrieving venue infos
    retrievedVenue1Info = await TicketingSystemInstance.venuesRegister(1)
    retrievedVenue2Info = await TicketingSystemInstance.venuesRegister(2)

    // Checking that infos are correct
    assert.equal(web3.utils.toUtf8(retrievedVenue1Info.name),venue1Name)
    assert.equal(web3.utils.toUtf8(retrievedVenue2Info.name),venue2Name)

    assert.equal(retrievedVenue1Info.capacity,venue1Capacity)
    assert.equal(retrievedVenue2Info.standardComission,venue2comission)
    assert.equal(retrievedVenue1Info.owner,accounts[0])
    assert.equal(retrievedVenue2Info.owner,accounts[1])
    })
    it('Modifying an venue profile', async function (){
    venue1Name = "Elysee montmartre"
    venue2Name = "Olympia"
    venue1Capacity = 300
    venue2Capacity = 4000
    venue1comission = 2000
    venue2comission = 1500

    await TicketingSystemInstance.createVenue(web3.utils.fromAscii(venue1Name), venue1Capacity, venue1comission, {from: accounts[0]}); 

    // function modifyVenue(uint _venueId, bytes32 _name, uint _capacity, uint _standardComission, address payable _newOwner) 
    await tryCatch(TicketingSystemInstance.modifyVenue(1, web3.utils.fromAscii(venue1Name), venue1Capacity, venue1comission, accounts[2], {from: accounts[2]}), errTypes.revert);
    await TicketingSystemInstance.modifyVenue(1, web3.utils.fromAscii(venue2Name), venue2Capacity, venue2comission, accounts[2], {from: accounts[0]})

    retrievedVenue1Info = await TicketingSystemInstance.venuesRegister(1)
    assert.equal(web3.utils.toUtf8(retrievedVenue1Info.name),venue2Name)

    assert.equal(retrievedVenue1Info.capacity,venue2Capacity)
    assert.equal(retrievedVenue1Info.standardComission,venue2comission)
    assert.equal(retrievedVenue1Info.owner,accounts[2])

    })


})