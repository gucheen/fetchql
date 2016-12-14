interface FetchQLInterceptor {
  request: (url: string, config) => { url: string, config };
  reueqstError: (error) => { reject: (error) => void };
  response: (response) => Object;
  responseError: (error) => { reject: (error) => void };
}

interface FetchQLOptions {
  url: string;
  interceptors?: FetchQLInterceptor | FetchQLInterceptor[];
  headers?: Object;
  onStart: (queueLength: number) => void;
  onEnd: (queueLength: number) => void;
  omitEmptyVariables: boolean;
}

interface FetchQLQuery {
  operationName: string;
  query: string;
  variables?: Object;
  opts: {
    omitEmptyVariables: boolean;
  };
}

interface FetchQL_Static {
  interceptors: FetchQLInterceptor[];

  url: string;

  requestObject: Object;

  EnumMap: Object;

  new (options: FetchQLOptions): FetchQL_Instance;
}

interface FetchQL_Instance {
  addInterceptors(interceptors: FetchQLInterceptor | FetchQLInterceptor[]): Function;

  clearInterceptors(): void;

  query(options: FetchQLQuery): { resolve: ({data, errors}) => void, rejedct: ({data, errors}) => void };

  getEnumTypes(enums: string[]): { resolve: ({data, errors}) => void, rejedct: ({data, errors}) => void };

  setUrl(): void;

  getUrl(): string;
}

declare var FetchQL: FetchQL_Static;

export default FetchQL;