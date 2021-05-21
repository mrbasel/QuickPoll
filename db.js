const pgp = require("pg-promise")();
const db = pgp("postgres://postgres:postgres@localhost:5432/test");

class DatabaseWrapper {
  constructor(database_url) {}

  createTables() {}
}

class Polls {
  static createPoll(questionText) {
    return db.one(
      "INSERT INTO polls(question) VALUES ($1) RETURNING poll_id",
      questionText
    );
  }
  static getPoll(pollId) {
    return db.one("SELECT * FROM polls WHERE url_id = $1", pollId);
  }

  static getChoices(pollId) {
    return db.any("SELECT * FROM choices WHERE poll_id = $1", pollId);
  }

  static addChoices(pollId, choices) {
    choices.map((choice) => {
      return db.none(
        "INSERT INTO choices (poll_id, choice_text) VALUES ($1, $2)",
        [pollId, choice]
      );
    });

    return Promise.all(choices);
  }
}

class Choices {}

exports.Polls = Polls;
