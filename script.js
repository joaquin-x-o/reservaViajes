// CARD 1: FORMULARIO

const formulario = document.getElementById('formRegistro');

formulario.addEventListener('submit', registrarFormulario);

document.addEventListener('DOMContentLoaded', cargarDatosLocalesTabla);

// función "main" en donde se ejecuta toda la lógica

function registrarFormulario(e) {
    // evita que la pagina se recargue para enviar los datos realmente a un presunto servidor
    e.preventDefault();

    // verificacion del formulario en el ingreso del destino y el DNI
    if (!verificarDestino() || !verificarDNI()) {
        return; // el registro se cancela si el destino o el DNI es invalido
    }

    //se guardan los datos ingresados en el formulario de forma individual

    // datos del viaje
    const destino = document.getElementById('destinoViaje').value;
    const fecha = document.getElementById('fechaViaje').value;
    const duracion = parseInt(document.getElementById('duracionViaje').value);
    const precio = parseFloat(document.getElementById('precioViaje').value);

    // datos del pasajero
    const nombre = document.getElementById('nombrePasajero').value;
    const dni = document.getElementById('dniPasajero').value;

    // calculo de importe total
    const importeTotal = calcularImporteTotal(duracion, precio);

    // estimacion de estado del viaje (mensaje)
    const estado = determinarEstadoViaje(fecha);

    // para mantener los datos ordenados, se crea un objeto
    const datosViaje = {
        destino,
        fecha,
        duracion,
        precio,
        importeTotal,
        nombre,
        dni,
        estado
    }

    // funcion para guardar los datos en la base de datos local (localStorage)
    guardarDatosLocales(datosViaje);

    // funcion para guardar dichos datos a la tabla de registros
    actualizarTabla(datosViaje);

    // funciones para mostrar las estadisticas de viaje y pasajeros
    actualizarEstadisticaViajes();
    actualizarEstadisticaPasajeros();

    // una vez realizado todo, se resetea el formulario para poder recibir correctamente el siguiente registro
    formulario.reset();

    // se borra el mensaje dado por la tarjeta de filtro en caso de que se haya  aplicado la funcionalidad de filtro primero
    document.querySelector('.resultadoFiltro').textContent = '';

}

// CARD 2: FILTROS (busqueda de un destino o pasajero que se vera reflejado en la tabla de registros)

// se le agrega la funcionalidad del boton para filtrar destino
document.getElementById('botonfiltroDestino').addEventListener('click', filtrarDestino);

/* function filtrarDestino() {

    // se obtiene el destino ingresado para filtrar y se aplica la 'estandarizacion del dato'
    const destinoInput = estandarizarDato(document.getElementById('filtroDestino').value);

    // se obtienen las filas de la tabla desde el DOM
    const filasTabla = document.querySelectorAll('tbody tr');

    // se obtiene el elemento en donde se le indicara el resultado del filtro ingresado
    const resultadoInput = document.querySelector('.resultadoFiltro');

    // se elimina el boton de reiniciar tabla si es que existe
    const botonExistente = document.getElementById("botonReiniciarTabla");
    if (botonExistente) {
        botonExistente.remove();
    }

    if (!filasTabla.length) {
        resultadoInput.textContent = 'Todavía no hay datos ingresados en la tabla de registros';
        resultadoInput.classList.add('text-bg-danger');
        return; // sale si no hay datos para no seguir ejecutando
    }

    let coincidencia = false;

    for (const fila of filasTabla) {
        const destinoFila = estandarizarDato(fila.children[0].textContent);

        if (destinoFila !== destinoInput) {
            // si el destino de la fila no es igual al del input ingresado, se oculta con la clase de Bootstrap
            fila.classList.add("d-none");

        } else {
            // si hay coincidencia se muestra la fila
            fila.classList.remove("d-none");

            coincidencia = true;
        }
    }

    if (!coincidencia) {
        // se agrega el mensaje de que no hubo resultados
        resultadoInput.classList.remove('text-bg-success');
        resultadoInput.classList.add('text-bg-danger');
        resultadoInput.textContent = 'No se encontraron resultados.';

        // se vuelve a mostrar todas las filas si no hay coincidencias
        for (const fila of filasTabla) {
            fila.classList.remove("d-none");
        }
    } else {

        // se agrega el mensaje de que hubo resultados
        resultadoInput.classList.remove('text-bg-danger');
        resultadoInput.classList.add('text-bg-success');
        resultadoInput.textContent = 'Se encontraron resultados. Dirígase a la tabla';

        // se agrega un boton debajo de la tabla para volver a la tabla original
        agregarBotonReiniciarTabla(filasTabla, resultadoInput);
    }

} */

