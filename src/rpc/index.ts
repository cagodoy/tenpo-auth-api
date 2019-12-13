import Service from '../service';
import { Context } from 'mali';

import { TAuthResponse, TAuthVerifyTokenResponse } from '../../../../lib/js/dist/clients/auth';
import { TUser } from '../../../../lib/js/dist/clients/users';

interface IRPC {
  verifyToken(ctx: Context, next: Function): Promise<void>;
  login(ctx: Context, next: Function): Promise<void>;
  signup(ctx: Context, next: Function): Promise<void>;
}

class RPC implements IRPC {
  private service: Service;

  constructor(service: Service) {
    this.service = service;
  }

  verifyToken = async (ctx: Context, next: Function): Promise<void> => {
    // validate token grpc param
    const { token } = ctx.req;
    if (token === undefined) {
      const res = <TAuthVerifyTokenResponse>{
        valid: false,
        error: {
          code: 500,
          message: 'invalid token req value',
        },
      };

      ctx.res = res;
      return;
    }

    try {
      await this.service.verifyToken(token);
    } catch (err) {
      const res = <TAuthVerifyTokenResponse>{
        valid: false,
        error: {
          code: 500,
          message: err.message,
        },
      };

      ctx.res = res;
      return;
    }

    const res = <TAuthVerifyTokenResponse>{
      valid: true,
      error: null,
    };

    ctx.res = res;
  };

  login = async (ctx: Context, next: Function): Promise<void> => {
    // validate email grpc param
    const { email } = ctx.req;
    if (email === undefined) {
      const res = <TAuthResponse>{
        error: {
          code: 500,
          message: 'invalid email req value',
        },
      };

      ctx.res = res;
      return;
    }

    // validate password grpc param
    const { password } = ctx.req;
    if (password === undefined) {
      const res = <TAuthResponse>{
        error: {
          code: 500,
          message: 'invalid password req value',
        },
      };

      ctx.res = res;
      return;
    }

    // login with email and password on users-api
    let auth: TAuthResponse;
    try {
      auth = await this.service.login(email, password);
    } catch (e) {
      const res = <TAuthResponse>{
        error: {
          code: 500,
          message: e.message,
        },
      };
      ctx.res = res;
      return;
    }

    // get data and meta login response
    const { data, meta } = auth;

    // set response values
    const res = <TAuthResponse>{
      data,
      meta,
      error: null,
    };

    // prepare response
    ctx.res = res;
  };

  signup = async (ctx: Context, next: Function): Promise<void> => {
    // validate email grpc param
    const { user } = ctx.req;
    if (user === undefined) {
      const res = <TAuthResponse>{
        error: {
          code: 500,
          message: 'invalid user req value',
        },
      };

      ctx.res = res;
      return;
    }

    // validate email grpc param
    const { email } = user;
    if (email === undefined) {
      const res = <TAuthResponse>{
        error: {
          code: 500,
          message: 'invalid user.email req value',
        },
      };

      ctx.res = res;
      return;
    }

    // validate password grpc param
    const { password } = user;
    if (password === undefined) {
      const res = <TAuthResponse>{
        error: {
          code: 500,
          message: 'invalid user.password req value',
        },
      };

      ctx.res = res;
      return;
    }

    // validate name grpc param
    const { name } = user;
    if (name === undefined) {
      const res = <TAuthResponse>{
        error: {
          code: 500,
          message: 'invalid user.name req value',
        },
      };

      ctx.res = res;
      return;
    }

    // signup with email, password and email on users-api
    let auth: TAuthResponse;
    try {
      const user: TUser = {
        email,
        password,
        name,
      };

      auth = await this.service.signUp(user);
    } catch (err) {
      throw err;
    }

    // get data and meta login response
    const { data, meta } = auth;

    // set response values
    const res = <TAuthResponse>{
      data,
      meta,
      error: null,
    };

    // prepare response
    ctx.res = res;
  };
}

export default RPC;
