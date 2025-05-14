let dataTableInstance;
let modoEdicion = false;
let idVehiculoEditando = null;


document.addEventListener('DOMContentLoaded', function () {
    cargarVehiculos();

    const form = document.getElementById('formVehiculo');


    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Validación del formulario
        if (!this.checkValidity()) {
            this.classList.add("was-validated");
            return;
        }

        const formData = new FormData(this);
        if (modoEdicion && idVehiculoEditando !== null) {
            formData.append('accion', 'editar');
            formData.append('id_vehiculo', idVehiculoEditando);
        } else {
            formData.append('accion', 'agregar');
        }
        
        // Enviar datos al servidor
        fetch('/megabus_proyecto/php/vehiculos.php', {
            method: 'POST',
            body: formData
        })
        .then(r => r.json())
        .then(res => {
            if (res.success) {
                this.reset();
                this.classList.remove("was-validated");
                cargarVehiculos();
                modoEdicion = false;
                idVehiculoEditando = null;
            } else {
                console.error("Error al guardar: " + res.error);
            }
        })
        .catch(error => {
            console.error("Error al registrar vehiculo:", error);
            alert("Error al registrar vehiculo");
        });
    });
});


function cargarVehiculos() {
    fetch('/megabus_proyecto/php/vehiculos.php')
     .then(response => response.json())
    .then(data => {
        console.log("Respuesta del servidor:", data); // Agrega esto
        if (!Array.isArray(data)) {
            throw new Error("La respuesta no es un array");
        }

        const tbody = document.querySelector('#example tbody');
        tbody.innerHTML = ''; // Limpiar contenido previo

        // Limpiar los datos de la tabla sin destruir la instancia
        if (dataTableInstance) {
            dataTableInstance.clear();
        }
        // Llenar la tabla con los conductores
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
             `
            ]);
        });

        // Redibujar la tabla
        dataTableInstance.draw();
    })
    .catch(error => console.error('Error al cargar los datos:', error));
}

// Inicialización de la DataTable fuera de la función cargarUsuarios()
document.addEventListener('DOMContentLoaded', function() {
    dataTableInstance = new DataTable('#example', {
        pageLength: 4,
        layout: {
            topStart: {
                buttons: ['copy', 'excel', 'pdf', 'colvis']
            }
        }
    });
});


function eliminarVehiculo(id) {
    if (!confirm('¿Eliminar este vehiculo?')) return;

    const formData = new FormData();
    formData.append('accion', 'eliminar');
    formData.append('id', id);

    fetch('/megabus_proyecto/php/vehiculos.php', {
        method: 'POST',
        body: formData
    })
    .then(r => r.json())
    .then(res => {
        if (res.success) {
            cargarVehiculos();
        } else {
            alert("Error al eliminar: " + res.error);
        }
    })
    .catch(error => console.error("Error al eliminar vehiculo:", error));
}

function editarVehiculo(id) {
    fetch(`/megabus_proyecto/php/vehiculos.php?id=${id}`)
    .then(response => response.json())
    .then(data => {
        const vehiculo = data;
        document.getElementById('placa').value = vehiculo.placa;
        document.getElementById('marca').value = vehiculo.marca;
        document.getElementById('modelo').value = vehiculo.modelo;
        document.getElementById('ano').value = vehiculo.ano;
        document.getElementById('tipo_bus').value = vehiculo.tipo_bus;
        document.getElementById('num_pasajeros').value = vehiculo.num_pasajeros;
        document.getElementById('max_velocidad').value = vehiculo.max_velocidad;
        document.getElementById('kilometraje').value = vehiculo.kilometraje;
        document.getElementById('ult_mantenimiento').value = vehiculo.ult_mantenimiento;
        document.getElementById('estado').value = vehiculo.estado;

        modoEdicion = true;
        idVehiculoEditando = id;
    })
    .catch(error => console.error("Error al cargar datos para editar:", error));
}