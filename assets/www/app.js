
var webdb = {};
webdb.db = null;

// Función para crear la base de datos
webdb.open = function(options) 
{
	if (typeof openDatabase == "undefined") {
		alert("El navegador no soporta openDatabase");
		return;
	}

	// Opciones por defecto
	var options = options || {};
	options.name = options.name || 'noname';
	options.mb = options.mb || 5;
	options.description = options.description || 'no description';
	options.version = options.version || '1.0';

	// Definimos el tamaño en MB
	var dbSize = options.mb * 1024 * 1024;

	// Cargamos la base de datos
	webdb.db = openDatabase(options.name, options.version, options.description, dbSize);
}

// Ejecutamos consulta
webdb.executeSql = function(sql, data, onSuccess, onError)
{
	if (!webdb.db) return;
	webdb.db.transaction(function(tx){tx.executeSql(sql,data,onSuccess,onError);});
}

var opt = {
	name: "nota",
	description: "Base de datos de notas",
	version: "1.0"
};

// Abrimos la base de datos
webdb.open(opt);

// Creamos la tabla (si no existe)
webdb.executeSql('CREATE TABLE IF NOT EXISTS nota (id INTEGER PRIMARY KEY ASC, texto TEXT, added_on DATETIME)', [],	function(tx, r){}, tratarError);  

//Mostramos mensaje de error luego de una consulta a la base de datos
function tratarError(tx, e)
{
  alert("Se ha producido un error: " + e.message);  
}

function limpiarCampos()
{
  document.getElementById("id").value = "";
  document.getElementById("texto").value = "";
}

function cargarNotas()
{
  document.getElementById("notas").innerHTML = "";
 
  //Busco datos
  webdb.executeSql('SELECT * FROM nota order by id desc', [],
  	function(tx, r){
        var _contenido = ""; 
        
        if(r.rows.length == 0){
          _contenido = "<span style='font-style:italic'>No hay notas para mostrar</span>";
        }
               
        for(var i = 0; i<r.rows.length; i++){
        	var _item = r.rows.item(i);
          _contenido += obtenerContenidoNota(_item.id, _item.texto);
        }
        
        document.getElementById("notas").innerHTML = _contenido;
  	},
    tratarError
  );    
}
 
function obtenerContenidoNota(id, texto)
{
  var newitem = "<span id='" + id + "'>" + 
                  texto +
                  "<br>" +  
                  "<button onclick='modoEdicion(" + id + ");'>Editar</button>" +
                  "<button onclick='borrar(" + id + ");'>Borrar</button>" + 
				"</span><hr>";
  return newitem;
}

function guardar()
{
  var _id = document.getElementById("id");
  var _texto = document.getElementById("texto"); 
  if(!_texto.value){ return; }

  // Insertamos un nuevo elemento o editamos el actual
  if(_id.value == "" || _id.value == undefined){

    webdb.executeSql('INSERT INTO nota (texto, added_on) VALUES (?,?)', [_texto.value, new Date()],
		function(tx, r){
			cargarNotas();
			limpiarCampos();
		},
		tratarError
    );    
    
  }else{

    webdb.executeSql('UPDATE nota SET texto = ? WHERE id = ?', [_texto.value, _id.value],
		function(tx, r){
			cargarNotas();
			limpiarCampos();
		},
		tratarError
    );    
    
  }
     
}  
 
function modoEdicion(id)
{
  //Busco texto de la nota
  webdb.executeSql('SELECT * FROM  nota where id = ?', [id],
    function(tx, r){
      var _item = r.rows.item(0);
      document.getElementById("id").value = _item.id;
      document.getElementById("texto").value = _item.texto;
    },
    tratarError
  ); 
}
 
function borrar(id)
{ 
  if(!confirm("¿Confirma el borrado de la nota?")) return; 
  
  webdb.executeSql('delete from nota where id = ?', [id],
    cargarNotas,
    tratarError
  );   
}
 