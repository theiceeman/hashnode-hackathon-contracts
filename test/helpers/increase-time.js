const { latestTime } = require("./latest-time");

/* 
    // opening time will be in one week
    this.openingTime = latestTime() + duration.weeks(1);

    // will close one week after opening time
    this.closingTime = this.openingTime + duration.weeks(1);

    // For the test, advance blockchain time to time when the presale start
    await increaseTimeTo(this.openingTime + 1);

 */

/**
 * Forwards blockchain time to the passed argument in seconds.
 *
 * @param target time in seconds
 */
async function increaseTimeTo(target) {
  try {
    let now = await latestTime();
    if (target < now)
      throw Error(
        `Cannot increase current time(${now}) to a moment in the past(${target})`
      );

    let res = await ethers.provider.send("evm_mine", [target]);
    return res;
  } catch (err) {
    console.log(err);
  }
}

const duration = {
  seconds: function (val) {
    return val;
  },
  minutes: function (val) {
    return val * this.seconds(60);
  },
  hours: function (val) {
    return val * this.minutes(60);
  },
  days: function (val) {
    return val * this.hours(24);
  },
  weeks: function (val) {
    return val * this.days(7);
  },
  years: function (val) {
    return val * this.days(365);
  },
};

module.exports = {
  increaseTimeTo,
  duration,
};
