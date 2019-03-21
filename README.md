# truffle-testing

A TD to learn how to use Truffle tests. This repo only has a test folder.

Your mission is to write a contract that passes all the tests when doing "truffle test".

These tests were written with:
* Truffle v5.0.8 (core: 5.0.8)
* Solidity v0.5.0 (solc-js)
* Node v11.3.0
* Web3.js v1.0.0-beta.37

# Context
The objective of this TD is for you to write a simple smart contract to manage the ticketing process for concerts. A lot of tools exists today to facilitate the relationship between artists and their audience:
* Bandcamp/Society6 to sell mp3/merch
* Distrokid/CD Baby to distribute digitally their music
* Facebook/Instagram to promote content

However, there are still few tools to help artists sell tickets for concerts. This is true for smaller and bigger artists. 

Platforms like ticketmaster take a massive commission in issuance fee etc.

Your task is to design a ticketing system allowing an artist to sell their tickets directly to their audience.

# Tasks list
* Create a ticketing contract 
* Create function to create/modify an artist profile (Name, Artist type, Total tickets sold)
* Create functions to create/modify a venue profile (Name, Space available, % of ticket price going to venue with 2 decimals)
* Create a ticket object (concert ID, artist ID, venue ID)
* Create functions to create a concert, emit tickets and use tickets. Artists can emit tickets that they attribute to whoever they want.
* Ticket owner can use tickets on the day of the event
* Create functions to buy and transfer tickets  
* Create a function for the artist to cash out after the concert. Make sure the concert has passed. Split the money between artist and venue.
* Create a function to safely trade ticket for money. Forbid selling the ticket for more than it was bought.

# Forward
The contract expected is obviously very incomplete, and various funcionalities could/should be implemented such as:
* Ticket reimbursement
* Event cancellation
* Paying the venue for tickets emitted by the artists but not paid
* Payment in ERC20 tokens

But for now, the objective is to get used to writing simple smart contracts and testing them along the way.






