// Type definitions for FetchQL
// Project: FetchQL
// Definitions by: gucheen https://github.com/gucheen/

export default  FetchQL;

declare class FetchQL {
  constructor(options: FetchQLOptions);
  
  private interceptors: FetchQLInterceptor[];

  private url: string;

  private requestObject: Object;

  private EnumMap: Object;

  addInterceptors(interceptors: FetchQLInterceptor | FetchQLInterceptor[]): Function;

  clearInterceptors(): void;

  query(options: FetchQLQuery): Promise<{data, errors}>;

  getEnumTypes(enums: string[]): Promise<{data, errors}>;

  setUrl(): void;

  getUrl(): string;
}

export interface FetchQLInterceptor {
  request: (url: string, config) => { url: string, config };
  reueqstError: (error) => Promise<{errors}>;
  response: (response) => Object;
  responseError: (error) => Promise<{errors}>;
}

export interface FetchQLOptions {
  url: string;
  interceptors?: FetchQLInterceptor | FetchQLInterceptor[];
  headers?: Object;
  onStart?: (queueLength: number) => void;
  onEnd?: (queueLength: number) => void;
  omitEmptyVariables?: boolean;
  requestOptions?: Object;
}

export interface FetchQLQuery {
  operationName: string;
  query: string;
  variables?: Object;
  opts?: {
    omitEmptyVariables: boolean;
  };
  requestOptions?: Object;
}
