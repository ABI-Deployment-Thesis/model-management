const mongoose = require('mongoose')

const ModelCatalogue = require('../../models/modelCatalogue')

async function getModel(call, callback) {
    try {
        logger.debug(`Received gRPC call: ${JSON.stringify(call.request)}`)

        const { model_id } = call.request

        let found = false
        let model = ''
        if (mongoose.Types.ObjectId.isValid(model_id)) {
            const modelCatalogue = await ModelCatalogue.findOne({ _id: model_id, deleted: false }).populate('features').populate('dependencies')
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

module.exports = {
    getModel
}