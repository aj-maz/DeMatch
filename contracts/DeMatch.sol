/**
 * SPDX-License-Identifier: MIT
 */
pragma solidity >=0.7;

import "./IArbitrable.sol";
import "./IArbitrator.sol";

contract DeMatch is IArbitrable {
    address public player1;
    address public player2;
    string public meta;
    IArbitrator public arbitrator;

    uint256 public endAt;
    uint256 public constant protestPeriod = 3 minutes; // Timeframe is short on purpose to be able to test it quickly. Not for production use.
    uint256 public constant arbitrationFeeDepositPeriod = 3 minutes; // Timeframe is short on purpose to be able to test it quickly. Not for production use.

    enum Player {
        None,
        Player1,
        Player2
    }

    Player public winner;
    address public announcer;

    enum Status {
        Initial,
        Announced,
        Protested,
        Disputed,
        Resolved
    }
    Status public status;

    uint256 public protestAt;
    uint256 public announcedAt;

    enum RulingOptions {
        RefusedToArbitrate,
        PlayerOneWins,
        PlayerTwoWins
    }
    uint256 constant numberOfRulingOptions = 2; // Notice that option 0 is reserved for RefusedToArbitrate.

    constructor(
        address _player1,
        address _player2,
        IArbitrator _arbitrator,
        uint256 _endAt,
        string memory _meta
    ) {
        player1 = _player1;
        player2 = _player2;
        arbitrator = _arbitrator;
        endAt = _endAt;
        status = Status.Initial;
        meta = _meta;
    }

    modifier onlyPlayer() {
        require(
            msg.sender == player1 || msg.sender == player2,
            "Can only be called by the players."
        );
        _;
    }

    modifier notAnouncer() {
        require(
            msg.sender != announcer,
            "Can only be called by the not announcer."
        );
        _;
    }

    // announce winner
    function announceWinner(Player _winner) public onlyPlayer {
        require(
            status == Status.Initial,
            "Only inital matches can be announced"
        );
        announcer = msg.sender;
        winner = _winner;
        status = Status.Announced;
        announcedAt = block.timestamp;
    }

    function finalizeResult() public onlyPlayer {
        require(
            status == Status.Announced,
            "Only announced matches can be finalized"
        );
        require(
            block.timestamp - endAt > protestPeriod,
            "Oponent still has time to protest."
        );
        status = Status.Resolved;
    }

    // accept result
    function acceptResult() public onlyPlayer notAnouncer {
        require(
            status == Status.Announced,
            "Only announced matches can be accpeted"
        );
        status = Status.Resolved;
    }

    // protest result
    function protestResult() public payable onlyPlayer notAnouncer {
        require(status == Status.Announced, "Match is not in announced state.");
        require(
            block.timestamp - endAt <= protestPeriod,
            "Protest period ended."
        );
        require(
            msg.value == arbitrator.arbitrationCost(""),
            "Can't reclaim funds without depositing arbitration fee."
        );
        protestAt = block.timestamp;
        status = Status.Protested;
    }

    function revertResult(Player _winner) public onlyPlayer notAnouncer {
        require(status == Status.Protested, "Match is not in protested state.");

        require(
            block.timestamp - protestAt > arbitrationFeeDepositPeriod,
            "Announcer still has time to deposit arbitration fee"
        );

        winner = _winner;
        status = Status.Resolved;
    }

    function depositArbitrationFeeForAnnouncer() public payable {
        require(status == Status.Protested, "Match is not in Protested state.");
        arbitrator.createDispute{value: msg.value}(numberOfRulingOptions, "");
        status = Status.Disputed;
    }

    function rule(uint256 _disputeID, uint256 _ruling) public override {
        require(
            msg.sender == address(arbitrator),
            "Only the arbitrator can execute this."
        );
        require(
            status == Status.Disputed,
            "There should be dispute to execute a ruling."
        );
        require(_ruling <= numberOfRulingOptions, "Ruling out of bounds!");

        status = Status.Resolved;
        if (_ruling == uint256(RulingOptions.PlayerOneWins))
            payable(player1).transfer(address(this).balance);
        else if (_ruling == uint256(RulingOptions.PlayerTwoWins))
            payable(player2).transfer(address(this).balance);
        emit Ruling(arbitrator, _disputeID, _ruling);
    }

    function remainingTimeToProtest() public view returns (uint256) {
        require(
            status == Status.Announced,
            "Match is not in an announced state."
        );
        return
            (block.timestamp - announcedAt) > protestPeriod
                ? 0
                : (announcedAt + protestPeriod - block.timestamp);
    }

    function remainingTimeToDepositArbitrationFee()
        public
        view
        returns (uint256)
    {
        require(status == Status.Protested, "Match is not in protested state.");
        return
            (block.timestamp - protestAt) > arbitrationFeeDepositPeriod
                ? 0
                : (protestAt + arbitrationFeeDepositPeriod - block.timestamp);
    }

    function finalizedWinner() public view returns (address) {
        require(status == Status.Resolved, "Winner is not finalized yet.");
        if (winner == Player.Player1) {
            return player1;
        } else {
            return player2;
        }
    }
}
