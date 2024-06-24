import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";

document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.options .button');
  const submitButton = document.querySelector('.submit-button');

  if (buttons.length > 0) {
    buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const buttonsInGroup = target.closest('.options')?.querySelectorAll('.button') as NodeListOf<HTMLElement>;
        
        if (buttonsInGroup) {
          buttonsInGroup.forEach(btn => btn.classList.remove('selected'));
        }
        target.classList.add('selected');

        console.log(`Button clicked: ${target.textContent}`); // Debugging statement
      });
    });
  }

  async function submitQuiz() {
    const selectedOptions = document.querySelectorAll('.options .button.selected') as NodeListOf<HTMLElement>;
    const data: { [key: string]: string } = {};

    selectedOptions.forEach(option => {
      const questionElement = option.closest('.options')?.previousElementSibling as HTMLElement;
      const question = questionElement ? questionElement.textContent : '';
      const answer = option.textContent || '';
      data[question || ''] = answer;
    });

    try {
      const docRef = await addDoc(collection(db, "quizResults"), data);
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  if (submitButton) {
    submitButton.addEventListener('click', submitQuiz);
  }
});