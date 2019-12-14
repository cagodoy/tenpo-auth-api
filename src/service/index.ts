import Store from '../database/postgres/store';
import jwt from 'jsonwebtoken';

import UsersSvc, { TUserResponse, TUser } from '../clients/users';
import { TAuthResponse, TAuth } from '../clients/auth';

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

// get JWT_SECRET env value
const JWT_SECRET = process.env.JWT_SECRET || '';
if (JWT_SECRET === '') {
  console.log('invalid env JWT_SECRET value');
  process.exit(1);
}

interface IService {
  verifyToken(token: string): Promise<void>;
  login(email: string, password: string): Promise<TAuthResponse>;
  signUp(user: TUser): Promise<TAuthResponse>;
}

class Service implements IService {
  private store: Store;

  constructor(store: Store) {
    this.store = store;
  }

  // verifyToken ...
  verifyToken = async (token: string): Promise<void> => {
    console.log('[gRPC][TenpoUsersService][VerifyToken][Request] ', token);

    // get auth by token from store
    let auth: TAuth;
    try {
      auth = await this.store.GetByToken(token);
      if (auth.blacklist) {
        throw new Error('blacklisted token');
      }
    } catch (err) {
      console.log('[gRPC][TenpoAuthService][VerifyToken][Store][GetByToken][Error] ', err.message);
      throw err;
    }

    // validate and decode token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      console.log('[gRPC][TenpoAuthService][VerifyToken][jwt.verify][Error] ', err.message);
      throw new Error('invalid token');
    }

    // check if token already expired
    if (decoded.exp < new Date().getTime() / 1000) {
      console.log('[gRPC][TenpoAuthService][VerifyToken][Error] Token already expired');
      throw new Error(`token already expired`);
    }

    return;
  };

  // signUp ...
  signUp = async (user: TUser): Promise<TAuthResponse> => {
    console.log('[gRPC][TenpoAuthService][SignUp][Request] ', user);

    // create new user
    let newUser: TUserResponse;
    try {
      newUser = await UsersSvc.create(user);
      if (newUser.error !== null) {
        throw new Error(newUser.error.message);
      }
    } catch (err) {
      console.log('[gRPC][TenpoAuthService][SignUp][UserCreate][Error] ', err.message);
      throw err;
    }

    // sign jwt token
    let token;
    try {
      token = jwt.sign(
        {
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
          user_id: newUser.data.id,
        },
        JWT_SECRET,
      );
    } catch (err) {
      console.log('[gRPC][TenpoAuthService][SignUp][jwt.sign][Error] ', err.message);
      throw err;
    }

    //create auth in store
    try {
      await this.store.Create(token, newUser.data.id);
    } catch (err) {
      console.log('[gRPC][TenpoAuthService][SignUp][Store][Create][Error] ', err.message);
      throw err;
    }

    // prepare response
    const response: TAuthResponse = {
      data: newUser.data,
      meta: {
        token,
      },
      error: null,
    };

    return response;
  };

  // login ...
  login = async (email: string, password: string): Promise<TAuthResponse> => {
    console.log('[gRPC][TenpoAuthService][Login][Request] ', email, password);

    // get user by email
    let user: TUserResponse;
    try {
      user = await UsersSvc.getByEmail(email);
      if (user.error !== null) {
        throw new Error(user.error.message);
      }
    } catch (err) {
      console.log('[gRPC][TenpoAuthService][Login][UserGetByEmail][Error] ', err.message);
      throw err;
    }

    // verify if password is valid
    try {
      const verify = await UsersSvc.verifyPassword(email, password);
      if (!verify.valid) {
        if (verify.error === null) {
          throw new Error('invalid password');
        } else {
          throw new Error(verify.error.message);
        }
      }
    } catch (err) {
      console.log('[gRPC][TenpoAuthService][Login][UserVerifyPassword][Error] ', err.message);
      throw err;
    }

    // sign jwt token
    let token;
    try {
      token = jwt.sign(
        {
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
          user_id: user.data.id,
        },
        JWT_SECRET,
      );
    } catch (err) {
      console.log('[gRPC][TenpoAuthService][Login][jwt.sign][Error] ', err.message);
      throw new Error('token was not created');
    }

    // prepare response
    const response: TAuthResponse = {
      data: user.data,
      meta: {
        token,
      },
      error: null,
    };

    return response;
  };
}

export default Service;
