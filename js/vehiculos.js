let dataTableInstance;
let modoEdicion = false;
let idVehiculoEditando = null;

document.addEventListener("DOMContentLoaded", function () {
  cargarVehiculos();

  const form = document.getElementById("formVehiculo");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    this.classList.remove("was-validated");


    const placa = form.placa.value.trim();
    const marca = form.marca.value.trim();
    const modelo = form.modelo.value.trim();
    const anio = parseInt(form.ano.value);
    const tipo = form.tipo_bus.value;
    const pasajeros = parseInt(form.num_pasajeros.value);
    const velocidad = parseInt(form.max_velocidad.value);
    const kilometraje = parseFloat(form.kilometraje.value);
    const mantenimiento = form.ult_mantenimiento.value;
    const estado = form.estado.value;

    let valid = true;
    let mensajes = [];


    const allEmpty =
      placa === "" &&
      marca === "" &&
      modelo === "" &&
      isNaN(anio) &&
      tipo === "" &&
      isNaN(pasajeros) &&
      isNaN(velocidad) &&
      isNaN(kilometraje) &&
      mantenimiento === "" &&
      estado === "";

    if (allEmpty) {
      Swal.fire({
        icon: "warning",
        title: "Formulario vacío",
        text: "No se puede enviar el formulario vacío. Por favor, complete los campos requeridos.",
      });
      return;
    }


    const placaRegex = /^[A-Z]{3}[0-9]{3}$/;
    if (!placaRegex.test(placa)) {
      valid = false;
      mensajes.push("La placa debe tener el formato ABC123, sin guión");
    }


    const marcaRegex = /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]{2,30}$/;
    if (!marcaRegex.test(marca)) {
      valid = false;
      mensajes.push(
        "La marca solo debe contener letras y espacios, sin números ni símbolos."
      );
    }

    const modeloRegex = /^[A-Za-z0-9\s]{2,30}$/;
    if (!modeloRegex.test(modelo)) {
      valid = false;
      mensajes.push(
        "El modelo no debe estar vacío y solo debe contener letras, números y espacios."
      );
    }


    if (isNaN(anio) || anio < 1900 || anio > 2099) {
      valid = false;
      mensajes.push("Ingrese un año válido entre 1900 y 2099.");
    }

    if (!tipo) {
      valid = false;
      mensajes.push("Seleccione un tipo de bus.");
    }


    if (!estado) {
      valid = false;
      mensajes.push("Seleccione un estado del vehículo.");
    }


    if (isNaN(pasajeros) || pasajeros <= 0 || pasajeros >60) {
      valid = false;
      mensajes.push("El número de pasajeros debe ser un valor positivo, MAX 60");
    }

    if (isNaN(velocidad) || velocidad <= 0) {
      valid = false;
      mensajes.push("La velocidad máxima debe ser un valor positivo.");
    }

    if (isNaN(kilometraje) || kilometraje < 0) {
      valid = false;
      mensajes.push("El kilometraje debe ser un número válido.");
    }


    if (!mantenimiento) {
      valid = false;
      mensajes.push("Seleccione la fecha del último mantenimiento.");
    }


    if (!valid) {
      if (mensajes.length > 4) {
        Swal.fire({
          icon: "error",
          title: "Errores en el formulario",
          text: "El formulario contiene varios errores. Por favor, revise los campos obligatorios.",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Errores en el formulario",
          html: mensajes.join("<br>"),
        });
      }
      return;
    }

    const formData = new FormData(this);
    if (modoEdicion && idVehiculoEditando !== null) {
      formData.append("accion", "editar");
      formData.append("id_vehiculo", idVehiculoEditando);
    } else {
      formData.append("accion", "agregar");
    }


    fetch("/megabus_proyecto/php/vehiculos.php", {
      method: "POST",
      body: formData,
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          this.reset();
          cargarVehiculos();
          modoEdicion = false;
          idVehiculoEditando = null;
          Swal.fire("Éxito", "Vehículo guardado correctamente.", "success");
        } else {
          Swal.fire("Error", "No se pudo guardar el vehículo.", "error");
        }
      })
      .catch((error) => {
        console.error("Error al registrar vehiculo:", error);
        Swal.fire("Error", "Error al registrar vehículo", "error");
      });
  });
});

