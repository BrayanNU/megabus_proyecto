console.log("login.js cargado");
document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();
  

  const correo = document.getElementById('correo').value.trim();
  const contrasena = document.getElementById('contrasena').value;
  const errorMsg = document.getElementById('loginError');

if (!correo || !contrasena) {
  errorMsg.textContent = "Todos los campos son obligatorios.";
  return;
} else if (!correo.includes("@")) {
  errorMsg.textContent = "El correo debe contener un símbolo @.";
  return;
} else {

  console.log("Correo:", correo);
  console.log("Contraseña:", contrasena);
}

  
  fetch('/megabus_proyecto/php/validar_login.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `correo=${encodeURIComponent(correo)}&contrasena=${encodeURIComponent(contrasena)}`
  })
  
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      if (data.rol === "Administrador") {
        window.location.href = "../vista/dashboard.html";
      } else {
        window.location.href = "../vista/dashboard.html";
      }
    } else {
      errorMsg.textContent = data.message;
    }
  })
  .catch(error => {
    console.error("ERROR FETCH:", error);
    errorMsg.textContent = "Error de conexión con el servidor.";
  });
});




