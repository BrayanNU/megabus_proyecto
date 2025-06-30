// alertas_velocidad.js
// Este archivo es solo para mostrar alertas de velocidad en tiempo real
let alertaInterval = null;
let ultimaAlertaId = null; // Para evitar mostrar muchas veces la misma alerta

document.addEventListener("DOMContentLoaded", () => {
  const rol = sessionStorage.getItem("rol");
  if (rol === "Conductor") {

  }
});

function iniciarAlertaVelocidad() {
  if (alertaInterval !== null) return; // ya está corriendo

  const idUsuario = sessionStorage.getItem("id_usuario");
  if (!idUsuario) {
    console.warn("No se encontró ID de usuario en sessionStorage.");
    return;
  }

  alertaInterval = setInterval(() => {
    fetch(`/megabus_proyecto/php/notificaciones_conductor.php?id_usuario=${idUsuario}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.alertas) && data.alertas.length > 0) {
          const ultima = data.alertas[0];
          if (ultimaAlertaId !== ultima.id_alerta) {
            ultimaAlertaId = ultima.id_alerta;
            Swal.fire({
              title: '🚨 Alerta de Velocidad',
              text: `Excediste la velocidad: ${ultima.velocidad_detectada} km/h`,
              icon: 'warning',
              confirmButtonText: 'Entendido',
              timer: 8000,
              timerProgressBar: true
            });
          }
        }
      })
      .catch(err => console.error("Error al obtener alertas:", err));
  }, 8000);
}

function detenerAlertaVelocidad() {
  if (alertaInterval !== null) {
    clearInterval(alertaInterval);
    alertaInterval = null;
  }
}