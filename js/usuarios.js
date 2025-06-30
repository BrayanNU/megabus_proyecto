let dataTableInstance;
let modoEdicion = false;
let idUsuarioEditando = null;

document.addEventListener("DOMContentLoaded", function () {
  cargarUsuarios();

  const form = document.getElementById("formUsuario");
  const nombreInput = document.getElementById("nombre");
  const apellidoInput = document.getElementById("apellido");
  const emailInput = document.getElementById("correo");
  const passwordInput = document.getElementById("contrasena");

  // Función para generar correo y contraseña
  function generarEmailYPassword() {
    const nombre = nombreInput.value.trim().toLowerCase().replace(/\s+/g, "");
    const apellido = apellidoInput.value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "");
    const email = nombre && apellido ? `${nombre}.${apellido}@gmail.com` : "";

    // Generar contraseña simple usando nombre + número aleatorio
    const password = Array.from({ length: 10 }, () =>
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".charAt(
        Math.floor(Math.random() * 74)
      )
    ).join("");

    emailInput.value = email;
    passwordInput.value = password; // Mostrar la contraseña generada
  }

  nombreInput.addEventListener("input", generarEmailYPassword);
  apellidoInput.addEventListener("input", generarEmailYPassword);

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    this.classList.remove("was-validated");

    const nombre = nombreInput.value.trim();
    const apellido = apellidoInput.value.trim();
    const rol = document.getElementById("rol").value.trim();
    const estado = document.getElementById("estado").value.trim();

    // Expresión regular solo para letras
    const sinSentido = /(asd|qwe|zxc|lkm|poi|mnb|aaa|eee|zzz){1,}/i;
    const soloLetrasBien =
      /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*$/;
    const repetido = /(.)\1{2,}/;

    const nombreLimpio = nombre.replace(/\s+/g, " ").trim();
    const apellidoLimpio = apellido.replace(/\s+/g, " ").trim();

    // Validar nombre
    if (
      nombreLimpio === "" ||
      !soloLetrasBien.test(nombreLimpio) ||
      nombreLimpio.length < 2 ||
      nombreLimpio.length > 50 ||
      repetido.test(nombreLimpio.toLowerCase()) ||
      sinSentido.test(nombreLimpio.toLowerCase())
    ) {
      Swal.fire(
        "Validación",
        "Ingrese un *nombre válido*. Debe contener solo letras, comenzar con mayúscula, y no tener repeticiones o combinaciones sin sentido.",
        "warning"
      );
      return;
    }

    // Validar apellido
    if (
      apellidoLimpio === "" ||
      !soloLetrasBien.test(apellidoLimpio) ||
      apellidoLimpio.length < 2 ||
      apellidoLimpio.length > 50 ||
      repetido.test(apellidoLimpio.toLowerCase()) ||
      sinSentido.test(apellidoLimpio.toLowerCase())
    ) {
      Swal.fire(
        "Validación",
        "Ingrese un *apellido válido*. Debe contener solo letras, comenzar con mayúscula, y no tener repeticiones o combinaciones sin sentido.",
        "warning"
      );
      return;
    }

    if (rol === "") {
      Swal.fire("Validación", "Debe seleccionar un rol.", "warning");
      return;
    }

    if (estado === "") {
      Swal.fire("Validación", "Debe seleccionar un estado.", "warning");
      return;
    }

    // Validación nativa del formulario
    if (!this.checkValidity()) {
      this.classList.add("was-validated");
      return;
    }

    const formData = new FormData(this);
    if (modoEdicion && idUsuarioEditando !== null) {
      formData.append("accion", "editar");
      formData.append("id_usuario", idUsuarioEditando);
    } else {
      formData.append("accion", "agregar");
    }

    // Enviar datos al servidor
    fetch("/megabus_proyecto/php/usuarios.php", {
      method: "POST",
      body: formData,
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          this.reset();
          this.classList.remove("was-validated");
          cargarUsuarios();
          modoEdicion = false;
          idUsuarioEditando = null;
          Swal.fire("Éxito", "Usuario guardado correctamente.", "success");
        } else {
          Swal.fire("Error", "No se pudo guardar el usuario.", "error");
        }
      })
      .catch((error) => {
        console.error("Error al registrar usuario:", error);
        Swal.fire("Error", "Error al registrar usuario", "error");
      });
  });

  document.getElementById("contrasena").addEventListener("focus", function () {
    this.value = "";
  });
});

