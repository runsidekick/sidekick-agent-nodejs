import {
  CaptureConfig,
  CaptureFrame,
  Frame,
  PropertyAccessClassification,
} from '../../../../types';
import TypeCastUtils from '../../../../utils/TypeCastUtils';
import PropertyAccessClassificationUtils from '../../../../utils/PropertyAccessClassificationUtils';
import ConfigProvider from '../../../../config/ConfigProvider';
import { ConfigNames } from '../../../../config/ConfigNames';
import Logger from '../../../../logger';

export default class CaptureFrameConverter {
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
          {
            maxProperties: ConfigProvider.get<number>(ConfigNames.capture.maxProperties),
            maxParseDepth: ConfigProvider.get<number>(ConfigNames.capture.maxParseDepth),
          } as CaptureConfig);
        if (resolveVariable && !Array.isArray(resolveVariable)) {
          frame.variables = resolveVariable;
        }
      }
    })

    return frames;
  }

  private findResolvedVariable(
    locals: { [key: string]: any } | any[],
    config: CaptureConfig,
    iteration = 1,
  ) {
    const arrayParser = (members: any[]) => {
      const _members = members.slice(0, config.maxProperties);
      const parsedArr = [];
      const mLenght = _members.length;
      for (let i = 0; i < mLenght; i++) {
        let value = _members[i];
        const type = !ConfigProvider.get<boolean>(ConfigNames.sourceCode.minified) && value && value.constructor 
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
              value = iteration > config.maxParseDepth
              ? '...'
              : this.findResolvedVariable(value, config, iteration + 1);
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
      const properties = PropertyAccessClassificationUtils.getProperties(
        members,
        ConfigProvider.get<PropertyAccessClassification>(ConfigNames.capture.propertyAccessClassification));
      
      const oLenght = Math.min(properties.length, config.maxProperties);
      for (let i = 0; i < oLenght; i++) {
        const member = properties[i];
        const name = member;
        let value = members[member];
        const type = !ConfigProvider.get<boolean>(ConfigNames.sourceCode.minified) && value && value.constructor
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
                value = iteration > config.maxParseDepth
                ? '...'
                : this.findResolvedVariable(value, config, iteration + 1);
            }
          } 
          
          const arrayFlag = Array.isArray(value);    
          parsedVariable[name] = {
            '@type': arrayFlag ? 'array' : type,
            '@value': value,
            ...( arrayFlag ? { '@array': true } : undefined )
          }
        }
      }
  
      return parsedVariable;
    }
  
    return Array.isArray(locals) ? arrayParser(locals) : objectParser(locals);
  }
}