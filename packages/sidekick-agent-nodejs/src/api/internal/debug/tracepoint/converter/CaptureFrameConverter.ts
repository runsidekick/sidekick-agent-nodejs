import {  
  CaptureConfig,
  CaptureFrame,
  Frame,
} from '../../../../../types';
import TypeCastUtils from '../../../../../utils/TypeCastUtils';

export default class CaptureFrameConverter {
  static convert(
    captureFrames: CaptureFrame[] = [],
    captureConfig: CaptureConfig,
    ): Frame[] {
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
        const resolveVariable = CaptureFrameConverter.findResolvedVariable(
          JSON.parse(JSON.stringify(locals)), 
          captureConfig.maxParseDepth);
        if (resolveVariable && !Array.isArray(resolveVariable)) {
          frame.variables = resolveVariable;
        }
      }
    })

    return frames;
  }

  private static findResolvedVariable(
    locals: { [key: string]: any } | any[],
    maxParseDepth: number,
    iteration = 1,
  ) {
    const arrayParser = (members: any[]) => {
      const parsedArr = [];
      const mLenght = members.length;
      for (let i = 0; i < mLenght - 1; i++) {
        let value = members[i];
        const type = typeof value;
        if (TypeCastUtils.isObject(type)) { 
          value = iteration > maxParseDepth 
          ? '...'
          : CaptureFrameConverter.findResolvedVariable(value, maxParseDepth, iteration + 1); 
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
      Object.keys(members || {}).forEach((member) => {
        const name = member;
        let value = members[member];
        const type = typeof value;
  
        if (!parsedVariable[name]) { 
          if (TypeCastUtils.isObject(type)) {
            value = iteration > maxParseDepth 
            ? '...'
            : CaptureFrameConverter.findResolvedVariable(value, maxParseDepth, iteration + 1); 
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