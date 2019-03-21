const ticketingSystem = artifacts.require("ticketingSystem");

module.exports = function(deployer) {
  deployer.deploy(ticketingSystem);
};
