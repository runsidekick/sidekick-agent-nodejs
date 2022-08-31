import fs from 'fs';
import path from 'path';
import { 
  LoadedScriptInfo,
  ScriptInfo,
  SourceFileInfo,
  SourceLocation, 
} from "../../types";
import * as SourceMap from 'source-map';
import * as SourceMapResolverApi from '../../api/external/source/SourceMapResolverApi';
import CryptoUtils from '../../utils/CryptoUtils';
import PathUtils from '../../utils/PathUtils';
import UrlUtils from '../../utils/UrlUtils';
import OsUtils from '../../utils/OsUtils';
import Logger from '../../logger';
import ConfigProvider from '../../config/ConfigProvider';
import { ConfigNames } from '../../config/ConfigNames';

import LRU from 'lru-cache';

export class ScriptStoreData {
  id: string;
  sourceFileInfoMap: Map<string, SourceFileInfo>
  rawFilename: string;
  rawFilePath: string;
  rawFileRelativePath: string;
  filename: string;
  fileHash: string;
  mapConsumer: SourceMap.SourceMapConsumer;

 constructor(id: string, rawFilename: string, source: string, scriptPrefix?: string) {
    this.id = id;
    this.sourceFileInfoMap = new Map();
    this.rawFilename = rawFilename;
    this.rawFilePath = this.getRawFilePath(this.rawFilename);
    this.rawFileRelativePath = this.getRawFileRelativePath(this.rawFilePath);
    this.filename = this.rawFilename.startsWith("file:") 
      ? PathUtils.canonizeFileName(UrlUtils.getFilePath(this.rawFilename))
      : PathUtils.canonizeFileName(this.rawFilename);
    this.fileHash = this.generateSourceHash(source);
    this.mapConsumer = null;
    this.loadMap(source, scriptPrefix);
  }

  isCompatableWithFile(fileHash: string): boolean {
    if (this.fileHash) {
      const fh = fileHash.replace(/(\r\n|\n|\r)/gm, '');
      if (fh !== this.fileHash) {
        return false;
      }
    }

    return true;
  }

  findSourceFileInfo(filename: string): SourceFileInfo {
    const sourceFileInfo = this.sourceFileInfoMap.get(filename);
    if (!sourceFileInfo) {
      return;
    }

    return sourceFileInfo;
  }

  generatedPositionFor(filename: string, line: number): SourceLocation | undefined {
    if (!this.mapConsumer || !filename || !line) {
      return;
    }

    const source = this.sourceFileInfoMap.get(filename);
    if (!source) {
      return;
    }

    const generatedPosition = this.mapConsumer.generatedPositionFor({ source: source.sourceFile, line: line + 1, column: 0 });
    return generatedPosition 
      ? { 
        ...generatedPosition, 
        path: source.sourceFile,
      } as SourceLocation 
      : undefined;
  }

  protected loadMap(source: string, scriptPrefix?: string): void {
    if (!this.filename || !source) {
      return;
    }

    Logger.debug(`<ScriptStoreData> Loading source for ${this.filename} ...`);
  
    let mapData = null;
    try {
      mapData = SourceMapResolverApi.resolveSourceMapSync(source, this.filename, fs.readFileSync);
    } catch (e) {
      Logger.debug(`<ScriptStoreData> Unable to find source map ${this.filename}`);
    }

    if (!mapData) {
      const rootPath = PathUtils.getRoutePath(this.filename);
      this.sourceFileInfoMap.set(scriptPrefix ? path.join(scriptPrefix, rootPath) 
        : rootPath, 
        {
          rawPath: this.rawFilename,
          rootPath,
          sourceFile: this.filename
        });
    } else if (mapData.map) {
      const mapObject = mapData.map;
      this.mapConsumer = new SourceMap.SourceMapConsumer(mapObject);
  
      for (let sourceFile of mapObject.sources) {
        let file = sourceFile;
        const unknownMapConsumer = (this.mapConsumer as any);
        if (unknownMapConsumer.file) {
          file = path.join(this.filename.replace(unknownMapConsumer.file, ''), sourceFile)
        }

        const rootPath = PathUtils.getRoutePath(file);
        this.sourceFileInfoMap.set(scriptPrefix ? path.join(scriptPrefix, rootPath) 
          : rootPath, 
          {
            rawPath: this.rawFilename,
            rootPath,
            sourceFile,
          });
      }
    }
  }

  protected generateSourceHash(source: string): string {
    if (source === null) {
      return source;
    }

    source = (OsUtils.isWindows() 
      ? source.replace(/\r\n/g,"\n") 
      : source.replace("\r\n", "\n")).
      replace("\r\u0000\n\u0000", "\n\u0000").
      replace("\r", "\n");

    return CryptoUtils.generateSHA256(source);
  }

