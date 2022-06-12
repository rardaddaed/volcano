// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {

  development: {
    client: 'mysql2',
    connection: {
      host: 'localhost',
      database: 'volcanoes',
      port: 3306,
      user: 'root',
      password: 'jb9iypcf'
    }
  },

  production: {
    client: 'mysql2',
    connection: {
      host: 'localhost',
      database: 'volcanoes',
      port: 3306,
      user: 'root',
      password: 'Cab230!'
    }
  }

};
