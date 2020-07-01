var pdf_extract = require("pdf-extract");
var options = {
  type: "text", // extract the actual text in the pdf file
};

module.exports = function (path) {
  return pdf_extract(path, options, function (err) {
    if (err) {
      console.log(err);
    }
  });
};
