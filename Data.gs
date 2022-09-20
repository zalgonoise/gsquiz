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
        if (
          (values[i][0] != "") && (   // question must not be empty
              (values[i][5] != "") || //
              (values[i][6] != "") || // one of the correct answer
              (values[i][7] != "") || // fields must be populated
              (values[i][8] != "")
            )
          ) {

          var qs = [];
          for (var q = 1; q < 5 ; q++) {
            if (values[i][q] != "") {
              qs.push(values[i][q])
            }
          }

          var as = [];
          for (var a = 5; q < 9 ; q++) {
            if (values[i][q] != "") {
              as.push(values[i][q])
            }
          }
          var points = 1;
          if (values[i][9] != "") {
            points = values[i][9]
          }

          var question = new Question(values[i][0], qs, as, points)
          this.questions.push(question)
        }
      }
      return this.questions
    }
  
    return this.Read()
  }
}
