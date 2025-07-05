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
  // --- Touch event support for mobile drag-and-drop ---
  let touchDragging = false;
  let offsetX = 0;
  let offsetY = 0;
  let origParent = null;
  let origNextSibling = null;
  let origStyle = {};

  img.addEventListener('touchstart', function(e) {
    // Only single touch
    if (e.touches.length !== 1) return;
    touchDragging = true;
    const touch = e.touches[0];
    // Save original parent and next sibling for reset
    origParent = img.parentNode;
    origNextSibling = img.nextSibling;
    // Save original style
    origStyle = {
      position: img.style.position,
      left: img.style.left,
      top: img.style.top,
      zIndex: img.style.zIndex,
      pointerEvents: img.style.pointerEvents,
      transition: img.style.transition
    };
    // Calculate offset within image
    const rect = img.getBoundingClientRect();
    offsetX = touch.clientX - rect.left;
    offsetY = touch.clientY - rect.top;
    // Make absolute and bring to front
    img.style.position = 'absolute';
    img.style.left = (touch.clientX - offsetX) + 'px';
    img.style.top = (touch.clientY - offsetY) + 'px';
    img.style.zIndex = 9999;
    img.style.pointerEvents = 'none';
    img.style.transition = 'none';
    document.body.appendChild(img);
    // Prevent scrolling
    e.preventDefault();
  }, { passive: false });

  img.addEventListener('touchmove', function(e) {
    if (!touchDragging) return;
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    img.style.left = (touch.clientX - offsetX) + 'px';
    img.style.top = (touch.clientY - offsetY) + 'px';
    // Prevent scrolling
    e.preventDefault();
  }, { passive: false });

  img.addEventListener('touchend', function(e) {
    if (!touchDragging) return;
    touchDragging = false;
    img.style.pointerEvents = '';
    // Find slot under touchend position
    let touch = (e.changedTouches && e.changedTouches[0]) || (e.touches && e.touches[0]);
    if (!touch) {
      // fallback: use last position
      touch = { clientX: parseInt(img.style.left) + offsetX, clientY: parseInt(img.style.top) + offsetY };
    }
    let dropped = false;
    let feedback = document.getElementById('feedback');
    document.querySelectorAll('.slot').forEach(slot => {
      const rect = slot.getBoundingClientRect();
      if (
        touch.clientX >= rect.left &&
        touch.clientX <= rect.right &&
        touch.clientY >= rect.top &&
        touch.clientY <= rect.bottom &&
        !dropped
      ) {
        // Only drop if not already filled
        if (slot.classList.contains('filled')) {
          feedback.textContent = '⚠️ This slot is already filled!';
          wrongSound.play();
          setTimeout(() => feedback.textContent = '', 1500);
        } else if (slot.dataset.name === img.dataset.name) {
          slot.classList.add('filled');
          slot.textContent = '';
          slot.appendChild(img);
          img.style.position = '';
          img.style.left = '';
          img.style.top = '';
          img.style.zIndex = '';
          img.style.pointerEvents = '';
          img.style.transition = '';
          img.style.cursor = 'default';
          img.draggable = false;
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
        dropped = true;
      }
    });
    if (!dropped) {
      // Not dropped on valid slot, reset position
      // Restore original style
      img.style.position = origStyle.position;
      img.style.left = origStyle.left;
      img.style.top = origStyle.top;
      img.style.zIndex = origStyle.zIndex;
      img.style.pointerEvents = origStyle.pointerEvents;
      img.style.transition = origStyle.transition;
      // Put back in original parent if needed
      if (origParent) {
        if (origNextSibling && origNextSibling.parentNode === origParent) {
          origParent.insertBefore(img, origNextSibling);
        } else {
          origParent.appendChild(img);
        }
      }
    }
    // Prevent scrolling
    e.preventDefault();
  }, { passive: false });
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
