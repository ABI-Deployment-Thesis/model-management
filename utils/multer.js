const multer = require('multer')
const path = require('path')
const fs = require('fs')
const mongoose = require('mongoose')

const { FILE_TYPES, MAX_SIZE_FILE } = require('../constants')

// Check file type
function checkType(file, cb) {
    // Check ext
    const extFileName = path.extname(file.originalname).toLowerCase()

    if (FILE_TYPES.includes(extFileName))
        return cb(null, true)
    else
        return cb(new Error('INVALID_TYPE'))
}

// Define folder to storage the file
const modelStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Save model_id in the request ---
        const id = new mongoose.Types.ObjectId()
        req.temp = { model_id: id }
        // ---
        const rootFolder = process.env.STORAGE_URL || 'uploads'
        const userFolder = `${rootFolder}/${req.user.id}`
        const modelFolder = `${rootFolder}/${req.user.id}/${id}`
        if (!fs.existsSync(rootFolder)) {
            fs.mkdirSync(rootFolder, { recursive: true })
            logger.debug(`Folder '${rootFolder}' created`)
        }
        if (!fs.existsSync(userFolder)) {
            fs.mkdirSync(userFolder, { recursive: true })
            logger.debug(`Folder '${userFolder}' created`)
        }
        if (!fs.existsSync(modelFolder)) {
            fs.mkdirSync(modelFolder, { recursive: true })
            logger.debug(`Folder '${modelFolder}' created`)
        }
        cb(null, modelFolder)
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).slice(1)
        cb(null, `model.${ext}`)
    }
})

// Upload file
async function uploadModel(req, res, next) {
    const multerUploader = multer({
        storage: modelStorage,
        limits: { fileSize: MAX_SIZE_FILE },
        fileFilter: function (req, file, cb) {
            checkType(file, cb)
        }
    })

    const upload = multerUploader.single('file')

    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading
            if (err.code == 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'invalid_size' })
            return res.status(400).json({ error: 'upload_error' })
        } else if (err) {
            // An unknown error occurred when uploading
            if (err.toString().includes('INVALID_TYPE')) return res.status(400).json({ error: 'invalid_type' })
            return res.status(400).json({ error: 'upload_error' })
        }
        // Everything went fine and save document in DB here
        // req.file.path is now accessible
        next()
    })

}

module.exports = {
    uploadModel
}
