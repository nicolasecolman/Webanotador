angular
  .module('app', [])
  .factory('webdb', function(){

	var webdb = {};
	webdb.db = null;
	webdb.supported = true;

	// Método para crear la base de datos
	webdb.open = function(options) 
	{
		if (typeof openDatabase == "undefined") {
		    //document.getElementById("btnguardar").disabled = true;
		    //document.getElementById("errorcontainer").style.display = '';
		    webdb.supported = false;
			return;
		}

		// Opciones por defecto
		var options         = options || {};
		options.name        = options.name || 'noname';
		options.mb          = options.mb || 5;
		options.description = options.description || 'no description';
		options.version     = options.version || '1.0';

		// Definimos el tamaño en MB
		var dbSize = options.mb * 1024 * 1024;

		// Cargamos la base de datos
		webdb.db = openDatabase(options.name, options.version, options.description, dbSize);
	}

	// Método para ejecutar consulta
	webdb.executeSql = function(sql, data, onSuccess, onError)
	{
		if (!webdb.db) return;
		webdb.db.transaction(function(tx){tx.executeSql(sql, data, onSuccess, onError);});
	}

	var opt = {
		name: "nota",
		description: "Base de datos de notas",
		version: "1.0"
	};

	// Abrimos la base de datos
	webdb.open(opt);

	function tratarError(e){
		throw "Error al crear base de datos: " + e;
	}
	// Creamos la tabla (si no existe)
	webdb.executeSql('CREATE TABLE IF NOT EXISTS nota (id INTEGER PRIMARY KEY ASC, texto TEXT, added_on DATETIME)', [],	function(tx, r){}, tratarError);  

	return webdb;
  })
  .controller('homeController', function(webdb, $log, $scope){
    //$scope = this;  //Haciendolo asi no soporta $scope.$apply

    $scope.databaseSupport = true;
    $scope.notes = [];

    $scope.save = function(){
    }

    function load(){
    	if(!webdb.supported){
    		$scope.databaseSupport = false;
    	}

	  //Busco datos
	  webdb.executeSql('SELECT * FROM nota order by id desc', [],
	  	function(tx, r){
	        
	        if(r.rows.length == 0){
	          r.rows.item(0) = {text: "<span style='font-style: italic'>No hay notas para mostrar</span>"}; 
	        }

	        for(var i = 0; i<r.rows.length; i++){
				var _item = r.rows.item(i);
				$scope.notes.push( _item );
	        }
	        
	        $scope.$apply(function(){});
	  	},
	    tratarError
	  );    
    }

    load();

    function tratarError(){}

  })