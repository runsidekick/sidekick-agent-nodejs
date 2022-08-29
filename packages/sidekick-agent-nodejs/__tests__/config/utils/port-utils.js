const portfinder = require('portfinder');

const maximum = 100;
const minimum = 10;

const getRandomPort = async () => {
    const randomNumber = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
    const port = await portfinder.getPortPromise();

    return port + randomNumber;
}

module.exports = {
    getRandomPort
}
