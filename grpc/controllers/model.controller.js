const mongoose = require('mongoose')

const ModelCatalogue = require('../../models/modelCatalogue')
const jwt = require('../../utils/jsonwebtoken')

async function getModel(call, callback) {
    try {
        logger.debug(`Received gRPC call: ${JSON.stringify(call.request)}`)

        const authHeader = call.metadata.get('authorization')[0]
        const { id } = await jwt.decodeSessionToken(jwt.getTokenFromBearer(authHeader))

        const { model_id } = call.request

        let found = false
        let model = ''
        if (mongoose.Types.ObjectId.isValid(model_id)) {
            const modelCatalogue = await ModelCatalogue.findOne({ _id: model_id, user_id: id, deleted: false }).populate('features').populate('dependencies')
            if (modelCatalogue) {
                found = true
                model = JSON.stringify(modelCatalogue)
            }
        }
        callback(null, { found: found, json_data: model })
    } catch (err) {
        logger.error(err)
        callback(null, { found: false, json_data: '{}' })
    }
}

async function getModels(call, callback) {
    try {
        logger.debug(`Received gRPC call: calling method gedModels`)

        const authHeader = call.metadata.get('authorization')[0]
        const { id } = await jwt.decodeSessionToken(jwt.getTokenFromBearer(authHeader))

        const models = await ModelCatalogue.find({ user_id: id }, { _id: 1, name: 1, type: 1, engine: 1, deleted: 1 })
        callback(null, { models: models })
    } catch (err) {
        logger.error(err)
        callback(null, { models: [] })
    }
}

module.exports = {
    getModel,
    getModels
}