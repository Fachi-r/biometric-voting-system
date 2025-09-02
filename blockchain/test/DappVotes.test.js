const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DappVotes", function () {
  let DappVotes;
  let dappVotes;
  let owner;
  let addr1;
  let addr2;
  let addr3;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    DappVotes = await ethers.getContractFactory("DappVotes");
    dappVotes = await DappVotes.deploy();
    await dappVotes.waitForDeployment();
  });

  describe("Poll Creation", function () {
    it("Should create a poll successfully", async function () {
      const currentTime = Math.floor(Date.now() / 1000);
      const startsAt = currentTime + 3600; // 1 hour from now
      const endsAt = startsAt + 86400; // 24 hours after start

      await dappVotes.createPoll(
        "https://example.com/image.jpg",
        "Test Poll",
        "This is a test poll",
        startsAt,
        endsAt
      );

      const polls = await dappVotes.getPolls();
      expect(polls.length).to.equal(1);
      expect(polls[0].title).to.equal("Test Poll");
      expect(polls[0].director).to.equal(owner.address);
    });

    it("Should fail to create poll with invalid timeframe", async function () {
      const currentTime = Math.floor(Date.now() / 1000);
      const startsAt = currentTime - 3600; // 1 hour ago (invalid)
      const endsAt = startsAt + 86400;

      await expect(
        dappVotes.createPoll(
          "https://example.com/image.jpg",
          "Test Poll",
          "This is a test poll",
          startsAt,
          endsAt
        )
      ).to.be.revertedWith("Start time must be in the future");
    });

    it("Should fail to create poll with empty title", async function () {
      const currentTime = Math.floor(Date.now() / 1000);
      const startsAt = currentTime + 3600;
      const endsAt = startsAt + 86400;

      await expect(
        dappVotes.createPoll(
          "https://example.com/image.jpg",
          "",
          "This is a test poll",
          startsAt,
          endsAt
        )
      ).to.be.revertedWith("Title cannot be empty");
    });
  });

  describe("Contest Registration", function () {
    let pollId;

    beforeEach(async function () {
      const currentTime = Math.floor(Date.now() / 1000);
      const startsAt = currentTime + 3600;
      const endsAt = startsAt + 86400;

      await dappVotes.createPoll(
        "https://example.com/image.jpg",
        "Test Poll",
        "This is a test poll",
        startsAt,
        endsAt
      );
      pollId = 1;
    });

    it("Should allow contestants to register", async function () {
      await dappVotes.connect(addr1).contest(
        pollId,
        "Contestant 1",
        "https://example.com/contestant1.jpg"
      );

      const contestants = await dappVotes.getContestants(pollId);
      expect(contestants.length).to.equal(1);
      expect(contestants[0].name).to.equal("Contestant 1");
      expect(contestants[0].account).to.equal(addr1.address);
    });

    it("Should fail to register with empty name", async function () {
      await expect(
        dappVotes.connect(addr1).contest(
          pollId,
          "",
          "https://example.com/contestant1.jpg"
        )
      ).to.be.revertedWith("Name cannot be empty");
    });
  });

  describe("Voting", function () {
    let pollId;

    beforeEach(async function () {
      const currentTime = Math.floor(Date.now() / 1000);
      const startsAt = currentTime + 1; // 1 second from now
      const endsAt = startsAt + 86400;

      await dappVotes.createPoll(
        "https://example.com/image.jpg",
        "Test Poll",
        "This is a test poll",
        startsAt,
        endsAt
      );
      pollId = 1;

      // Add contestants
      await dappVotes.connect(addr1).contest(
        pollId,
        "Contestant 1",
        "https://example.com/contestant1.jpg"
      );
      await dappVotes.connect(addr2).contest(
        pollId,
        "Contestant 2",
        "https://example.com/contestant2.jpg"
      );

      // Wait for poll to start
      await new Promise(resolve => setTimeout(resolve, 2000));
    });

    it("Should allow voting for contestants", async function () {
      await dappVotes.connect(addr3).vote(pollId, 1);

      const contestants = await dappVotes.getContestants(pollId);
      expect(contestants[0].votes).to.equal(1);

      const hasVotedResult = await dappVotes.hasAddressVoted(pollId, addr3.address);
      expect(hasVotedResult).to.be.true;
    });

    it("Should prevent double voting", async function () {
      await dappVotes.connect(addr3).vote(pollId, 1);

      await expect(
        dappVotes.connect(addr3).vote(pollId, 2)
      ).to.be.revertedWith("You have already voted in this poll");
    });

    it("Should fail to vote for non-existent contestant", async function () {
      await expect(
        dappVotes.connect(addr3).vote(pollId, 99)
      ).to.be.revertedWith("Invalid contestant");
    });
  });

  describe("Poll Management", function () {
    let pollId;

    beforeEach(async function () {
      const currentTime = Math.floor(Date.now() / 1000);
      const startsAt = currentTime + 3600;
      const endsAt = startsAt + 86400;

      await dappVotes.createPoll(
        "https://example.com/image.jpg",
        "Test Poll",
        "This is a test poll",
        startsAt,
        endsAt
      );
      pollId = 1;
    });

    it("Should allow director to update poll before votes", async function () {
      const currentTime = Math.floor(Date.now() / 1000);
      const newStartsAt = currentTime + 7200;
      const newEndsAt = newStartsAt + 86400;

      await dappVotes.updatePoll(
        pollId,
        "https://example.com/newimage.jpg",
        "Updated Poll Title",
        "Updated description",
        newStartsAt,
        newEndsAt
      );

      const poll = await dappVotes.getPoll(pollId);
      expect(poll.title).to.equal("Updated Poll Title");
    });

    it("Should allow director to delete poll with no votes", async function () {
      await dappVotes.deletePoll(pollId);

      const polls = await dappVotes.getPolls();
      expect(polls.length).to.equal(0);
    });

    it("Should fail to update poll from non-director", async function () {
      const currentTime = Math.floor(Date.now() / 1000);
      const newStartsAt = currentTime + 7200;
      const newEndsAt = newStartsAt + 86400;

      await expect(
        dappVotes.connect(addr1).updatePoll(
          pollId,
          "https://example.com/newimage.jpg",
          "Updated Poll Title",
          "Updated description",
          newStartsAt,
          newEndsAt
        )
      ).to.be.revertedWith("Only poll director can perform this action");
    });
  });

  describe("Poll Status", function () {
    it("Should return correct poll status", async function () {
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Create upcoming poll
      const startsAt = currentTime + 3600;
      const endsAt = startsAt + 86400;

      await dappVotes.createPoll(
        "https://example.com/image.jpg",
        "Test Poll",
        "This is a test poll",
        startsAt,
        endsAt
      );

      const status = await dappVotes.getPollStatus(1);
      expect(status).to.equal("upcoming");
    });
  });
});