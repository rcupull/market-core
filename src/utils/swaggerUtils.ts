import { Express, Router } from 'express';
import { RequestHandler } from '../types/general';
import { z, ZodObject, ZodRawShape, ZodTypeAny } from 'zod';

type Route = {
  methods: Record<string, boolean>;
  path: string | Array<string>;
  stack: Array<{
    handle: RequestHandler & {
      bodyShape?: ZodObject<ZodRawShape>;
      paramsShape?: ZodObject<ZodRawShape>;
      queryShape?: ZodObject<ZodRawShape>;
    };
    method?: string;
  }>;
};

type Endpoint = {
  path: string;
  method: string;
  //
  bodyShape?: ZodObject<ZodRawShape>;
  paramsShape?: ZodObject<ZodRawShape>;
  queryShape?: ZodObject<ZodRawShape>;
};

const regExpToParseExpressPathRegExp =
  /^\/\^\\?\/?(?:(:?[\w\\.-]*(?:\\\/:?[\w\\.-]*)*)|(\(\?:\\?\/?\([^)]+\)\)))\\\/.*/;
const regExpToReplaceExpressPathRegExpParams = /\(\?:\\?\/?\([^)]+\)\)/;
const regexpExpressParamRegexp = /\(\?:\\?\\?\/?\([^)]+\)\)/g;
const regexpExpressPathParamRegexp = /(:[^)]+)\([^)]+\)/g;

const EXPRESS_ROOT_PATH_REGEXP_VALUE = '/^\\/?(?=\\/|$)/i';
const STACK_ITEM_VALID_NAMES = ['router', 'bound dispatch', 'mounted_app'];

const hasParams = (expressPathRegExp: string): boolean => {
  return regexpExpressParamRegexp.test(expressPathRegExp);
};

const parseExpressRouteByMethod = (route: Route, basePath: string): Array<Endpoint> => {
  const paths = Array.isArray(route.path) ? route.path : [route.path];
  const endpoints: Endpoint[] = [];

  paths.forEach((path) => {
    const fullPath = basePath && path === '/' ? basePath : `${basePath}${path}`;

    route.stack.forEach((layer) => {
      const { method, handle } = layer;

      if (!method) return;

      const bodyShape = handle?.bodyShape;
      const paramsShape = handle?.paramsShape;
      const queryShape = handle?.queryShape;
      const path = fullPath.replace(regexpExpressPathParamRegexp, '$1');

      const endPointIndex = endpoints.findIndex((e) => e.method === method && e.path === path);

      if (endPointIndex >= 0 && (bodyShape || paramsShape || queryShape)) {
        endpoints[endPointIndex] = {
          ...endpoints[endPointIndex],
          bodyShape,
          paramsShape,
          queryShape
        };
      } else {
        endpoints.push({
          path,
          method,
          bodyShape,
          paramsShape,
          queryShape
        });
      }
    });
  });

  return endpoints;
};

const parseExpressPath = (expressPathRegExp: RegExp, params: Array<{ name: string }>): string => {
  let parsedRegExp = expressPathRegExp.toString();
  let expressPathRegExpExec = regExpToParseExpressPathRegExp.exec(parsedRegExp);
  let paramIndex = 0;

  while (hasParams(parsedRegExp)) {
    const paramName = params[paramIndex]?.name;
    const paramId = `:${paramName}`;

    parsedRegExp = parsedRegExp.replace(regExpToReplaceExpressPathRegExpParams, (str) => {
      return str.startsWith('(?:\\/') ? `\\/${paramId}` : paramId;
    });

    paramIndex++;
  }

  if (parsedRegExp !== expressPathRegExp.toString()) {
    expressPathRegExpExec = regExpToParseExpressPathRegExp.exec(parsedRegExp);
  }

  const parsedPath = expressPathRegExpExec?.[1]?.replace(/\\\//g, '/') ?? '';

  return parsedPath;
};

const addEndpoints = (
  currentEndpoints: Array<Endpoint>,
  endpointsToAdd: Array<Endpoint>
): Array<Endpoint> => {
  for (const newEndpoint of endpointsToAdd) {
    const exists = !!currentEndpoints.find(
      ({ path, method }) => path === newEndpoint.path && method === newEndpoint.method
    );

    if (!exists) {
      currentEndpoints.push(newEndpoint);
    }
  }
  return currentEndpoints;
};

const parseStack = (
  stack: Array<any>,
  basePath: string,
  endpoints: Array<Endpoint>
): Array<Endpoint> => {
  stack.forEach((stackItem) => {
    if (stackItem.route) {
      const newEndpoints = parseExpressRouteByMethod(stackItem.route, basePath);
      endpoints = addEndpoints(endpoints, newEndpoints);
      return;
    }

    if (STACK_ITEM_VALID_NAMES.includes(stackItem.name)) {
      const isRegExp = regExpToParseExpressPathRegExp.test(stackItem.regexp);
      let newBasePath = basePath;

      if (isRegExp) {
        const parsed = parseExpressPath(stackItem.regexp, stackItem.keys || []);
        newBasePath += `/${parsed}`;
      } else if (
        !stackItem.path &&
        stackItem.regexp &&
        stackItem.regexp.toString() !== EXPRESS_ROOT_PATH_REGEXP_VALUE
      ) {
        newBasePath += `/RegExp(${stackItem.regexp})`;
      }

      endpoints = parseEndpoints(stackItem.handle, newBasePath, endpoints);
    }
  });

  return endpoints;
};

const parseEndpoints = (
  app: Express | Router | any,
  basePath: string = '',
  endpoints: Array<Endpoint> = []
): Array<Endpoint> => {
  const stack = app.stack || app._router?.stack;

  if (stack) {
    endpoints = parseStack(stack, basePath, endpoints);
  }

  return endpoints;
};

export const expressListEndpoints = (app: Express | Router | any): Array<Endpoint> => {
  return parseEndpoints(app);
};

interface SwaggerParameter {
  name: string;
  in: 'query' | 'path';
  required: boolean;
  schema: { type: string; format?: string };
}

type SwaggerPath = {
  [method: string]: {
    summary: string;
    requestBody?: {
      content: {
        'application/json': {
          schema: {
            $ref: string;
          };
        };
      };
    };
    parameters: Array<SwaggerParameter>;
    responses: {
      [statusCode: string]: {
        description: string;
      };
    };
  };
};

type SwaggerSpec = {
  openapi: string;
  info: {
    title: string;
    version: string;
  };
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http';
        scheme: 'bearer';
        bearerFormat: 'JWT';
      };
    };
  };
  security: [
    {
      bearerAuth: [];
    }
  ];
  paths: {
    [path: string]: SwaggerPath;
  };
};

