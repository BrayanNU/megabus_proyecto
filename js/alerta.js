let dataTableReporte1, dataTableReporte2, dataTableReporte3, dataTableReporte4, dataTableReporte5;
let modoEdicion = false;

document.addEventListener("DOMContentLoaded", function () {
  cargarVehiculoAveriado();
  cargarProblemasPasajeros();
  cargarRutaBloqueada();
  cargarClima();
  cargarOtros();

  dataTableReporte1 = new DataTable("#example_1", {
    pageLength: 8,
    layout: {
      topStart: {
        buttons: ["copy", "excel", "pdf", "colvis"],
      },
    },
  });

  dataTableReporte2 = new DataTable("#example_2", {
    pageLength: 8,
    layout: {
      topStart: {
        buttons: ["copy", "excel", "pdf", "colvis"],
      },
    },
  });

  dataTableReporte3 = new DataTable("#example_3", {
    pageLength: 8,
    layout: {
      topStart: {
        buttons: ["copy", "excel", "pdf", "colvis"],
      },
    },
  });
  dataTableReporte4 = new DataTable("#example_4", {
    pageLength: 8,
    layout: {
      topStart: {
        buttons: ["copy", "excel", "pdf", "colvis"],
      },
    },
  });
  dataTableReporte5 = new DataTable("#example_5", {
    pageLength: 8,
    layout: {
      topStart: {
        buttons: ["copy", "excel", "pdf", "colvis"],
      },
    },
  });

 
});

function cargarVehiculoAveriado() {
  fetch("/megabus_proyecto/php/reporte.php?tipo=vehiculo averiado")
    .then((res) => res.json())
    .then((data) => {
      const tbody = document.querySelector("#example_1 tbody");
      tbody.innerHTML = "";
      dataTableReporte1.clear();

      data.forEach((reporte, index) => {
        dataTableReporte1.row.add([
          index + 1,
          reporte.nombre,
          reporte.tipo_reporte,
          reporte.descripcion,
          reporte.foto,
          reporte.fecha_generacion,
        ]);
      });
      dataTableReporte1.draw();
    });
}

function cargarProblemasPasajeros() {
  fetch("/megabus_proyecto/php/reporte.php?tipo=Problema con el pasajeros")
    .then((res) => res.json())
    .then((data) => {
      const tbody = document.querySelector("#example_2 tbody");
      tbody.innerHTML = "";
      dataTableReporte2.clear();

      data.forEach((reporte, index) => {
        dataTableReporte2.row.add([
          index + 1,
          reporte.nombre,
          reporte.tipo_reporte,
          reporte.descripcion,
          reporte.foto,
          reporte.fecha_generacion,
        ]);
      });
      dataTableReporte2.draw();
    });
}
function cargarRutaBloqueada() {
  fetch("/megabus_proyecto/php/reporte.php?tipo=Ruta bloqueada")
    .then((res) => res.json())
    .then((data) => {
      const tbody = document.querySelector("#example_3 tbody");
      tbody.innerHTML = "";
      dataTableReporte3.clear();

      data.forEach((reporte, index) => {
        dataTableReporte3.row.add([
          index + 1,
          reporte.nombre,
          reporte.tipo_reporte,
          reporte.descripcion,
          reporte.foto,
          reporte.fecha_generacion,
        ]);
      });
      dataTableReporte3.draw();
    });
}
function cargarClima() {
  fetch("/megabus_proyecto/php/reporte.php?tipo=Clima")
    .then((res) => res.json())
    .then((data) => {
      const tbody = document.querySelector("#example_4 tbody");
      tbody.innerHTML = "";
      dataTableReporte4.clear();

      data.forEach((reporte, index) => {
        dataTableReporte4.row.add([
          index + 1,
          reporte.nombre,
          reporte.tipo_reporte,
          reporte.descripcion,
          reporte.foto,
          reporte.fecha_generacion,
        ]);
      });
      dataTableReporte4.draw();
    });
}
function cargarOtros() {
  fetch("/megabus_proyecto/php/reporte.php?tipo=Otro")
    .then((res) => res.json())
    .then((data) => {
      const tbody = document.querySelector("#example_5 tbody");
      tbody.innerHTML = "";
      dataTableReporte5.clear();

      data.forEach((reporte, index) => {
        dataTableReporte5.row.add([
          index + 1,
          reporte.nombre,
          reporte.tipo_reporte,
          reporte.descripcion,
          reporte.foto,
          reporte.fecha_generacion,
        ]);
      });
      dataTableReporte5.draw();
    });
}
