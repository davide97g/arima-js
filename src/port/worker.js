// console.log("[Worker] Hi!");

onmessage = function (e) {
  let data = e.data;

  if (typeof data === "object" && (data.url || data.code)) {
    /*
      INIT MESSAGE
    */
    let model = data;

    // Javascript
    this.container = model.container;

    if (model.code)
      importScripts(
        URL.createObjectURL(new Blob([model.code], { type: "text/javascript" }))
      );
    else if (model.url) importScripts(model.url);
    else console.error("[Worker] No script provided");

    const modelClass = new this[model.name]();
    this.modelFunc = (...a) => modelClass[model.run || "predict"](...a);

    postMessage({ _status: "loaded" });
  } else {
    /*
      CALL MESSAGE
    */
    let res;

    // JavaScript model
    console.log("[Worker] Calling JavaScript model");
    if (this.container === "args") {
      // console.log("[Worker] Applying inputs as arguments");
      res = this.modelFunc.apply(null, data);
    } else {
      // JS object or array
      // console.log("[Worker] Applying inputs as object/array");
      res = this.modelFunc(data);
    }
    // Return promise value or just regular value
    // Promise.resolve handles both cases
    Promise.resolve(res).then((r) => {
      postMessage(r);
    });
  }
};
