const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const uploadDirectory = path.join(
    __dirname,
    "../../../uploads"
);

function ensureUploadDirectory() {
    if (!fs.existsSync(uploadDirectory)) {
        fs.mkdirSync(uploadDirectory, {
            recursive: true
        });
    }
}

function createVideoFilename(originalName) {
    const extension =
        path.extname(originalName).toLowerCase();

    const uniqueName =
        `${Date.now()}-${crypto.randomUUID()}${extension}`;

    return uniqueName;
}

function getVideoPath(filename) {
    return path.join(
        uploadDirectory,
        filename
    );
}

function getVideoUrl(filename) {
    return `/uploads/${filename}`;
}

function deleteVideoFile(filename) {
    if (!filename) {
        return;
    }

    const filePath =
        getVideoPath(filename);

    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}

module.exports = {
    uploadDirectory,
    ensureUploadDirectory,
    createVideoFilename,
    getVideoPath,
    getVideoUrl,
    deleteVideoFile
};