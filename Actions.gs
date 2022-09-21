function generateQuiz() {
  var quiz = new Quiz()
  var output = "The Quizzz!!\n"
    + "\n" + `Forms doc: ${quiz.forms.formsURL}` 
    + "\n" + `Forms Editor: ${quiz.forms.editURL}`
    + "\n" + `Slides: ${quiz.slides.slidesURL}`

  console.log(output) // register in Apps Script logs in case popup is gone 
  SpreadsheetApp.getUi().alert(output);
}

function resetTemplate() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0]
  
  sheet.getRange(themeRange).clear() // clear theme
  sheet.getRange(maxRange).clear() // clear questions
}
