/**
 * SPDX-License-Identifier: MIT
 */
pragma solidity >=0.7;

import "./DeMatch.sol";
import "./IArbitrator.sol";

// This is a simple tournament contract to show usecases of DeMatches
contract SimpleTournaments {
    DeMatch[] public matches;

    struct Checkout {
        uint256 amount;
        bool checkedOut;
    }

    mapping(uint256 => Checkout) checkouts;

    struct MatchProposal {
        address proposer;
        uint256 amount;
        bool open;
        string title;
    }

    MatchProposal[] public proposedMatches;

    IArbitrator arbitrator;

    constructor(IArbitrator _arbitrator) {
        arbitrator = _arbitrator;
    }

    function proposeMatch(string memory _title)
        public
        payable
        returns (uint256)
    {
        proposedMatches.push(
            MatchProposal({
                proposer: msg.sender,
                amount: msg.value,
                open: true,
                title: _title
            })
        );

        return proposedMatches.length - 1;
    }

    function endProposal(uint256 _proposalId) public {
        MatchProposal memory currentProposal = proposedMatches[_proposalId];

        require(
            msg.sender == currentProposal.proposer,
            "Only proposer and end it."
        );

        require(
            currentProposal.open == true,
            "Proposal is not in an endable state"
        );

        proposedMatches[_proposalId] = MatchProposal({
            title: currentProposal.title,
            proposer: currentProposal.proposer,
            amount: currentProposal.amount,
            open: false
        });

        payable(currentProposal.proposer).transfer(currentProposal.amount);
    }

    function getProposalAmount(uint256 _proposalId)
        public
        view
        returns (uint256)
    {
        return proposedMatches[_proposalId].amount;
    }

    function acceptProposal(uint256 _proposalId)
        public
        payable
        returns (uint256)
    {
        MatchProposal memory currentProposal = proposedMatches[_proposalId];

        require(
            msg.value >= currentProposal.amount,
            "You must pay the proposal amount to accept it."
        );

        proposedMatches[_proposalId] = MatchProposal({
            title: currentProposal.title,
            proposer: currentProposal.proposer,
            amount: currentProposal.amount,
            open: false
        });

        matches.push(
            new DeMatch(
                currentProposal.proposer,
                msg.sender,
                arbitrator,
                block.timestamp,
                currentProposal.title
            )
        );
        checkouts[matches.length - 1] = Checkout({
            amount: currentProposal.amount + msg.value,
            checkedOut: false
        });

        return matches.length - 1;
    }

    function withdrawFunds(uint256 _matchId) public {
        require(
            checkouts[_matchId].checkedOut == false,
            "This match is already withdrawed."
        );
        DeMatch currentMatch = matches[_matchId];
        require(
            currentMatch.finalizedWinner() == msg.sender,
            "You're not this match winner. Atleast yet."
        );
        payable(msg.sender).transfer(checkouts[_matchId].amount);
    }

    function getMatches() public view returns (DeMatch[] memory) {
        return matches;
    }

    function getProposals() public view returns (MatchProposal[] memory) {
        return proposedMatches;
    }
}
