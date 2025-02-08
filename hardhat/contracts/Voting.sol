// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Voting {
    mapping(address => bool) public isAdmin; // Maps addresses to check if they are admins
    mapping(address => bool) public hasVoted; // Maps addresses to check if they have already voted
    mapping(string => uint256) public votes; // Maps candidates to their vote count
    string[] public candidates; // Stores candidate names
    address[] public voters; // Stores addresses of voters
    bool public votingActive; // Flag to check if voting is active

    // Constructor sets up the contract with admins and candidates
    constructor(address[] memory _admins, string[] memory _candidates) {
        isAdmin[msg.sender] = true; // The contract deployer is automatically an admin

        // Adding the provided admin addresses
        for (uint256 i = 0; i < _admins.length; i++) {
            isAdmin[_admins[i]] = true;
        }

        // Adding candidates and initializing their votes
        for (uint256 i = 0; i < _candidates.length; i++) {
            candidates.push(_candidates[i]);
            votes[_candidates[i]] = 0;
        }

        votingActive = false; // Voting is initially inactive
    }

    // Modifier to restrict access to only admins
    modifier onlyAdmin() {
        require(isAdmin[msg.sender], "You must be an admin.");
        _;
    }

    // Modifier to ensure voting is active before voting
    modifier votingIsActive() {
        require(votingActive, "Voting is not currently active.");
        _;
    }

    // Admin can start voting
    function startVoting() public onlyAdmin {
        require(!votingActive, "Voting is already active.");
        votingActive = true;
    }

    // Admin can stop voting
    function stopVoting() public onlyAdmin {
        require(votingActive, "Voting is not active.");
        votingActive = false;
        emit VotingStopped(); // Emit event when voting is stopped
    }

    // Anyone can vote if voting is active and they haven't voted yet
    function castVote(string memory _candidate) public votingIsActive {
        require(!hasVoted[msg.sender], "You've already voted.");

        bool validCandidate = false;
        for (uint256 i = 0; i < candidates.length; i++) {
            if (
                keccak256(abi.encodePacked(_candidate)) ==
                keccak256(abi.encodePacked(candidates[i]))
            ) {
                validCandidate = true;
                break;
            }
        }

        require(validCandidate, "Invalid candidate.");

        votes[_candidate]++; // Increment the candidate's vote count
        hasVoted[msg.sender] = true; // Mark the sender as voted
        voters.push(msg.sender); // Record the voter for later reset
    }

    // Admin can reset votes, clearing vote counts and resetting 'hasVoted' status
    function resetVotes() public onlyAdmin {
        for (uint256 i = 0; i < candidates.length; i++) {
            votes[candidates[i]] = 0; // Reset vote count for each candidate
        }

        // Reset the 'hasVoted' status for each voter
        for (uint256 i = 0; i < voters.length; i++) {
            hasVoted[voters[i]] = false;
        }

        delete voters; // Clear the list of voters

        votingActive = false; // Stop voting
        emit VotesReset(); // Emit event when votes are reset
    }

    // Retrieve the number of votes a specific candidate has
    function getVotes(string memory _candidate) public view returns (uint256) {
        return votes[_candidate];
    }

    // Get the list of candidates
    function getCandidates() public view returns (string[] memory) {
        return candidates;
    }

    // Events to signal changes in voting state
    event VotingStopped();
    event VotesReset();
}
