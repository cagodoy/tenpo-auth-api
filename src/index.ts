// dependencies
import Mali from 'mali';
import path from 'path';
import UsersSvc from './clients/users';

// internal dependencies
import NewPostgres from './database';
import Service from './service';
import RPC from './rpc';
import Store from './database/postgres/store';

// get PORT env value
const PORT = process.env.PORT || '';
if (PORT === '') {
  console.log('invalid env PORT value');
  process.exit(1);
}

// get POSTGRES_DSN env value
const POSTGRES_DSN: string = process.env.POSTGRES_DSN || '';
if (POSTGRES_DSN === '') {
  console.log('invalid env POSTGRES_DSN value');
  process.exit(1);
}

// get USERS_HOST env value
const USERS_HOST = process.env.USERS_HOST || '';
if (USERS_HOST === '') {
  console.log('invalid env USERS_HOST value');
  process.exit(1);
}

// get USERS_PORT env value
const USERS_PORT = process.env.USERS_PORT || '';
if (USERS_PORT === '') {
  console.log('invalid env USERS_PORT value');
  process.exit(1);
}

// global values
let app: Mali;

async function main() {
  let pgSvc: Store;
  try {
    pgSvc = await NewPostgres(POSTGRES_DSN);
  } catch (err) {
    console.log('Failed connect to postgres: ', err);
    process.exit(1);
  }

  // mali grpc server
  try {
    const PROTO_PATH = path.resolve(__dirname, '../', 'proto', 'demo.proto');
    app = new Mali(PROTO_PATH, 'AuthService');
  } catch (err) {
    console.log('Failed at create mali server: ', err);
    process.exit(1);
  }

  // create service
  const svc = new Service(pgSvc);

  // create RPC
  const rpc = new RPC(svc);

  // configure user service connection
  UsersSvc.config({
    host: USERS_HOST,
    port: USERS_PORT,
  });

  // configure routes
  app.use('AuthService', 'verifyToken', rpc.verifyToken);
  app.use('AuthService', 'login', rpc.login);
  app.use('AuthService', 'signUp', rpc.signup);

  // running mali server
  app.start(`0.0.0.0:${PORT}`);

  console.log(`Mali server at running on port ${PORT}`);
}

// shutdown method used for signals events listener
function shutdown(err: any) {
  if (err) {
    console.error(err);
  }

  app
    .close()
    .then(() => process.exit())
    .catch(() => process.exit());
}

// add listener for os signals
process.on('uncaughtException', shutdown);
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// run main method
main();
