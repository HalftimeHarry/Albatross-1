// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract NFTDAO {
    IERC20 public stakeToken;
    uint256 public nftID;

    uint256 public proposalCount;
    uint256 public minQuorum;

    struct Proposal {
        uint256 id;
        address proposer;
        string description;
        bytes callData;
        address target;
        bool executed;
        uint256 forVotes;
        uint256 againstVotes;
        mapping(address => bool) voted;
    }

    mapping(uint256 => Proposal) public proposals;

    event ProposalCreated(uint256 proposalID, address proposer, string description);
    event Voted(uint256 proposalID, address voter, bool vote);
    event ProposalExecuted(uint256 proposalID);

    constructor(address _stakeToken, uint256 _nftID, uint256 _minQuorum) {
        stakeToken = IERC20(_stakeToken);
        nftID = _nftID;
        minQuorum = _minQuorum;
    }

    function createProposal(string memory description, address target, bytes memory callData) public {
        proposalCount++;

        proposals[proposalCount].id = proposalCount;
        proposals[proposalCount].proposer = msg.sender;
        proposals[proposalCount].description = description;
        proposals[proposalCount].callData = callData;
        proposals[proposalCount].target = target;
        proposals[proposalCount].executed = false;
        proposals[proposalCount].forVotes = 0;
        proposals[proposalCount].againstVotes = 0;

        emit ProposalCreated(proposalCount, msg.sender, description);
    }

    function vote(uint256 proposalID, bool support) public {
        Proposal storage proposal = proposals[proposalID];
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.voted[msg.sender], "Already voted");

        uint256 voterStake = stakeToken.balanceOf(msg.sender);
        require(voterStake > 0, "No stake tokens");

        if (support) {
            proposal.forVotes += voterStake;
        } else {
            proposal.againstVotes += voterStake;
        }
        proposal.voted[msg.sender] = true;

        emit Voted(proposalID, msg.sender, support);
    }

    function executeProposal(uint256 proposalID) public {
        Proposal storage proposal = proposals[proposalID];
        require(!proposal.executed, "Proposal already executed");
        require(proposal.forVotes + proposal.againstVotes >= minQuorum, "Not enough votes");
        require(proposal.forVotes > proposal.againstVotes, "Not enough support");

        (bool success, ) = proposal.target.call(proposal.callData);
        require(success, "Execution failed");

        proposal.executed = true;

        emit ProposalExecuted(proposalID);
    }

    function setMinQuorum(uint256 _minQuorum) public {
        minQuorum = _minQuorum;
    }
}
