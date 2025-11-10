document.addEventListener("DOMContentLoaded", async () => {
    const tablaConductores = document.getElementById("tabla-conductores");
    const authForm = document.getElementById("auth-form");
    const authCodeInput = document.getElementById("auth-code");
    const authMessage = document.getElementById("auth-message");

    let isEditable = false; // Por defecto, la tabla es de solo lectura

    // Cargar datos de los conductores
    async function cargarConductores() {
        try {
            const response = await fetch("http://localhost:3000/conductores");
            if (response.ok) {
                const conductores = await response.json();
                tablaConductores.innerHTML = ""; // Limpiar tabla
                conductores.forEach(conductor => {
                    const fila = document.createElement("tr");
                    fila.innerHTML = `
                        <td>${conductor.nombre}</td>
                        <td>${conductor.numero_economico}</td>
                        <td contenteditable="${isEditable}">${conductor.rutas_lunes}</td>
                        <td contenteditable="${isEditable}">${conductor.rutas_martes}</td>
                        <td contenteditable="${isEditable}">${conductor.rutas_miercoles}</td>
                        <td contenteditable="${isEditable}">${conductor.rutas_jueves}</td>
                        <td contenteditable="${isEditable}">${conductor.rutas_viernes}</td>
                        <td contenteditable="${isEditable}">${conductor.rutas_sabado}</td>
                        <td>${conductor.puntaje}</td>
                        <td>${conductor.estado}</td>
                    `;
                    tablaConductores.appendChild(fila);
                });
            } else {
                console.error("Error al obtener los datos de los conductores");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }

    // Validar código de autorización
    authForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const authCode = authCodeInput.value;

        // Código de autorización (puedes cambiarlo)
        const codigoValido = "A7f9K2xQ";

        if (authCode === codigoValido) {
            isEditable = true; // Habilitar edición
            authMessage.style.display = "none";
            cargarConductores(); // Recargar la tabla con celdas editables
        } else {
            authMessage.style.display = "block"; // Mostrar mensaje de error
        }
    });

    // Cargar los datos al inicio
    cargarConductores();
});