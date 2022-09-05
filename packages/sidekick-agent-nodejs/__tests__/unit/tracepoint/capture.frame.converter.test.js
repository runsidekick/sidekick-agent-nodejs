const ConfigProvider = require('../../../dist/config/ConfigProvider').default;
const ConfigMetadata = require('../../../dist/config/ConfigMetadata').default;
const CaptureFrameConverter = require('../../../dist/api/internal/debug/converter/CaptureFrameConverter').default;
const {
    Frames,
    CovertedFramesSchema,
} = require('../../config/data/captureframe/data');

describe('Capture Frame Converter Test', function () {
    let captureFrameConverter;

    beforeAll(async () => {
        captureFrameConverter = new CaptureFrameConverter({
            maxExpandFrames: 1,
            maxFrames: 3,
            bundled: false,
            maxParseDepth: 3,
            maxProperties: 20,
            propertyAccessClassification: 'ENUMERABLE-OWN'
        });

        ConfigProvider.init({
            config: {
                apiKey: 'foo',
            },
            configMetaData: ConfigMetadata
        });
    });

    it('Check Converted Json Schema', async () => {
        const convertedFrames = captureFrameConverter.convert(Frames);

        const result = CovertedFramesSchema.validate(convertedFrames);
        expect(result.error).toBeUndefined();
    });
});