function filtrarDestino() {
    const destinoInput = estandarizarDato(document.getElementById('filtroDestino').value);
    const filasTabla = document.querySelectorAll('tbody tr');
    const resultadoInput = document.querySelector('.resultadoFiltro');
    const botonExistente = document.getElementById("botonReiniciarTabla");

    // validacion del input
    // CAMBIO: al no ingresar nada en el input, el metodo includes lo detecta como un espacio vacio " ", por lo que siempre lo identificara como coincidencia.
    //         Por ello, ahora hay que validar si el input es una cadena vacia o no.

    if (!destinoInput) {
        // se agrega el mensaje de que no hubo resultados
        resultadoInput.classList.remove('text-bg-success');
        resultadoInput.classList.add('text-bg-danger');
        resultadoInput.textContent = 'Debe ingresar un destino válido para filtrar.';
        return;
    }

    if (botonExistente) {
        botonExistente.remove();
    }

    if (!filasTabla.length) {
        resultadoInput.textContent = 'Todavía no hay datos ingresados en la tabla de registros';
        resultadoInput.classList.add('text-bg-danger');
        return;
    }

    let coincidencia = false;

    for (const fila of filasTabla) {
        const destinoFila = estandarizarDato(fila.children[0].textContent);

        //CAMBIO: para realizar un filtro por aproximación se debe utilizar el metodo includes que verifica si incluye el input ingresado por el usuario y no
        //        los operadores de (des)igualdad que compara exactamente el input ingresado, lo cual no es practico.


        if (!destinoFila.includes(destinoInput)) {
            fila.classList.add("d-none");
        } else {
            fila.classList.remove("d-none");
            coincidencia = true;
        }
    }

    if (!coincidencia) {
        resultadoInput.classList.remove('text-bg-success');
        resultadoInput.classList.add('text-bg-danger');
        resultadoInput.textContent = 'No se encontraron resultados.';

        for (const fila of filasTabla) {
            fila.classList.remove("d-none");
        }
        
    } else {
        resultadoInput.classList.remove('text-bg-danger');
        resultadoInput.classList.add('text-bg-success');
        resultadoInput.textContent = 'Se encontraron resultados. Dirígase a la tabla';

        agregarBotonReiniciarTabla(filasTabla, resultadoInput);
    }
}

// se le agrega la funcionalidad del boton para filtrar pasajero
document.getElementById('botonFiltroPasajero').addEventListener('click', filtrarPasajero);

