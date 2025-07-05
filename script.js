let placedCount = 0;
const totalCharacters = 5;

const rightSound = new Audio('right.mp3');
const wrongSound = new Audio('wrong.mp3');
const successSound = new Audio('wow.mp3');

// Highlight the next empty slot with pulsing effect
function highlightNextSlot() {
  document.querySelectorAll('.slot').forEach(slot => {
    slot.classList.remove('pulsing');
  });

  const nextSlot = Array.from(document.querySelectorAll('.slot'))
    .find(slot => !slot.classList.contains('filled'));

  if (nextSlot) {
    nextSlot.classList.add('pulsing');
  }
}

document.querySelectorAll('.character').forEach(img => {
  img.addEventListener('dragstart', e => {
    e.dataTransfer.setData('character', img.dataset.name);
  });
});

document.querySelectorAll('.slot').forEach(slot => {
  slot.addEventListener('dragover', e => e.preventDefault());

  slot.addEventListener('drop', e => {
    e.preventDefault();
    const droppedName = e.dataTransfer.getData('character');
    const draggedEl = document.querySelector(`.character[data-name="${droppedName}"]`);
    const feedback = document.getElementById('feedback');

    if (slot.classList.contains('filled')) {
      feedback.textContent = '⚠️ This slot is already filled!';
      wrongSound.play();
      setTimeout(() => feedback.textContent = '', 1500);
      return;
    }

    if (slot.dataset.name === droppedName) {
      slot.classList.add('filled');
      slot.textContent = '';
      slot.appendChild(draggedEl);
      draggedEl.style.cursor = 'default';
      draggedEl.draggable = false;
      placedCount++;
      rightSound.play();
      feedback.textContent = '';

      if (placedCount === totalCharacters) {
        showCompletion();
      } else {
        highlightNextSlot();
      }
    } else {
      feedback.textContent = '❌ Wrong slot! Try again.';
      wrongSound.play();
      setTimeout(() => feedback.textContent = '', 1500);
    }
  });
});

function showCompletion() {
  const msg = document.getElementById('completion-message');
  msg.textContent = '🎉 Great job! All characters matched!';
  successSound.play();

  // Remove pulsing animations
  document.querySelectorAll('.slot').forEach(slot => {
    slot.classList.remove('pulsing');
  });

  // Create center container
  const centerContainer = document.createElement('div');
  centerContainer.id = 'center-container';
  document.body.appendChild(centerContainer);


}

// Start by highlighting the first slot
highlightNextSlot();