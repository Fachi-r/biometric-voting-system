// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0

pragma solidity >=0.7.0 <0.9.0;

import "../utils/counter.sol";

// TODO: Add fingerprint logic to the smart contract (based on hashed fingerprint ID).
// TODO: Implement custom Counter function

contract DappVotes {
    using Counters for Counters.Counter;
    Counters.Counter private totalPolls;

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

    mapping(uint => Poll) private polls;
    mapping(uint => bool) private pollExists;
    mapping(uint => mapping(address => bool)) private hasVoted;
    mapping(uint => mapping(address => bool)) private hasContested;
    mapping(uint => mapping(uint => Contestant)) private pollContestants;
    mapping(uint => Counters.Counter) private pollContestantCounters;

    event PollCreated(uint indexed pollId, address indexed creator);
    event PollUpdated(uint indexed pollId);
    event PollDeleted(uint indexed pollId);
    event Contested(
        uint indexed pollId,
        uint indexed contestantId,
        address indexed contestant
    );
    event Voted(
        uint indexed pollId,
        uint indexed contestantId,
        address indexed voter
    );

    modifier onlyDirector(uint pollId) {
        require(pollExists[pollId], "Poll does not exist");
        require(polls[pollId].director == msg.sender, "Not poll director");
        _;
    }

    modifier pollActive(uint pollId) {
        require(pollExists[pollId], "Poll does not exist");
        require(
            block.timestamp >= polls[pollId].startsAt &&
                block.timestamp < polls[pollId].endsAt,
            "Poll not active"
        );
        _;
    }

    function createPoll(
        string memory image,
        string memory title,
        string memory description,
        uint startsAt,
        uint endsAt
    ) external {
        require(bytes(image).length > 0, "Image required");
        require(bytes(title).length > 0, "Title required");
        require(bytes(description).length > 0, "Description required");
        require(startsAt > 0 && endsAt > startsAt, "Invalid time range");

        totalPolls.increment();
        uint pollId = totalPolls.current();

        polls[pollId] = Poll({
            id: pollId,
            image: image,
            title: title,
            description: description,
            voteCount: 0,
            contestantCount: 0,
            deleted: false,
            director: msg.sender,
            startsAt: startsAt,
            endsAt: endsAt,
            createdAt: block.timestamp
        });

        pollExists[pollId] = true;
        emit PollCreated(pollId, msg.sender);
    }

    function updatePoll(
        uint pollId,
        string memory image,
        string memory title,
        string memory description,
        uint startsAt,
        uint endsAt
    ) external onlyDirector(pollId) {
        Poll storage poll = polls[pollId];
        require(!poll.deleted, "Poll is deleted");
        require(poll.voteCount == 0, "Poll already has votes");
        require(endsAt > startsAt, "Invalid time range");

        poll.image = image;
        poll.title = title;
        poll.description = description;
        poll.startsAt = startsAt;
        poll.endsAt = endsAt;

        emit PollUpdated(pollId);
    }

    function deletePoll(uint pollId) external onlyDirector(pollId) {
        require(pollExists[pollId], "Poll does not exist");
        Poll storage poll = polls[pollId];
        require(!poll.deleted, "Poll already deleted");
        require(poll.voteCount == 0, "Cannot delete with votes");

        poll.deleted = true;
        emit PollDeleted(pollId);
    }

    function contest(
        uint pollId,
        string memory name,
        string memory image
    ) external {
        require(pollExists[pollId], "Poll does not exist");
        require(!hasContested[pollId][msg.sender], "Already contested");
        require(polls[pollId].voteCount == 0, "Poll already started");

        require(bytes(name).length > 0, "Name required");
        require(bytes(image).length > 0, "Image required");

        pollContestantCounters[pollId].increment();
        uint contestantId = pollContestantCounters[pollId].current();

        pollContestants[pollId][contestantId] = Contestant({
            id: contestantId,
            image: image,
            name: name,
            account: msg.sender,
            votes: 0
        });

        hasContested[pollId][msg.sender] = true;
        polls[pollId].contestantCount++;

        emit Contested(pollId, contestantId, msg.sender);
    }

    function vote(uint pollId, uint contestantId) external pollActive(pollId) {
        require(pollExists[pollId], "Poll does not exist");
        require(!hasVoted[pollId][msg.sender], "Already voted");
        require(!polls[pollId].deleted, "Poll deleted");
        require(polls[pollId].contestantCount >= 2, "Not enough contestants");

        Contestant storage contestant = pollContestants[pollId][contestantId];
        require(contestant.account != address(0), "Invalid contestant");

        contestant.votes++;
        polls[pollId].voteCount++;
        hasVoted[pollId][msg.sender] = true;

        emit Voted(pollId, contestantId, msg.sender);
    }

    function getPoll(uint pollId) external view returns (Poll memory) {
        require(pollExists[pollId], "Poll does not exist");
        return polls[pollId];
    }

    function getPolls() external view returns (Poll[] memory activePolls) {
        uint count;
        for (uint i = 1; i <= totalPolls.current(); i++) {
            if (!polls[i].deleted) count++;
        }

        activePolls = new Poll[](count);
        uint index;
        for (uint i = 1; i <= totalPolls.current(); i++) {
            if (!polls[i].deleted) {
                activePolls[index++] = polls[i];
            }
        }
    }

    function getContestants(
        uint pollId
    ) external view returns (Contestant[] memory) {
        require(pollExists[pollId], "Poll does not exist");

        uint total = pollContestantCounters[pollId].current();
        Contestant[] memory results = new Contestant[](total);

        for (uint i = 1; i <= total; i++) {
            results[i - 1] = pollContestants[pollId][i];
        }

        return results;
    }

    function getContestant(
        uint pollId,
        uint contestantId
    ) external view returns (Contestant memory) {
        require(pollExists[pollId], "Poll does not exist");
        return pollContestants[pollId][contestantId];
    }

    function getPollCount() external view returns (uint) {
        return totalPolls.current();
    }

    function hasUserVoted(
        uint pollId,
        address user
    ) external view returns (bool) {
        require(pollExists[pollId], "Poll does not exist");
        return hasVoted[pollId][user];
    }

    function hasUserContested(
        uint pollId,
        address user
    ) external view returns (bool) {
        require(pollExists[pollId], "Poll does not exist");
        return hasContested[pollId][user];
    }
}
