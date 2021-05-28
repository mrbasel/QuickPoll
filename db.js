const pgp = require("pg-promise")();
const db = pgp(process.env.DATABASE_URL);

class DbWrapper {
  static createPollsCmd = `CREATE TABLE IF NOT EXISTS polls (
    poll_id SERIAL PRIMARY KEY,
    url_id uuid DEFAULT uuid_generate_v4(),
    question VARCHAR(250) NOT NULL,
    date_created DATE NOT NULL DEFAULT CURRENT_DATE,
    deadline_date TIMESTAMPTZ
);`;
  static createChoicesCmd = `CREATE TABLE IF NOT EXISTS choices (
    choice_id SERIAL PRIMARY KEY,
    poll_id INT,
    choice_text VARCHAR(200) NOT NULL,
    vote_count INT DEFAULT 0,
    CONSTRAINT poll_fk FOREIGN KEY(poll_id) 
	  REFERENCES polls(poll_id)
      ON DELETE CASCADE
);`;

  static createTables() {
    return db
      .none(this.createPollsCmd)
      .then(() => db.none(this.createChoicesCmd));
  }
}

class Polls {
  static createPoll(questionText, timeStamp) {
    return db.one(
      "INSERT INTO polls(question, deadline_date) VALUES ($1, $2) RETURNING poll_id, url_id",
      [questionText, timeStamp]
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

  static vote(pollId, choice) {
    return db.none(
      "UPDATE choices SET vote_count = vote_count + 1 WHERE poll_id = $1 AND choice_text = $2 ",
      [pollId, choice]
    );
  }
}

class Choices {}

exports.Polls = Polls;
exports.DbWrapper = DbWrapper;
