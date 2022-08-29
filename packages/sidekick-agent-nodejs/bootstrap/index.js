const sidekick = require('@runsidekick/sidekick-agent-nodejs');

try {
    sidekick.start().then(() => {
    }).catch((error) => {
        console.info('An error occured while Sidekick auto start.', error);
    })
} catch (error) {
    console.error('An error occured while Sidekick auto start.', error);
}
