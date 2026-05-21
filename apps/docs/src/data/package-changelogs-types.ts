/**
 * Shape of the data produced by the `package-changelogs` Docusaurus plugin
 * (apps/docs/plugins/package-changelogs.ts) and consumed by the changelog page
 * via `usePluginData('package-changelogs')`.
 *
 * Lives under src/data/ so both the plugin (excluded from tsconfig) and the
 * page (included in tsconfig) can share the same definition without the
 * plugin file itself needing to be type-checked by the docs tsconfig.
 */

export type PackageChangelogVersion = {
  version: string;
  body: string;
};

export type PackageChangelog = {
  name: string;
  key: string;
  versions: PackageChangelogVersion[];
};

export type PackageChangelogsData = {
  packages: PackageChangelog[];
};
