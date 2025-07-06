window.addEventListener("DOMContentLoaded", () => {
  cargarHistorialCompleto();

  const form = document.getElementById("formHistorial_C");
  if (form) {
    form.addEventListener("submit", filtrarHistorial);
  }
});

function cargarHistorialCompleto() {
  const idConductor = sessionStorage.getItem("id_usuario");


  if (!idConductor) {
    console.error("No se encontró el ID del conductor en sessionStorage.");
    document.getElementById("contenedorHistorial_C").innerHTML =
      "<p>Error: Usuario no autenticado.</p>";
    return;
  }

  fetch(`/megabus_proyecto/php/historial_C.php?id=${idConductor}`)
    .then((response) => response.json())
    .then((data) => mostrarHistorial(data))
    .catch((error) => {
      console.error("Error al cargar historial:", error);
      document.getElementById("contenedorHistorial_C").innerHTML =
        "<p>Error al cargar historial.</p>";
    });
}

function filtrarHistorial(e) {
  e.preventDefault();

  const idConductor = sessionStorage.getItem("id_usuario");
  const codRuta = document.getElementById("cod_ruta").value.trim();
  const fechaViaje = document.getElementById("fecha_viaje").value;

  if (!idConductor) {
    console.error("No se encontró el ID del conductor en sessionStorage.");
    return;
  }

  
  if (!codRuta && !fechaViaje) {
    cargarHistorialCompleto();
    return;
  }

  const formData = new FormData();
  formData.append("id_conductor", idConductor);
  if (codRuta) formData.append("cod_ruta", codRuta);
  if (fechaViaje) formData.append("fecha_viaje", fechaViaje);

  fetch("/megabus_proyecto/php/historial_C.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => mostrarHistorial(data))
    .catch((err) => {
      console.error("Error al filtrar historial:", err);
      document.getElementById("contenedorHistorial_C").innerHTML =
        "<p>Error al filtrar historial.</p>";
    });
}


let currentIndex = 0;

function mostrarHistorial(data) {
  const contenedor = document.getElementById("contenedorHistorial_C");
  contenedor.innerHTML = "";

  if (!Array.isArray(data) || data.length === 0) {
    contenedor.innerHTML = "<p>No hay viajes encontrados.</p>";
    return;
  }

  data.forEach((viaje) => {
    const divViaje = document.createElement("div");
    divViaje.classList.add("viaje_card");

   divViaje.innerHTML = `
  <p><strong>Ruta:</strong><br>${viaje.origen}<br> ${viaje.destino}</p>
  <p><strong>Fecha del viaje:</strong><br>${viaje.fecha_viaje}</p>
  <p><strong>Vehículo:</strong><br>${viaje.placa}<br>${viaje.marca} ${viaje.modelo}</p>
  <p><strong>Vel. Máxima registrada:</strong><br>${viaje.vel_max} km/h</p>
`;

    contenedor.appendChild(divViaje);
  });


  const btnAnterior = document.getElementById("btnAnterior");
  const btnSiguiente = document.getElementById("btnSiguiente");

  btnAnterior.onclick = () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateCarrusel();
    }
  };

  btnSiguiente.onclick = () => {
    if (currentIndex < data.length - 1) {
      currentIndex++;
      updateCarrusel();
    }
  };

  function updateCarrusel() {
  const tarjeta = contenedor.querySelector(".viaje_card");
  if (tarjeta) {
    const scrollX = tarjeta.offsetWidth + 20; 
    contenedor.scrollTo({
      left: scrollX * currentIndex,
      behavior: "smooth"
    });
  }
}

  let startX = 0;

  contenedor.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
  });

  contenedor.addEventListener("touchend", (e) => {
    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;

    if (diff > 50 && currentIndex < data.length - 1) {
      currentIndex++;
      updateCarrusel();
    } else if (diff < -50 && currentIndex > 0) {
      currentIndex--;
      updateCarrusel();
    }
  });
}


document.getElementById("cerrarSesion").addEventListener("click", function (e) {
  e.preventDefault();
  sessionStorage.clear();
  window.location.href = "../vista/login.html";
});
