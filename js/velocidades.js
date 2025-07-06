    function cargarVelocidades() {
    fetch('/megabus_proyecto/php/consultar_velocidades.php')
    .then(response => response.json())
        .then(data => {
            const contenedor = document.getElementById('tabla-velocidades');
            contenedor.innerHTML = '';

            if (data.length === 0) {
                contenedor.innerHTML = '<p>No hay rutas en ejecución.</p>';
                return;
            }

            let tabla = '<table>';
            tabla += `
                <thead>
                    <tr>
                        <th>ID Asignación</th>
                        <th>Conductor</th>
                        <th>Placa</th>
                        <th>Código de Ruta</th>
                        <th>Velocidad Máxima (km/h)</th>
                        <th>Velocidad Actual (km/h)</th>
                        <th>Estado de Ruta</th>
                        <th>Fecha</th>
                    </tr>
                </thead>
                <tbody>
            `;

            data.forEach(item => {
                tabla += `
                    <tr>
                        <td>${item.id_asignacion}</td>
                        <td>${item.nombre_conductor} ${item.apellido_conductor}</td>
                        <td>${item.placa}</td>
                        <td>${item.cod_ruta}</td>
                        <td>${item.vel_max}</td>
                        <td>${item.velocidad_actual}</td>
                        <td>${item.estado_ruta_asig}</td>
                        <td>${item.fecha_programada}</td>
                    </tr>
                `;
            });

            tabla += '</tbody></table>';
            contenedor.innerHTML = tabla;
        })
        .catch(error => {
            console.error('Error al cargar velocidades:', error);
        });
}


cargarVelocidades();
setInterval(cargarVelocidades, 5000);