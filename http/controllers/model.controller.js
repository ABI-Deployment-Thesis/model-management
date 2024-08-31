const path = require('path')
const fs = require('fs')

const ModelCatalogue = require('../../models/modelCatalogue')
const Feature = require('../../models/feature')
const Requirement = require('../../models/dependency')
const { handleEngine } = require('../../utils/engines')

async function getModels(req, res) {
    try {
        const models = await ModelCatalogue.find({ user_id: req.user.id, deleted: false })
        res.status(200).json(models)
    } catch (err) {
        logger.error(err)
        res.status(400).json({ error: err })
    }
}

async function getModel(req, res, next) {
    try {
        let model = await ModelCatalogue.findOne({ _id: req.params.id, user_id: req.user.id, deleted: false }).populate('features').populate('dependencies')
        if (!model) model = {}
        res.status(200).json(model)
    } catch (err) {
        logger.error(err)
        res.status(400).json({ error: err })
    }
}

async function saveModel(req, res, next) {
    try {
        const id = req.temp.model_id
        const filePath = req.file.path

        const user_id = req.user.id
        const name = req.body.name
        const type = req.body.type
        const engine = req.body.engine
        const language = req.body.language
        const language_version = req.body.language_version
        const serialization = req.body.serialization
        const mem_limit = req.body.mem_limit
        const cpu_percentage = req.body.cpu_percentage
        const features = req.body.features
        const dependencies = req.body.dependencies

        const modelCatalogue = await new ModelCatalogue({
            _id: id,
            user_id: user_id,
            name: name,
            type: type,
            engine: engine,
            language: language,
            language_version: language_version,
            file_path: filePath,
            serialization: serialization,
            mem_limit: mem_limit,
            cpu_percentage: cpu_percentage
        })
        await modelCatalogue.validate()

        const feature = await Feature.insertMany(features)
        const requirement = await Requirement.insertMany(dependencies)

        modelCatalogue.dependencies.push(...requirement)
        modelCatalogue.features.push(...feature)

        let destPath = path.dirname(filePath)
        if (fs.lstatSync(filePath).isDirectory()) {
            destPath = filePath
        }
        await handleEngine(engine, type, language, language_version, serialization, dependencies, destPath)

        await modelCatalogue.save()
        res.status(201).json({ message: `Model ${id} saved successfully` })
    } catch (err) {
        logger.error(err)
        // error: TypeError: Cannot read properties of undefined (reading 'model_id')
        // error: TypeError: Cannot read properties of undefined (reading 'path')
        if (req.file && req.file.path) {
            const filePath = path.dirname(req.file.path)
            if (await fs.existsSync(filePath)) {
                logger.debug(`Deleting folder '${filePath}'`)
                await fs.rmSync(filePath, { recursive: true, force: true })
            }
        }
        res.status(400).json({ error: err })
    }
}

module.exports = {
    getModels,
    getModel,
    saveModel
}