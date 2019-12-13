// store dependies
import { Client } from 'pg';
import squel from 'squel';
import { TAuth } from '../../../../../lib/js/dist/clients/auth';

// store interface
export interface IStore {
  Get(id: string): Promise<TAuth>;
  GetByToken(token: string): Promise<TAuth>;
  Create(token: string, userId: string): Promise<TAuth>;
  Update(id: string): Promise<TAuth>;
  Delete(id: string): Promise<TAuth>;
}

// store class
class Store implements IStore {
  private db: Client;

  constructor(db: Client) {
    this.db = db;
  }

  // Get a auth value from store
  Get = async (id: string): Promise<TAuth> => {
    const query = squel
      .select()
      .from('auth')
      .where('auth.id = ?', id)
      .toString();

    try {
      const result = await this.db.query(query, []);
      console.log('Store Get', result.rows[0]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  };

  // GetByToken a auth value from store
  GetByToken = async (token: string): Promise<TAuth> => {
    const query = squel
      .select()
      .from('auth')
      .where('auth.token = ?', token)
      .toString();

    try {
      const result = await this.db.query(query, []);
      if (result.rows.length === 0) {
        throw new Error('token is not found');
      }
      console.log('GetByToken', result);
      console.log('GetByToken', result.rows[0]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  };

  // Create a auth value from store
  Create = async (token: string, userId: string): Promise<any> => {
    // generate query
    const query =
      squel
        .insert()
        .into('auth')
        .set('user_id', userId)
        .set('token', token)
        .toString() + 'RETURNING *';

    // exec query
    try {
      const result = await this.db.query(query, []);
      console.log('Store Create', result.rows[0]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  };

  // Update a auth value from store
  Update(id: string): Promise<any> {
    const err = new Error('method not implemented');
    return Promise.reject(err);
  }

  // Delete a auth value from store
  Delete(id: string): Promise<any> {
    const err = new Error('method not implemented');
    return Promise.reject(err);
  }
}

export default Store;