export const generateSwaggerSpec = (app: Express): SwaggerSpec => {
  const endpoints = expressListEndpoints(app);

  const paths: Record<string, SwaggerPath> = endpoints.reduce(
    (acc, { method, bodyShape, paramsShape, queryShape, path }) => {
      const parsedPath = path.replace('///', '/');
      const pathItem: SwaggerPath = acc[parsedPath] || {};

      pathItem[method.toLowerCase()] = {
        summary: `Auto-generated endpoint for ${method} ${parsedPath}`,
        requestBody: bodyShape && {
          content: {
            'application/json': {
              schema: zodToSwaggerBody(bodyShape)
            }
          }
        },
        parameters: [
          ...(paramsShape ? zodToSwaggerParameters(paramsShape, 'path') : []),
          ...(queryShape ? zodToSwaggerParameters(queryShape, 'query') : [])
        ],
        responses: {
          '200': {
            description: 'Success'
          }
        }
      };

      acc[parsedPath] = pathItem;
      return acc;
    },
    {} as Record<string, SwaggerPath>
  );

  return {
    openapi: '3.0.0',
    info: {
      title: 'El Trapiche',
      version: '1.0.0'
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    paths
  };
};

const zodToSwaggerBody = (zodSchema: ZodObject<ZodRawShape>): any => {
  const shape = zodSchema.shape;
  const properties: Record<string, any> = {};
  const required: string[] = [];

  for (const key in shape) {
    const field = shape[key];
    const swaggerField = zodFieldToSwagger(field);
    properties[key] = swaggerField;

    if (!field.isOptional()) {
      required.push(key);
    }
  }

  return {
    type: 'object',
    properties,
    required
  };
};

const zodFieldToSwagger = (field: ZodTypeAny): any => {
  if (field instanceof z.ZodString) {
    return { type: 'string' };
  }
  if (field instanceof z.ZodNumber) {
    return { type: 'number' };
  }
  if (field instanceof z.ZodBoolean) {
    return { type: 'boolean' };
  }
  if (field instanceof z.ZodArray) {
    return {
      type: 'array',
      items: zodFieldToSwagger(field._def.type)
    };
  }
  if (field instanceof z.ZodEnum) {
    return {
      type: 'string',
      enum: field._def.values
    };
  }

  // Otros tipos como ZodLiteral, ZodNullable, etc., pueden ser añadidos
  return { type: 'string' }; // fallback
};

const zodToSwaggerParameters = (
  zodSchema: ZodObject<ZodRawShape>,
  paramLocation: 'path' | 'query'
): Array<SwaggerParameter> => {
  const shape = zodSchema.shape;
  const entries = Object.entries(shape);

  return entries.map(([key, zodType]) => {
    const isOptional = zodType.isOptional();
    const baseType = isOptional ? (zodType as any)._def.innerType : zodType;
    let type = 'string';
    let format;

    if (baseType._def.typeName === 'ZodString') {
      type = 'string';
      if (baseType._def.checks?.some((c: any) => c.kind === 'uuid')) {
        format = 'uuid';
      }
    } else if (baseType._def.typeName === 'ZodNumber') {
      type = 'number';
    } else if (baseType._def.typeName === 'ZodBoolean') {
      type = 'boolean';
    }

    return {
      name: key,
      in: paramLocation,
      required: !isOptional,
      schema: { type, ...(format ? { format } : {}) }
    };
  });
};
