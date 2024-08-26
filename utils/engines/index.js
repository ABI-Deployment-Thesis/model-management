const fs = require('fs')
const { PREDICTIVE, OPTIMIZATION, DOCKER, PYTHON3, R } = require('./../../constants')

async function handleEngine(engine, type, language, serialization, docker_tag, dependencies, folderPath) {
    if (engine == DOCKER) {
        await handleDockerEngine(type, language, serialization, docker_tag, dependencies, folderPath)
    }
}

async function handleDockerEngine(type, language, serialization, docker_tag, dependencies, folderPath) {
    if (type == PREDICTIVE) {
        if (language == PYTHON3) {
            let requirements = ''
            dependencies.forEach(library => {
                requirements += `${library.library}==${library.version}\n`
            })
            await fs.writeFileSync(`${folderPath}/requirements.txt`, requirements)
            await replaceTextInFile(`./utils/engines/docker/templates/predictive/Python3/Dockerfile`, '#<DOCKER_TAG>', docker_tag, `${folderPath}/Dockerfile`)
            await fs.copyFileSync(`./utils/engines/docker/templates/predictive/Python3/${serialization}.py`, `${folderPath}/app.py`)
        }
        if (language == R) {
            let installLibsText = ''
            let loadLibsText = ''
            dependencies.forEach(library => {
                if (library.version == 'latest') {
                    installLibsText += `RUN R -e "install.packages('${library.library}')"\n`
                } else {
                    installLibsText += `RUN R -e "remotes::install_version('${library.library}', version = '${library.version}')"\n`
                }
                loadLibsText += `library(${library.library})\n`
            })
            await replaceTextInFile(`./utils/engines/docker/templates/predictive/R/Dockerfile`, '#<DEPENDENCIES>', installLibsText, `${folderPath}/Dockerfile`)
            await replaceTextInFile(`${folderPath}/Dockerfile`, '#<DOCKER_TAG>', docker_tag, `${folderPath}/Dockerfile`)
            await replaceTextInFile(`./utils/engines/docker/templates/predictive/R/app.R`, '#<DEPENDENCIES>', loadLibsText, `${folderPath}/app.R`)
        }
    } else if (type == OPTIMIZATION) {
        if (language == PYTHON3) {
            let requirements = ''
            dependencies.forEach(library => {
                requirements += `${library.library}==${library.version}\n`
            })
            await fs.writeFileSync(`${folderPath}/requirements.txt`, requirements)
            await fs.copyFileSync(`./utils/engines/docker/templates/optimization/Python3/Dockerfile`, `${folderPath}/Dockerfile`)
        }
    }
}

async function replaceTextInFile(inputFilePath, target, replacement, outputFilePath) {
    try {
        const data = await fs.readFileSync(inputFilePath, 'utf8')

        // Replace the target text with the replacement text
        const updatedData = data.replace(new RegExp(target, 'g'), replacement)

        await fs.writeFileSync(outputFilePath, updatedData, 'utf8')
        logger.debug('Text replaced and written to new file successfully')
    } catch (err) {
        throw new Error(err)
    }
}

module.exports = {
    handleEngine
}