/* function filtrarPasajero() {
    // se obtiene el pasajero ingresado para filtrar y se aplica la 'estandarizacion del dato'
    const pasajeroInput = estandarizarDato(document.getElementById('filtroPasajero').value);

    // se obtienen las filas de la tabla desde el DOM
    const filasTabla = document.querySelectorAll('tbody tr');

    // se obtiene el elemento en donde se le indicara el resultado del filtro ingresado
    const resultadoInput = document.querySelector('.resultadoFiltro');

    // se elimina el boton de reiniciar tabla si es que existe
    const botonExistente = document.getElementById("botonReiniciarTabla");
    if (botonExistente) {
        botonExistente.remove();
    }

    if (!filasTabla.length) {
        resultadoInput.textContent = 'Todavía no hay datos ingresados en la tabla de registros';
        resultadoInput.classList.add('text-bg-danger');
        return; // sale si no hay datos para no seguir ejecutando
    }

    let coincidencia = false;

    for (const fila of filasTabla) {
        const pasajeroFila = estandarizarDato(fila.children[5].textContent);

        if (pasajeroFila !== pasajeroInput) {
            // si el destino de la fila no es igual al del input ingresado, se oculta con la clase de Bootstrap
            fila.classList.add("d-none");

        } else {
            // si hay coincidencia se muestra la fila
            fila.classList.remove("d-none");

            coincidencia = true;
        }
    }

    if (!coincidencia) {
        // se agrega el mensaje de que no hubo resultados
        resultadoInput.classList.remove('text-bg-success');
        resultadoInput.classList.add('text-bg-danger');
        resultadoInput.textContent = 'No se encontraron resultados.';

        // se vuelve a mostrar todas las filas si no hay coincidencias
        for (const fila of filasTabla) {
            fila.classList.remove("d-none");
        }
    } else {

        // se agrega el mensaje de que hubo resultados
        resultadoInput.classList.remove('text-bg-danger');
        resultadoInput.classList.add('text-bg-success');
        resultadoInput.textContent = 'Se encontraron resultados. Dirígase a la tabla';

        // se agrega un boton debajo de la tabla para volver a la tabla original
        agregarBotonReiniciarTabla(filasTabla, resultadoInput);
    }

} */

function filtrarPasajero() {
    // se obtiene el pasajero ingresado para filtrar y se aplica la 'estandarizacion del dato'
    const pasajeroInput = estandarizarDato(document.getElementById('filtroPasajero').value);

    // se obtienen las filas de la tabla desde el DOM
    const filasTabla = document.querySelectorAll('tbody tr');

    // se obtiene el elemento en donde se le indicara el resultado del filtro ingresado
    const resultadoInput = document.querySelector('.resultadoFiltro');

    // validacion del input
    // CAMBIO: al no ingresar nada en el input, el metodo includes lo detecta como un espacio vacio " ", por lo que siempre lo identificara como coincidencia.
    //         Por ello, ahora hay que validar si el input es una cadena vacia o no.

    if (!pasajeroInput) {
        // se agrega el mensaje de que no hubo resultados
        resultadoInput.classList.remove('text-bg-success');
        resultadoInput.classList.add('text-bg-danger');
        resultadoInput.textContent = 'Debe ingresar un nombre o apellido para filtrar.';
        return;
    }


    // se elimina el boton de reiniciar tabla si es que existe
    const botonExistente = document.getElementById("botonReiniciarTabla");
    if (botonExistente) {
        botonExistente.remove();
    }

    if (!filasTabla.length) {
        resultadoInput.textContent = 'Todavía no hay datos ingresados en la tabla de registros';
        resultadoInput.classList.add('text-bg-danger');
        return; // sale si no hay datos para no seguir ejecutando
    }

    let coincidencia = false;

    for (const fila of filasTabla) {
        const pasajeroFila = estandarizarDato(fila.children[5].textContent);

        //CAMBIO: para realizar un filtro por aproximación se debe utilizar el metodo includes que verifica si incluye el input ingresado por el usuario y no
        //        los operadores de (des)igualdad que compara exactamente el input ingresado, lo cual no es practico.

        if (!pasajeroFila.includes(pasajeroInput)) {
            // si el destino de la fila no es igual al del input ingresado, se oculta con la clase de Bootstrap
            fila.classList.add("d-none");

        } else {
            // si hay coincidencia se muestra la fila
            fila.classList.remove("d-none");

            coincidencia = true;
        }
    }

    if (!coincidencia) {
        // se agrega el mensaje de que no hubo resultados
        resultadoInput.classList.remove('text-bg-success');
        resultadoInput.classList.add('text-bg-danger');
        resultadoInput.textContent = 'No se encontraron resultados.';

        // se vuelve a mostrar todas las filas si no hay coincidencias
        for (const fila of filasTabla) {
            fila.classList.remove("d-none");
        }
    } else {

        // se agrega el mensaje de que hubo resultados
        resultadoInput.classList.remove('text-bg-danger');
        resultadoInput.classList.add('text-bg-success');
        resultadoInput.textContent = 'Se encontraron resultados. Dirígase a la tabla';

        // se agrega un boton debajo de la tabla para volver a la tabla original
        agregarBotonReiniciarTabla(filasTabla, resultadoInput);
    }

}


