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
        fifteenSeconds = 15
        concertPrice = 1000
        concertDate2 = Math.floor((new Date).getTime()/1000 + fifteenSeconds);        
        await TicketingSystemInstance.createConcert(1,1, concertDate2, concertPrice, {from: accounts[1]})
        await TicketingSystemInstance.validateConcert(1, {from: accounts[0]})

        // Buying 2 tickets
        await TicketingSystemInstance.buyTicket(1, {from: accounts[3], value: concertPrice})
        await TicketingSystemInstance.buyTicket(1, {from: accounts[4], value: concertPrice})

        // Using tickets
        await TicketingSystemInstance.useTicket(1, {from: accounts[3]})
        await TicketingSystemInstance.useTicket(2, {from: accounts[4]})
    
    })

    it('Cashing out concert', async function (){

        // Checking initial balance
        account9InitialBalance = await web3.eth.getBalance(accounts[9])
        ticketSystemInitialBalance = await web3.eth.getBalance(TicketingSystemInstance.address)
        venueInitialBalance = await web3.eth.getBalance(accounts[0])
        // Trying to cash out before the start of the concert
        // function cashOutConcert(uint _concertId, address payable _cashOutAddress)
        await tryCatch(TicketingSystemInstance.cashOutConcert(1, accounts[9], {from: accounts[1]}), errTypes.revert);
        
        // Waiting for the concert to start
        wait(fifteenSeconds*1000);

        // Trying to cash out with another acount
        await tryCatch(TicketingSystemInstance.cashOutConcert(1, accounts[9], {from: accounts[2]}), errTypes.revert);

        // Cashing out 
        await TicketingSystemInstance.cashOutConcert(1, accounts[9], {from: accounts[1]})
        account9FinalBalance = await web3.eth.getBalance(accounts[9])
        ticketSystemFinalBalance = await web3.eth.getBalance(TicketingSystemInstance.address)
        venueFinalBalance = await web3.eth.getBalance(accounts[0])

        // Calculating the share of each stakeholder. The comission is recorded in percentage with 2 decimals (eg 24,34%)
        totalTicketSale = concertPrice*2
        venueShare = totalTicketSale * venue1comission / 10000
        artistShare = totalTicketSale - venueShare

        expectedAccount9Balance = parseInt(account9InitialBalance) + artistShare
        expectedAccount0Balance = parseInt(venueInitialBalance) + venueShare
        assert.equal(account9FinalBalance, expectedAccount9Balance)
        assert.equal(ticketSystemFinalBalance, 0)
        assert.equal(venueFinalBalance, expectedAccount0Balance)

        concertInfo = await TicketingSystemInstance.concertsRegister(1)
        // checking that the tickets that were sold are accounted in artist profile
        artistInfo = await TicketingSystemInstance.artistsRegister(1)
        assert.equal(artistInfo.totalTicketSold, 2)

    })

})

function wait(ms){
   var start = new Date().getTime();
   var end = start;
   while(end < start + ms) {
     end = new Date().getTime();
  }
}