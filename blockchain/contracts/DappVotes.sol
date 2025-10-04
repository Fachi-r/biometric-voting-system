// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DappVotes {
    struct Poll {
        uint id;
        string image;
        string title;
        string description;
        uint voteCount;
        uint contestantCount;
        bool deleted;
        address director;
        uint startsAt;
        uint endsAt;
        uint createdAt;
    }

    struct Contestant {
        uint id;
        string image;
        string name;
        address account;
        uint votes;
    }

    struct Voter {
        address voterAddress;
        string name;
        uint256 fingerprintId;
        uint256 voterId;
        bool registered;
    }

    uint public totalPolls;
    uint public voterCount;
    mapping(uint => Poll) public polls;
    mapping(uint => mapping(uint => Contestant)) public contestants;
    mapping(uint => mapping(address => bool)) public hasVoted;
    mapping(address => uint[]) public userPolls;
    mapping(address => Voter) public voters;
    Voter[] public voterList;

    event PollCreated(uint indexed pollId, address indexed director, string title);
    event PollUpdated(uint indexed pollId, string title);
    event PollDeleted(uint indexed pollId);
    event ContestantAdded(uint indexed pollId, uint indexed contestantId, address indexed account, string name);
    event VoteCast(uint indexed pollId, uint indexed contestantId, address indexed voter);
    event VoterRegistered(address indexed voterAddress, uint256 indexed voterId, string name, uint256 fingerprintId);

    modifier onlyDirector(uint _pollId) {
        require(polls[_pollId].director == msg.sender, "Only poll director can perform this action");
        _;
    }

    modifier pollExists(uint _pollId) {
        require(_pollId > 0 && _pollId <= totalPolls, "Poll does not exist");
        require(!polls[_pollId].deleted, "Poll has been deleted");
        _;
    }

    modifier validTimeframe(uint _startsAt, uint _endsAt) {
        require(_startsAt > block.timestamp, "Start time must be in the future");
        require(_endsAt > _startsAt, "End time must be after start time");
        _;
    }

    function createPoll(
        string memory _image,
        string memory _title,
        string memory _description,
        uint _startsAt,
        uint _endsAt
    ) public validTimeframe(_startsAt, _endsAt) returns (uint) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");

        totalPolls++;
        
        polls[totalPolls] = Poll({
            id: totalPolls,
            image: _image,
            title: _title,
            description: _description,
            voteCount: 0,
            contestantCount: 0,
            deleted: false,
            director: msg.sender,
            startsAt: _startsAt,
            endsAt: _endsAt,
            createdAt: block.timestamp
        });

        userPolls[msg.sender].push(totalPolls);
        
        emit PollCreated(totalPolls, msg.sender, _title);
        return totalPolls;
    }

    function updatePoll(
        uint _pollId,
        string memory _image,
        string memory _title,
        string memory _description,
        uint _startsAt,
        uint _endsAt
    ) public pollExists(_pollId) onlyDirector(_pollId) validTimeframe(_startsAt, _endsAt) {
        require(polls[_pollId].voteCount == 0, "Cannot update poll after votes have been cast");
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");

        Poll storage poll = polls[_pollId];
        poll.image = _image;
        poll.title = _title;
        poll.description = _description;
        poll.startsAt = _startsAt;
        poll.endsAt = _endsAt;

        emit PollUpdated(_pollId, _title);
    }

    function deletePoll(uint _pollId) public pollExists(_pollId) onlyDirector(_pollId) {
        require(polls[_pollId].voteCount == 0, "Cannot delete poll with existing votes");
        
        polls[_pollId].deleted = true;
        emit PollDeleted(_pollId);
    }

    function contest(
        uint _pollId,
        string memory _name,
        string memory _image
    ) public pollExists(_pollId) {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(block.timestamp < polls[_pollId].startsAt, "Cannot join after poll has started");

        Poll storage poll = polls[_pollId];
        poll.contestantCount++;

        contestants[_pollId][poll.contestantCount] = Contestant({
            id: poll.contestantCount,
            image: _image,
            name: _name,
            account: msg.sender,
            votes: 0
        });

        emit ContestantAdded(_pollId, poll.contestantCount, msg.sender, _name);
    }

    function vote(uint _pollId, uint _contestantId) public pollExists(_pollId) {
        require(!hasVoted[_pollId][msg.sender], "You have already voted in this poll");
        require(block.timestamp >= polls[_pollId].startsAt, "Voting has not started yet");
        require(block.timestamp <= polls[_pollId].endsAt, "Voting has ended");
        require(_contestantId > 0 && _contestantId <= polls[_pollId].contestantCount, "Invalid contestant");
        require(polls[_pollId].contestantCount >= 2, "Poll must have at least 2 contestants");

        hasVoted[_pollId][msg.sender] = true;
        contestants[_pollId][_contestantId].votes++;
        polls[_pollId].voteCount++;

        emit VoteCast(_pollId, _contestantId, msg.sender);
    }

    function getPolls() public view returns (Poll[] memory) {
        uint validPollCount = 0;
        
        // Count valid polls
        for (uint i = 1; i <= totalPolls; i++) {
            if (!polls[i].deleted) {
                validPollCount++;
            }
        }

        Poll[] memory validPolls = new Poll[](validPollCount);
        uint currentIndex = 0;

        // Fill array with valid polls
        for (uint i = 1; i <= totalPolls; i++) {
            if (!polls[i].deleted) {
                validPolls[currentIndex] = polls[i];
                currentIndex++;
            }
        }

        return validPolls;
    }

    function getContestants(uint _pollId) public view pollExists(_pollId) returns (Contestant[] memory) {
        uint contestantCount = polls[_pollId].contestantCount;
        Contestant[] memory pollContestants = new Contestant[](contestantCount);

        for (uint i = 1; i <= contestantCount; i++) {
            pollContestants[i - 1] = contestants[_pollId][i];
        }

        return pollContestants;
    }

    function hasAddressVoted(uint _pollId, address _voter) public view pollExists(_pollId) returns (bool) {
        return hasVoted[_pollId][_voter];
    }

    function getPoll(uint _pollId) public view pollExists(_pollId) returns (Poll memory) {
        return polls[_pollId];
    }

    function getUserPolls(address _user) public view returns (uint[] memory) {
        return userPolls[_user];
    }

    function isPollActive(uint _pollId) public view pollExists(_pollId) returns (bool) {
        Poll memory poll = polls[_pollId];
        return (block.timestamp >= poll.startsAt && block.timestamp <= poll.endsAt);
    }

    function getPollStatus(uint _pollId) public view pollExists(_pollId) returns (string memory) {
        Poll memory poll = polls[_pollId];
        
        if (block.timestamp < poll.startsAt) {
            return "upcoming";
        } else if (block.timestamp >= poll.startsAt && block.timestamp <= poll.endsAt) {
            return "active";
        } else {
            return "ended";
        }
    }

    function registerVoter(
        address _voterAddress,
        string memory _name,
        uint256 _fingerprintId
    ) public returns (uint256) {
        require(!voters[_voterAddress].registered, "Voter already registered");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(_fingerprintId > 0, "Invalid fingerprint ID");

        voterCount++;

        Voter memory newVoter = Voter({
            voterAddress: _voterAddress,
            name: _name,
            fingerprintId: _fingerprintId,
            voterId: voterCount,
            registered: true
        });

        voters[_voterAddress] = newVoter;
        voterList.push(newVoter);

        emit VoterRegistered(_voterAddress, voterCount, _name, _fingerprintId);
        return voterCount;
    }

    function getAllVoters() public view returns (Voter[] memory) {
        return voterList;
    }

    function isVoterRegistered(address _voterAddress) public view returns (bool) {
        return voters[_voterAddress].registered;
    }

    function getVoter(address _voterAddress) public view returns (Voter memory) {
        require(voters[_voterAddress].registered, "Voter not registered");
        return voters[_voterAddress];
    }
}