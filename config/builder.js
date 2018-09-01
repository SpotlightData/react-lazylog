const fs = require('fs');
const path = require('path');
const R = require('ramda');
const dirTree = require('directory-tree');
const { files, build } = require('./defaults');

const modules = {
  library: require('./library'),
};

const CONTROLLER_FILE = '.builder.js';

module.exports = argv => {
  let options = {
    home: process.cwd(),
    mode: argv[2],
    nodeEnv: process.env.NODE_ENV || 'development',
    files,
    build,
  };
  const builder = {
    deepMerge: R.mergeDeepRight,
    merge: (obj1, obj2) => Object.assign({}, obj1, obj2),
    update: fn => {
      options = fn(options);
    },
  };

  // Controller handling
  const controllerPath = path.resolve(options.home, CONTROLLER_FILE);
  if (fs.existsSync(controllerPath)) {
    const controller = require(controllerPath);
    switch (typeof controller) {
      case 'function': {
        // We expect side effects here, so
        const resp = controller(builder, options);
        if (typeof resp === 'object') {
          options = deepMerge(controller);
        }
        break;
      }
      case 'object': {
        options = deepMerge(controller);
      }
    }
  }
  const mode = str => R.propEq('mode', str);
  R.cond([[mode('lib'), modules.library(builder)]])(options);
};
