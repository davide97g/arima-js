onmessage = function (e) {
  let data = e.data;

  if (data.url || data.code) {
    /*
      INIT MESSAGE
    */
    let model = data;

    if (model.code)
      importScripts(
        URL.createObjectURL(new Blob([model.code], { type: "text/javascript" }))
      );
    else console.error("[Worker] No script provided");

    const modelClass = new this[model.name]();
    if (!model.methods) throw new Error("[Worker] Methods not specified");
    // ? create a map of methods
    this.methods = {};
    model.methods.forEach(
      (method) => (this.methods[method] = (...a) => modelClass[method](...a))
    );
    console.info("[Worker] Instantiated methods", this.methods);
    postMessage({ _status: "loaded" });
  } else {
    /*
      CALL MESSAGE
    */
    if (!data.method) throw new Error("[Worker] Method not specified");

    console.info("[Worker] Method", data.method);
    // JavaScript model
    console.log("[Worker] Calling JavaScript model");
    let res = this.methods[data.method](data.params);

    // Return promise value or just regular value
    // Promise.resolve handles both cases
    Promise.resolve(res).then((r) => {
      r.method = data.method; // ? appending the method for the caller
      postMessage(r);
    });
  }
};
