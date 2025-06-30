document.addEventListener("DOMContentLoaded", function () {
  fetch("/megabus_proyecto/php/notificaciones_admin.php")
    .then(res => res.json())
    .then(data => {
      mostrarAlertas(data.alertas || []);
      mostrarReportes(data.reportes || []);
      mostrarIncidencias(data.incidencias || []);
    })
    .catch(err => console.error("Error al cargar notificaciones:", err));
});

function mostrarAlertas(alertas) {
  const tbody = document.querySelector("#example_1 tbody");
  tbody.innerHTML = "";

  alertas.forEach((item, index) => {
    tbody.innerHTML += `
      <tr>
        <td>${index + 1}</td>
        <td>${item.placa}</td>
        <td>${item.velocidad_detectada} km/h</td>
        <td>${item.fecha_alerta}</td>
      </tr>
    `;
  });

  new DataTable("#example_1", {
    pageLength: 3,
    responsive: true
  });
}

function mostrarReportes(reportes) {
  const tbody = document.querySelector("#example_2 tbody");
  tbody.innerHTML = "";

  reportes.forEach((item, index) => {
    tbody.innerHTML += `
      <tr>
        <td>${index + 1}</td>
        <td>${item.nombre}</td>
        <td>${item.tipo_reporte}</td>
        <td>${item.descripcion}</td>
        <td>${item.fecha_generacion}</td>
      </tr>
    `;
  });

  new DataTable("#example_2", {
    pageLength: 3,
    responsive: true
  });
}

function mostrarIncidencias(incidencias) {
  const tbody = document.querySelector("#example_3 tbody");
  tbody.innerHTML = "";

  incidencias.forEach((item, index) => {
    tbody.innerHTML += `
      <tr>
        <td>${index + 1}</td>
        <td>${item.nombre_conductor}</td>
        <td>${item.descripcion}</td>
        <td>${item.estado}</td>
        <td>${item.fecha_incidencia}</td>
      </tr>
    `;
  });

  new DataTable("#example_3", {
    pageLength: 3,
    responsive: true
  });
}
