import type { Route } from "next";
import type { CreateSerializerOptions, ParserMap } from "nuqs/server";
import { createSerializer } from "nuqs/server";

export const createTypedLink = <Parsers extends ParserMap>(
  route: Route,
  parsers: Parsers,
  options: CreateSerializerOptions<Parsers> = {}
) => {
  const serialize = createSerializer<Parsers, Route, Route>(parsers, options);
  return serialize.bind(null, route);
};
