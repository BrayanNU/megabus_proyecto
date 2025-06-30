let dataTableInstance;
let modoEdicion = false;
let idConductorEditando = null;

document.addEventListener("DOMContentLoaded", function () {
  cargarConductores();

  const form = document.getElementById("formConductor");
  const nombreInput = document.getElementById("nombre");
  const apellidoInput = document.getElementById("apellido");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  // Función para generar correo y contraseña
  function generarEmailYPassword() {
    const nombre = nombreInput.value.trim().toLowerCase().replace(/\s+/g, "");
    const apellido = apellidoInput.value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "");
    const email = nombre && apellido ? `${nombre}.${apellido}@gmail.com` : "";

    // Generar contraseña simple usando nombre + número aleatorio
    const password = `${nombre}${Math.floor(Math.random() * 10000)}`; // Ejemplo: pedro12345

    emailInput.value = email;
    passwordInput.value = password; // Mostrar la contraseña generada
  }

  nombreInput.addEventListener("input", generarEmailYPassword);
  apellidoInput.addEventListener("input", generarEmailYPassword);

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    this.classList.remove("was-validated");

    // Obtener valores
    const dni = document.getElementById("dni").value.trim();
    const nombre = nombreInput.value.trim();
    const apellido = apellidoInput.value.trim();
    const email = emailInput.value.trim();
    const licencia = document.getElementById("licencia_conducir").value.trim();
    const fechaLicencia = document
      .getElementById("fecha_vencimiento_licencia")
      .value.trim();
    const telefono = document.getElementById("telefono").value.trim();

    let valid = true;
    let mensajes = [];

    const allEmpty =
      dni === "" &&
      nombre === "" &&
      apellido === "" &&
      licencia === "" &&
      fechaLicencia === "" &&
      telefono === "";

    if (allEmpty) {
      Swal.fire({
        icon: "warning",
        title: "Formulario vacío",
        text: "No se puede enviar el formulario vacío. Por favor, complete los campos requeridos.",
      });
      return;
    }

    // Validaciones
    if (dni === "" || !/^\d{8}$/.test(dni)) {
      valid = false;
      mensajes.push("DNI no válido. Debe tener exactamente 8 dígitos.");
    }

    if (nombre === "" || !/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/.test(nombre)) {
      valid = false;
      mensajes.push("Nombre no válido, solo letras.");
    }

    if (apellido === "" || !/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/.test(apellido)) {
      valid = false;
      mensajes.push("Apellido no válido, solo letras.");
    }

    if (licencia === "" || !/^[A-Z0-9-]{6,15}$/i.test(licencia)) {
      valid = false;
      mensajes.push("Licencia no válida. Debe tener entre 6 y 15 caracteres.");
    }

    if (!fechaLicencia) {
      valid = false;
      mensajes.push("Seleccione la fecha de vencimiento de la licencia.");
    }

    if (telefono === "" || !/^\d{9}$/.test(telefono)) {
      valid = false;
      mensajes.push("Teléfono no válido. Debe tener exactamente 9 dígitos.");
    }

    // Mostrar errores
    if (!valid) {
      Swal.fire({
        icon: "error",
        title: "Errores en el formulario",
        html: mensajes.join("<br>"),
      });
      return;
    }

    const formData = new FormData(this);
    if (modoEdicion && idConductorEditando !== null) {
      formData.append("accion", "editar");
      formData.append("id_conductor", idConductorEditando);
    } else {
      formData.append("accion", "agregar");
    }

    // Enviar datos al servidor
    fetch("/megabus_proyecto/php/conductores.php", {
      method: "POST",
      body: formData,
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          this.reset();
          this.classList.remove("was-validated");
          cargarConductores();
          modoEdicion = false;
          idConductorEditando = null;
          Swal.fire("Éxito", "Conductor guardado correctamente.", "success");
        } else {
          Swal.fire("Error", "No se pudo guardar al conductor.", "error");
        }
      })
      .catch((error) => {
        console.error("Error al registrar conductor:", error);
        Swal.fire("Error", "Error al registrar conductor", "error");
      });
  });
});

