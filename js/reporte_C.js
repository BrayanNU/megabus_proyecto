document.addEventListener("DOMContentLoaded", function () {
      const id_usuario = sessionStorage.getItem("id_usuario");
      const form = document.getElementById("formReporte");

      if (!id_usuario) {
        Swal.fire({
          icon: "error",
          title: "No autenticado",
          text: "Debe iniciar sesión para reportar."
        });
        form.querySelector("button[type='submit']").disabled = true;
        return;
      }

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