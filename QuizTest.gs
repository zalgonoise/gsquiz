const url = `` // a (string) complete URL to pointing a sheets document

function TestQuiz() {  
  q = new Quiz(url)

  console.log(q.BuildForms())
}

function TestSheetsData() {
  wants = [
    new Question(
      "What is 2 + 2?",
      [3, 4, 5, 6],
      4,
    ),
    new Question(
      "What is the capital of Sweden?",
      ["Cairo", "Madrid", "Paris", "Stockholm"],
      "Stockholm",
    ),
    new Question(
      "Are you smart?",
      ["Yes", "No"],
      "Yes",
    )
  ];

  s = new SheetsData(url)
  if (s.length != wants.length) {
    console.error("length mismatch error: wanted", wants.length, "got", s.length)
  }

  wants.forEach(function(w, idx) {
    if (w.question != s[idx].question) {
      console.error("output mismatch error: wanted", w.question, "got", s[idx].question)
    }

    if (w.correctIndex != s[idx].correctIndex) {
      console.error("output mismatch error: wanted", w.correctIndex, "got", s[idx].correctIndex)
    }

    s[idx].answers.forEach(function(a, idx){
      if (!w.answers.includes(a, idx)) {
        console.error("output mismatch error: missing", a, "in expected answers")
      }
    })
  })
}