function cargarConductores() {
  fetch("/megabus_proyecto/php/conductores.php")
    .then((response) => response.json())
    .then((data) => {
      console.log("Respuesta del servidor:", data); // Agrega esto
      if (!Array.isArray(data)) {
        throw new Error("La respuesta no es un array");
      }

      const tbody = document.querySelector("#example tbody");
      tbody.innerHTML = ""; // Limpiar contenido previo

      // Limpiar los datos de la tabla sin destruir la instancia
      if (dataTableInstance) {
        dataTableInstance.clear();
      }
      // Llenar la tabla con los conductores
      data.forEach((conductor, index) => {
        dataTableInstance.row.add([
          index + 1,
          conductor.dni,
          conductor.nombre,
          conductor.apellido,
          conductor.licencia_conducir,
          conductor.fecha_vencimiento_licencia,
          conductor.telefono,
          `
                <button class="btn btn-warning btn-sm me-2" onclick="editarConductor(${conductor.id_conductor})">Editar</button>
                <button class="btn btn-danger btn-sm" onclick="eliminarConductor(${conductor.id_conductor})">Eliminar</button>
             `,
        ]);
      });

      // Redibujar la tabla
      dataTableInstance.draw();
    })
    .catch((error) => console.error("Error al cargar los datos:", error));
}

// Inicialización de la DataTable fuera de la función cargarUsuarios()
document.addEventListener("DOMContentLoaded", function () {
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
            title: "Reporte de Conductores",
            orientation: "portrait",
            pageSize: "A4",
            exportOptions: {
              columns: [0, 1, 2, 3, 4, 5, 6] // Excluir columna de acciones
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

              // Elimina el título automático
              doc.content.splice(0, 1);

              // Insertar título de empresa "Mega Bus"
              doc.content.unshift({
                text: "MEGA BUS",
                style: "title",
                fontSize: 24,
                bold: true,
                margin: [0, 0, 0, 5],
                alignment: "center"
              });

              // Insertar subtítulo
              doc.content.splice(1, 0, {
                text: "REPORTE DE CONDUCTORES",
                style: "subheader",
                margin: [0, 0, 0, 12],
                alignment: "center"
              });

              // Ajustar ancho de columnas (adaptar si es necesario)
              doc.content[2].table.widths = [
                "5%",   // #
                "15%",  // DNI
                "15%",  // Nombre
                "15%",  // Apellido
                "20%",  // Licencia
                "15%",  // Fecha Venc.
                "15%",  // Teléfono
              ];
            }
          },
          "colvis"
        ],
      },
    },
  });
});


function eliminarConductor(id) {
  Swal.fire({
    title: "¿Estás seguro?",
    text: "Esta acción eliminará al conductor y no se podrá revertir.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar"
  }).then((result) => {
    if (result.isConfirmed) {
      const formData = new FormData();
      formData.append("accion", "eliminar");
      formData.append("id", id);

      fetch("/megabus_proyecto/php/conductores.php", {
        method: "POST",
        body: formData,
      })
        .then((r) => r.json())
        .then((res) => {
          if (res.success) {
            Swal.fire("Eliminado", "Conductor eliminado correctamente.", "success");
            cargarConductores();
          } else {
            Swal.fire("Error", "No se pudo eliminar el conductor. " + (res.error || ""), "error");
          }
        })
        .catch((error) => {
          console.error("Error al eliminar conductor:", error);
          Swal.fire("Error", "Error inesperado al eliminar conductor.", "error");
        });
    }
  });
}



function editarConductor(id) {
  fetch(`/megabus_proyecto/php/conductores.php?id=${id}`)
    .then((response) => response.json())
    .then((data) => {
      const conductor = data;
      document.getElementById("nombre").value = conductor.nombre;
      document.getElementById("apellido").value = conductor.apellido;
      document.getElementById("email").value = conductor.email;
      document.getElementById("dni").value = conductor.dni;
      document.getElementById("licencia_conducir").value =
        conductor.licencia_conducir;
      document.getElementById("fecha_vencimiento_licencia").value =
        conductor.fecha_vencimiento_licencia;
      document.getElementById("telefono").value = conductor.telefono;

      modoEdicion = true;
      idConductorEditando = id;
    })
    .catch((error) =>
      console.error("Error al cargar datos para editar:", error)
    );
}
