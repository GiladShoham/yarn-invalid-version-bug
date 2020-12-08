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

async function computeConfiguration(rootDirPath) {
  const pluginConfig = getPluginConfiguration();
  const config = await Configuration.find(rootDirPath, pluginConfig);

  const data = {
    nodeLinker: 'node-modules',
    installStatePath: (`${rootDirPath}/.yarn/install-state.gz`),
    pnpDataPath: (`${rootDirPath}/.pnp.meta.json`),
    bstatePath: (`${rootDirPath}/.yarn/build-state.yml`),
    virtualFolder: `${rootDirPath}/.yarn/$$virtual`,
    npmRegistryServer: 'https://registry.yarnpkg.com',
    npmAlwaysAuth: false,
  };
  config.use('aaa', data, rootDirPath, {});

  return config;
}

async function resolveVersion(packageName){
  const [_NpmRemapResolver, NpmSemverResolver, NpmTagResolver] = npmPlugin.default.resolvers;
  let resolver = new NpmSemverResolver();
  const ident = structUtils.parseIdent(packageName);
  let range = 'npm:*';
  const rootDirPath = process.cwd();
  const config = await computeConfiguration(rootDirPath);
  const project = new Project(rootDirPath, { configuration: config });
  
  const descriptor = structUtils.makeDescriptor(ident, range);
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