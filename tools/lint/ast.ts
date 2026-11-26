import type { ESTree } from "@oxlint/plugins";

export const unwrapExpression = (
  node: ESTree.Expression
): ESTree.Expression => {
  let current = node;

  while (
    current.type === "ParenthesizedExpression" ||
    current.type === "TSAsExpression" ||
    current.type === "TSSatisfiesExpression" ||
    current.type === "TSTypeAssertion" ||
    current.type === "TSNonNullExpression"
  ) {
    current = current.expression;
  }

  return current;
};

const isNamedProperty = (
  property: ESTree.ObjectExpression["properties"][number],
  name: string
): property is ESTree.ObjectProperty =>
  property.type === "Property" &&
  !property.computed &&
  ((property.key.type === "Identifier" && property.key.name === name) ||
    (property.key.type === "Literal" && property.key.value === name));

export const findProperty = (
  object: ESTree.ObjectExpression,
  name: string
): ESTree.ObjectProperty | undefined =>
  object.properties.find((property) => isNamedProperty(property, name));

export const namedImportAliases = (
  statement: ESTree.ImportDeclaration,
  importedName: string
): readonly string[] =>
  statement.specifiers
    .filter(
      (specifier): specifier is ESTree.ImportSpecifier =>
        specifier.type === "ImportSpecifier" &&
        specifier.imported.type === "Identifier" &&
        specifier.imported.name === importedName
    )
    .map((specifier) => specifier.local.name);

export const moduleImportAliases = (
  statement: ESTree.ImportDeclaration
): readonly string[] =>
  statement.specifiers
    .filter(
      (specifier) =>
        specifier.type === "ImportNamespaceSpecifier" ||
        specifier.type === "ImportDefaultSpecifier"
    )
    .map((specifier) => specifier.local.name);

export const propertyAtPath = (
  node: ESTree.Expression | undefined,
  path: readonly string[]
): ESTree.ObjectProperty | undefined => {
  let property: ESTree.ObjectProperty | undefined;
  let current = node;

  for (const name of path) {
    if (current === undefined) {
      return undefined;
    }

    const object = unwrapExpression(current);

    if (object.type !== "ObjectExpression") {
      return undefined;
    }

    property = findProperty(object, name);
    current = property?.value;
  }

  return property;
};
