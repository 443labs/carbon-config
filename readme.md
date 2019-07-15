# carbon-config
A YAML-based configuration system for Node projects supporting tiered environments and files.

This is a port of the code from PyCarbon, a PyPi package for Python projects.
* Download: https://pypi.python.org/pypi/pycarbon
* Homepage: https://github.com/evilgeniuslabs/pycarbon

Just like *PyCarbon*, `carbon-config` is easy to use, highly configurable, and capable of real-world deployment scenarios that balance settings across multiple files and deployed environments.

# Installation
`npm i carbon-config --save`

# Release History

All public releases may be found here: https://www.npmjs.com/package/carbon-config

* 2019-07-14: v1.0.0: Initial release
* 2019-07-14: v1.0.1: Added support for `ConfigurationArgs` as an object for the `get` method.
* 2019-07-14: v1.0.2: Bugfixes
* 2019-07-15: v1.0.3: Publish transpiled Node-compatible lib, rather than src.
* 2019-07-15: v1.0.4: Bugfixes for babel and typescript.

## Key Concepts

* Environments: [`production`, `staging`, `development`, `test`] - Define environments where various settings differ. Should evaluate to one of `NODE_ENV`.
* Files: [`config.yml`, `localhost.yml`, `secrets.yml`] - Define files that allow you to isolate various settings, across environments.
* Supports multiple YAML documents per file, namespaced by an `environment`. Each providing a baseline for the next.
* Supports multiple config files, with the opinion that some settings are not fit for source control and should be isolated.
* All settings are merged at runtime, allowing for easy querying.
* Setting keys may be simple or complex (i.e., `path/to/your/setting`, `path.to.your.setting`, `MY_SETTING`)
* Configurable via constructor injection or environment variables.
* Setting values may have defaults, fallback on environment variable values, or be configured to throw exceptions if not found.
* Simple to use, easy to customize

## Usage

The only required setting is the `CONFIG_DIR` or `directory` value, which is required for the module to  know where to look for your config files.

Set it using an environment variable, or in the constructor.

```
import { Configuration } from "carbon-config";

// load files from specified directory (the default is './config/')
const config = new Configuration({ directory: 'path/to/your/config/files' });

# alternatively use environment variables
process.env.CONFIG_DIR = '/path/to/your/config/files' # or export it
const config = new Configuration();
```

Reading setting values.

```
// load a setting
console.log(config.get({ path: 'demo.setting' }))

// load a setting, throw an exception if it doesn't exist
console.log(config.get({ path: 'demo.setting' }))

// load a setting, with a default
console.log(config.get({ path: 'demo.setting', defaultValue: 42 }))

// use a complex key path to the setting (delimiters supported: comma, slash, colon)
console.log(config.get({ path: 'path.to.your.setting' }))
console.log(config.get({ path: 'path:to:your:setting' }))
console.log(config.get({ path: 'path/to/your/setting' }))

// allow os overrides via environment variables (enabled by default)
// if process.env['setting'] exists, it will override what is defined in the config. handy for ci/cd or containers.
console.log(config.get({ path: 'path.to.your.setting', allowEnvironmentVariables: true }))
```

**Sample Config**

Settings should be nested beneath the environment name. The default environment is `local`.

```
production:
  foo: production-value

staging:
  foo: staging-value

development:
  foo: dev-value
 
test:
  foo: test-value
```

The assumption is that your CI/CD tool will be setting the `NODE_ENV` to one of the pre-defined environments, such that isolating deployment settings is simple.

## Environments

The following `environments` are supported by default, each inheriting or overriding values from the previous environment.

**Default Environments**

* `production`: Default baseline config. If a value is not set for an environment, these are the last fallback values.
* `staging`: Inherits and overrides `production` values.
* `development`: Inherits and overrides `staging` then `production` values.
* `testing`: Inherits and overrides `development` then `staging` then `production` values.

Environments may be overriden by setting the `NODE_ENVS` environment variable, or by constructor injection.

```
# separate each environment name with a space
export NODE_ENVS=production staging development test
```

```
const config = new Configuration({ environments: ['production`, `staging`, `development`, `test`] });
```

Feel free to define your own environment hierarchy. The first in the list is the baseline. 

Settings will be looked up from the most specific, to the baseline.

If a setting is not found in one environment, it will fallback to the environment before it, continuing to look for a value.

## Files

Configuration files are loaded from these files by default, each inheriting or overriding values from the previous file.

Overrides: `secrets.yml` overrides `localhost.yml` overrides `config.yml`

* `config.yml`: Default config file, commit this to your source control.
* `localhost.yml`: Developer config file, likely contains secrets for local development and is ignored by your VCS.
* `secrets.yml`: Top-most secrets file. This file should never be committed to VCS, and contains secrets needed for deployments (i.e., dev, staging, or production).

Files may be overridden by setting the `CONFIG_FILES` environment variable, or by constructor injection.

```
# separate each filename with a space
export CONFIG_FILES=config.yml localhost.yml secrets.yml
```

```
const config = new Configuration({ files: ['config.yml`, `localhost.yml`, `secrets.yml`] })
```

Feel free to define your own file hierarchy. The first file in the list is the baseline, the last file is the last one that can override a setting.
