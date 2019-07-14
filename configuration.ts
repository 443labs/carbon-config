/**
 * Defines the supported configuration options.
 */
export interface ConfigurationOptions {
  directory: string;
  files: string[];
  environment: string;
  environments: string[];
  throwExceptions: boolean;
  allowEnvironmentVariables: boolean;
}

/**
 * Provides an opinionated set of default configuration options.
 */
export class DefaultConfigurationOptions implements ConfigurationOptions {
  directory: string = 'config';
  files: string[];
  environment: string;
  environments: string[];
  throwExceptions: boolean = true;
  allowEnvironmentVariables: boolean = true;

  constructor(options?: ConfigurationOptions) {
    if (!options)
      options = {} as any;

    if (!options.directory)
        options.directory = process.env.CONFIG_DIR || 'config';

    if (!options.files) // You may use .json as well, but I prefer yaml. Feel free to override this.
        options.files = this.stringToArray(process.env.CONFIG_FILES) || ['config.yml', 'localhost.yml', 'secrets.yml'];

    if (!options.environment)
      options.environment = process.env.CONFIG_ENV || 'local';

    if (!options.environments)
      options.environments = this.stringToArray(process.env.CONFIG_ENVS) || ['production', 'staging', 'development', 'local', 'testing'];

    this.directory = options.directory;
    this.files = options.files;
    this.environment = options.environment;
    this.environments = options.environments;
    this.throwExceptions = options.throwExceptions || true;
    this.allowEnvironmentVariables = options.allowEnvironmentVariables || true;
  }

  private stringToArray(value: string, delimiter: string = ' '): string[] {
    if (!value)
      return undefined;

    return value.split(delimiter);
  }
}

export interface ConfigurationArgs {
  path: string;
  environment?: string;
  defaultValue?: any;
  throwExceptions?: boolean;
  allowEnvironmentVariables?: boolean;
}

/**
 * Defines a configuration management class through which we will load all settings.
 * Sources from layered yaml files, each overriding the next, allowing secrets to be kept out of source control.
 *
 * Loads from these files by default, in this order:
 * - config.yml    # all defaults
 * - localhost.yml # optional: all of your tweaks to make things work locally (not committed)
 * - secrets.yml   # optional: final chance to override, again not to be committed
 *
 * Loads from these namespaces by default:
 * - production
 * - staging
 * - development
 * - local
 * - testing
 *
 * The goal here is to provide a single source of truth for loading json or yaml config files, rather than requiring
 * entries in multiple files and .env or env variables.
 */
export class Configuration {

  public options: ConfigurationOptions;
  private configFiles: any;
  private configs: any;

  constructor(options?: ConfigurationOptions) {
    this.options = new DefaultConfigurationOptions(options);
    this.reload()
  }

  public reload() {
    this.configFiles = this.loadConfigFiles(this.options.directory, this.options.files);
    this.configs = {};

    let baseline = {};
    for (let i = 0; i < this.options.environments.length; i++) {
      const env = this.options.environments[i];

      baseline = this.buildConfig(env, baseline);
      this.configs[env] = baseline;
    }
  }

  public get(args: ConfigurationArgs): any {
    if (!args)
      args = {} as ConfigurationArgs;

    if (!args.throwExceptions)
      args.throwExceptions = this.options.throwExceptions;

    if (!args.allowEnvironmentVariables)
      args.allowEnvironmentVariables = this.options.allowEnvironmentVariables;

    // TODO: Use destructuring to load the parameters.
    console.log(`Loading configuration setting: ${args.path}, defaultValue: ${args.defaultValue}, environment: ${args.environment}, throwExceptions: ${args.throwExceptions}`);

    const env = args.environment || this.options.environment;
    let config = this.configs[env]; // select the config for the chosen environment

    let lastKey = null;
    if (args.path) {
      // paths may be separated by periods, colons, or forward-slashes
      let keys = args.path.split(/[.:/]/);

      // walk the paths fetching the next element
      for (let i=0; i < keys.length; i++) {
        const key = keys[i];
        lastKey = key;
        try {
          config = config[key];
        } catch (e) {
          console.log(e);
          config = null;

          if (args.throwExceptions)
            throw e;

          break;
        }
      }
    }

    // final config element is a value, or null
    let value = config;

    // see if there is an os environment variable that we should load from
    // TODO: Use parameterization to make this easier to understand.
    // Current workflow simply looks for an environment variable using the last key
    // So in the case of myService.DATABASE_URL, it will look for process.env.DATABASE_URL.
    // This allows for any CI/CD pipeline to override settings, if you don't wish to use secrets.yml to do so.
    if (args.allowEnvironmentVariables && lastKey) {
      const envValue = process.env[lastKey];
      if (envValue)
        value = envValue;
    }

    // TODO: Add support for AWS secrets manager.
    // TODO: Add support for parameterized values.

    if (!value)
      return args.defaultValue;

    return value;
  }

  // private buildConfig(environment: string, baseline: Map<string, any>): Map<string, any> {
  private buildConfig(environment: string, baseline: any): any {
    let config = this.merge({}, baseline);

    for (let i = 0; i < this.configFiles.length; i++) {
      let envConfig = this.configFiles[i];

      if (environment in envConfig) {
        const baseline = envConfig[environment];
        config = this.merge(config, baseline);
      }
    }

    return config;
  }

  private loadConfigFile(filename): any {
    const yaml = require('js-yaml');
    const fs = require('fs');
    const data = fs.readFileSync(filename, 'utf8');
    const docs = yaml.safeLoadAll(data);
    return docs;
  }

  private loadConfigFiles(directory, files): any {
    const path = require('path');
    const fs = require('fs');

    let configFiles = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filename = path.join(directory, file);
      const absoluteFilename = path.resolve(filename);
      if (!fs.existsSync(absoluteFilename))
        continue;

      const data = this.loadConfigFile(absoluteFilename);

      if (Symbol.iterator in Object(data)) {
        configFiles.push(...data);
      } else {
        configFiles.push(data);
      }
    }

    return configFiles;
  }

  private merge(a, b) {
    if (b) {
      for (const [k, v] of Object.entries(b)) {
        if (Symbol.iterator in Object(v)) {
          let key = a[k] || {};
          let result = this.merge(key, v);
          a[k] = result;
        } else {
          a[k] = b[k];
        }
      }
    }
    return a;
  }
}