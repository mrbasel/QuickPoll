function textboxListener(elem) {
  // Adds a new textbox to the container if "elem" is the last element in the container
  const answerTextFieldsContainer = document.querySelector(".answers");
  const answerTextFields = document.querySelectorAll(".answer");
  const isLastElement =
    answerTextFieldsContainer.children[
      answerTextFieldsContainer.children.length - 1
    ] !== elem.target;

  if (isLastElement || answerTextFields.length >= 8) return;

  const answerTextbox =
    answerTextFieldsContainer.children[
      answerTextFieldsContainer.children.length - 1
    ].cloneNode();
  const answerLabel = document.querySelectorAll("label")[2].cloneNode(true);
  answerLabel.textContent = "Answer " + (answerTextFields.length + 1);
  answerTextbox.name = answerTextFields.length + 1;

  answerTextbox.addEventListener("focus", textboxListener);
  answerTextFieldsContainer.appendChild(answerLabel);
  answerTextFieldsContainer.appendChild(answerTextbox);
}
window.onload = () => {
  const answerTextFields = document.querySelectorAll(".answer");

  answerTextFields[answerTextFields.length - 1].addEventListener(
    "focus",
    textboxListener
  );
};
