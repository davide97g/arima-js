const fs = require("fs");
const parse = require("csv-parse");
const inputPath = "../data/seq_d1.csv";

const createCsvWriter = require("csv-writer").createObjectCsvWriter;

function saveCSV(name, data) {
  const csvWriter = createCsvWriter({
    path: "../../data/output/" + name + ".csv",
    header: [{ id: name, title: name }],
  });

  const formatted = data.map((x) => {
    let obj = {};
    obj[name] = x;
    return obj;
  });

  csvWriter
    .writeRecords(formatted)
    .then(() => console.log(name + " CSV file was written successfully"));
}

function arima_ogd(data, options) {
  let mk = options.mk;
  let lrate = options.lrate;
  let w = options.init_w;

  let list = [];
  let SE = 0;

  // ? for i = mk+1:size(data,2)
  for (let i = mk; i < data.length; i++) {
    let diff = 0;

    // ? diff = w*data(i-mk:i-1)'-data(i)
    for (let j = i - mk; j < i; j++) diff += w[j - i + mk] * data[j];
    diff -= data[i];

    // ? w = w - data(i-mk:i-1)*2*diff/sqrt(i-mk)*lrate
    for (let j = i - mk; j < i; j++)
      w[j - i + mk] =
        w[j - i + mk] - ((data[j] * 2 * diff) / Math.sqrt(i - mk + 1)) * lrate;

    // ? SE = SE + diff^2;
    SE += Math.pow(diff, 2);
    if (i % options.t_tick == 0) list.push(Math.sqrt(SE / i));
  }
  return { RMSE: list, w: w };
}

fs.readFile(inputPath, (err, fileData) => {
  parse(fileData, { columns: false, trim: true }, (err, rows) => {
    // Your CSV data is in an array of arrys passed to this callback as rows.
    let input = [];
    rows.forEach((row) =>
      row.forEach((value) => input.push(parseFloat(value)))
    );
    // console.info(input);
    let options = {
      lrate: 0.0001,
      mk: 10,
      init_w: [0, 1, 0, 0, 0, 1, 0, 1, 0, 1],
      t_tick: 1,
    };

    let res = arima_ogd(input, options);
    console.info(res);

    saveCSV("RMSE", res.RMSE);
    saveCSV("w", res.w);
  });
});
