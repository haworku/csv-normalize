const fs = require('fs');
const csv = require('fast-csv');
const moment = require('moment-timezone');

const INVALID_DATE = 'Invalid Date';

const cleanField = string => string.normalize();

// Convert duration from HH:MM:SS.MS into seconds
const handleDuration = duration => {
  const timeArray = duration.split(':');
  const convertedHours = +timeArray[0] * 60 * 60;
  const convertedMinutes = +timeArray[1] * 60;
  const secondsWithMilliseconds = +timeArray[2];

  return convertedHours + convertedMinutes + secondsWithMilliseconds;
};

// Convert timestamp from Pacific to Eastern time, return formatted timestamp or INVALID_DATE
const handleTimestamp = timestamp => {
  const tzMoment = moment
    .tz(timestamp, 'MM-DD-YY hh:mm:ss a', 'America/Los_Angeles')
    .tz('America/New_York');

  return tzMoment.isValid() ? tzMoment.format() : INVALID_DATE;
};

// Prefix shorter numbers with zero to reach five digit zip code length
const handleZip = num => {
  if (num.length < 5) {
    const prefix = new Array(5 - num.length).fill(0).join('');
    num = `${prefix}${num}`;
  }
  return num;
};

// Validity check - could be expanded to include more cases
isValidRow = rowData => rowData.Timestamp !== INVALID_DATE;

// Transform data for each row, used in `parseStream`, drops invalid rows
const transform = data => {
  if (!isValidRow(data)) return;

  const FooDuration = handleDuration(data.FooDuration);
  const BarDuration = handleDuration(data.BarDuration);

  return {
    Timestamp: handleTimestamp(data.Timestamp),
    Address: cleanField(data.Address),
    ZIP: handleZip(data.ZIP),
    FullName: data.FullName.toUpperCase(),
    FooDuration,
    BarDuration,
    TotalDuration: BarDuration + FooDuration,
    Notes: cleanField(data.Notes)
  };
};

// MAIN
csv
  .parseStream(process.stdin, { headers: true, quotes: null, transform })
  .transform(data => transform(data))
  .validate(data => data.Timestamp !== INVALID_DATE)
  .on('error', error => console.error(error))
  .on('data-invalid', (row, rowNumber) => {
    console.error(`Dropped Row ${rowNumber} due to invalid data`);
  })
  .on('end', rowCount => {
    console.warn(`Parsed ${rowCount} rows`);
  })
  .pipe(csv.format({ headers: true }))
  .pipe(process.stdout);
