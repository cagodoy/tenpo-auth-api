// dependencies
import { Client } from 'pg';
import Store from './postgres/store';

const NewPostgres = async (dsn: string): Promise<Store> => {
  try {
    const client = new Client(dsn);
    await client.connect();

    const store = new Store(client);
    return Promise.resolve(store);
  } catch (err) {
    throw err;
  }
};

export default NewPostgres;
