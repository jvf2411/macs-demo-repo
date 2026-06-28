const loginPage = document.getElementById("loginPage");
const appPage = document.getElementById("appPage");
const loginForm = document.getElementById("loginForm");
const logoutBtn = document.getElementById("logoutBtn");
const solicitudForm = document.getElementById("solicitudForm");
const refreshBtn = document.getElementById("refreshBtn");
const solicitudesTable = document.getElementById("solicitudesTable");

const totalSolicitudes = document.getElementById("totalSolicitudes");
const totalUrgentes = document.getElementById("totalUrgentes");
const totalCriticas = document.getElementById("totalCriticas");

loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  loginPage.classList.add("hidden");
  appPage.classList.remove("hidden");

  await cargarSolicitudes();
});

logoutBtn.addEventListener("click", function () {
  appPage.classList.add("hidden");
  loginPage.classList.remove("hidden");
});

refreshBtn.addEventListener("click", cargarSolicitudes);

solicitudForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const solicitud = {
    paciente: document.getElementById("paciente").value,
    tipo_nutricion: document.getElementById("tipoNutricion").value,
    centro_medico: document.getElementById("centroMedico").value,
    prioridad: document.getElementById("prioridad").value,
    observacion: document.getElementById("observacion").value
  };

  try {
    const response = await fetch("/api/solicitudes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(solicitud)
    });

    if (!response.ok) {
      alert("No fue posible registrar la solicitud.");
      return;
    }

    solicitudForm.reset();
    await cargarSolicitudes();
    alert("Solicitud registrada correctamente.");
  } catch (error) {
    console.error("Error registrando solicitud:", error);
    alert("Error de conexión con el backend.");
  }
});

async function cargarSolicitudes() {
  try {
    const response = await fetch("/api/solicitudes");
    const solicitudes = await response.json();

    actualizarResumen(solicitudes);
    renderizarTabla(solicitudes);
  } catch (error) {
    console.error("Error cargando solicitudes:", error);
    solicitudesTable.innerHTML = `
      <tr>
        <td colspan="6">No fue posible conectar con el backend.</td>
      </tr>
    `;
  }
}

function actualizarResumen(solicitudes) {
  totalSolicitudes.textContent = solicitudes.length;
  totalUrgentes.textContent = solicitudes.filter(s => s.prioridad === "Urgente").length;
  totalCriticas.textContent = solicitudes.filter(s => s.prioridad === "Crítica").length;
}

function renderizarTabla(solicitudes) {
  if (!solicitudes || solicitudes.length === 0) {
    solicitudesTable.innerHTML = `
      <tr>
        <td colspan="6">No hay solicitudes registradas.</td>
      </tr>
    `;
    return;
  }

  solicitudesTable.innerHTML = solicitudes.map(s => {
    const prioridadClass = normalizarPrioridad(s.prioridad);

    return `
      <tr>
        <td>${s.id}</td>
        <td>${s.paciente}</td>
        <td>${s.tipo_nutricion}</td>
        <td>${s.centro_medico}</td>
        <td><span class="badge ${prioridadClass}">${s.prioridad}</span></td>
        <td>${formatearFecha(s.fecha_creacion)}</td>
      </tr>
    `;
  }).join("");
}

function normalizarPrioridad(prioridad) {
  if (prioridad === "Crítica") return "critica";
  if (prioridad === "Urgente") return "urgente";
  return "normal";
}

function formatearFecha(fecha) {
  try {
    return new Date(fecha).toLocaleString("es-DO");
  } catch {
    return fecha;
  }
}
