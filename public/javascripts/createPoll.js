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

function validAnswers() {
  const answerTextFields = document.querySelectorAll(".answer");

  let validAnswersCount = 0;
  for (const textField of answerTextFields) {
    if (textField.value !== "") validAnswersCount++;
  }

  if (validAnswersCount < 2) return false;
  return true;
}

// Sets the min attribute for the date input
// to the current date, and sets max to a date
// one year from the current date
function setDateMinMax() {
  const dateInput = document.querySelector("input[type='date']");
  const dateAfterOneYear = new Date();
  dateAfterOneYear.setFullYear(dateAfterOneYear.getFullYear() + 1);

  dateInput.setAttribute("min", new Date().toISOString().split("T")[0]);
  dateInput.setAttribute("max", dateAfterOneYear.toISOString().split("T")[0]);
}

window.onload = () => {
  const submitBtn = document.querySelector("#submitBtn");
  const answerTextFields = document.querySelectorAll(".answer");
  const deadlineChkBox = document.querySelector("#deadline-option-checkbox");
  const dateInput = document.querySelector("input[type='date']");

  setDateMinMax();
  answerTextFields[answerTextFields.length - 1].addEventListener(
    "focus",
    textboxListener
  );

  deadlineChkBox.addEventListener("change", (e) => {
    if (deadlineChkBox.checked) dateInput.style.display = "block";
    else {
      dateInput.style.display = "none";
      dateInput.value = "";
    }
  });

  submitBtn.addEventListener("click", (e) => {
    if (!validAnswers()) {
      alert("You must have 2 or more answers");
      e.preventDefault();
    }
  });
};
