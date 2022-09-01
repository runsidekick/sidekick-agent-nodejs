process.env.JEST_JUNIT_OUTPUT_DIR = './report';

const config = {
    testPathIgnorePatterns: ['./__tests__/config'],
    name: 'sidekick-agent-nodej',
    verbose: true,
};

module.exports = config;
