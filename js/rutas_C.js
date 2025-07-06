window.addEventListener("DOMContentLoaded", () => {
  cargarRutas_C();

  const nombre = sessionStorage.getItem("nombre");
  if (nombre) {
    document.getElementById("nombre_C").textContent = nombre;
  }
  const diasSemana = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];
  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const hoy = new Date();
  const nombreDia = diasSemana[hoy.getDay()];
  const numeroDia = hoy.getDate();
  const nombreMes = meses[hoy.getMonth()];

  const fechaFormateada = `${nombreDia}, ${numeroDia} ${nombreMes}`;
  document.getElementById("fecha").textContent = fechaFormateada;
});

function cargarRutas_C() {
  const idConductor = sessionStorage.getItem("id_usuario");

  if (!idConductor) {
    console.error("No se encontró el ID del conductor en sessionStorage.");
    document.getElementById("contenedorRutas").innerHTML =
      "<p>Error: Usuario no autenticado.</p>";
    return;
  }

  fetch(`/megabus_proyecto/php/rutas_C.php?id=${idConductor}`)
    .then((response) => response.json())
    .then((data) => {
      const contenedor = document.getElementById("contenedorRutas");
      contenedor.innerHTML = ""; 

      if (Array.isArray(data)) {
        console.log(data);
        data.forEach((ruta) => {
          const divRuta = document.createElement("div");
          divRuta.classList.add("ruta_asig");


          divRuta.innerHTML = `
            <div id="infoRuta">
              <p>${ruta.origen} ➜ ${ruta.destino}</p>
              <p><strong>Vehículo:</strong> ${ruta.placa} - ${ruta.marca} ${ruta.modelo}</p>
              <p><strong>Fecha programada:</strong> ${ruta.fecha_programada}</p>
              <p><strong>Vel. Máxima:</strong> ${ruta.vel_max}</p>
            </div>

            <div id="ActRuta">
              <form class="formActRuta">
                <input type="hidden" name="id_asignacion" value="${ruta.id_asignacion}">
                <button class="pop" type="submit">Comenzar</button>
              </form>
            </div>
          `;
          divRuta.querySelector(".formActRuta").addEventListener("submit", function (e) {
          e.preventDefault();
          const id_asignacion = this.querySelector("input[name='id_asignacion']").value;
          comenzarRuta(id_asignacion);
          });

          contenedor.appendChild(divRuta);
        });
      } else {
        contenedor.innerHTML = "<p>No hay rutas asignadas.</p>";
      }
    })
    .catch((error) => {
      console.error("Error al cargar los datos:", error);
      document.getElementById("contenedorRutas").innerHTML =
        "<p>Error al cargar rutas.</p>";
    });
}

  function comenzarRuta(id) {
    fetch('/megabus_proyecto/php/rutas_C.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `accion=comenzar&id_asignacion=${encodeURIComponent(id)}`
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        cargarRutas_C();
        sessionStorage.setItem("id_asignacion", id);
        window.location.href = "../vista/map_C.html";
      } else {
        alert("Error al comenzar la ruta: " + data.error);
      }
    })
    .catch(error => {
      console.error("Error al comenzar la ruta:", error);
      alert("Error de red o del servidor.");
    });
}
document.getElementById("cerrarSesion").addEventListener("click", function (e) {
  e.preventDefault(); 
  sessionStorage.clear(); 
  
  window.location.href = "../vista/login.html";
});

