
var webdb = {};
webdb.db = null;

// Función para crear la base de datos
webdb.open = function(options) {
	if (typeof openDatabase == "undefined") { alert("El navegador no soporta openDatabase"); return; }

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
// ExecuteSql
webdb.executeSql = function(sql, data, onSuccess, onError){
	if (!webdb.db) return;
	webdb.db.transaction(function(tx){tx.executeSql(sql,data,onSuccess,onError);});
}

var opt = {
	name: "nota",
	mb: 1,
	description: "Base de datos de nota",
	version: "1.0"
};

// Abrimos la base de datos
webdb.open(opt);

// Creamos la tabla
webdb.executeSql('CREATE TABLE IF NOT EXISTS nota (id INTEGER PRIMARY KEY ASC, texto TEXT, added_on DATETIME)', [],
	function(tx, r){
	},
	function(tx, e){
		alert("Se ha producido un error: " + e.message);
  }
);  

 function cargarNotas()
 {
   document.getElementById("notas").innerHTML = "";
   
    //Busco datos
    webdb.executeSql('SELECT * FROM  nota', [],
			function(tx, r){
        if(r.rows.length == 0){document.getElementById("notas").innerHTML = "<span style='font-style:italic'>No hay notas para mostrar</span>";}
               
        for(var i = 0; i<r.rows.length; i++){
          //console.log(r.rows.item(i));
          mostrarNota(r.rows.item(i).id,r.rows.item(i).texto);
        }
			},
			function(tx, e){
				alert("Se ha producido un error: " + e.message);
		  }
    );    
 }
 
 function mostrarNota(id,texto)
 {
   var newitem = "<span id='"+id+"'>" + 
                    texto +
                    "<br>" +  
                    "<button onclick='modoEdicion("+id+");'>Editar</button>" +
                    "<button onclick='borrar("+id+");'>Borrar</button>" + 
                 "</span><hr>";
   document.getElementById("notas").innerHTML = newitem + document.getElementById("notas").innerHTML;
 }
  
 function guardar()
 {
   if(!document.getElementById("texto").value){return;}

    // Insertamos un nuevo elemento o editamos el actual
    if(document.getElementById("id").value == "" || document.getElementById("id").value == undefined){
  
      webdb.executeSql('INSERT INTO nota (texto, added_on) VALUES (?,?)', [document.getElementById("texto").value, new Date()],
  			function(tx, r){      
           cargarNotas();
           document.getElementById("id").value = "";
           document.getElementById("texto").value = "";
  			},
  			function(tx, e){
  				alert("Se ha producido un error: " + e.message);
  		  }
      );    
    }else{
  
      webdb.executeSql('UPDATE nota SET texto = ? WHERE id = ?', [document.getElementById("texto").value, document.getElementById("id").value],
  			function(tx, r){      
           cargarNotas();
           document.getElementById("id").value = "";
           document.getElementById("texto").value = "";
  			},
  			function(tx, e){
  				alert("Se ha producido un error: " + e.message);
  		  }
      );    
    }
       
 }  
 
 function modoEdicion(id)
 {
    //Busco texto de la nota
    webdb.executeSql('SELECT * FROM  nota where id = ?', [id],
			function(tx, r){
       document.getElementById("id").value = r.rows.item(0).id;
       document.getElementById("texto").value = r.rows.item(0).texto;
			},
			function(tx, e){
				alert("Se ha producido un error: " + e.message);
		  }
    ); 
 }
 
 function borrar(id)
 { 
    webdb.executeSql('delete from nota where id = ?', [id],
			function(tx, r){
         cargarNotas();
			},
			function(tx, e){
				alert("Se ha producido un error: " + e.message);
		  }
    );
   
 }
 