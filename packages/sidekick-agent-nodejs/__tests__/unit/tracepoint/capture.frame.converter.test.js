const ConfigProvider = require('../../../dist/config/ConfigProvider').default;
const ConfigMetadata = require('../../../dist/config/ConfigMetadata').default;
const CaptureFrameConverter = require('../../../dist/api/internal/debug/converter/CaptureFrameConverter').default;
const {
    Frames,
    CovertedFramesSchema,
    ResolvedVariableTable,
} = require('../../config/data/captureframe/data');

describe('Capture Frame Converter Test', function () {
    beforeAll(async () => {
        ConfigProvider.init({
            config: {
                apiKey: 'foo',
            },
            configMetaData: ConfigMetadata
        });
    });

    it('Check Converted Json Schema', async () => {
        const convertedFrames = CaptureFrameConverter.convert(Frames, ResolvedVariableTable, 3);

        const result = CovertedFramesSchema.validate(convertedFrames);
        expect(result.error).toBeUndefined();
    });
});