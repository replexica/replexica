import { UnpluginInstance, createUnplugin } from 'unplugin';
import Z from 'zod';

const unplgConfigSchema = Z.object({
  rsc: Z.boolean().optional().default(false),
  debug: Z.boolean().optional().default(false),
});
const unplg = createUnplugin<Z.infer<typeof unplgConfigSchema>>((config) => ({
  name: 'replexica',
}));

const replexicaConfigSchema = unplgConfigSchema;

export type ReplexicaConfig = Z.infer<typeof replexicaConfigSchema>;


const createNextCompiler = (unplg: UnpluginInstance<ReplexicaConfig>) =>
  (replexicaConfig: ReplexicaConfig) =>
    (nextConfig: any) => {
      return nextConfig;
    }
export default createCompiler(unplg, {
  next: createNextCompiler,
});

type CreateCompilerFactoryMap<R, K extends keyof R> = {
  [P in K]: (unplg: UnpluginInstance<ReplexicaConfig>) => R[P];
};

function createCompiler<R>(
  unplg: UnpluginInstance<ReplexicaConfig>,
  factories: CreateCompilerFactoryMap<R, keyof R>
): R {
  const factoryKeys = Object.keys(factories) as (keyof R)[];
  const factoryMap = factoryKeys.reduce((acc, key) => {
    acc[key] = factories[key](unplg);
    return acc;
  }, {} as R);

  return factoryMap;
}