const pgp = require("pg-promise")();
const db = pgp(process.env.DATABASE_URL);
const { PreparedStatement: PS } = require("pg-promise");

function createTables() {
  const createPollsCmd = `CREATE TABLE IF NOT EXISTS polls (
    poll_id SERIAL PRIMARY KEY,
    url_id uuid DEFAULT uuid_generate_v4(),
    question VARCHAR(250) NOT NULL,
    date_created DATE NOT NULL DEFAULT CURRENT_DATE,
    deadline_date TIMESTAMPTZ
);`;
  const createChoicesCmd = `CREATE TABLE IF NOT EXISTS choices (
    choice_id SERIAL PRIMARY KEY,
    poll_id INT,
    choice_text VARCHAR(200) NOT NULL,
    vote_count INT DEFAULT 0,
    CONSTRAINT poll_fk FOREIGN KEY(poll_id) 
	  REFERENCES polls(poll_id)
      ON DELETE CASCADE
);`;

  return db.none(createPollsCmd).then(() => db.none(createChoicesCmd));
}

const Polls = {
  getPoll: function (pollId) {
    const getPollStatement = new PS({
      name: "get-poll",
      text: "SELECT * FROM polls WHERE url_id = $1",
      values: [pollId],
    });
    return db.one(getPollStatement);
  },
  createPoll: function (questionText, timeStamp, choices) {
    const createPollStatement = new PS({
      name: "create-poll",
      text: "INSERT INTO polls(question, deadline_date) VALUES ($1, $2) RETURNING poll_id, url_id",
      values: [questionText, timeStamp],
    });

    return db.tx(async (t) => {
      const pollData = await t.one(createPollStatement);
      await t.none(Choices.addChoices(pollData.poll_id, choices));
      return pollData;
    });
  },
  vote: function (pollId, choice) {
    const voteStatement = new PS({
      name: "vote",
      text: "UPDATE choices SET vote_count = vote_count + 1 WHERE poll_id = $1 AND choice_text = $2",
      values: [pollId, choice],
    });
    return db.none(voteStatement);
  },
};

const Choices = {
  getChoices: function (pollId) {
    const getChoicesStatement = new PS({
      name: "get-choices",
      text: "SELECT * FROM choices WHERE poll_id = $1",
      values: [pollId],
    });
    return db.any(getChoicesStatement);
  },
  addChoices: function (pollId, choices) {
    const values = [];
    choices.forEach((choice) => {
      values.push({ poll_id: pollId, choice_text: choice });
    });

    const columns = new pgp.helpers.ColumnSet(["poll_id", "choice_text"], {
      table: "choices",
    });

    const query = pgp.helpers.insert(values, columns);
    return query;
  },
};

exports.Polls = Polls;
exports.Choices = Choices;
exports.createTables = createTables;
