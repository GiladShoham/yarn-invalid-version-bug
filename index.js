const npmPlugin = require('@yarnpkg/plugin-npm');
const {
  Workspace,
  Project,
  Configuration,
  structUtils,
  IdentHash,
  Descriptor,
  Cache,
  StreamReport,
  ResolveOptions,
  LightReport,
} = require('@yarnpkg/core');
const { getPluginConfiguration } = require('@yarnpkg/cli');

async function computeConfiguration(rootDirPath, cacheFolder) {
  // const registries = await this.depResolver.getRegistries();
  const pluginConfig = getPluginConfiguration();
  const config = await Configuration.find(rootDirPath, pluginConfig);
  // const scopedRegistries = await this.getScopedRegistries(registries);
  // const defaultRegistry = registries.defaultRegistry;
  // const defaultAuthProp = this.getAuthProp(defaultRegistry);

  const data = {
    nodeLinker: 'node-modules',
    installStatePath: (`${rootDirPath}/.yarn/install-state.gz`),
    // cacheFolder,
    pnpDataPath: (`${rootDirPath}/.pnp.meta.json`),
    bstatePath: (`${rootDirPath}/.yarn/build-state.yml`),
    // npmScopes: scopedRegistries,
    virtualFolder: `${rootDirPath}/.yarn/$$virtual`,
    npmRegistryServer: 'https://registry.yarnpkg.com',
    npmAlwaysAuth: false,
    // enableInlineBuilds: true,
    // globalFolder: `${userHome}/.yarn/global`,
  };
  // if (defaultAuthProp) {
  //   data[defaultAuthProp.keyName] = defaultAuthProp.value;
  // }
  // // TODO: node-modules is hardcoded now until adding support for pnp.
  config.use('aaa', data, rootDirPath, {});

  return config;
}

async function resolveVersion(packageName){
  // console.log(npmPlugin)
  const [_NpmRemapResolver, NpmSemverResolver, NpmTagResolver] = npmPlugin.default.resolvers;
  let resolver = new NpmSemverResolver();
  const ident = structUtils.parseIdent(packageName);
  let range = 'npm:*';
  // const rootDirPath = npath.toPortablePath(options.rootDir);
  // const rootDirPath = npath.toPortablePath(process.cwd());
  const rootDirPath = process.cwd();
  // const cacheDir = this.getCacheFolder(options.cacheRootDir);
  // const config = await this.computeConfiguration(rootDirPath, cacheDir);
  const config = await computeConfiguration(rootDirPath);

  // const pluginConfig = getPluginConfiguration();
  // const config = await Configuration.find(rootDirPath, pluginConfig);

  const project = new Project(rootDirPath, { configuration: config });
  // const project = new Project(rootDirPath, { });
  // console.log(project)
  // const report = new LightReport({ configuration: config, stdout: process.stdout });

  // Handle cases when the version is a dist tag like dev / latest for example bit install lodash@latest
  // if (parsedPackage.version) {
  //   resolver = new NpmTagResolver();
  //   range = `npm:${parsedPackage.version}`;
  // }
  const descriptor = structUtils.makeDescriptor(ident, range);
  // @ts-ignore
  // project.setupResolutions();
  const resolveOptions = {
    project,
    resolver
  };
  const candidates = await resolver.getCandidates(descriptor, new Map(), resolveOptions);
  return candidates
}

resolveVersion('@babel/plugin-proposal-class-properties').then(res => {
  console.log('res')
  console.log(res)
}).catch(e => {
  console.log('got error', e)
});