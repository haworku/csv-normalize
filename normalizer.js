const csv = require('fast-csv');
const fs = require('fs');
const moment = require('moment');
const tz = require('moment-timezone');

const cleanField = string => {
  const normalized = string.normalize();
  return normalized;
};

// Convert duration from HH:MM:SS.MS into seconds
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
    : {
        error: 'Invalid Date',
        message: `${timestamp} is an invalid date, dropping row`
      };
};

// Prefix shorter numbers with zero to reach five digit zip code length
const handleZip = num => {
  if (num.length < 5) {
    const prefix = new Array(5 - num.length).fill(0).join('');
    num = `${prefix}${num}`;
  }
  return num;
};

csv
  .parseStream(process.stdin, { headers: true })
  .transform(data => {
    const Address = cleanField(data.Address);
    const BarDuration = handleDuration(data.BarDuration);
    const FooDuration = handleDuration(data.FooDuration);
    const FullName = data.FullName.toUpperCase();
    const Notes = cleanField(data.Notes);
    const TotalDuration = BarDuration + FooDuration;
    const Timestamp = handleTimestamp(data.Timestamp);
    const ZIP = handleZip(data.ZIP);

    // Print error and drop row when timestamp is invalid
    if (Timestamp.error) {
      console.error(Timestamp.message);
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
  .on('error', error => console.error(error))
  .on('end', rowCount => {
    console.warn(`Normalized ${rowCount} rows`);
  })
  .pipe(csv.format({ headers: true, writeBOM: true }))
  .pipe(process.stdout);
