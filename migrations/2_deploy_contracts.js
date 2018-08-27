var CasinoDrive = artifacts.require("./CasinoDrive.sol");
var Members = artifacts.require("./Members.sol");
var Ownable = artifacts.require("./Ownable.sol");
var Pausable = artifacts.require("./Pausable.sol");

module.exports = function (deployer) {
    deployer.deploy(Ownable);
    deployer.deploy(Pausable);
    deployer.deploy(Members);
    deployer.deploy(CasinoDrive);
    deployer.link(Members, CasinoDrive);
};