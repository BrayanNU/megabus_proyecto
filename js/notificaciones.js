let dataTableInstance;

document.addEventListener("DOMContentLoaded", function () {
  dataTableInstance = new DataTable("#example", {
    pageLength: 5,
    language: {
      url: "//cdn.datatables.net/plug-ins/1.10.25/i18n/Spanish.json",
    },
  });

  const rol = sessionStorage.getItem('rol');
  if (rol === "Administrador") {

  } else if (rol === "Conductor") {
    cargarNotificacionesConductor();
  }
});

function cargarNotificacionesConductor() {
  const idUsuario = sessionStorage.getItem("id_usuario");
  fetch(`/megabus_proyecto/php/notificaciones_conductor.php?id_usuario=${idUsuario}`)
    .then(res => res.json())
    .then(data => mostrarNotificaciones(data))
    .catch(err => console.error("Error al obtener notificaciones:", err));
}

function mostrarNotificaciones(data) {
  const tbody = document.querySelector("#example tbody");
  tbody.innerHTML = ""; 

  if (dataTableInstance) {
    dataTableInstance.clear();
  }

  let index = 1;
  let hayDatos = false;

  if (Array.isArray(data.alertas)) {
    data.alertas.forEach(alerta => {
      dataTableInstance.row.add([
        index++,
        "Alerta de Velocidad",
        `Vehículo ${alerta.placa} excedió ${alerta.velocidad_detectada} km/h`,
        alerta.fecha_alerta,
        "Generada"
      ]);
      hayDatos = true;
    });
  }

  if (Array.isArray(data.incidencias)) {
    data.incidencias.forEach(inc => {
      dataTableInstance.row.add([
        index++,
        "Incidencia",
        inc.descripcion,
        inc.fecha_incidencia,
        inc.estado
      ]);
      hayDatos = true;
    });
  }


  if (!hayDatos) {
    dataTableInstance.row.add([
      "", "No tienes alertas registradas", "", "", ""
    ]);
  }

  dataTableInstance.draw();
}