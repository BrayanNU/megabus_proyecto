let dataTableConductores, dataTableVehiculos, dataTableRutas;
let modoEdicion = false;
let idConductorEditando = null;
let idVehiculoEditando = null;
let idRutaEditando = null;

document.addEventListener("DOMContentLoaded", function () {
  cargarConductores();
  cargarVehiculos();
  cargarRutas();

  dataTableConductores = new DataTable("#example_1", { pageLength: 8 });
  dataTableVehiculos = new DataTable("#example_2", { pageLength: 8 });
  dataTableRutas = new DataTable("#example_3", { pageLength: 8 });

  const form = document.getElementById("formAsigRuta");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    this.classList.remove("was-validated");

    const fecha_programada = document
      .getElementById("fecha_programada")
      .value.trim();

    if (!fecha_programada) {
      Swal.fire("Error", "Debe seleccionar una fecha programada", "warning");
      return;
    }

    // Verifica que se haya seleccionado conductor, vehiculo y ruta
    if (
      idConductorEditando === null ||
      idVehiculoEditando === null ||
      idRutaEditando === null
    ) {
      Swal.fire(
        "Error",
        "Debe seleccionar conductor, vehículo y ruta",
        "warning"
      );
      return;
    }

    const formData = new FormData();
    formData.append("accion", "agregar");
    formData.append("id_conductor", idConductorEditando);
    formData.append("id_vehiculo", idVehiculoEditando);
    formData.append("id_ruta", idRutaEditando);
    formData.append("fecha_programada", fecha_programada);

    fetch("/megabus_proyecto/php/asignar_rutas.php", {
      method: "POST",
      body: formData,
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          Swal.fire("Éxito", "Asignación guardada correctamente.", "success");
          form.reset();
          idConductorEditando = null;
          idVehiculoEditando = null;
          idRutaEditando = null;
          modoEdicion = false;
        } else {
          Swal.fire("Error", "No se pudo guardar la asignación", "error");
        }
      })
      .catch((error) => {
        console.error("Error al enviar datos:", error);
        Swal.fire("Error", "Error en la solicitud", "error");
      });
  });
});

function cargarConductores() {
  fetch("/megabus_proyecto/php/conductores.php")
    .then((res) => res.json())
    .then((data) => {
      const tbody = document.querySelector("#example_1 tbody");
      tbody.innerHTML = "";
      dataTableConductores.clear();

      data.forEach((conductor, index) => {
        dataTableConductores.row.add([
          index + 1,
          conductor.dni,
          conductor.nombre,
          conductor.apellido,
          conductor.licencia_conducir,
          conductor.fecha_vencimiento_licencia,
          conductor.telefono,
          `<button class="btn btn-warning btn-sm me-2" onclick="select_Conductor(${conductor.id_conductor})">Agregar</button>`,
        ]);
      });
      dataTableConductores.draw();
    });
}

function cargarVehiculos() {
  fetch("/megabus_proyecto/php/vehiculos.php")
    .then((res) => res.json())
    .then((data) => {
      const tbody = document.querySelector("#example_2 tbody");
      tbody.innerHTML = "";
      dataTableVehiculos.clear();

      data.forEach((vehiculo, index) => {
        dataTableVehiculos.row.add([
          index + 1,
          vehiculo.placa,
          vehiculo.marca,
          vehiculo.modelo,
          vehiculo.ano,
          vehiculo.tipo_bus,
          vehiculo.num_pasajeros,
          vehiculo.max_velocidad,
          vehiculo.kilometraje,
          vehiculo.ult_mantenimiento,
          vehiculo.estado,
          `
            <button class="btn btn-warning btn-sm me-2" onclick="select_Vehiculo(${vehiculo.id_vehiculo})">Agregar</button>
          `,
        ]);
      });
      dataTableVehiculos.draw();
    });
}

function cargarRutas() {
  fetch("/megabus_proyecto/php/rutas.php")
    .then((res) => res.json())
    .then((data) => {
      const tbody = document.querySelector("#example_3 tbody");
      tbody.innerHTML = "";
      dataTableRutas.clear();

      data.forEach((ruta, index) => {
        dataTableRutas.row.add([
          index + 1,
          ruta.cod_ruta,
          ruta.origen,
          ruta.destino,
          ruta.vel_max,
          ruta.estado,
          `
            <button class="btn btn-warning btn-sm me-2" onclick="select_Ruta(${ruta.id_ruta})">Agregar</button>
          `,
        ]);
      });
      dataTableRutas.draw();
    });
}

function select_Conductor(id) {
  fetch(`/megabus_proyecto/php/asignar_rutas.php?id=${id}&tipo=conductor`)
    .then((res) => res.json())
    .then((conductor) => {
      document.getElementById("nombre").value = conductor.nombre + " " + conductor.apellido;
      idConductorEditando = id;
      modoEdicion = true;
    })
    .catch((error) => {
      console.error("Error al cargar conductor:", error);
    });
}

function select_Vehiculo(id) {
  fetch(`/megabus_proyecto/php/asignar_rutas.php?id=${id}&tipo=vehiculo`)
    .then((res) => res.json())
    .then((vehiculo) => {
      if (vehiculo && vehiculo.placa && vehiculo.marca) {
        document.getElementById("placa").value = vehiculo.placa + " " + vehiculo.marca;
        idVehiculoEditando = id;
        modoEdicion = true;
      } else {
        // No se encontró o no está activo
        document.getElementById("placa").value = "";
        idVehiculoEditando = null;
        Swal.fire("Vehículo no disponible", "Este vehículo no está activo o no se encontró.", "warning");
      }
    })
    .catch((error) => {
      console.error("Error al cargar vehiculo:", error);
      document.getElementById("placa").value = "";
      idVehiculoEditando = null;
      Swal.fire("Error", "No se pudo cargar el vehículo", "error");
    });
}


function select_Ruta(id) {
  fetch(`/megabus_proyecto/php/asignar_rutas.php?id=${id}&tipo=ruta`)
    .then((res) => res.json())
    .then((ruta) => {
      document.getElementById("cod_ruta").value = ruta.cod_ruta;
      idRutaEditando = id;
      modoEdicion = true;
    })
    .catch((error) => {
      console.error("Error al cargar ruta:", error);
    });
}
