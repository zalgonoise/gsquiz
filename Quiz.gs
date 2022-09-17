// baseFormID is the ID of a Forms document that will serve as a template to the created form
const baseFormID = ""
// baseFolderID is the ID of a Drive folder where the new Forms document should be moved
const baseFolderID = ""
// maxRange is the maximum range to scan in a Sheets document to retrieve questions and answers
const maxRange = "A1:F30"
// baseTitle is the base title of the document
const baseTitle = "The Quizzz"
// sep is a basic separator
const sep = "-"
// spSep is a spaced separator
const spSep = " - "
// feedbackOK is the feedback given on correct answers
const feedbackOK = "nice! 😎"
// feedbackNOK is the feedback given on incorrect answers
const feedbackNOK = "bruh 🤮"

class Question {
  /**
   * Question class defines the structure of a multi-choice question, which is composed of
   * a question, an array of answers (at least one, up to four), and a matching correct answer
   * 
   * @param {string} question question - the question raised in the quiz
   * @param {string[]} asnwers answers - the possible answers to the question
   * @param {string} correctAns - the right answer, present in answers
   */
  constructor(question, answers, correctAns) {
    this.question = question;
    this.answers = answers;
    this.correctAns = correctAns;
  }
}

class Quiz {
  /**
   * Quiz class will build the Forms document based on the input questions from the Sheets document
   * 
   * The output will be an array of strings containing the Forms URL, Forms Edit URL and the 
   * Forms document ID.
   * 
   * @param {string} sheetsURL sheetsURL - the URL to the Sheets document 
   * containing the questions and answers. It should contain 6 columns where:
   *   - col. A: question
   *   - col. B-E: 4 possible answers; leave blank when less than 4
   *   - col. F: index (0-3) of the right answer out of the list of answers
   */
  constructor(sheetsURL) {
    this.url = sheetsURL;
    this.questions = new SheetsData(sheetsURL); 
    this.form;
    this.formURL;
    this.formEditURL;
    this.responses;
    this.score; 

    /**
     * BuildForms method will use the input Sheets data to build a Forms document 
     * containing all the input questions and responses
     * 
     * Returns the Forms document URL, Forms Edit URL, and Forms file ID
     */
    this.BuildForms = function() {
      var form;
      var d = new Date()
      var df = d.getFullYear() + sep + d.getMonth() + sep + d.getDay()
      var title = baseTitle + spSep + df

      if ((baseFormID == "") || (baseFolderID == "")) {
        form = FormApp.create(title)
                      .setTitle(title)
                      .setIsQuiz(true)
                      .setCollectEmail(true)
                      .setLimitOneResponsePerUser(true)
                      .setProgressBar(true)
                      .setPublishingSummary(true)
      } else {
        var copy = DriveApp.getFileById(baseFormID).makeCopy()
        copy.setName(title)
        copy.moveTo(DriveApp.getFolderById(baseFolderID))

        var form = FormApp.openById(copy.getId())
                          .setTitle(title)
                          .setIsQuiz(true)
                          .setCollectEmail(true)
                          .setLimitOneResponsePerUser(true)
                          .setProgressBar(true)
                          .setPublishingSummary(true)
      }
      this.questions.forEach(function(q) {
        var item = form.addMultipleChoiceItem()
        item.setTitle(q.question)
        
        var choices = [];
        q.answers.forEach(function(ans) {
          choices.push(item.createChoice(ans, (ans == q.correctAns)))
        })
        item.setChoices(choices)
        item.setFeedbackForCorrect(FormApp.createFeedback().setText(feedbackOK).build())
        item.setFeedbackForIncorrect(FormApp.createFeedback().setText(feedbackNOK).build())
        item.setPoints(1)
        item.createResponse(q.correctAns)

        form.addPageBreakItem()
      })
      this.form = form;
      this.formURL = form.getPublishedUrl();
      this.formEditURL = form.getEditUrl();
      return [ 
        this.form.shortenFormUrl(this.formURL), 
        this.form.shortenFormUrl(this.formEditURL),
        this.form.getId()
      ]
    }

    /**
     * BuildSlides method will create a Slides document based on the input questions and answers
     * to present these in a visual form, to an audience.
     * 
     * It's not yet implemented
     */
    this.BuildSlides = function() {}

    return this.BuildForms()
  }
}

class SheetsData {
  /**
   * SheetsData class will behave as an extractor for Sheets documents data
   * in the context of a Quiz.
   * 
   * It will expect a Sheets document URL with read permissions, composed of 
   * up to 30 rows of 6 columns.
   * 
   * Col. A will be the question.
   * Cols. B-E will be the potential answers. It has to be at least one, up to four
   * Col. F will be a copy of the correct answer. Must match one of the provided answers 
   * 
   * It returns an array of Question, based on the Sheets input
   * 
   * @param {string} sheetsURL sheetsURL - the URL to the Sheets document 
   * containing the questions and answers.
   */
  constructor(sheetsURL) {
    this.url = sheetsURL;
    this.user = Session.getActiveUser();
    this.file = SpreadsheetApp.openByUrl(sheetsURL);
    this.sheet = this.file.getSheets()[0];
    this.questions = [];

    /**
     * Read method will parse through the content in A1:F30, building an array of
     * Question objects, if valid, which is returned.
     */
    this.Read = function() {
      var range = this.sheet.getRange(maxRange);
      var values = range.getValues();

      for (var i = 0; i < values.length; i++) {
        if ((values[i][0] != "") && (values[i][5] != "")) {

          var qs = [];
          for (var q = 1; q < 5 ; q++) {
            if (values[i][q] != "") {
              qs.push(values[i][q])
            }
          }

          var question = new Question(values[i][0], qs, values[i][5])
          this.questions.push(question)
        }
      }
      return this.questions
    }
  
    return this.Read()
  }
}