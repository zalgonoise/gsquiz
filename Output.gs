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
