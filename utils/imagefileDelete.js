const fs = require("fs");

// deleting image file function
const imageFileDelete = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) throw err;
    console.log("path/file.txt was deleted");
  });
};

module.exports = imageFileDelete;
