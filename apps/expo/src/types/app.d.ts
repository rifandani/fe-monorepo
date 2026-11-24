declare module "*.png" {
  // oxlint-disable-next-line typescript/no-explicit-any -- Metro resolves an image import to an asset reference with no public type
  const value: any;
  export = value;
}
