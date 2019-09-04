const csv = require('fast-csv');
const fs = require('fs');

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

    return {
      //   TimeStamp: obj.TimeStamp,
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
