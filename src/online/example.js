const fs = require("fs");
const parse = require("csv-parse");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const arima_ogd = require("./arima-ogd");
const arima_ons = require("./arima-ons");

const inputPath = "../../data/input/";
const outputPath = "../../data/output/";

const utils = require("./utils");

function saveCSV(algorithm, name, data) {
  const csvWriter = createCsvWriter({
    path: outputPath + algorithm + "_" + name + ".csv",
    header: [{ id: name, title: name }],
  });

  const formatted = data.map((x) => {
    let obj = {};
    obj[name] = x;
    return obj;
  });

  csvWriter
    .writeRecords(formatted)
    .then(() => console.log(algorithm, name + ".csv file saved"));
}

function arima(algorithm, input_file) {
  fs.readFile(inputPath + input_file + ".csv", (err, fileData) => {
    parse(fileData, { columns: false, trim: true }, (err, rows) => {
      let input = [];
      rows.forEach((row) =>
        row.forEach((value) => input.push(parseFloat(value)))
      );

      let options = {};
      let res = null;
      if (algorithm == "ogd") {
        options = {
          lrate: 0.0001,
          mk: 10,
          init_w: utils.new_random_vector(10),
          t_tick: 1,
        };
        res = arima_ogd.train(input, options);
      } else if (algorithm == "ons") {
        options = {
          lrate: 0.0001,
          mk: 10,
          init_w: utils.new_random_vector(10),
          epsilon: 0.0001,
          t_tick: 1,
        };
        res = arima_ons.train(input, options);
      }

      console.info(algorithm, "w", res.w);

      saveCSV(algorithm, "RMSE", res.RMSE);
      saveCSV(algorithm, "w", res.w);
    });
  });
}

arima("ogd", "seq_d1");
arima("ons", "seq_d1");
