const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
    uploadDirectory,
    createVideoFilename
} = require("./storage.service");

if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, {
        recursive: true
    });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },

    filename: (req, file, cb) => {
        cb(
            null,
            createVideoFilename(
                file.originalname
            )
        );
    }
});

const fileFilter = (
    req,
    file,
    cb
) => {
    const extension =
        path.extname(
            file.originalname
        ).toLowerCase();

    if (extension === ".mp4") {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Only MP4 video files are supported."
            ),
            false
        );
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize:
            2 * 1024 * 1024 * 1024
    }
});

module.exports = upload;