// CARD 3: ESTADÍSTICAS (actualización del total recaudado por viaje y total de pasajeros por viaje)

// actualizar total recaudado por viaje
function actualizarEstadisticaViajes() {

    // se obtienen los viajes
    const viajes = obtenerDatosLocales();

    // se crea un objeto que contendra la informacion de lo recaudado
    const recaudadoPorDestino = {
        // 'destino': importe

        // ej:
        // Salta: 20000    
        // Cordoba: 13000

        // El objeto guarda solo LOS IMPORTES, el nombre del destino simplemente es utilizado como clave
    };

    // recorrer viajes para sumar totales por destino
    viajes.forEach(viaje => {
        if (recaudadoPorDestino[viaje.destino]) { // se accede a cada atributo del objeto de recaudado por Destino a partir del destino como clave []
            recaudadoPorDestino[viaje.destino] += viaje.importeTotal;
        } else {
            // se crea una nueva propiedad del objeto con el destino como clave y su importe correspondiente como valor
            recaudadoPorDestino[viaje.destino] = viaje.importeTotal;
        }
    });

    // actualizacion de la lista en el HTML
    const listaEstadisticaViajes = document.getElementById("listaRecaudadoDestino");
    listaEstadisticaViajes.innerHTML = "";

    // se recorren los destinos y se crea el item de cada uno
    for (const destino in recaudadoPorDestino) {
        const li = document.createElement("li");
        li.textContent = `Destino: ${destino} - $${recaudadoPorDestino[destino].toFixed(2)}`;

        listaEstadisticaViajes.appendChild(li);
    }
}

// actualizar total de pasajeros por viaje
function actualizarEstadisticaPasajeros() {

    // se obtienen los viajes
    const viajes = obtenerDatosLocales();

    // objeto para acumular cantidad de pasajeros por "destino (fecha)"
    const pasajerosPorViaje = {
        // 'Destino (fecha)': cantidadPasajeros
    };

    viajes.forEach(viaje => {

        // la clave es un string que concatena el destino y la fecha en el formato deseado para ser mostrado luego en el HTML
        const clave = `${viaje.destino} (${viaje.fecha})`; // se transforma los valores del elemento viaje como clave del objeto pasajerosPorViaje 'Destino (fecha)'
        if (pasajerosPorViaje[clave]) {
            // al solo poder registrar un pasajero por registro, este se incrementa de uno en uno
            pasajerosPorViaje[clave] += 1;
        } else {
            // se crea una nueva propiedad del objeto con el destino y fecha como clave y su importe correspondiente como valor
            pasajerosPorViaje[clave] = 1;
        }
    });

    // actualizacion de la lista en el HTML
    const listaCantidadPasajeros = document.getElementById("listaCantidadPasajeros");
    listaCantidadPasajeros.innerHTML = "";

    for (const clave in pasajerosPorViaje) {
        const li = document.createElement("li");
        li.textContent = `${clave}: ${pasajerosPorViaje[clave]} pasajero(s)`;
        listaCantidadPasajeros.appendChild(li);
    }
}

// CARD 4: VIAJES REGISTRADOS (actualizacion de tabla con datos ingresados por el formulario)

const tablaRegistro = document.getElementById('tablaViajes').getElementsByTagName('tbody')[0];

