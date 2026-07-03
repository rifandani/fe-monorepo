import type { Route } from 'next'
import type { CreateSerializerOptions, ParserMap } from 'nuqs/server'
import {
  createSerializer,
} from 'nuqs/server'

/**
 * @example
 *
 * // Reuse your search params definitions objects & urlKeys:
 * const searchParams = {
 *   latitude: parseAsFloat.withDefault(0),
 *   longitude: parseAsFloat.withDefault(0),
 * }
 * const urlKeys: UrlKeys<typeof searchParams> = {
 *   // Define shorthands in the URL
 *   latitude: 'lat',
 *   longitude: 'lng'
 * }
 * // This is a function bound to /map, with those search params & mapping:
 * const getMapLink = createTypedLink('/map', searchParams, { urlKeys })
 * function MapLinks() {
 *   return (
 *     <Link
 *       href={
 *         getMapLink({ latitude: 48.86, longitude: 2.35 })
 *         // → /map?lat=48.86&lng=2.35
 *       }
 *     >
 *       Paris, France
 *     </Link>
 *   )
 * }
 */
export function createTypedLink<Parsers extends ParserMap>(
  route: Route,
  parsers: Parsers,
  options: CreateSerializerOptions<Parsers> = {},
) {
  const serialize = createSerializer<Parsers, Route, Route>(parsers, options)
  return serialize.bind(null, route)
}
