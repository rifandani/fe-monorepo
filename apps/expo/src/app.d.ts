import type { resources } from '@/core/providers/i18n/client'
import 'i18next'

declare module '*.png' {
  const value: any
  export = value
}

type ResourceType = typeof resources
type ResourceKey = keyof ResourceType

declare module 'i18next' {
  interface CustomTypeOptions {
    /**
     * use this for maximum strict type safety to make sure the key exists in both id and en
     * beware that this is has higher performance cost during compilation because it merge both id and en
     */
    // resources: ResourceType[ResourceKey]
    resources: ResourceType['en']
    returnNull: false
  }
}

// declare module '*.svg' {
//   import React from 'react';
//   import { SvgProps } from 'react-native-svg';
//   const content: React.FC<SvgProps>;
//   export default content;
// }
