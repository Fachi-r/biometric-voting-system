const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DappVotes Contract", function () {
  let contract, deployer, contestant1, contestant2, voter1, voter2, voter3;
  const title = "Republican Primary Election";
  const description = "Lorem Ipsum";
  const image = "https://image.png";
  const avatar1 = "https://avatar1.png";
  const name1 = "Nebu Ballon";
  const avatar2 = "https://avatar2.png";
  const name2 = "Kad Neza";

  let starts, ends;
  const pollId = 1;
  const contestantId = 1;

  beforeEach(async function () {
    const DappVotes = await ethers.getContractFactory("DappVotes");
    [deployer, contestant1, contestant2, voter1, voter2, voter3] =
      await ethers.getSigners();

    contract = await DappVotes.deploy();
    await contract.waitForDeployment(); // ethers v6 syntax

    const now = Math.floor(Date.now() / 1000);
    starts = now - 100;
    ends = now + 1000;
  });

  describe("Poll Management", function () {
    it("should create a poll", async function () {
      await contract.createPoll(image, title, description, starts, ends);
      const polls = await contract.getPolls();
      expect(polls.length).to.equal(1);
      expect(polls[0].title).to.equal(title);
      expect(polls[0].director).to.equal(deployer.address);
    });

    it("should update a poll", async function () {
      await contract.createPoll(image, title, description, starts, ends);
      await contract.updatePoll(
        pollId,
        image,
        "New Title",
        description,
        starts,
        ends
      );
      const poll = await contract.getPoll(pollId);
      expect(poll.title).to.equal("New Title");
    });

    it("should delete a poll", async function () {
      await contract.createPoll(image, title, description, starts, ends);
      await contract.deletePoll(pollId);
      const updated = await contract.getPoll(pollId);
      expect(updated.deleted).to.be.true;
      const polls = await contract.getPolls();
      expect(polls.length).to.equal(0);
    });

    it("should fail creating a poll with bad inputs", async function () {
      await expect(
        contract.createPoll("", title, description, starts, ends)
      ).to.be.revertedWith("Image required");

      await expect(
        contract.createPoll(image, title, description, 0, ends)
      ).to.be.revertedWith("Invalid time range");
    });

    it("should fail to update/delete non-existent poll", async function () {
      await expect(
        contract.updatePoll(100, image, title, description, starts, ends)
      ).to.be.revertedWith("Poll does not exist");

      await expect(contract.deletePoll(100)).to.be.revertedWith(
        "Poll does not exist"
      );
    });
  });

  describe("Contest Poll", function () {
    beforeEach(async function () {
      await contract.createPoll(image, title, description, starts, ends);
    });

    it("should allow contestants to enter", async function () {
      await contract.connect(contestant1).contest(pollId, name1, avatar1);
      await contract.connect(contestant2).contest(pollId, name2, avatar2);

      const poll = await contract.getPoll(pollId);
      expect(poll.contestantCount).to.equal(2);

      const allContestants = await contract.getContestants(pollId);
      expect(allContestants.length).to.equal(2);
    });

    it("should prevent double contest or invalid input", async function () {
      await expect(
        contract.connect(contestant1).contest(999, name1, avatar1)
      ).to.be.revertedWith("Poll does not exist");

      await expect(
        contract.connect(contestant1).contest(pollId, "", avatar1)
      ).to.be.revertedWith("Name required");

      await contract.connect(contestant1).contest(pollId, name1, avatar1);

      await expect(
        contract.connect(contestant1).contest(pollId, name1, avatar1)
      ).to.be.revertedWith("Already contested");
    });
  });

  describe("Voting", function () {
    beforeEach(async function () {
      await contract.createPoll(image, title, description, starts, ends);
      await contract.connect(contestant1).contest(pollId, name1, avatar1);
      await contract.connect(contestant2).contest(pollId, name2, avatar2);
    });

    it("should allow users to vote", async function () {
      await contract.connect(voter1).vote(pollId, contestantId);
      await contract.connect(voter2).vote(pollId, contestantId);

      const poll = await contract.getPoll(pollId);
      expect(poll.voteCount).to.equal(2);

      const contestant = await contract.getContestant(pollId, contestantId);
      expect(contestant.votes).to.equal(2);
      expect(contestant.account).to.equal(contestant1.address);
    });

    it("should fail to vote twice or on invalid poll", async function () {
      await contract.connect(voter1).vote(pollId, contestantId);

      await expect(
        contract.connect(voter1).vote(pollId, contestantId)
      ).to.be.revertedWith("Already voted");

      await expect(
        contract.connect(voter3).vote(999, contestantId)
      ).to.be.revertedWith("Poll does not exist");

      await expect(contract.deletePoll(pollId)).to.be.revertedWith(
        "Cannot delete with votes"
      );

      const poll = await contract.getPoll(pollId);
      expect(poll.deleted).to.be.false;
    });
  });
});
