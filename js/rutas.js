let dataTableInstance;
let modoEdicion = false;
let idRutaEditando = null;

document.addEventListener("DOMContentLoaded", () => {
  inicializarEventos();
  inicializarDataTable();
  cargarRutas();
});

function inicializarEventos() {
  const form = document.getElementById("formRuta");
  const velInput = document.getElementById("vel_max");


  ["origen", "destino"].forEach((id) =>
    document.getElementById(id).addEventListener("input", generarCodigoRuta)
  );


  velInput.addEventListener("input", () => {
    const valorNumerico = velInput.value.replace(/\D/g, '');
    velInput.value = valorNumerico ? `${valorNumerico} km/h` : "";
  });

  velInput.addEventListener("focus", () => {
    velInput.value = velInput.value.replace(" km/h", "");
  });

  velInput.addEventListener("blur", () => {
    const valorNumerico = velInput.value.replace(/\D/g, '');
    velInput.value = valorNumerico ? `${valorNumerico} km/h` : "";
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    form.classList.remove("was-validated");

    const origen = document.getElementById("origen").value.trim();
    const destino = document.getElementById("destino").value.trim();
    const codRuta = document.getElementById("cod_ruta").value.trim();
    const estado = document.getElementById("estado").value.trim();
    let velMax = document.getElementById("vel_max").value.trim().replace(/[^\d.]/g, '');

    let mensajes = [];
    const camposVacios = !origen && !destino && !codRuta && !velMax && !estado;

    if (camposVacios) {
      return mostrarAlerta("warning", "Formulario vacío", "Complete los campos requeridos.");
    }

    if (!origen) mensajes.push("Seleccione el punto de origen.");
    if (!destino) mensajes.push("Seleccione el punto de destino.");
    if (!codRuta) mensajes.push("Ingrese el nombre de la ruta.");
    if (!estado) mensajes.push("Seleccione el estado de la ruta.");
    if (isNaN(velMax) || velMax <= 0) mensajes.push("Ingrese una velocidad válida (> 0).");

    if (mensajes.length > 0) {
      return mostrarAlerta("error", "Errores en el formulario", mensajes.join("<br>"));
    }

    const formData = new FormData(form);
    formData.append("accion", modoEdicion ? "editar" : "agregar");
    if (modoEdicion) formData.append("id_ruta", idRutaEditando);

    fetch("/megabus_proyecto/php/rutas.php", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          form.reset();
          form.classList.remove("was-validated");
          cargarRutas();
          modoEdicion = false;
          idRutaEditando = null;
          mostrarAlerta("success", "Éxito", "Ruta guardada correctamente.");
        } else {
          mostrarAlerta("error", "Error", res.error || "No se pudo guardar la ruta.");
        }
      })
      .catch((err) => {
        console.error("Error al registrar ruta:", err);
        mostrarAlerta("error", "Error", "Error al registrar la ruta.");
      });
  });
}

function inicializarDataTable() {
  dataTableInstance = new DataTable("#example", {
    pageLength: 4,
    layout: {
      topStart: {
        buttons: [
          "copy",
          "excel",
          {
            extend: "pdfHtml5",
            text: "Exportar PDF",
            title: "Reporte de Rutas",
            orientation: "landscape",
            pageSize: "A4",
            exportOptions: {
              columns: [0, 1, 2, 3, 4, 5]
            },
            customize: function (doc) {
              doc.styles.title = {
                color: "#007bff",
                fontSize: 20,
                alignment: "center",
              };

              doc.styles.tableHeader = {
                fillColor: "#007bff",
                color: "white",
                bold: true,
                fontSize: 12,
              };

      
              doc.content.splice(0, 1);

              doc.content.unshift({
                text: "REPORTE DE RUTAS",
                style: "title",
                margin: [0, 0, 0, 12],
              });

        
              doc.content[1].table.widths = ["5%", "15%", "15%", "25%", "15%", "15%"];
            }
          },
          "colvis"
        ],
      },
    },
  });
}


function cargarRutas() {
  fetch("/megabus_proyecto/php/rutas.php")
    .then((res) => res.json())
    .then((data) => {
      if (!Array.isArray(data)) throw new Error("La respuesta no es un array");
      const tbody = document.querySelector("#example tbody");
      tbody.innerHTML = "";

      if (dataTableInstance) dataTableInstance.clear();

      data.forEach((ruta, index) => {
        dataTableInstance.row.add([
          index + 1,
          ruta.cod_ruta,
          ruta.origen,
          ruta.destino,
          ruta.vel_max,
          ruta.estado,
          `
            <button class="btn btn-warning btn-sm me-2" onclick="editarRuta(${ruta.id_ruta})">Editar</button>
            <button class="btn btn-danger btn-sm" onclick="eliminarRuta(${ruta.id_ruta})">Eliminar</button>
          `,
        ]);
      });

      dataTableInstance.draw();
    })
    .catch((error) => console.error("Error al cargar rutas:", error));
}

function editarRuta(id) {
  fetch(`/megabus_proyecto/php/rutas.php?id=${id}`)
    .then((res) => res.json())
    .then((ruta) => {
      document.getElementById("cod_ruta").value = ruta.cod_ruta;
      document.getElementById("origen").value = ruta.origen;
      document.getElementById("destino").value = ruta.destino;
      document.getElementById("vel_max").value = ruta.vel_max;
      document.getElementById("estado").value = ruta.estado;

      modoEdicion = true;
      idRutaEditando = id;
    })
    .catch((err) => console.error("Error al cargar datos para editar:", err));
}

function eliminarRuta(id) {
  Swal.fire({
    title: "¿Estás seguro?",
    text: "Esta acción eliminará la ruta.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar"
  }).then((result) => {
    if (result.isConfirmed) {
      const formData = new FormData();
      formData.append("accion", "eliminar");
      formData.append("id", id);

      fetch("/megabus_proyecto/php/rutas.php", {
        method: "POST",
        body: formData,
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.success) {
            cargarRutas();
            mostrarAlerta("success", "Eliminado", "Ruta eliminada correctamente.");
          } else {
            mostrarAlerta("error", "Error al eliminar", res.error);
          }
        })
        .catch((error) => {
          console.error("Error al eliminar ruta:", error);
          mostrarAlerta("error", "Error", "No se pudo eliminar la ruta.");
        });
    }
  });
}


function generarCodigoRuta() {
  const origen = document.getElementById("origen").value;
  const destino = document.getElementById("destino").value;

  const cod = origen && destino
    ? `${abreviar(origen)}-${abreviar(destino)}-01`
    : "";

  document.getElementById("cod_ruta").value = cod;
}

function abreviar(texto) {
  return texto.trim().substring(0, 3).toUpperCase();
}

function mostrarAlerta(icono, titulo, texto) {
  Swal.fire({
    icon: icono,
    title: titulo,
    html: texto,
  });
}
