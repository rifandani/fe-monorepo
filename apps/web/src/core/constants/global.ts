import metadata from "../../../package.json" with { type: "json" };

export const SERVICE_NAME = metadata.name;
// export const SERVICE_VERSION = metadata.version;
export const TRACER_GLOBAL_ERROR = "globalError";
export const TRACER_GLOBAL_ERROR_ON_ERROR = `${TRACER_GLOBAL_ERROR}.onError`;
export const TRACER_ROOT_ROUTE = "rootRoute";
export const TRACER_ROOT_ROUTE_ON_ERROR = `${TRACER_ROOT_ROUTE}.onError`;
