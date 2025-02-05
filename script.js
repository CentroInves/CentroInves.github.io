// Establecer ubicación fija
document.getElementById("ubicacion").innerHTML = `Ubicación: <a href="https://maps.app.goo.gl/EPDHnjbZ775b1FYU7" target="_blank">Ver Ubicación</a>`;

// Activar cámara
let video = document.getElementById("video");
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => video.srcObject = stream)
    .catch(() => alert("No se pudo acceder a la cámara."));

// Registrar entrada o salida
function registrar(tipo) {
    let nombre = document.getElementById("nombre").value.trim();
    let apellido = document.getElementById("apellido").value.trim();
    if (!nombre || !apellido) return alert("Ingrese su nombre y apellido.");

    let fecha = new Date().toLocaleDateString();
    let hora = new Date().toLocaleTimeString();
    let ubicacion = document.getElementById("ubicacion").innerHTML;
    let foto = localStorage.getItem("ultimaFoto") || "";

    let registros = JSON.parse(localStorage.getItem("registros")) || [];
    let usuario = registros.find(r => r.nombre === nombre && r.apellido === apellido && r.fecha === fecha);

    if (tipo === "entrada") {
        if (usuario) return alert("Ya registraste tu entrada hoy.");
        registros.push({ nombre, apellido, fecha, entrada: hora, salida: "", ubicacion, foto });
    } else {
        if (!usuario) return alert("Primero registra tu entrada.");
        usuario.salida = hora;
    }

    localStorage.setItem("registros", JSON.stringify(registros));
    mostrarRegistros();
}

// Tomar foto con la cámara
function tomarFoto() {
    let canvas = document.getElementById("canvas");
    let context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    let foto = canvas.toDataURL("image/png");
    localStorage.setItem("ultimaFoto", foto);
    alert("Foto tomada correctamente.");
}

// Mostrar registros en la tabla
function mostrarRegistros() {
    let registros = JSON.parse(localStorage.getItem("registros")) || [];
    let tbody = document.getElementById("registros");
    tbody.innerHTML = "";
    registros.forEach(r => {
        tbody.innerHTML += `<tr>
            <td>${r.nombre} ${r.apellido}</td>
            <td>${r.fecha}</td>
            <td>${r.entrada}</td>
            <td>${r.salida || "Pendiente"}</td>
            <td>${r.ubicacion}</td>
            <td><img src="${r.foto}" width="100"></td>
        </tr>`;
    });
}

// Eliminar registros
function eliminarRegistros() {
    localStorage.removeItem("registros");
    mostrarRegistros();
}

// Exportar a Excel
function exportarExcel() {
    let registros = JSON.parse(localStorage.getItem("registros")) || [];
    if (registros.length === 0) return alert("No hay registros para exportar.");

    let csvContent = "data:text/csv;charset=utf-8,Nombre,Apellido,Fecha,Entrada,Salida,Ubicación\n" +
        registros.map(r => `${r.nombre},${r.apellido},${r.fecha},${r.entrada},${r.salida || "Pendiente"},${r.ubicacion}`).join("\n");

    let encodedUri = encodeURI(csvContent);
    let link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "registros.csv");
    document.body.appendChild(link);
    link.click();
}

// Exportar a Imagen
function exportarImagen() {
    let registrosTable = document.getElementById("tabla");

    html2canvas(registrosTable).then(function (canvas) {
        let imgData = canvas.toDataURL("image/png");
        let link = document.createElement("a");
        link.href = imgData;
        link.download = "registros.png";
        link.click();
    }).catch(function (error) {
        alert("No se pudo generar la imagen: " + error);
    });
}

// Exportar a PDF
function exportarPDF() {
    let registros = JSON.parse(localStorage.getItem("registros")) || [];
    if (registros.length === 0) return alert("No hay registros para exportar.");

    let { jsPDF } = window.jspdf;
    let doc = new jsPDF();
    doc.text("Registro de Asistencia", 20, 10);

    let data = registros.map(r => [r.nombre, r.fecha, r.entrada, r.salida || "Pendiente"]);

    doc.autoTable({
        head: [["Nombre", "Fecha", "Entrada", "Salida"]],
        body: data,
        startY: 20,
    });

    doc.save("registros.pdf");
}

mostrarRegistros();

