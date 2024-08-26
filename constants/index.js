const NONE = 'None'
const PREDICTIVE = 'predictive'
const OPTIMIZATION = 'optimization'
const DOCKER = 'docker'
const PYTHON3 = 'Python3'
const R = 'R'
const JOBLIB = 'joblib'
const PICKLE = 'pickle'
const RDS = 'RDS'

const FEATURE_TYPES = ['int', 'float', 'boolean', 'string']
const MODEL_TYPES = [PREDICTIVE, OPTIMIZATION]
const PRED_ENGINES = [DOCKER]
const OPT_ENGINES = ['TBA']
const ENGINES = PRED_ENGINES.concat(OPT_ENGINES)
const LANGUAGES = [PYTHON3, R]
const PY_SERIALIZATION_ALG = [JOBLIB, PICKLE]
const R_SERIALIZATION_ALG = [RDS]
const SERIALIZATION_ALG = PY_SERIALIZATION_ALG.concat(R_SERIALIZATION_ALG)
const NATIVE_SERIALIZATION_ALG = [PICKLE, RDS]

const NAME_REGEX = /^.{2,50}$/

const PY_FILE_TYPES = ['.sav', '.pkl']
const R_FILE_TYPES = ['.rds']
const COMPRESSION_FILE_TYPES = ['.zip']
const FILE_TYPES = PY_FILE_TYPES.concat(R_FILE_TYPES, COMPRESSION_FILE_TYPES)
const MAX_SIZE_FILE = 30 * 1024 * 1024 // 30MB = 5 * 1024 * 1024 Bytes

module.exports = {
    NONE,
    PREDICTIVE,
    OPTIMIZATION,
    DOCKER,
    PYTHON3,
    R,
    RDS,

    FEATURE_TYPES,
    MODEL_TYPES,
    ENGINES,
    LANGUAGES,
    PY_SERIALIZATION_ALG,
    SERIALIZATION_ALG,
    NATIVE_SERIALIZATION_ALG,

    NAME_REGEX,

    PY_FILE_TYPES,
    R_FILE_TYPES,
    COMPRESSION_FILE_TYPES,
    FILE_TYPES,
    MAX_SIZE_FILE
}