let dataTableInstance;
let modoEdicion = false;
let idRutaEditando = null;

document.addEventListener("DOMContentLoaded", function () {
  cargarRutas();

  document
    .getElementById("origen")
    .addEventListener("input", generarCodigoRuta);
  document
    .getElementById("destino")
    .addEventListener("input", generarCodigoRuta);

  const form = document.getElementById("formRuta");

    const velInput = document.getElementById("vel_max");

  // Mostrar "km/h" mientras escribes
  velInput.addEventListener("input", function () {
    // Eliminar todo excepto dígitos y agregar " km/h"
    let valorNumerico = velInput.value.replace(/\D/g, '');
    if (valorNumerico) {
      velInput.value = `${valorNumerico} km/h`;
    } else {
      velInput.value = "";
    }
  });

  // Facilitar edición al enfocar
  velInput.addEventListener("focus", function () {
    velInput.value = velInput.value.replace(" km/h", "");
  });

  // Restaurar formato al salir del campo
  velInput.addEventListener("blur", function () {
    let valorNumerico = velInput.value.replace(/\D/g, '');
    if (valorNumerico) {
      velInput.value = `${valorNumerico} km/h`;
    }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Validación del formulario
    if (!this.checkValidity()) {
      this.classList.add("was-validated");
      return;
    }

    const formData = new FormData(this);
    if (modoEdicion && idRutaEditando !== null) {
      formData.append("accion", "editar");
      formData.append("id_ruta", idRutaEditando);
    } else {
      formData.append("accion", "agregar");
    }

    // Enviar datos al servidor
    fetch("/megabus_proyecto/php/rutas.php", {
      method: "POST",
      body: formData,
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          this.reset();
          this.classList.remove("was-validated");
          cargarRutas();
          modoEdicion = false;
          idRutaEditando = null;
        } else {
          console.error("Error al guardar: " + res.error);
        }
      })
      .catch((error) => {
        console.error("Error al registrar ruta:", error);
        alert("Error al registrar ruta");
      });
  });
});

function cargarRutas() {
  fetch("/megabus_proyecto/php/rutas.php")
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
        buttons: ["copy", "excel", "pdf", "colvis"],
      },
    },
  });
});

function eliminarRuta(id) {
  if (!confirm("¿Eliminar este ruta?")) return;

  const formData = new FormData();
  formData.append("accion", "eliminar");
  formData.append("id", id);

  fetch("/megabus_proyecto/php/rutas.php", {
    method: "POST",
    body: formData,
  })
    .then((r) => r.json())
    .then((res) => {
      if (res.success) {
        cargarRutas();
      } else {
        alert("Error al eliminar: " + res.error);
      }
    })
    .catch((error) => console.error("Error al eliminar ruta:", error));
}

function editarRuta(id) {
  fetch(`/megabus_proyecto/rutas.php?id=${id}`)
    .then((response) => response.json())
    .then((data) => {
      const ruta = data;
      document.getElementById("cod_ruta").value = ruta.cod_ruta;
      document.getElementById("origen").value = ruta.origen;
      document.getElementById("destino").value = ruta.destino;
      document.getElementById("vel_max").value = ruta.vel_max;
      document.getElementById("estado").value = ruta.estado;

      modoEdicion = true;
      idRutaEditando = id;
    })
    .catch((error) =>
      console.error("Error al cargar datos para editar:", error)
    );
}

function abreviar(texto) {
  return texto.trim().substring(0, 3).toUpperCase();
}

function generarCodigoRuta() {
  const origen = document.getElementById("origen").value;
  const destino = document.getElementById("destino").value;

  if (origen && destino) {
    const cod = `${abreviar(origen)}-${abreviar(destino)}-01`;
    document.getElementById("cod_ruta").value = cod;
  } else {
    document.getElementById("cod_ruta").value = "";
  }
}
