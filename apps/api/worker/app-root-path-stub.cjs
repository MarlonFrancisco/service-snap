// O TypeORM só usa app-root-path para achar ormconfig no disco; o shim de
// browser que o bundler escolhe quebra no carregamento. No Worker não há disco.
const root = '/';
module.exports = { path: root, resolve: (p) => p, require: () => { throw new Error('app-root-path.require unavailable'); }, toString: () => root, setPath: () => {} };
