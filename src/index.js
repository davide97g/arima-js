let worker;

const fetch = window["fetch"];

let output = (res) => {
  console.info("[Index] callback output", res);
  config.model.methods.forEach((method) => {
    if (res[method]) console.info("-> Method", method); // todo: generalize this
  });
};

// todo: remove this
const config = {
  model: {
    name: "Process",
    methods: ["train", "predict", "getModel"],
    url: "./src/process/process.built.js",
  },
  callback: output,
};

// const port = new Port(config);

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

// ****************** THIS IS THE NEW PORT ******************

function init(model) {
  console.log("[Port] Initializing model", model);

  worker = new Worker("./src/port/worker.js");

  worker.onmessage = (e) => {
    const data = e.data;
    console.log("[Port] Response from worker:", data);
    if (data._status) console.log("[Port] Worker loaded successfully");
    else {
      // ? check for the initialization of the worker
      if (!data) throw new Error("[Port] Invalid output data");
      else if (!config.callback || typeof config.callback !== "function")
        throw new Error("[Port] Callback is not a function");
      else config.callback(data);
    }
  };

  worker.onerror = (e) => console.error("[Port] Error from worker:", e);

  if (model.url) {
    fetch(model.url)
      .then((res) => res.text())
      .then((res) => {
        console.log("[Port] Loaded js code for worker");
        model.code = res;
        worker.postMessage(model);
      });
  }
}

function run(params) {
  if (!params) throw new Error("[Port] Params not specified");
  // We have all input values here, pass them to worker, window.modelFunc or tf
  worker.postMessage({ method: "train", params: params });
}

function predict(data) {
  if (!data) throw new Error("[Port] Data not specified");
  worker.postMessage({ method: "predict", params: data });
}

function getModel() {
  worker.postMessage({ method: "getModel" });
}

init(config.model);

document.getElementById("run").addEventListener("click", () => run(params));

document
  .getElementById("predict")
  .addEventListener("click", () => predict(test_data));

document.getElementById("get").addEventListener("click", () => getModel());
