import {  
  CaptureConfig,
  CaptureFrame,
  Frame,
} from '../../../../types';
import TypeCastUtils from '../../../../utils/TypeCastUtils';
import PropertyAccessClassificationUtils from '../../../../utils/PropertyAccessClassificationUtils';
import Logger from '../../../../logger';

export default class CaptureFrameConverter {
  protected captureConfig: CaptureConfig;

  constructor(captureConfig: CaptureConfig,) {
    this.captureConfig = captureConfig;
  }

  convert(captureFrames: CaptureFrame[] = []): Frame[] {
    const frames: Frame[] = [];

    captureFrames.forEach(captureFrame => {
      const {
        lineNo,
        methodName,
        className,
        locals,
      } = captureFrame;

      let frame = {
        lineNo,
        methodName,
        className,
        variables: {},
      } as Frame;

      frames.push(frame);
      if (locals) {
        const resolveVariable = this.findResolvedVariable(
          locals, 
          this.captureConfig.maxParseDepth);
        if (resolveVariable && !Array.isArray(resolveVariable)) {
          frame.variables = resolveVariable;
        }
      }
    })

    return frames;
  }

  private findResolvedVariable(
    locals: { [key: string]: any } | any[],
    maxParseDepth: number,
    iteration = 1,
  ) {
    const arrayParser = (members: any[]) => {
      const parsedArr = [];
      const mLenght = members.length;
      for (let i = 0; i < mLenght; i++) {
        let value = members[i];
        const type = !this.captureConfig.bundled && value && value.constructor 
          ? value.constructor.name || typeof value
          : typeof value;
        if (TypeCastUtils.isObject(value)) { 
          if (Object.getOwnPropertyNames(value).length == 0) {
            try {
              value = value + '';
            } catch (error) {
              Logger.debug(`<CaptureFrameConverter> An error occured while parsing 
                with type ${type}: ${error.message}`);
              value = '';
            }
          } else {
              value = iteration > maxParseDepth
              ? '...'
              : this.findResolvedVariable(value, maxParseDepth, iteration + 1);
          }
        }
  
        const arrayFlag = Array.isArray(value);   
        parsedArr.push({
          '@type': arrayFlag ? 'array': type,
          '@value': value,
          ...( arrayFlag ? { '@array': true } : undefined )
        })
      }
  
      return parsedArr;
    }
  
    const objectParser = (members: { [key: string]: any }) => {
      const parsedVariable: { [key: string]: any } = {};
      PropertyAccessClassificationUtils.getProperties(
        members, 
        this.captureConfig.propertyAccessClassification)
        .forEach((member) => {
          const name = member;
          let value = members[member];
          const type = !this.captureConfig.bundled && value && value.constructor
            ? value.constructor.name || typeof value
            : typeof value;
          if (!parsedVariable[name]) { 
            if (TypeCastUtils.isObject(value)) {
              if (Object.getOwnPropertyNames(value).length == 0) {
                try {
                  value = value + '';
                } catch (error) {
                  Logger.debug(`<CaptureFrameConverter> An error occured while parsing 
                    field ${name} with type ${type}: ${error.message}`);
                  value = '';
                }
              } else {
                  value = iteration > maxParseDepth
                  ? '...'
                  : this.findResolvedVariable(value, maxParseDepth, iteration + 1);
              }
            } 
            
            const arrayFlag = Array.isArray(value);    
            parsedVariable[name] = {
              '@type': arrayFlag ? 'array' : type,
              '@value': value,
              ...( arrayFlag ? { '@array': true } : undefined )
            }
          }
      });
  
      return parsedVariable;
    }
  
    return Array.isArray(locals) ? arrayParser(locals) : objectParser(locals);
  }
}