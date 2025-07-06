document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formRecuPass");
  const modalElement = document.getElementById("modalExito");
  const passwordSpan = document.getElementById("passwordGenerated");
  const modal = new bootstrap.Modal(modalElement);

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

   
    this.classList.remove("was-validated");

    const dni = form.dni.value.trim();
    const nombre = form.nombre.value.trim();
    const apellido = form.apellido.value.trim();
    const licencia = form.licencia_conducir.value.trim();
    const telefono = form.telefono.value.trim();


    const mensajes = [];

    if ([dni, nombre, apellido, licencia, telefono].every((v) => v === "")) {
      Swal.fire({
        icon: "warning",
        title: "Formulario vacío",
        text: "No se puede enviar el formulario vacío. Por favor, complete los campos requeridos.",
      });
      return;
    }

    if (!/^\d{8}$/.test(dni)) mensajes.push("DNI no válido. Debe tener 8 dígitos.");
    if (!/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/.test(nombre)) mensajes.push("Nombre inválido, solo letras.");
    if (!/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/.test(apellido)) mensajes.push("Apellido inválido, solo letras.");
    if (!/^[A-Z0-9-]{6,15}$/i.test(licencia)) mensajes.push("Licencia no válida (6 a 15 caracteres).");
    if (!/^\d{9}$/.test(telefono)) mensajes.push("Teléfono no válido, debe tener 9 dígitos.");

    if (mensajes.length > 0) {
      Swal.fire({
        icon: "error",
        title: "Errores en el formulario",
        html: mensajes.join("<br>"),
      });
      return;
    }

    
    const passwordGenerada = `${nombre.toLowerCase()}${Math.floor(Math.random() * 10000)}`;


    const formData = new FormData(form);
    formData.set("accion", "confirmar");
    formData.set("password", passwordGenerada);

    try {
      const response = await fetch("/megabus_proyecto/php/recu_pass.php", {
        method: "POST",
        body: formData,
      });

      const res = await response.json();

      if (res.success) {

        passwordSpan.textContent = passwordGenerada;
        modal.show();


        modalElement.addEventListener("hidden.bs.modal", () => {
          window.location.href = "/megabus_proyecto/vista/login.html";
        }, { once: true });


        form.reset();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error en el registro",
          text: res.error || "No se pudo generar contraseña.",
        });
      }
    } catch (error) {
      console.error("Error en la petición:", error);
      Swal.fire({
        icon: "error",
        title: "Error de red",
        text: "No se pudo conectar con el servidor.",
      });
    }
  });
});
