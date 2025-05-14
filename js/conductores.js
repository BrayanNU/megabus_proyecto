let dataTableInstance;
let modoEdicion = false;
let idConductorEditando = null;


document.addEventListener('DOMContentLoaded', function () {
    cargarConductores();

    const form = document.getElementById('formConductor');
    const nombreInput = document.getElementById('nombre');
    const apellidoInput = document.getElementById('apellido');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    // Función para generar correo y contraseña
    function generarEmailYPassword() {
        const nombre = nombreInput.value.trim().toLowerCase().replace(/\s+/g, '');
        const apellido = apellidoInput.value.trim().toLowerCase().replace(/\s+/g, '');
        const email = nombre && apellido ? `${nombre}.${apellido}@gmail.com` : '';

        // Generar contraseña simple usando nombre + número aleatorio
        const password = `${nombre}${Math.floor(Math.random() * 10000)}`;  // Ejemplo: pedro12345
        
        emailInput.value = email;
        passwordInput.value = password;  // Mostrar la contraseña generada
    }

    nombreInput.addEventListener('input', generarEmailYPassword);
    apellidoInput.addEventListener('input', generarEmailYPassword);

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Validación del formulario
        if (!this.checkValidity()) {
            this.classList.add("was-validated");
            return;
        }

        const formData = new FormData(this);
        if (modoEdicion && idConductorEditando !== null) {
            formData.append('accion', 'editar');
            formData.append('id_conductor', idConductorEditando);
        } else {
            formData.append('accion', 'agregar');
        }
        
        // Enviar datos al servidor
        fetch('/megabus_proyecto/php/conductores.php', {
            method: 'POST',
            body: formData
        })
        .then(r => r.json())
        .then(res => {
            if (res.success) {
                this.reset();
                this.classList.remove("was-validated");
                cargarConductores();
                modoEdicion = false;
                idConductorEditando = null;
            } else {
                console.error("Error al guardar: " + res.error);
            }
        })
        .catch(error => {
            console.error("Error al registrar conductor:", error);
            alert("Error al registrar conductor");
        });
    });
});


function cargarConductores() {
    fetch('/megabus_proyecto/php/conductores.php')
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


function eliminarConductor(id) {
    if (!confirm('¿Eliminar este conductor?')) return;

    const formData = new FormData();
    formData.append('accion', 'eliminar');
    formData.append('id', id);

    fetch('/megabus_proyecto/php/conductores.php', {
        method: 'POST',
        body: formData
    })
    .then(r => r.json())
    .then(res => {
        if (res.success) {
            cargarConductores();
        } else {
            alert("Error al eliminar: " + res.error);
        }
    })
    .catch(error => console.error("Error al eliminar conductor:", error));
}

function editarConductor(id) {
    fetch(`/megabus_proyecto/conductores.php?id=${id}`)
    .then(response => response.json())
    .then(data => {
        const conductor = data;
        document.getElementById('nombre').value = conductor.nombre;
        document.getElementById('apellido').value = conductor.apellido;
        document.getElementById('email').value = conductor.email;
        document.getElementById('dni').value = conductor.dni;
        document.getElementById('licencia_conducir').value = conductor.licencia_conducir;
        document.getElementById('fecha_vencimiento_licencia').value = conductor.fecha_vencimiento_licencia;
        document.getElementById('telefono').value = conductor.telefono;

        modoEdicion = true;
        idConductorEditando = id;
    })
    .catch(error => console.error("Error al cargar datos para editar:", error));
}