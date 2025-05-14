const bus = document.getElementById('bus');
let position = 0;
const maxPosition = 560; // límite dentro del contenedor

function moverBus() {
  if (position >= maxPosition) {
    position = 0; // reinicia el recorrido
  } else {
    position += 40; // avanza el bus
  }

  bus.style.left = position + 'px';
  bus.textContent = "🚌";
}

setInterval(moverBus, 2000);