function actualizarTabla(datosViaje) {
    const filaTabla = tablaRegistro.insertRow();

    // a partir del objeto, se crea un array para luego poder recorrerlo y extraer sus datos
    const datosCelda = [
        datosViaje.destino,
        datosViaje.fecha,
        datosViaje.duracion,
        `$${datosViaje.precio.toFixed(2)}`,
        `$${datosViaje.importeTotal.toFixed(2)}`,
        datosViaje.nombre,
        datosViaje.dni,
        datosViaje.estado
    ];

    // a medida que recorro el array de datos del viaje, creo una celda e inserto el valor en dicha celda
    datosCelda.forEach((valorCelda) => {
        const celda = filaTabla.insertCell();
        celda.textContent = valorCelda;
    });


    const celdaAcciones = filaTabla.insertCell();

    const contenedorBotones = document.createElement("div");
    contenedorBotones.className = "d-flex justify-content-center gap-1"; // flex horizontal, centrado y con separación

    celdaAcciones.appendChild(contenedorBotones);

    // se agregan los botones de acciones
    agregarBotonEditar(filaTabla, contenedorBotones);
    agregarBotonEliminar(filaTabla, contenedorBotones);


    // procedimiento para asignarle el color correspondiente a cada fila una vez cargada 
    const fecha = filaTabla.cells[1].textContent;
    const fechaViaje = calcularDiferenciaDias(fecha);

    determinarEstadoViajeEstilo(filaTabla, fechaViaje);
}

// --------------------------------

// CAMBIO: eliminar todos los elementos de la tabla

const botonEliminar = document.getElementById('botonEliminarTabla');

botonEliminar.addEventListener("click", eliminarTodosLosViajes);

function eliminarTodosLosViajes() {
    const cuerpoTabla = document.querySelector('tbody');
    const filas = cuerpoTabla.querySelectorAll('tr');
    
    const mensajeBorrarTabla = document.getElementById('mensajeBorrarTabla');


    // verificacion si hay datos para borrar o aun no
    if (filas.length === 0) {
        mensajeBorrarTabla.classList.add('text-bg-danger');
        mensajeBorrarTabla.textContent = 'Todavía no hay datos ingresados en la tabla de registros.';

        setTimeout(() => {
            mensajeBorrarTabla.textContent = '';
            mensajeBorrarTabla.classList.remove('text-bg-danger');
        }, 3000);

        return;
    }

    // Recorremos y eliminamos del almacenamiento y del DOM
    for (const fila of filas) {
        const viajeParaBorrar = {
            destino: fila.cells[0].textContent,
            fecha: fila.cells[1].textContent,
            duracion: parseInt(fila.cells[2].textContent),
            precio: parseFloat(fila.cells[3].textContent.replace('$', '')),
            importeTotal: parseFloat(fila.cells[4].textContent.replace('$', '')),
            nombre: fila.cells[5].textContent,
            dni: fila.cells[6].textContent,
            estado: fila.cells[7].textContent
        };

        borrarDatosLocales(viajeParaBorrar);
        fila.remove();
    }

    mensajeBorrarTabla.textContent = 'Los datos fueron borrados correctamente.';
    mensajeBorrarTabla.classList.add('text-bg-success');

    setTimeout(() => {
        mensajeBorrarTabla.classList.remove('text-bg-success');
        mensajeBorrarTabla.textContent = '';
    }, 3000);

    actualizarEstadisticaViajes();
    actualizarEstadisticaPasajeros();
}

// --------------------------------

// FUNCIONES PARA EL ALMACENAMIENTO LOCAL

// Recuperar viajes desde localStorage
function obtenerDatosLocales() {

    // se intenta obtener los datos almacenados bajo la clave "viajes" en localStorage (como string JSON)
    const viajesJSON = localStorage.getItem("viajes");

    // si existen datos, se convierten de string JSON a un array de objetos. Si no hay datos, se retorna un array vacío.
    return viajesJSON ? JSON.parse(viajesJSON) : [];
}

// Guardar un viaje en localStorage
function guardarDatosLocales(viaje) {

    // se obtienen los viajes almacenados previamente (o un array vacío si no hay ninguno)
    const viajes = obtenerDatosLocales();

    // se añade al array el nuevo objeto "viaje" recibido como parámetro
    viajes.push(viaje);

    // se guarda el array actualizado en localStorage, convirtiéndolo primero a formato JSON
    localStorage.setItem("viajes", JSON.stringify(viajes));
}

