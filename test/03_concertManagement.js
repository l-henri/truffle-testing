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

    })

    // Tests routines start with "it"
    it('Creating a concert', async function (){


    // Anyone can declare a concert for any artist they want.
    // Tickets can be sold before the venue or the artists validated their participation. This is to incentivize the artists
    // and venue to look at potential opportunities, with actual funds locked in waiting for them.
    // function createConcert(uint _artistId, uint _venueId, uint _concertDate, uint _ticketPrice)
    oneWeek = 60*60*24*7
    concertDate = Math.floor((new Date).getTime()/1000 + oneWeek);
    await TicketingSystemInstance.createConcert(1,1, concertDate, 1000, {from: accounts[1]})
    await TicketingSystemInstance.createConcert(1,1, concertDate, 1000, {from: accounts[2]})
    
    // Retrieving concert infos
    concert1Info = await TicketingSystemInstance.concertsRegister(1)
    concert2Info = await TicketingSystemInstance.concertsRegister(2)

    // Checking that infos are correct
    assert.equal(concert1Info.artistId, 1)
    assert.equal(concert2Info.artistId, 1)

    assert.equal(concert1Info.concertDate, concertDate)
    assert.equal(concert2Info.concertDate, concertDate)

    assert.equal(concert1Info.validatedByArtist, true)
    assert.equal(concert2Info.validatedByArtist, false)

    assert.equal(concert1Info.validatedByVenue, false)
    assert.equal(concert2Info.validatedByVenue, false)

    // Artist accepts concert 2 and venue accepts concert 1 and 2
    //function validateConcert(uint _concertId)
    await TicketingSystemInstance.validateConcert(1, {from: accounts[0]})
    await TicketingSystemInstance.validateConcert(2, {from: accounts[0]})
    await TicketingSystemInstance.validateConcert(2, {from: accounts[1]})

        // Retrieving concert infos
    concert1Info = await TicketingSystemInstance.concertsRegister(1)
    concert2Info = await TicketingSystemInstance.concertsRegister(2)
    assert.equal(concert1Info.validatedByArtist, true)
    assert.equal(concert2Info.validatedByArtist, true)

    assert.equal(concert1Info.validatedByVenue, true)
    assert.equal(concert2Info.validatedByVenue, true)
    })
        // Tests routines start with "it"
    it('Emitting tickets', async function (){

    // Declaring concert
    oneWeek = 60*60*24*7
    concertPrice = 1000
    concertDate = Math.floor((new Date).getTime()/1000 + oneWeek);
    await TicketingSystemInstance.createConcert(1,1, concertDate, concertPrice, {from: accounts[1]})
    await TicketingSystemInstance.validateConcert(1, {from: accounts[0]})
    
    // Verifying concert infos
    concert1Info = await TicketingSystemInstance.concertsRegister(1)
    assert.equal(concert1Info.totalSoldTicket, 0)
    assert.equal(concert1Info.totalMoneyCollected, 0)

    // Emitting 5 tickets. Only artists can emit tickets.
    // function emitTicket(uint _concertId, address payable _ticketOwner)
    await TicketingSystemInstance.emitTicket(1,  accounts[2],{from: accounts[1]})
    await TicketingSystemInstance.emitTicket(1,  accounts[3],{from: accounts[1]})
    await TicketingSystemInstance.emitTicket(1,  accounts[4],{from: accounts[1]})
    await TicketingSystemInstance.emitTicket(1,  accounts[5],{from: accounts[1]})
    await TicketingSystemInstance.emitTicket(1,  accounts[6],{from: accounts[1]})
    // Trying to emit tickets with another account, should fail
    await tryCatch(TicketingSystemInstance.emitTicket(1, accounts[5], {from: accounts[2]}), errTypes.revert);


    // Verifying concert infos
    concert1Info = await TicketingSystemInstance.concertsRegister(1)
    assert.equal(concert1Info.totalSoldTicket, 5)
    assert.equal(concert1Info.totalMoneyCollected, 0)

    // Verifying ticket infos
    ticket3Info = await TicketingSystemInstance.ticketsRegister(3)
    assert.equal(ticket3Info.owner, accounts[4])
    assert.equal(ticket3Info.isAvailable, true)
    })


     it('Using tickets', async function (){

    // Declaring concert
    oneWeek = 60*60*24*7
    oneDay = 60*60*24
    concertPrice = 1000
    concertDate = Math.floor((new Date).getTime()/1000 + oneWeek);
    concertDate2 = Math.floor((new Date).getTime()/1000 + oneDay -1);

    await TicketingSystemInstance.createConcert(1,1, concertDate, concertPrice, {from: accounts[1]})
    await TicketingSystemInstance.validateConcert(1, {from: accounts[0]})
    await TicketingSystemInstance.createConcert(1,1, concertDate2, concertPrice, {from: accounts[1]})
    
    
    
    // Verifying concert infos
    concert1Info = await TicketingSystemInstance.concertsRegister(1)
    assert.equal(concert1Info.totalSoldTicket, 0)
    assert.equal(concert1Info.totalMoneyCollected, 0)

    // Buying 2 tickets for concert 1 and 2
    await TicketingSystemInstance.emitTicket(1,  accounts[3],{from: accounts[1]})
    await TicketingSystemInstance.emitTicket(2,  accounts[4],{from: accounts[1]})

    // Trying to use ticket I do not own
    // function useTicket(uint _ticketId)
    await tryCatch(TicketingSystemInstance.useTicket(1, {from: accounts[5]}), errTypes.revert);
    // Trying to use ticket before the day of the event
    await tryCatch(TicketingSystemInstance.useTicket(1, {from: accounts[3]}), errTypes.revert);
    // Trying to use ticket before the venue validated the event
    await tryCatch(TicketingSystemInstance.useTicket(2, {from: accounts[4]}), errTypes.revert);

    // Validating the concert
    await TicketingSystemInstance.validateConcert(2, {from: accounts[0]})
    // Using a ticket on the day of the event
    await TicketingSystemInstance.useTicket(2, {from: accounts[4]})

    // Verifying ticket infos
    ticketInfo = await TicketingSystemInstance.ticketsRegister(2)
    assert.equal(ticketInfo.isAvailable, false)
    assert.equal(ticketInfo.owner, 0x0000)
    })



})