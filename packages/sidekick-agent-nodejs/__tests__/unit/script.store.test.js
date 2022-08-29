const ScriptStore = require('../../dist/store/script/ScriptStore').default;
const ProbeUtils = require('../../dist/utils/ProbeUtils').default;
const CryptoUtils = require('../../dist/utils/CryptoUtils').default;
const ConfigProvider = require('../../dist/config/ConfigProvider').default;
const ConfigMetadata = require('../../dist/config/ConfigMetadata').default;
const fs = require('fs');
const path = require('path');

describe('Script Store Test', function () {
    let scriptStore;
    const basefile = '__tests__/config/data/scriptstore/ts/index';
    const sourceFile = `${basefile}.ts`
    const generatedFile = `${basefile}.js`
    const filenamePrefix = 'https://api.github.com/repos/abc/aaa/contents'
    const sourceFilePath = path.join(__dirname, `../../${generatedFile}`);
    const scriptId = 1;
    const scriptUrl = `file://${sourceFilePath}`;
    const filename = `${filenamePrefix}/${sourceFile}?ref=f889d36daf57d5f96f76eed1ad2bb2ec0ecd71a7`;
    let generatedFileContent;

    beforeAll(async () => {
        ConfigProvider.init({
            config: {
                apiKey: 'foo',
            },
            configMetaData: ConfigMetadata
        });

        scriptStore = new ScriptStore();
    });

    beforeEach(async () => {
        generatedFileContent = await fs.promises.readFile(sourceFilePath);
        scriptStore.set({
            scriptParams: {
                scriptId,
                url: sourceFilePath,
            },
            scriptRawUrl: scriptUrl,
            scriptSource: generatedFileContent.toString(),
        });
    });
    
    it('Check Script Url', async () => {
        const _scriptUrl = scriptStore.getScriptRawFilename(scriptId);
        expect(_scriptUrl).toBe(scriptUrl);
    });

    it('Check Script Wrapper', async () => {
        const _filename = ProbeUtils.extractFileNameFrom(filename, 'contents')
        const scriptWraper = scriptStore.getByScriptUrl(_filename);
        expect(scriptWraper).not.toBeNull();
    }); 

    it('Check Generated Position', async () => {
        const _filename = ProbeUtils.extractFileNameFrom(filename, 'contents')
        const scriptWraper = scriptStore.getByScriptUrl(_filename);
        const generatedPosition = scriptWraper.generatedPositionFor(_filename, 14);
        expect(generatedPosition.line).toBe(7);
    }); 

    it('Check Hash', async () => {
        const _filename = ProbeUtils.extractFileNameFrom(filename, 'contents')
        const scriptWraper = scriptStore.getByScriptUrl(_filename);
        const result = scriptWraper.isCompatableWithFile(CryptoUtils.generateSHA256(generatedFileContent));
        expect(result).toBe(true);
    })
});