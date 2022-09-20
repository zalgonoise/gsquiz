class Question {
  /**
   * Question class defines the structure of a multi-choice question,
   * which is composed of a question, an array of answers (at least one,
   * up to four), and a matching correct answer
   * 
   * @param {string} question question - the question raised in the quiz
   * @param {string[]} asnwers answers - the possible answers to the
   * question
   * @param {string} correctAns - the right answer, present in answers
   */
  constructor(question, answers, correctAns, points) {
    this.question = question;
    this.answers = answers;
    this.correctAns = correctAns;
    this.points = points;
  }
}
