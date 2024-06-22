const fs = require('fs')

async function handleEngine(engine, type, language, dependencies, folderPath) {
    if (engine == 'docker') {
        await handleDockerEngine(type, language, dependencies, folderPath)
    }
}

async function handleDockerEngine(type, language, dependencies, folderPath) {
    if (type == 'predictive') {
        if (language == 'Python3') {
            let requirements = ''
            dependencies.forEach(library => {
                requirements += `${library.library}==${library.version}\n`
            })
            await fs.writeFileSync(`${folderPath}/requirements.txt`, requirements)
            await fs.copyFileSync(`./utils/engines/docker/templates/preditive/Python3/Dockerfile`, `${folderPath}/Dockerfile`)
            await fs.copyFileSync(`./utils/engines/docker/templates/preditive/Python3/app.py`, `${folderPath}/app.py`)
        }
    }
}

module.exports = {
    handleEngine
}