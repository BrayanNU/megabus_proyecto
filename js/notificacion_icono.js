document.addEventListener("DOMContentLoaded", function () {
  fetch("/megabus_proyecto/php/notificaciones_admin.php")
    .then(res => res.json())
    .then(data => {
      let contador = 0;
      const hoy = new Date().toISOString().slice(0, 10); // formato YYYY-MM-DD

      // Alertas de velocidad de hoy
      if (Array.isArray(data.alertas)) {
        contador += data.alertas.filter(a => a.fecha_alerta?.slice(0, 10) === hoy).length;
      }

      // Reportes de hoy
      if (Array.isArray(data.reportes)) {
        contador += data.reportes.filter(r => r.fecha_generacion?.slice(0, 10) === hoy).length;
      }

      // Incidencias de hoy
      if (Array.isArray(data.incidencias)) {
        contador += data.incidencias.filter(i => i.fecha_incidencia?.slice(0, 10) === hoy).length;
      }

      const span = document.getElementById("contador-notificaciones");
      if (span) {
        if (contador > 0) {
          span.textContent = contador;
          span.style.display = "inline-block";
        } else {
          span.style.display = "none";
        }
      }
    })
    .catch(err => console.error("Error al cargar notificaciones:", err));
});
