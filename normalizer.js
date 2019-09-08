const csv = require('fast-csv');
const fs = require('fs');
const moment = require('moment');
const tz = require('moment-timezone');

const testFilePath = './sample1.csv';

const output = fs.createWriteStream('output.csv').on('finish', function() {
  console.log('Writing new CSV complete');
});
const cleanField = string => {
  const normalized = string.normalize();
  return normalized;
};

// Convert durations from HH:MM:SS.MS into seconds
const handleDuration = duration => {
  const timeArray = duration.split(':');
  const convertedHours = +timeArray[0] * 60 * 60;
  const convertedMinutes = +timeArray[1] * 60;
  const secondsWithMilliseconds = +timeArray[2];

  return convertedHours + convertedMinutes + secondsWithMilliseconds;
};

// Convert timestamp from Pacific to Eastern time (or return error for invalid dates)
const handleTimestamp = timestamp => {
  const tzMoment = moment
    .tz(timestamp, 'MM-DD-YY hh:mm:ss a', 'America/Los_Angeles')
    .tz('America/New_York');

  return tzMoment.isValid()
    ? tzMoment.format()
    : { error: tzMoment.invalidAt() || 'Invalid Date' };
};

// Prefix shorter numbers with zero to reach five digit zip code length
const handleZip = num => {
  if (num.length < 5) {
    const prefix = new Array(5 - num.length).fill(0).join('');
    num = `${prefix}${num}`;
  }
  return num;
};

csvStream = csv
  .fromPath(testFilePath, { headers: true })
  .transform(function(obj) {
    const BarDuration = handleDuration(obj.BarDuration);
    const FooDuration = handleDuration(obj.FooDuration);
    const FullName = obj.FullName.toUpperCase();
    const Address = cleanField(data.Address);
    const Notes = cleanField(data.Notes);
    const TotalDuration = BarDuration + FooDuration;
    const Timestamp = handleTimestamp(obj.Timestamp);
    const ZIP = handleZip(obj.ZIP);

    // Print error and drop row when timestamp is invalid
    if (Timestamp.error) {
      //stnderr
      return;
    }

    return {
      Timestamp,
      Address,
      ZIP,
      FullName,
      FooDuration,
      BarDuration,
      TotalDuration,
      Notes
    };
  })
  .pipe(csv.createWriteStream({ headers: true }))
  .pipe(output);