// Borrar un viaje de localStorage 
function borrarDatosLocales(viaje) {

    // se obtienen todos los viajes almacenados actualmente
    const viajes = obtenerDatosLocales();

    // se busca el índice del viaje que coincida exactamente con todos los campos del viaje pasado como parámetro
    const index = viajes.findIndex(v =>
        v.destino === viaje.destino &&
        v.fecha === viaje.fecha &&
        v.duracion === viaje.duracion &&
        Math.abs(v.precio - viaje.precio) < 0.01 &&               // comparación con margen para evitar problemas con decimales 
        Math.abs(v.importeTotal - viaje.importeTotal) < 0.01 &&   // (= si la diferencia entre ambos valores es menor a 0.01, se consideran iguales)
        v.nombre === viaje.nombre &&
        v.dni === viaje.dni &&
        v.estado === viaje.estado
    );

    // si se encontró el viaje (índice distinto de -1), se elimina del array
    if (index !== -1) {
        viajes.splice(index, 1); // elimina 1 elemento en la posición encontrada

        // se guarda el array actualizado nuevamente en localStorage en formato JSON
        localStorage.setItem("viajes", JSON.stringify(viajes));
    }
}


// Cargar todos los viajes almacenados y agregarlos a la tabla
function cargarDatosLocalesTabla() {
    const viajes = obtenerDatosLocales();

    viajes.forEach(actualizarTabla);
    actualizarEstadisticaViajes();
    actualizarEstadisticaPasajeros();
}

// FUNCIONES AUXILIARES

function calcularImporteTotal(duracion, precio) {
    const importeTotal = duracion * precio;
    return importeTotal;
}

function determinarEstadoViaje(fecha) {
    // variable para almacenar el mensaje que saldra en la tabla
    let estadoMensaje;

    const diferenciaDias = calcularDiferenciaDias(fecha);

    // CONDICIONES:
    // si faltan menos de 15 dias
    // si falta entre 15 y 30 dias
    // si faltan mas de 30 dias

    if (diferenciaDias < 15) {
        estadoMensaje = "Muy próximo - menos de 15 días";
    } else if (diferenciaDias >= 15 && diferenciaDias <= 30) {
        estadoMensaje = "Próximo - entre 15 y 30 días";
    } else {
        estadoMensaje = "Lejano - más de 30 días";
    }

    return estadoMensaje;
}

function determinarEstadoViajeEstilo(fila, diferenciaDias) {

    // se identifica el color que deberia de ir
    let color;

    if (diferenciaDias < 15) {
        color = 'green';
    } else if (diferenciaDias >= 15 && diferenciaDias <= 30) {
        color = 'yellow';
    } else if (diferenciaDias > 30) {
        color = 'red';
    }

    // se aplica el color en cada celda al recorrer la fila 
    for (const celda of fila.cells) {
        celda.style.borderBottom = `2px solid ${color}`;
    }
}

function calcularDiferenciaDias(fecha) {
    // por defecto, el objeto date da como valores la fecha actual del dispositivo
    const fechaActual = new Date();
    const fechaViaje = new Date(fecha);

    //diferencia de fechas en MILISEGUNDOS (lo que se suele hacer)
    const diferenciaHorariaMs = fechaViaje - fechaActual;

    // conversion a dias    
    const milisegundosPorDia = (1000 * 60 * 60 * 24); // 1000 milisegundos = 1 segundo, 60 segundos = 1 minuto, 60 minutos = 1 hora, 24 horas = 1 día 

    const diferenciaHorariaDias = Math.ceil(diferenciaHorariaMs / milisegundosPorDia);
    return diferenciaHorariaDias;
}

