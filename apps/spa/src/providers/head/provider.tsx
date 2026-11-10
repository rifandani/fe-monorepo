import { useHead, useSeoMeta } from "@unhead/react";
import { createHead, UnheadProvider } from "@unhead/react/client";
import { TemplateParamsPlugin } from "@unhead/react/plugins";

import { EnvConfig, readEnv } from "@/lib/layers/env";
import { buildSeoMetadata } from "@/utils/seo";

const defaultSeo = buildSeoMetadata({});
const appUrl = readEnv(EnvConfig.appUrl);

const head = createHead({
  plugins: [TemplateParamsPlugin],
});

const HeadDefaults = () => {
  useHead({
    templateParams: {
      schemaOrg: {
        host: appUrl,
      },
    },
  });
  useSeoMeta(defaultSeo.metadata);

  return null;
};

export const AppHeadProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <UnheadProvider value={head}>
    <HeadDefaults />
    {children}
  </UnheadProvider>
);
