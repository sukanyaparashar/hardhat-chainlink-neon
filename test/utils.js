const hre = require("hardhat");
const { expect, assert } = require("chai");

describe("Utils", function () {
  let utils;

  beforeEach(async function () {
    const Utils = await hre.ethers.getContractFactory("Utils");
    utils = await Utils.deploy();
    await utils.deployed();
  });

  describe(".extractRound", function () {
    /*
      Raw Transmission data sample:

      slot: u64 = 138620452,
      timestamp: u32 = 1654260800,
      _padding0: u32 = 0,
      answer: i128 = 176139103829,
      _padding1: u64 = 0,
      _padding2: u64 = 0,
    */
    const transmission =
      "0x" +
      "242e43080000000040049a6200000000" +
      "556eb502290000000000000000000000" +
      "00000000000000000000000000000000";

    const _roundId = 31337;

    it("should set round id", async function () {
      const { roundId } = await utils.extractRound(_roundId, transmission);
      expect(roundId).to.equal(_roundId);
    });

    it("should extract timestamp of a round from transmission struct data", async function () {
      const { timestamp } = await utils.extractRound(_roundId, transmission);
      expect(timestamp).to.equal(1654260800);
    });

    it("should extract answer of a round from transmission struct data", async function () {
      const { answer } = await utils.extractRound(_roundId, transmission);
      expect(answer).to.equal("176139103829");
    });

    describe("when transmission is not ready", async function () {
      const transmission =
        "0x" +
        "00000000000000000000000000000000" +
        "00000000000000000000000000000000" +
        "00000000000000000000000000000000";

      it("reverts", async function () {
        try {
          await utils.extractRound(_roundId, transmission);
          throw null;
        } catch (error) {
          expect(error.message).to.include("No data present");
        }
      });
    });
  });

  describe(".extractHeader", function () {
    /*
      Raw Header data sample:

      version: u8 = 2
      state: u8 = 1
      owner: Pubkey
      proposed_owner: Pubkey
      writer: Pubkey
      description: [u8; 32] = "ETH / USD"
      decimals: u8 = 8
      flagging_threshold: u32
      latest_round_id: u32 = 1638131
      granularity: u8 = 30
      live_length: u32 = 1024
      live_cursor: u32 = 755
      historical_cursor: u32 = 54604
    */
    const header =
      "0x" +
      "020111d3be3f3544f970bd6fd0d49cc6" +
      "9cd3ea549b220b34c874ede871afe057" +
      "550f0000000000000000000000000000" +
      "00000000000000000000000000000000" +
      "00006c6670e4187ad830d9c44710b498" +
      "044edee2e3d2c1512d030b73cebdc092" +
      "fc3e455448202f205553440000000000" +
      "00000000000000000000000000000000" +
      "00000800000000f3fe18001e00040000" +
      "f30200004cd500000000000000000000" +
      "00000000000000000000000000000000" +
      "00000000000000000000000000000000";

    it("should extract version of a feed from header struct data", async function () {
      const { version } = await utils.extractHeader(header);
      expect(version).to.equal(2);
    });

    it("should extract description of a feed from header struct data", async function () {
      const { description } = await utils.extractHeader(header);
      expect(description).to.equal("ETH / USD");
    });

    it("should extract decimals of a feed from header struct data", async function () {
      const { decimals } = await utils.extractHeader(header);
      expect(decimals).to.equal(8);
    });

    it("should extract latest round id from header struct data", async function () {
      const { latestRoundId } = await utils.extractHeader(header);
      expect(latestRoundId).to.equal(1638131);
    });

    it("should extract length of the live ring buffer from header struct data", async function () {
      const { liveLength } = await utils.extractHeader(header);
      expect(liveLength).to.equal(1024);
    });

    it("should extract cursor of the live ring buffer from header struct data", async function () {
      const { liveCursor } = await utils.extractHeader(header);
      expect(liveCursor).to.equal(755);
    });

    it("should extract cursor of the historical ring buffer from header struct data", async function () {
      const { historicalCursor } = await utils.extractHeader(header);
      expect(historicalCursor).to.equal(54604);
    });

    it("should extract granularity of the historical ring buffer from header struct data", async function () {
      const { granularity } = await utils.extractHeader(header);
      expect(granularity).to.equal(30);
    });
  });

  describe(".leftShiftRingbufferCursor", function () {
    const length = 1024;

    it("left shifts cursor by the number of steps", async function () {
      const cursor = await utils.leftShiftRingbufferCursor(100, 1, length);
      expect(cursor).to.equal(99);
    });

    it("takes into account ringbuffer wraparound", async function () {
      const cursor = await utils.leftShiftRingbufferCursor(0, 1, length);
      expect(cursor).to.equal(1023);
    });
  });

  describe(".locateRound", function () {
    // Transmissions layout
    // 0   1   2   3   4   5   6   7   8   9   10  11  12  13  14
    // | Live            | Historical
    // 0   1   2   3   4 | 0   1   2   3   4   5   6   7   8   9
    // 36  37  38  34  35| 33  36  9   12  15  18  21  24  27  30
    //             ^               ^
    //             liveCursor      historicalCursor

    const liveCursor = 3;
    const liveLength = 5;
    const latestRoundId = 38;
    const historicalCursor = 2;
    const historicalLength = 10;
    const granularity = 3;

    async function locate(roundId) {
      return utils.locateRound(
        roundId,
        liveCursor,
        liveLength,
        latestRoundId,
        historicalCursor,
        historicalLength,
        granularity
      );
    }

    describe("when round is out of range", function () {
      it("reverts", async function () {
        try {
          await locate(42);
          throw null;
        } catch (error) {
          assert(error, "Expected an error but did not get one");
          assert(
            error.reason,
            "Expected no data present error, but received " + error
          );
        }
      });
    });

    describe("when round is within the live range", function () {
      it("finds position to the left of the live cursor", async function () {
        const { position, correctedRoundId } = await locate(36);

        expect(correctedRoundId).to.equal(36);
        expect(position).to.equal(0);
      });

      it("finds position of the latest round", async function () {
        const { position, correctedRoundId } = await locate(38);

        expect(correctedRoundId).to.equal(38);
        expect(position).to.equal(2);
      });

      it("finds position to the right of the live cursor", async function () {
        const { position, correctedRoundId } = await locate(35);

        expect(correctedRoundId).to.equal(35);
        expect(position).to.equal(4);
      });
    });

    describe("when round is within the historical range", function () {
      it("finds position to the left of the historical cursor", async function () {
        const { position, correctedRoundId } = await locate(33);

        expect(correctedRoundId).to.equal(33);
        expect(position).to.equal(5);
      });

      it("finds position to the right of the historical cursor", async function () {
        const { position, correctedRoundId } = await locate(15);

        expect(correctedRoundId).to.equal(15);
        expect(position).to.equal(9);
      });

      it("finds position and corrects round id according to granularity", async function () {
        const { position, correctedRoundId } = await locate(17);

        expect(correctedRoundId).to.equal(15);
        expect(position).to.equal(9);
      });

      it("finds position when historical cursor points to the round", async function () {
        const { position, correctedRoundId } = await locate(9);

        expect(correctedRoundId).to.equal(9);
        expect(position).to.equal(7);
      });
    });

    describe("when historical data does not present", function () {
      const liveCursor = 0;
      const liveLength = 1;
      const latestRoundId = 38;
      const historicalCursor = 0;
      const historicalLength = 0;
      const granularity = 1;

      it("reverts", async function () {
        try {
          await utils.locateRound(
            42,
            liveCursor,
            liveLength,
            latestRoundId,
            historicalCursor,
            historicalLength,
            granularity
          );
          throw null;
        } catch (error) {
          assert(error, "Expected an error but did not get one");
          assert(
            error.reason,
            "Expected no data present error, but received " + error
          );
        }
      });
    });
  });
});