function agregarBotonEliminar(filaTabla, celdaAcciones) {
    const botonEliminar = document.createElement("button");
    botonEliminar.textContent = "Eliminar";
    botonEliminar.className = 'btn btn-danger';

    botonEliminar.addEventListener("click", function () {
        const viajeParaBorrar = {
            destino: filaTabla.cells[0].textContent,
            fecha: filaTabla.cells[1].textContent,
            duracion: parseInt(filaTabla.cells[2].textContent),
            precio: parseFloat(filaTabla.cells[3].textContent.replace('$', '')),
            importeTotal: parseFloat(filaTabla.cells[4].textContent.replace('$', '')),
            nombre: filaTabla.cells[5].textContent,
            dni: filaTabla.cells[6].textContent,
            estado: filaTabla.cells[7].textContent
        };

        borrarDatosLocales(viajeParaBorrar);
        filaTabla.remove();

        actualizarEstadisticaViajes();
        actualizarEstadisticaPasajeros();
    });

    celdaAcciones.appendChild(botonEliminar);
}

// CAMBIO: se agrega la funcionalidad de editar un registro
function agregarBotonEditar(filaTabla, celdaAcciones) {
    const botonEditar = document.createElement("button");
    botonEditar.textContent = "Editar";
    botonEditar.className = 'btn btn-warning me-2';

    botonEditar.addEventListener("click", function () {
        const viajeParaEditar = {
            destino: filaTabla.cells[0].textContent,
            fecha: filaTabla.cells[1].textContent,
            duracion: parseInt(filaTabla.cells[2].textContent),
            precio: parseFloat(filaTabla.cells[3].textContent.replace('$', '')),
            importeTotal: parseFloat(filaTabla.cells[4].textContent.replace('$', '')),
            nombre: filaTabla.cells[5].textContent,
            dni: filaTabla.cells[6].textContent,
            estado: filaTabla.cells[7].textContent
        };

        llenarFormularioConViaje(viajeParaEditar);
        borrarDatosLocales(viajeParaEditar);
        filaTabla.remove();

        actualizarEstadisticaViajes();
        actualizarEstadisticaPasajeros();
    });

    celdaAcciones.appendChild(botonEditar);
}

function agregarBotonReiniciarTabla(filasTabla, resultadoInput) {

    // creacion del botón

    const boton = document.createElement("button");
    boton.textContent = "Mostrar tabla original";
    boton.className = "btn btn-primary btn-sm mt-3";
    boton.id = "botonReiniciarTabla";

    // se agrega la funcionalidad de mostrar nuevamente la tabla como estaba
    boton.addEventListener("click", function () {
        for (const fila of filasTabla) {
            fila.classList.remove("d-none");
        }

        // se reestablece el texto que muestra el resultado
        resultadoInput.classList.remove('text-bg-success');
        resultadoInput.textContent = "";

        boton.remove();

    });

    // el boton se inserta debajo de la tabla
    document.getElementById("contenedorTabla").appendChild(boton);
}

function estandarizarDato(texto) {
    // se pone el texto todo en minusculas, se quitan las tildes y se eliminan los espacios
    return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "");
}

function verificarDestino() {
    let inputDestino = document.getElementById('destinoViaje').value;
    const mensajeError = document.getElementById('errorDestino');

    if (inputDestino.length < 3) {
        mensajeError.textContent = 'El destino debe contener al menos 3 caracteres'; // muestra mensaje de error
        document.getElementById('destinoViaje').value = ''; // limpia input
        return false; // indica que es inválido
    } else {
        mensajeError.textContent = '';
        return true; // indica que es válido
    }
}

function verificarDNI() {
    let inputDNI = document.getElementById('dniPasajero').value;
    const mensajeError = document.getElementById('errorDNI');

    if (inputDNI.length < 7) {
        mensajeError.textContent = 'El DNI debe contener al menos 7 números'; // muestra mensaje de error
        document.getElementById('dniPasajero').value = ''; // limpia input
        return false; // indica que es inválido
    } else {
        mensajeError.textContent = '';
        return true; // indica que es válido
    }
}

function llenarFormularioConViaje(viaje) {
    document.getElementById("destinoViaje").value = viaje.destino;
    document.getElementById("fechaViaje").value = viaje.fecha;
    document.getElementById("duracionViaje").value = viaje.duracion;
    document.getElementById("precioViaje").value = viaje.precio;
    document.getElementById("nombrePasajero").value = viaje.nombre;
    document.getElementById("dniPasajero").value = viaje.dni;
}

