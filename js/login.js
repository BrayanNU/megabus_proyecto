document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();
  

  const correo = document.getElementById('correo').value.trim();
  const contrasena = document.getElementById('contrasena').value;
  const errorMsg = document.getElementById('loginError');
  const errorMail =document.getElementById('emailError');
  errorMsg.textContent = "";
  errorMail.textContent = "";

  if (!correo || !contrasena) {
    errorMsg.textContent = "Todos los campos son obligatorios.";
    return;
  }

  const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!correoRegex.test(correo)) {
    errorMail.textContent = "Ingrese un correo válido.";
    return;
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

      sessionStorage.setItem('id_usuario', data.id_usuario);
      sessionStorage.setItem('nombre', data.nombre);
      sessionStorage.setItem('rol', data.rol);

      if (data.rol === "Administrador") {
        window.location.href = "../vista/dashboard.html";
      } else if (data.rol === "Conductor") {
        window.location.href = "../vista/rutas_C.html";
      }else {
        window.location.href = "../vista/recuperarPassword.html";
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