function cargarUsuarios() {
  fetch("/megabus_proyecto/php/usuarios.php")
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

      // Agregar los nuevos datos a la tabla
      data.forEach((usuario, index) => {
        const contrasenaOculta = "*".repeat(usuario.contrasena.length); // Muestra asteriscos según la longitud de la contraseña

        dataTableInstance.row.add([
          index + 1, // Número de fila
          usuario.nombre,
          usuario.apellido,
          usuario.correo,
          contrasenaOculta,
          usuario.rol,
          usuario.estado,
          `
                    <button class="btn btn-warning btn-sm me-2" onclick="editarUsuario(${usuario.id_usuario})">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="eliminarUsuario(${usuario.id_usuario})">Eliminar</button>
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
        buttons: ["copy", "excel", {
    extend: "pdfHtml5",
    text: "Exportar PDF",
    title: "Reporte de Usuarios",
    orientation: "landscape",
    pageSize: "A4",
    exportOptions: {
      columns: [0, 1, 2, 3, 4, 5, 6] // Omitir columna de botones (índice 7)
    },
    customize: function (doc) {
      // Cambiar fuente, estilos, encabezados, márgenes, etc.
      doc.styles.title = {
        color: "#007bff",
        fontSize: "20",
        alignment: "center",
      };

      doc.content.splice(0, 1); // Elimina el título original
      doc.content.unshift({
        text: "REPORTE DE USUARIOS",
        style: "title",
        margin: [0, 0, 0, 10],
      });

      // Cambiar alineación de la tabla
      doc.content[1].table.widths = ["5%", "15%", "15%", "25%", "10%", "15%", "15%"];
    }
  }, "colvis"],
      },
    },
  });
});

function eliminarUsuario(id) {
  Swal.fire({
    title: "¿Estás seguro?",
    text: "Esta acción eliminará al usuario de forma permanente.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      const formData = new FormData();
      formData.append("accion", "eliminar");
      formData.append("id", id);

      fetch("/megabus_proyecto/php/usuarios.php", {
        method: "POST",
        body: formData,
      })
        .then((r) => r.json())
        .then((res) => {
          if (res.success) {
            cargarUsuarios();
            Swal.fire("Eliminado", "El usuario ha sido eliminado.", "success");
          } else {
            Swal.fire("Error", "No se pudo eliminar el usuario.", "error");
          }
        })
        .catch((error) => {
          console.error("Error al eliminar usuario:", error);
          Swal.fire("Error", "Ocurrió un error al eliminar el usuario.", "error");
        });
    }
  });
}


function editarUsuario(id) {
  console.log("Editando usuario con ID:", id); // <== AÑADE ESTO

  fetch(`/megabus_proyecto/php/usuarios.php?id=${id}`)
    .then((response) => response.json())
    .then((data) => {
      console.log("Datos recibidos del servidor:", data); // <== Agregado para depuración

      const usuario = data;
      document.getElementById("nombre").value = usuario.nombre;
      document.getElementById("apellido").value = usuario.apellido;
      document.getElementById("correo").value = usuario.correo;
      document.getElementById("contrasena").value = usuario.contrasena;
      document.getElementById("rol").value = usuario.rol;
      document.getElementById("estado").value = usuario.estado;

      modoEdicion = true;
      idUsuarioEditando = id;

      cargarUsuarios();
    })
    .catch((error) =>
      console.error("Error al cargar datos para editar:", error)
    );
}
