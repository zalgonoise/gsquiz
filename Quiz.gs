// baseFormID is the ID of a Forms document that will serve as a template to the created form
const baseFormID = ""
// baseSlidesID is the ID of a Forms document that will serve as a template to the created form
const baseSlidesID = ""
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
   * Question class defines the structure of a multi-choice question,
   * which is composed of a question, an array of answers (at least one,
   * up to four), and a matching correct answer
   * 
   * @param {string} question question - the question raised in the quiz
   * @param {string[]} asnwers answers - the possible answers to the
   * question
   * @param {string} correctAns - the right answer, present in answers
   */
  constructor(question, answers, correctAns) {
    this.question = question;
    this.answers = answers;
    this.correctAns = correctAns;
  }
}

class QuizOutput {
  /**
   * QuizOutput class defines the structure of the Quiz class' output,
   * which will an object containing two other objects:
   * 
   * output.forms - the output of Forms documents generation
   *       .forms.formsURL - URL to the Forms document
   *       .forms.editURL - URL to edit / manage the Forms document
   *       .forms.formsID - Forms document ID
   * 
   * output.slides - the output of Slides documents generation
   *       .slides.slidesURL - URL to the Slides document
   *       .slides.slidesID - Slides document ID
   */
  constructor() {
    this.forms;
    this.slides;

    /**
     * Forms method will parse the output of a Quiz.BuildForms() call.
     * 
     * It expects an array of strings, of len 3.
     * 
     * @param {string[]} forms forms - the output of a 
     * Quiz.BuildForms() call
     */
    this.Forms = function(forms) {
      if (forms.length != 3) {
        return
      }
      this.forms = {
        formsURL: forms[0],
        editURL: forms[1],
        formsID: forms[2]
      }
    }

    /**
     * Slides method will parse the output of a Quiz.BuildSlides() call.
     * 
     * It expects an array of strings, of len 2. These could also be errors
     * if the correct defaults aren't set (template file and base folder)
     * 
     * @param {string[]} slides slides - the output of a 
     * Quiz.BuildSlides() call
     */
    this.Slides = function(slides) {
      if (slides.length != 2) {
        return
      }
      if (
        (slides[0] == "no slides template provided") 
        || (slides[0] == "no base folder provided")
      ) {
        return
      }
      this.slides = {
        slidesURL: slides[0],
        slidesID: slides[1]
      }    
    }

    /**
     * Output method will return an object containing the parsed 
     * values of QuizOutput.Forms() and QuizOutput.Slides() calls
     * 
     * It returns an object containing a forms object, and a slides object
     */
    this.Output = function(){
      return {
        forms: this.forms,
        slides: this.slides
      }
    }
  }
}

class Quiz {
  /**
   * Quiz class will build the Forms document based on the input questions
   * from the Sheets document
   * 
   * The output will be an array of strings containing the Forms URL,
   * Forms Edit URL and the 
   * Forms document ID.
   * 
   * @param {string} sheetsURL sheetsURL - the URL to the Sheets document 
   * containing the questions and answers. It should contain 6 columns
   * where:
   *   - col. A: question
   *   - col. B-E: 4 possible answers; leave blank when less than 4
   *   - col. F: index (0-3) of the right answer out of the list of answers
   */
  constructor(sheetsURL, themeDescription) {
    this.url = sheetsURL;
    this.questions = new SheetsData(sheetsURL); 
    this.theme = themeDescription;
    this.form;
    this.dateF;
    this.title;
    this.out = new QuizOutput();

      var d = new Date();
      this.dateF = d.getFullYear() + sep + d.getMonth() + sep + d.getDate();
      this.title = baseTitle + spSep + this.dateF;

    /**
     * BuildForms method will use the input Sheets data to build a Forms
     * document 
     * containing all the input questions and responses
     * 
     * Returns the Forms document URL, Forms Edit URL, and Forms file ID
     */
    this.BuildForms = function() {
      var form;

      if ((baseFormID == "") || (baseFolderID == "")) {
        form = FormApp.create(this.title)
                      .setTitle(this.title)
                      .setDescription(this.theme)
                      .setIsQuiz(true)
                      .setCollectEmail(true)
                      .setLimitOneResponsePerUser(true)
                      .setProgressBar(true)
                      .setPublishingSummary(true)
      } else {
        var copy = DriveApp.getFileById(baseFormID).makeCopy()
        copy.setName(this.title)
        copy.moveTo(DriveApp.getFolderById(baseFolderID))

        form = FormApp.openById(copy.getId())
                          .setTitle(this.title)
                          .setDescription(this.theme)
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
     * BuildSlides method will create a Slides document based on the input
     * questions and answers
     * to present these in a visual form, to an audience.
     * 
     * Reference template slides:
     * [0] - Title, gets the date added under "The Quizzz"
     * [1] - Theme, gets theme added in Shape[1]
     * [2] - Question, followed by different possible answers from A-D
     *       It is placed in Shape[1]
     * [3] - Correct Answer 
     *       It is placed in Shape[1]
     * [4] - Results check
     * 
     * It only works with a provided Slides template complying with the
     * structure above; otherwise returns an error
     */
    this.BuildSlides = function() {
      var ppt;
  
      if ((baseSlidesID == "") || (baseFolderID == "")) {
        var errs = []
        if (baseSlidesID == "") {errs.push("no slides template provided")}
        if (baseFolderID == "") {errs.push("no base folder provided")}
        if (errs.length == 1) {
          errs.push("") // comply with expected array lenght
        }
        return errs
      } 
      var copy = DriveApp.getFileById(baseSlidesID).makeCopy()
      copy.setName(this.title)
      copy.moveTo(DriveApp.getFolderById(baseFolderID))

      ppt = SlidesApp.openById(copy.getId())
      var items = ppt.getSlides()
      var questionCopy = items[2]
      var answerCopy = items[3]
      var resultsCopy = items[4]

      // set title
      var title = items[0].getShapes()[1].getText()
      var oldTitle = title.asString()
      title.setText(oldTitle + this.dateF)
      // set theme
      items[1].getShapes()[1].getText().setText(this.theme)
      
      // build questions
      var ansIndex = ["A) ", "B) ", "C) ", "D) "]
      this.questions.forEach(function(q) {
        var newSlide = ppt.appendSlide(questionCopy)
        var qBody = "\n" + q.question + "\n"
        q.answers.forEach(function(a, idx) {
          qBody += ansIndex[idx] +  a + "\n"
        })
        newSlide.getShapes()[1].getText().setText(qBody)

        var ansSlide = ppt.appendSlide(answerCopy)
        var qBody = "\n" + q.question + "\n"
        q.answers.forEach(function(a, idx) {
          if (a == q.correctAns) {
            qBody += ansIndex[idx] +  a + "\n"
          }
        })
        ansSlide.getShapes()[1].getText().setText(qBody)
      })

      // add results check
      ppt.appendSlide(resultsCopy)

      // remove template slides
      items = ppt.getSlides()
      items[4].remove()
      items[3].remove()
      items[2].remove()
      
      return [
        ppt.getUrl(),
        ppt.getId()
      ]
    }

    this.out.Forms(this.BuildForms())   // build forms into output
    this.out.Slides(this.BuildSlides()) // build slides into output
    return this.out.Output()            // return output 
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
