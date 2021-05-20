const pgp = require("pg-promise")();
const db = pgp("postgres://postgres:postgres@localhost:5432/test");

class DatabaseWrapper {
  constructor(database_url) {}

  createTables() {}
}

class Polls {
  static createPoll(questionText) {
    return db.none("INSERT INTO polls(question) VALUES ($1)", questionText);
  }
}

class Choices {}

exports.Polls = Polls;
