/**

  Ejemplo de CRUD con PouchDB: agenda
  @date 2018-02-22
  @author parzibyte

  No olvides visitar https://www.parzibyte.me/blog
*/
var bd = new PouchDB("agenda"),
  $nombreCompleto = document.querySelector("#nombreCompleto"),
  $direccion = document.querySelector("#direccion"),
  $telefono = document.querySelector("#telefono"),
  $btnGuardar = document.querySelector("#btnGuardar"),
  $btnGuardarCambios = document.querySelector("#btnGuardarCambios"),
  $btnCancelarEdicion = document.querySelector("#btnCancelarEdicion"),
  $cuerpoTabla = document.querySelector("#cuerpoTabla"),
  idTemporalContacto = null, //Variable global para referirnos al id del contacto editado
  revTemporalContacto = null; //Variable global para referirnos a la revisión del contacto editado





$btnGuardar.addEventListener("click", function() {
  var nombreCompleto = $nombreCompleto.value,
    direccion = $direccion.value,
    telefono = $telefono.value;

  if (nombreCompleto && direccion && telefono) {
    bd.post({
        nombre: nombreCompleto,
        direccion: direccion,
        telefono: telefono
      })
      .then(function(respuesta) {
        if (respuesta.ok) {
          consultarContactos();
          alert("Guardado correctamente");
          cancelarEdicion(); //Pequeño truco para limpiar el formulario
        }
      });
  }
});


$btnCancelarEdicion.addEventListener("click", function() {
  cancelarEdicion();
});

$btnGuardarCambios.addEventListener("click", function() {
  var nombreCompleto = $nombreCompleto.value,
    direccion = $direccion.value,
    telefono = $telefono.value;

  if (nombreCompleto && direccion && telefono) {
    bd.put({
        nombre: nombreCompleto,
        direccion: direccion,
        telefono: telefono,
        _id: idTemporalContacto,
        _rev: revTemporalContacto
      })
      .then(function(respuesta) {
        if (respuesta.ok) {
          consultarContactos();
          alert("Cambios guardados");
          cancelarEdicion();
        }
      });
  }
});


var prepararParaEditar = function() {
  $btnGuardar.style.display = "none";
  $btnGuardarCambios.style.display = "block";
  $btnCancelarEdicion.style.display = "block";

};

var cancelarEdicion = function() {
  $btnGuardar.style.display = "block";
  $btnGuardarCambios.style.display = "none";
  $btnCancelarEdicion.style.display = "none";

  $nombreCompleto.value = $direccion.value = $telefono.value = "";

  idTemporalContacto = null;
  revTemporalContacto = null;
};





var consultarContactos = function() {
  bd.allDocs({
    include_docs: true
  }).then(function(documentos) {
    var htmlCuerpoTabla = "";
    for (var i = 0; i < documentos.rows.length; i++) {
      var contacto = documentos.rows[i].doc;
      htmlCuerpoTabla += "<tr>";

      htmlCuerpoTabla += "<td>";
      htmlCuerpoTabla += contacto.nombre;
      htmlCuerpoTabla += "</td>";

      htmlCuerpoTabla += "<td>";
      htmlCuerpoTabla += contacto.direccion;
      htmlCuerpoTabla += "</td>";

      htmlCuerpoTabla += "<td>";
      htmlCuerpoTabla += contacto.telefono;
      htmlCuerpoTabla += "</td>";


      htmlCuerpoTabla += "<td>";
      htmlCuerpoTabla += "<button class='btn-editar' data-id-contacto='" + contacto._id + "'>Editar</button>";
      htmlCuerpoTabla += "</td>";

      //Nuevo botón
      htmlCuerpoTabla += "<td>";
      htmlCuerpoTabla += "<button class='btn-eliminar' data-id-contacto='" + contacto._id + "'>Eliminar</button>";
      htmlCuerpoTabla += "</td>";

      htmlCuerpoTabla += "</tr>";
    }

    $cuerpoTabla.innerHTML = htmlCuerpoTabla; //Asignar HTML concatenado


    //Una vez dibujados los botones, los escuchamos
    escucharBotonesEditar();
    escucharBotonesEliminar();

  });
};

var escucharBotonesEditar = function() {
  var botonesEditar = document.getElementsByClassName("btn-editar");
  for (var i = 0; i < botonesEditar.length; i++) {
    botonesEditar[i].addEventListener('click', editarContacto);
  }
};
var escucharBotonesEliminar = function() {
  var botonesEliminar = document.getElementsByClassName("btn-eliminar");
  for (var i = 0; i < botonesEliminar.length; i++) {
    botonesEliminar[i].addEventListener('click', eliminarContacto);
  }
};

var eliminarContacto = function() {

  //Detener si no se confirma
  if (!confirm("¿Seguro?")) return;

  var idContacto = this.dataset.idContacto;
  
  obtenerUnContacto(idContacto)
    .then(function(contacto) {
      return contacto;
    })
    .then(function(contacto) {
      return bd.remove(contacto).then(function(respuesta) {
        return respuesta;
      });
    })
    .then(function(respuesta) {
      if (respuesta.ok) {
        alert("Eliminado correctamente");
        consultarContactos();
      }
    });

};

var editarContacto = function() {
  // Acceder a data-id-contacto
  // Javascript remueve los guiones y el "data", luego
  // pone todos los datos en un objeto llamado dataset
  // y convierte dichos guiones a camelCase
  // Ejemplo: data-id-contacto => dataset.idContacto

  var idContacto = this.dataset.idContacto;
  obtenerUnContacto(idContacto).then(function(contacto) {

    //Ocultar y mostrar botones respectivos
    prepararParaEditar();

    $nombreCompleto.value = contacto.nombre;
    $direccion.value = contacto.direccion;
    $telefono.value = contacto.telefono;

    idTemporalContacto = contacto._id;
    revTemporalContacto = contacto._rev;
  });
};

var obtenerUnContacto = function(idContacto) {
  return bd.get(idContacto).then(function(contacto) {
    return contacto;
  });
};

//Por defecto, ocultar botones que sólo se muestran al editar
cancelarEdicion();

consultarContactos();