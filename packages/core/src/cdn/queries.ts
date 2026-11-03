export type CdnValidKeys = (typeof cdnValidKeys)[keyof typeof cdnValidKeys];

export const cdnValidKeys = {
  getArticleCoverImage: "getArticleCoverImage",
} as const;

export const cdnKeys = {
  all: ["cdn"] as const,
  article: () => [...cdnKeys.all, "article"] as const,
  getArticleCoverImage: (url: string | undefined) =>
    [...cdnKeys.article(), url] as const,
};
