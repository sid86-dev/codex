import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterveral;

// Create loading animation
function loader(element) {
  element.textContent = '';

  loadInterveral = setInterval(() => {
    element.textContent += '.';

    if (element.textContent === "....") {
      element.textContent = '';
    }
  }, 300);
};

// Type text with interval 
function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20)
};


// Generate Unique Id
function generateUniquieId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexaDecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexaDecimalString}`;
};


// Create Chat Stripe
function chatStripe(isAi, value, uniqueId) {
  return (
    `<div class="wrapper ${isAi && 'ai'}">
      <div class="chat">
        <div class="profile">
          <img src="${isAi ? bot : user}" alt="${isAi ? 'bot' : 'user'}" />
        </div>
        <div class="message" style="${isAi && 'white-space: pre-wrap;'}" id="${uniqueId}">
          ${value}
        </div>
      </div>
    </div>
    `
  )
}


// Handle Submit of user input
const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  // user's chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'), generateUniquieId());

  form.reset();

  // bot's chatstripe
  const uniqueId = generateUniquieId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  // fetch response from server
  const response = await fetch(import.meta.env.VITE_SERVER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: data.get('prompt'),
    }),
  });


  clearInterval(loadInterveral);
  messageDiv.innerHTML = '';

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.message.trim();

    typeText(messageDiv, parsedData);
  } else {
    messageDiv.innerHTML = 'Something went wrong';
  }
}

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});


