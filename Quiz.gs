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
   * @param {string} question question - the question raised in the quiz
   * @param {string[]} asnwers answers - the possible answers to the question
   * @param {int} correctAns - the right answer, present in answers
   */
  constructor(question, answers, correctAns) {
    this.question = question;
    this.answers = answers;
    this.correctAns = correctAns;
  }
}

class Quiz {
  /**
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

    this.BuildForms = function() {
      var init = DriveApp.getFileById("1xdo5NUkl2Afpwp7tX_WyXhMhBnkXd-8qnja3heDDJfM")

      var form = FormApp.create("The Quizzz")
                        .setIsQuiz(true)
                        .setCollectEmail(true)
                        .setLimitOneResponsePerUser(true)
                        .setProgressBar(true)
                        .setPublishingSummary(true)
      this.questions.forEach(function(q) {
        var item = form.addMultipleChoiceItem()
        item.setTitle(q.question)
        
        var choices = [];
        q.answers.forEach(function(ans) {
          choices.push(item.createChoice(ans, (ans == q.correctAns)))
        })
        item.setChoices(choices)
        item.setFeedbackForCorrect(FormApp.createFeedback().setText("nice! 😎").build())
        item.setFeedbackForIncorrect(FormApp.createFeedback().setText("bruh 🤮").build())
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
      ]
    }
    this.buildSlides = function() {}
    this.GetResponses = function() {
      if (this.form == null) {
        console.error("form must be created in order to fetch responses. form:", this.form)
      }
      this.responses = this.form.getResponses()

      this.reponses.forEach(function(r) {
          var itemReponses = r.getItemResponses();
          itemResponses.forEach(function(res, idx){
        })
      })
    }

  }
}

class SheetsData {
  /**
   * @param {string} sheetsURL sheetsURL - the URL to the Sheets document 
   * containing the questions and answers.
   */
  constructor(sheetsURL) {
    this.url = sheetsURL;
    this.user = Session.getActiveUser();
    this.file = SpreadsheetApp.openByUrl(sheetsURL);
    this.sheet;
    this.data;
    this.questions = [];

    this.GetSheet = function() {
      this.sheet = this.file.getSheets()[0];
    }

    this.Read = function() {
      var range = this.sheet.getRange("A1:F30");
      var values = range.getValues();
      this.data = values;

      for (var i = 0; i < values.length; i++) {
        if ((values[i][0] != "") && (values[i][5] != "")) {

          var questions = [];
          for (var q = 1; q < 5 ; q++) {
            if (values[i][q] != "") {
              questions.push(values[i][q])
            }
          }

          var question = new Question(values[i][0], questions, values[i][5])
          this.questions.push(question)
        }
      }
    }
    this.GetSheet()
    this.Read()
  
    return this.questions
  }
}
