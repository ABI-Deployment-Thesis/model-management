const FEATURE_TYPES = ['int', 'float', 'boolean']
const MODEL_TYPES = ['predictive', 'optimization']
const ENGINES = ['docker']
const LANGUAGES = ['Python3', 'R']
const NAME_REGEX = /^.{2,50}$/

module.exports = {
    FEATURE_TYPES,
    MODEL_TYPES,
    ENGINES,
    LANGUAGES,
    NAME_REGEX
}