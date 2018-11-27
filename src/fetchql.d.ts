// Type definitions for FetchQL
// Project: FetchQL
// Definitions by: gucheen https://github.com/gucheen/
//                 Jamee Kim https://github.com/jameekim

export default FetchQL;

declare class FetchQL {
  constructor(options: FetchQLOptions);

  private interceptors: FetchQLInterceptor[];

  private url: string;

  private requestObject: Object;

  private EnumMap: { [p: string]: FetchQLEnumInfo };

  addInterceptors(interceptors: FetchQLInterceptor | FetchQLInterceptor[]): () => void;

  clearInterceptors(): void;

  query<TData = any, TVariables = { [p: string]: any }>(options: FetchQLQuery<TVariables>):
    Promise<FetchQLQueryResult<TData>>;

  getEnumTypes(enums: string[]): Promise<FetchQLEnumResult>;

  setUrl(): void;

  getUrl(): string;
}

export class FetchQLInterceptor {
  request?: (url: string, config: any) => any;
  requestError?: (error: any) => any;
  response?: (response: Response | any) => Response | any;
  responseError?: (error: any) => any;
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

export interface FetchQLQuery<TVariables = { [p: string]: any }> {
  operationName: string;
  query: string;
  variables?: TVariables;
  opts?: {
    omitEmptyVariables: boolean;
  };
  requestOptions?: Object;
}

export interface FetchQLQueryResult<TData = any> {
  data: TData;
  errors?: Array<FetchQLErrorInfo | GraphQLError>;
}

export interface FetchQLEnumResult {
  data: { [p: string]: FetchQLEnumInfo | null };
  errors?: FetchQLErrorInfo[];
}

export interface FetchQLEnumInfo {
  kind: 'ENUM';
  description: string;
  enumValues: Array<string | number>;
}

export interface FetchQLErrorInfo {
  message: string;
  stack: Response;
}

interface GraphQLError {
  message: string;
  locations?: any;
  path?: any;
  nodes?: any;
  source?: any;
  positions?: any;
  originalError?: any;
  extensions?: any;
}