  private getRawFilePath(rawFilename: string) {
    const strippedUrl = PathUtils.stripFileProtocol(rawFilename);
    if (OsUtils.isWindows()) {
      // on windows the script url provided to v8 uses forward slashes
      // convert them back to backslashes
      return strippedUrl.replace(/\//g, '\\');
    }
    return UrlUtils.isEncoded(strippedUrl) ? decodeURIComponent(strippedUrl) : strippedUrl;
  }

  private getRawFileRelativePath(rawFilePath: string) {
    return PathUtils.stripCurrentWorkingDirectory(rawFilePath);
  }
}

export default class ScriptStore {
  protected scriptUrlMap: Map<string, ScriptInfo>;
  protected scriptMap: Map<string, ScriptStoreData>;
  protected disablePositionCache: boolean;
  protected positionLruCache: LRU<string, SourceLocation>;
  protected scriptPrefix: string;
   
  constructor() {
    this.scriptUrlMap = new Map();
    this.scriptMap = new Map();
    this.disablePositionCache = ConfigProvider.get<boolean>(ConfigNames.scriptStore.disablePositionCache, false);
    this.scriptPrefix = this.appendSlash(ConfigProvider.get<string>(ConfigNames.scriptStore.prefix));

    if (!this.disablePositionCache) {
      this.positionLruCache = new LRU({
        max: 100, 
        maxSize: 100,
        ttl: 1000 * 60 * 5,
        allowStale: false,
        updateAgeOnGet: true,
        updateAgeOnHas: true,
        sizeCalculation: (value: SourceLocation, key: string) => {
          // return an positive integer which is the size of the item,
          // if a positive integer is not returned, will use 0 as the size.
          return 1;
        },
      });
    }
  }

  get(scriptId: string): ScriptStoreData {
    return this.scriptMap.get(scriptId);
  }

  has(scriptId: string): boolean {
    return this.scriptMap.get(scriptId) != undefined;
  }

  getScriptRawFilename(scriptId: string): string {
    const storeData = this.scriptMap.get(scriptId);
    return storeData ? storeData.rawFilename : undefined;
  }

  getScriptRawFilePath(scriptId: string): string {
    const storeData = this.scriptMap.get(scriptId);
    return storeData ? storeData.rawFilePath : undefined;
  }

  getByScriptUrl(scriptUrl: string): ScriptStoreData {
    const scriptInfo = this.scriptUrlMap.get(scriptUrl);
    if (!scriptInfo || !scriptInfo.scriptId) {
      return;
    }

    return this.scriptMap.get(scriptInfo.scriptId);
  }

  generatedPositionFor(filename: string, lineNo: number): SourceLocation | undefined {
    const scriptWrapper = this.getByScriptUrl(filename);
    if (!scriptWrapper) {
        return;
    }

    const sourcefileInfo = scriptWrapper.findSourceFileInfo(filename);
    if (!sourcefileInfo) {
        return;
    }

    const key = `${filename}-${lineNo}`;
    if (this.disablePositionCache) {
      return scriptWrapper.generatedPositionFor(sourcefileInfo.rootPath, lineNo);
    } else {
      try {
        if (!this.positionLruCache.has(key)) {
          const generatedPosition = scriptWrapper.generatedPositionFor(sourcefileInfo.rootPath, lineNo);
          if (generatedPosition) {
            this.positionLruCache.set(key, generatedPosition);
          }
    
          return generatedPosition;
        } else {
          return this.positionLruCache.get(key);
        }
      } catch (error) {
        return scriptWrapper.generatedPositionFor(sourcefileInfo.rootPath, lineNo);
      }
    }
  }

  set(loadedScriptInfo: LoadedScriptInfo) {
    if (null == loadedScriptInfo 
      || null == loadedScriptInfo.scriptRawUrl 
      || "" === loadedScriptInfo.scriptRawUrl 
      || null == loadedScriptInfo.scriptParams 
      || this.scriptMap.hasOwnProperty(loadedScriptInfo.scriptParams.url)) {
      return;
    }

    const scriptId = loadedScriptInfo.scriptParams.scriptId;
    const scriptWrapper = new ScriptStoreData(
      scriptId,
      loadedScriptInfo.scriptRawUrl,
      loadedScriptInfo.scriptSource,
      this.scriptPrefix);

    this.scriptMap.set(scriptId, scriptWrapper);     
    scriptWrapper.sourceFileInfoMap.forEach((value, key) => {
      this.scriptUrlMap.set(
        key,
        {
          ...value,
          scriptId
        });
    })
  }

  clear() {
    if (this.scriptUrlMap) {
      this.scriptUrlMap.clear();
    }

    if (this.scriptMap) {
      this.scriptMap.clear();
    }

    if (this.positionLruCache) {
      this.positionLruCache.clear();
    }
  }

  private appendSlash(scriptPrefix: string) {
    if (!scriptPrefix) {
      return;
    }

    return scriptPrefix.startsWith('/') ? scriptPrefix : path.join('/', scriptPrefix);
  }
}