const path = require('path');

/* async wrapper */
const upload = (file, path) =>
    new Promise((res, rej) =>
        file.mv(path, (err) => {
            if (err) return rej(err);
            res();
        })
    );

/* check file extension */
const uploadExtChecker = (name, opts) => {
    const { allowAnyExt = false, allowNoExt = false, allowedExts } = opts;

    const dotFileExt = path.extname(name);
    if (!allowAnyExt) {
        if (!(dotFileExt || allowNoExt)) return false;
        const fileExt = dotFileExt.slice(1);
        if (!allowedExts.includes(fileExt)) return false;
    }

    return dotFileExt;
};

const uploadPath = process.env.DATA_DIR || path.join('data', 'upload');

module.exports = {
    upload,
    uploadExtChecker,
    uploadPath
};
