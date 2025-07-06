document.addEventListener("DOMContentLoaded", () => {
  fetch("../php/dashboard.php")
    .then((response) => response.json())
    .then((data) => {

      actualizarIndicador("vehiculosActivos", data.vehiculosActivos, "Vehículos activos");
      actualizarIndicador("conductoresActivos", data.conductoresActivos, "Conductores activos");
      actualizarIndicador("alertasHoy", data.alertasHoy, "Alertas de velocidad (hoy)");
      actualizarIndicador("viajesMes", data.viajesMes, "Viajes realizados mes");


      if (data.alertasPorVehiculo) {
        const labels = data.alertasPorVehiculo.map(item => item.placa);
        const values = data.alertasPorVehiculo.map(item => item.total_alertas);

        new Chart(document.getElementById("alertasVehiculosChart"), {
          type: "bar",
          data: {
            labels: labels,
            datasets: [{
              label: "Alertas por vehículo (últimos 7 días)",
              data: values,
              backgroundColor: "#2c4683"
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      }

      
      if (data.estadoVehiculos) {
        const labels = data.estadoVehiculos.map(e => e.estado);
        const values = data.estadoVehiculos.map(e => e.total);

        new Chart(document.getElementById("estadoVehiculosChart"), {
          type: "doughnut",
          data: {
            labels: labels,
            datasets: [{
              label: "Estado de vehículos",
              data: values,
              backgroundColor: ["#081940", "#2c4683", "#4c6cb5"]
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'bottom'
              }
            }
          }
        });
      }

    
      if (data.tiposIncidencias) {
        const labels = data.tiposIncidencias.map(e => e.tipo);
        const values = data.tiposIncidencias.map(e => e.total);

        new Chart(document.getElementById("incidenciasChart"), {
          type: "doughnut",
          data: {
            labels: labels,
            datasets: [{
              label: "Tipos de incidencias",
              data: values,
              backgroundColor: ["#081940", "#2c4683", "#4c6cb5"]
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'bottom'
              }
            }
          }
        });
      }

     
      if (data.viajesPorDia) {
        const labels = data.viajesPorDia.map(e => e.dia);
        const values = data.viajesPorDia.map(e => e.total_viajes);

        new Chart(document.getElementById("viajesLineaChart"), {
          type: "line",
          data: {
            labels: labels,
            datasets: [{
              label: "Viajes por día",
              data: values,
              fill: false,
              borderColor: "#081940",
              tension: 0.3
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      }


      if (data.notificaciones) {
        const contenedorNoti = document.getElementById("listaNotificaciones");
        contenedorNoti.innerHTML = "";

        if (data.notificaciones.length > 0) {
          data.notificaciones.slice(0, 3).forEach((mensaje) => {
            const li = document.createElement("li");
            li.textContent = mensaje;
            li.classList.add("list-group-item");
            contenedorNoti.appendChild(li);
          });
        } else {
          contenedorNoti.innerHTML = "<li class='list-group-item'>Sin notificaciones recientes</li>";
        }
      }

      if (data.historialReciente) {
        const tablaHistorial = document.getElementById("tablaHistorial");
        tablaHistorial.innerHTML = "";

        data.historialReciente.slice(0, 4).forEach((item, index) => {
          const fila = document.createElement("tr");

          fila.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.vehiculo}</td>
            <td>${item.ruta}</td>
            <td>${item.fecha}</td>
          `;

          tablaHistorial.appendChild(fila);
        });
      }



    })
    .catch((error) => {
      console.error("Error al cargar los datos del dashboard:", error);
    });
});


function actualizarIndicador(idElemento, valor, textoInfo) {
  const contenedor = document.getElementById(idElemento);
  if (!contenedor) return;

  contenedor.innerHTML = "";

  const valorElemento = document.createElement("p");
  valorElemento.className = "dat";
  valorElemento.textContent = valor;

  const texto = document.createElement("p");
  texto.className = "info";
  texto.textContent = textoInfo;

  contenedor.appendChild(valorElemento);
  contenedor.appendChild(texto);
}
