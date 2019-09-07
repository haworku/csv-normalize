const csv = require('fast-csv');
const fs = require('fs');
const moment = require('moment');
const tz = require('moment-timezone');

const testFilePath = './sample1.csv';

const output = fs.createWriteStream('output.csv').on('finish', function() {
  console.log('Writing new CSV complete');
});

const prefixZip = num => {
  if (num.length < 5) {
    const prefix = new Array(5 - num.length).fill(0).join('');
    num = `${prefix}${num}`;
  }
  return num;
};

csvStream = csv
  .fromPath(testFilePath, { headers: true })
  .transform(function(obj) {
    const FullName = obj.FullName.toUpperCase();
    const ZIP = prefixZip(obj.ZIP);

    const Timestamp = moment
      .tz(obj.Timestamp, 'YYYY-MM-DD hh:mm:ss a', 'America/Los_Angeles')
      .tz('America/New_York')
      .format();

    // console.log(obj.Timestamp, Timestamp);
    return {
      Timestamp,
      //   Address: obj.Address,
      ZIP,
      FullName
      //   BarDuration: obj.BarDuration,
      //   TotalDuration: obj.TotalDuration,
      //   Notes: obj.Notes
    };
  })
  .pipe(csv.createWriteStream({ headers: true }))
  .pipe(output);
