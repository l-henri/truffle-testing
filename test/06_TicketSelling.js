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

        // Buying 2 tickets
        await TicketingSystemInstance.buyTicket(1, {from: accounts[3], value: concertPrice})
        await TicketingSystemInstance.buyTicket(1, {from: accounts[4], value: concertPrice})
    
    })

    it('Putting up tickets to sell', async function (){

    // Verifying ticket infos
    ticketInfo = await TicketingSystemInstance.ticketsRegister(1)
    assert.equal(ticketInfo.isAvailable, true)
    assert.equal(ticketInfo.isAvailableForSale, false)

    // Offering a ticket to sell
    // function offerTicketForSale(uint _ticketId, uint _salePrice)
    await TicketingSystemInstance.offerTicketForSale(1, concertPrice - 2, {from: accounts[3]})

    // Verifying ticket infos
    ticketInfo = await TicketingSystemInstance.ticketsRegister(1)
    assert.equal(ticketInfo.isAvailable, true)
    assert.equal(ticketInfo.isAvailableForSale, true)

    // Trying to sell a ticket that does not belong to me
    await tryCatch(TicketingSystemInstance.offerTicketForSale(1, concertPrice - 2, {from: accounts[4]}), errTypes.revert);

    // Trying to sell a ticket for more than I paid for it
    await tryCatch(TicketingSystemInstance.offerTicketForSale(1, concertPrice + 2, {from: accounts[3]}), errTypes.revert);

    })

    it('Buying auctioned tickets', async function (){

    // Offering a ticket to sell
    await TicketingSystemInstance.offerTicketForSale(1, concertPrice - 2, {from: accounts[3]})

    // Trying to buy the ticket for lower than the proposed price
    await tryCatch(TicketingSystemInstance.buySecondHandTicket(1, {from: accounts[4], value: concertPrice - 20}), errTypes.revert);

    // Buying the ticket
    // function buySecondHandTicket(uint _ticketId)
    await TicketingSystemInstance.buySecondHandTicket(1, {from: accounts[4], value: concertPrice - 2})
    })

    it('Using a ticket while it is on sale', async function (){

    // Offering a ticket to sell
    await TicketingSystemInstance.offerTicketForSale(1, concertPrice - 2, {from: accounts[3]})

    // Changed my mind, using the ticket
    await TicketingSystemInstance.useTicket(1, {from: accounts[3]})

    // Trying to buy the ticket even though it was already used
    await tryCatch(TicketingSystemInstance.buySecondHandTicket(1, {from: accounts[4], value: concertPrice - 2}), errTypes.revert);
    })

})