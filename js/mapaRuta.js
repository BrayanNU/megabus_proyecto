/*window.addEventListener("DOMContentLoaded", () => {
  const idAsignacion = sessionStorage.getItem("id_asignacion");
  console.log("ID de asignación obtenido:", idAsignacion);

  if (!idAsignacion) {
    alert("No se encontró una ruta activa.");
    return;
  }

  fetch(`/megabus_proyecto/php/obt_ruta.php?id_asignacion=${idAsignacion}`)
    .then(res => res.json())
    .then(data => {
      if (!data || !data.destino) {
        alert("No se pudo cargar la información de la ruta.");
        return;
      }

      const destinoTexto = data.destino;

      // Geocodificar dirección destino
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: destinoTexto }, (results, status) => {
        if (status === "OK") {
          const destinoCoords = results[0].geometry.location;

          // Obtener ubicación actual
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
              const origen = {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude
              };

              iniciarMapa(origen, {
                lat: destinoCoords.lat(),
                lng: destinoCoords.lng()
              });
            }, () => {
              alert("No se pudo obtener tu ubicación.");
            });
          } else {
            alert("Tu navegador no soporta geolocalización.");
          }
        } else {
          alert("No se pudo geocodificar la dirección de destino.");
        }
      });
    })
    .catch(err => {
      console.error("Error al obtener ruta:", err);
    });
});

function iniciarMapa(origen, destino) {
  const map = new google.maps.Map(document.getElementById("map"), {
    center: origen,
    zoom: 14
  });

  new google.maps.Marker({
    position: origen,
    map,
    label: "Tú",
    title: "Ubicación actual"
  });

  new google.maps.Marker({
    position: destino,
    map,
    label: "D",
    title: "Destino"
  });

  const ruta = new google.maps.Polyline({
    path: [origen, destino],
    geodesic: true,
    strokeColor: "#007bff",
    strokeOpacity: 0.8,
    strokeWeight: 4
  });

  ruta.setMap(map);
}
*/