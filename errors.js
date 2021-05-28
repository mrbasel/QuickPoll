class PollDeadlineError extends Error {
  constructor(msg) {
    super(msg);
    this.name = "PollDeadlineError";
  }
}

module.exports = PollDeadlineError;
