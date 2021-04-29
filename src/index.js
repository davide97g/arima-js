import Port from "./port/port.js";

let output = (res) => {
  console.info("[Index] callback output", res);
  config.model.methods.forEach((method) => {
    if (res[method]) console.info("-> Method", method);
  });
};
const config = {
  model: {
    name: "Process",
    methods: ["train", "predict", "getModel"],
    url: "./src/process/process.built.js",
  },
  callback: output,
};

const port = new Port(config);

const input_data = {
  data: [
    "41",
    "39",
    "50",
    "40",
    "43",
    "38",
    "44",
    "35",
    "39",
    "35",
    "29",
    "49",
    "50",
    "59",
    "63",
    "32",
    "39",
    "47",
    "53",
    "60",
    "57",
    "52",
    "70",
    "90",
    "74",
    "62",
    "55",
    "84",
    "94",
    "70",
    "108",
    "139",
    "120",
    "97",
    "126",
    "149",
    "158",
    "124",
    "140",
    "109",
    "114",
    "77",
    "120",
    "133",
    "110",
    "92",
    "97",
    "78",
    "99",
    "107",
    "112",
    "90",
    "98",
    "125",
    "155",
    "190",
    "236",
    "189",
    "174",
    "178",
    "136",
    "161",
    "171",
    "149",
    "184",
    "155",
    "276",
    "224",
    "213",
    "279",
    "268",
    "287",
    "238",
    "213",
    "257",
    "293",
    "212",
  ],
};

const test_data = {
  data: [
    "246",
    "353",
    "339",
    "308",
    "247",
    "257",
    "322",
    "298",
    "273",
    "312",
    "249",
    "286",
    "279",
    "309",
    "401",
    "309",
    "328",
    "353",
    "354",
    "327",
    "324",
    "285",
    "243",
    "241",
    "287",
    "355",
    "460",
    "364",
    "487",
    "452",
    "391",
    "500",
    "451",
    "375",
    "372",
    "302",
    "316",
    "398",
    "394",
    "431",
    "431",
  ],
};

const params = {
  column: "data",
  data: input_data,
  iterations: 10,
  method: "Maximum Likelihood",
  d: 0,
  p: 1,
  q: 1,
  parameters: "Auto",
  timesteps: 20,
};

document
  .getElementById("run")
  .addEventListener("click", () => port.run(params));

document
  .getElementById("predict")
  .addEventListener("click", () => port.predict(test_data));

document.getElementById("get").addEventListener("click", () => port.getModel());