function cargarVehiculos() {
  fetch("/megabus_proyecto/php/vehiculos.php")
    .then((response) => response.json())
    .then((data) => {
      console.log("Respuesta del servidor:", data); 
      if (!Array.isArray(data)) {
        throw new Error("La respuesta no es un array");
      }

      const tbody = document.querySelector("#example tbody");
      tbody.innerHTML = ""; 


      if (dataTableInstance) {
        dataTableInstance.clear();
      }

      data.forEach((vehiculo, index) => {
        dataTableInstance.row.add([
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
                <button class="btn btn-warning btn-sm me-2" onclick="editarVehiculo(${vehiculo.id_vehiculo})">Editar</button>
                <button class="btn btn-danger btn-sm" onclick="eliminarVehiculo(${vehiculo.id_vehiculo})">Eliminar</button>
             `,
        ]);
      });

      dataTableInstance.draw();
    })
    .catch((error) => console.error("Error al cargar los datos:", error));
}


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
            title: "Reporte de Vehículos",
            orientation: "landscape",
            pageSize: "A4",
            exportOptions: {
              columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] 
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
                text: "REPORTE DE VEHÍCULOS",
                style: "title",
                margin: [0, 0, 0, 12],
              });

            
              doc.content[1].table.widths = [
                "4%",  
                "10%", 
                "10%", 
                "10%", 
                "6%",  
                "10%",
                "10%", 
                "10%", 
                "10%",
                "12%", 
                "8%"  
              ];
            }
          },
          "colvis"
        ]
      }
    }
  });
});


function eliminarVehiculo(id) {
  Swal.fire({
    title: "¿Estás seguro?",
    text: "Este vehículo será eliminado.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (!result.isConfirmed) return;

    const formData = new FormData();
    formData.append("accion", "eliminar");
    formData.append("id", id);

    fetch("/megabus_proyecto/php/vehiculos.php", {
      method: "POST",
      body: formData,
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          cargarVehiculos();
          Swal.fire("Eliminado", "Vehículo eliminado correctamente.", "success");
        } else {
  
          if (
            res.error &&
            res.error.includes("a foreign key constraint fails")
          ) {
            Swal.fire({
              icon: "error",
              title: "No se puede eliminar",
              text: "Este vehículo está siendo utilizado actualmente en un historial de viajes y no puede ser eliminado.",
            });
          } else {
            Swal.fire("Error", "Ocurrió un error: " + res.error, "error");
          }
        }
      })
      .catch((error) => {
        console.error("Error al eliminar vehiculo:", error);
        Swal.fire("Error", "No se pudo conectar con el servidor.", "error");
      });
  });
}


function editarVehiculo(id) {
  fetch(`/megabus_proyecto/php/vehiculos.php?id=${id}`)
    .then((response) => response.json())
    .then((data) => {
      const vehiculo = data;
      document.getElementById("placa").value = vehiculo.placa;
      document.getElementById("marca").value = vehiculo.marca;
      document.getElementById("modelo").value = vehiculo.modelo;
      document.getElementById("ano").value = vehiculo.ano;
      document.getElementById("tipo_bus").value = vehiculo.tipo_bus;
      document.getElementById("num_pasajeros").value = vehiculo.num_pasajeros;
      document.getElementById("max_velocidad").value = vehiculo.max_velocidad;
      document.getElementById("kilometraje").value = vehiculo.kilometraje;
      document.getElementById("ult_mantenimiento").value =
        vehiculo.ult_mantenimiento;
      document.getElementById("estado").value = vehiculo.estado;

      modoEdicion = true;
      idVehiculoEditando = id;
    })
    .catch((error) =>
      console.error("Error al cargar datos para editar:", error)
    );
}
