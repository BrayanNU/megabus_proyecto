document.addEventListener("DOMContentLoaded", function () {
      const id_usuario = sessionStorage.getItem("id_usuario");
      const form = document.getElementById("formReporte");

      if (!id_usuario) {
      Swal.fire({
        icon: "error",
        title: "No autenticado",
        text: "Debe iniciar sesión para reportar.",
        confirmButtonText: "OK"
      }).then((result) => {
        if (result.isConfirmed) {
          
          window.location.href = "../vista/login.html";
        }
      });

      form.querySelector("button[type='submit']").disabled = true;
      return;
    }

  const params = new URLSearchParams(window.location.search);
  const id_asignacion = params.get("id_asignacion");


  document.getElementById("id_asignacion").value = id_asignacion;


  fetch(`/megabus_proyecto/php/reporte_C.php?accion=obtenerNombreRuta&id_asignacion=${id_asignacion}`)
    .then(res => res.json())
    .then(data => {
      const divRuta = document.getElementById("nombreRuta");
      if (data.success && data.nombre_ruta) {
        divRuta.textContent = `Ruta: ${data.nombre_ruta}`;
      } else {
        divRuta.textContent = "Ruta no encontrada.";
        divRuta.classList.replace("alert-primary", "alert-danger");
      }
    })
    .catch(error => {
      console.error("Error al obtener nombre de ruta:", error);
      document.getElementById("nombreRuta").textContent = "Error al cargar la ruta.";
    });

 form.addEventListener("submit", function (e) {
        e.preventDefault();

        const tipo = form.tipo_reporte.value.trim();
        const descripcion = form.descripcion.value.trim();
        const archivo = form.foto.files[0];

        const errores = [];

        if (!tipo) errores.push("Seleccione un tipo de reporte.");
        if (!/^[\w\s\u00C0-\u017F]{3,200}$/.test(descripcion)) {
          errores.push("La descripción debe tener entre 3 y 200 caracteres válidos.");
        }

        if (errores.length) {
          Swal.fire({ icon: "error", title: "Errores", html: errores.join("<br>") });
          return;
        }

        const formData = new FormData();
        formData.append("accion", "agregar");
        formData.append("id_usuario", id_usuario);
        formData.append("id_asignacion", id_asignacion);
        formData.append("tipo_reporte", tipo);
        formData.append("descripcion", descripcion);
        if (archivo) formData.append("foto", archivo);

        fetch("/megabus_proyecto/php/reporte_C.php", {
  method: "POST",
  body: formData
})
.then(res => res.text()) 
.then(text => {
  console.log("Respuesta RAW:", text); 
  return JSON.parse(text); 
})
.then(data => {
  if (data.success) {
    Swal.fire("Éxito", "Reporte enviado correctamente.", "success");
    form.reset();
    window.location.href = "../vista/rutas_C.html";
  } else {
    Swal.fire("Error", data.error || "No se pudo guardar el reporte.", "error");
  }
})
.catch(error => {
  console.error("Error parseando o de red:", error);
  Swal.fire("Error", "Error al registrar el reporte.", "error");
});
      });
    });