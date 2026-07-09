declare module "*.png" {
  // oxlint-disable-next-line typescript/no-explicit-any
  const value: any;
  export = value;
}

// declare module '*.svg' {
//   import React from 'react';
//   import { SvgProps } from 'react-native-svg';
//   const content: React.FC<SvgProps>;
//   export default content;
// }
