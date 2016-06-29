interface FetchQLInterceptor {
    request: (url: string, config) => { url: string, config };
    reueqstError: (error) => { reject: (error) => void };
    response: (response) => Object;
    responseError: (error) => { reject: (error) => void };
  }

  interface FetchQLOptions {
    url: string;
    intercepotrs?: FetchQLInterceptor | FetchQLInterceptor[];
  }

  interface FetchQLQuery {
    operationName: string;
    query: string;
    variables?: Object;
  }

  interface FetchQL_Static {
    intercepotrs: FetchQLInterceptor[];

    _url: string;

    requestObject: Object;

    EnumMap: Object;

    new (options: FetchQLOptions): FetchQL_Instance;
  }

  interface FetchQL_Instance {
    addInterceptors(intercepotrs: FetchQLInterceptor | FetchQLInterceptor[]): Function;

    clearInterceptors(): void;

    query(options: FetchQLQuery): { resolve: ({data, errors}) => void, rejedct: ({data, errors}) => void };

    getEnumTypes(enums: string[]): { resolve: ({data, errors}) => void, rejedct: ({data, errors}) => void };

    setUrl(): void;

    getUrl(): string;
  }

  declare var FetchQL: FetchQL_Static;

  export default FetchQL;