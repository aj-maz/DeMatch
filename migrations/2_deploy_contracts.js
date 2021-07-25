const Arbitrator = artifacts.require("Arbitrator");
const SimpleTournaments = artifacts.require("SimpleTournaments");

module.exports = function (deployer) {
  deployer
    .deploy(Arbitrator)
    .then(() => deployer.deploy(SimpleTournaments, Arbitrator.address));
};
