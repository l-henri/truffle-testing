const ticketingSystem = artifacts.require('./ticketingSystem.sol')

let tryCatch = require("./exceptions.js").tryCatch;
let errTypes = require("./exceptions.js").errTypes;

contract('Concert management functions', function (accounts) {

    // Setup before each test
    beforeEach('setup contract for each test', async function () {
        // Deploying contract
        TicketingSystemInstance = await ticketingSystem.new({from: accounts[0]})

        // Creating a venue
        venue1Name = "Elysee montmartre"
        venue1Capacity = 300
        venue1comission = 2000
        await TicketingSystemInstance.createVenue(web3.utils.fromAscii(venue1Name), venue1Capacity, venue1comission, {from: accounts[0]}); 

        // Creating an artist
        artist1Name = "Electric Octopus"
        artistCategory = 1
        await TicketingSystemInstance.createArtist(web3.utils.fromAscii(artist1Name), artistCategory, {from: accounts[1]}); 

        // Declaring a concert
        oneDay = 60*60*24
        concertPrice = 1000
        concertDate2 = Math.floor((new Date).getTime()/1000 + oneDay -1);        
        await TicketingSystemInstance.createConcert(1,1, concertDate2, concertPrice, {from: accounts[1]})
        await TicketingSystemInstance.validateConcert(1, {from: accounts[0]})
    
    })

    it('Buying tickets', async function (){

    // Buying 2 tickets
    // function buyTicket(uint _concertId) public payable
    await TicketingSystemInstance.buyTicket(1, {from: accounts[3], value: concertPrice})
    await TicketingSystemInstance.buyTicket(1, {from: accounts[4], value: concertPrice})

    // Verifying concert infos
    concert1Info = await TicketingSystemInstance.concertsRegister(1)
    assert.equal(concert1Info.totalSoldTicket, 2)
    assert.equal(concert1Info.totalMoneyCollected, 2*concertPrice)

    ticketInfo = await TicketingSystemInstance.ticketsRegister(1)
    assert.equal(ticketInfo.concertId, 1)
    assert.equal(ticketInfo.amountPaid , concertPrice)
    assert.equal(ticketInfo.isAvailable, true)
    assert.equal(ticketInfo.owner, accounts[3])
    assert.equal(ticketInfo.isAvailableForSale, false)


    })

     it('Using bought tickets', async function (){

    // Buying 2 tickets
    await TicketingSystemInstance.buyTicket(1, {from: accounts[3], value: concertPrice})
    // Trying to use ticket I do not own
    await tryCatch(TicketingSystemInstance.useTicket(1, {from: accounts[5]}), errTypes.revert);

    // Using a ticket on the day of the event
    await TicketingSystemInstance.useTicket(1, {from: accounts[3]})

    // Verifying ticket infos
    ticketInfo = await TicketingSystemInstance.ticketsRegister(1)
    assert.equal(ticketInfo.isAvailable, false)
    assert.equal(ticketInfo.owner, 0x0000)
    })

    it('Transferring tickets', async function (){

    // Buying 2 tickets
    await TicketingSystemInstance.buyTicket(1, {from: accounts[3], value: concertPrice})
    // Trying to use ticket I do not own
    // function transferTicket(uint _ticketId, address payable _newOwner)
    await tryCatch(TicketingSystemInstance.transferTicket(1, accounts[5], {from: accounts[5]}), errTypes.revert);

    // Transferring a ticket
    await TicketingSystemInstance.transferTicket(1, accounts[5], {from: accounts[3]})

    // Verifying ticket infos
    ticketInfo = await TicketingSystemInstance.ticketsRegister(1)
    assert.equal(ticketInfo.owner, accounts[5])
    })



})