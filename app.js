angular
  .module('app', [])
  .factory('webdb', function () {

	var webdb = {};
	webdb.db = null;
	webdb.supported = true;

	webdb.open = function (options) 
	{
		if (typeof openDatabase == "undefined") {
			webdb.supported = false;
			return;
		}

		// Default options
		var options         = options || {};
		options.name        = options.name || 'noname';
		options.mb          = options.mb || 5;
		options.description = options.description || 'no description';
		options.version     = options.version || '1.0';

		// Size of the database in MB
		var dbSize = options.mb * 1024 * 1024;

		webdb.db = openDatabase(options.name, options.version, options.description, dbSize);
	}

	webdb.executeSql = function (sql, data, onSuccess, onError)
	{
		if (!webdb.db) return;
		webdb.db.transaction(function (tx) {
			tx.executeSql(sql, data, onSuccess, onError);
		});
	};

	var opt = {
		name: "nota",
		description: "Base de datos de notas",
		version: "1.0"
	};

	webdb.open(opt);

	function tratarError(e)
	{
		throw "Error al crear base de datos: " + e;
	}

	webdb.executeSql('CREATE TABLE IF NOT EXISTS nota (id INTEGER PRIMARY KEY ASC, texto TEXT, added_on DATETIME)', [],	function(tx, r){}, tratarError);
	
	/**
	 * Searchs notes in the database
	 * @returns {Promise} (SQLResultSetRowList)
	 */
	webdb.getNotes = function () {
		return new Promise(function (resolve, reject) {
			webdb.executeSql('SELECT * FROM nota order by id desc', [], 
				function (tx, r) {
					resolve(r.rows);
				},
				function () {
					reject('There was an error.');
				}
			);
		});
	};

	/**
	 * Inserts or updates a note
	 * @param {integer} _id 
	 * @param {string} _texto 
	 * @returns {Promise}
	 */
	webdb.saveNote = function (_id, _texto) {
		return new Promise(function (resolve, reject) {			
			if(_id == "" || _id == undefined){
				webdb.executeSql('INSERT INTO nota (texto, added_on) VALUES (?,?)', [_texto, new Date()],
					function (tx, r) {
						resolve();
					},
					function () {
						reject('There was an error.');
					}
				);
			}else{	
				webdb.executeSql('UPDATE nota SET texto = ? WHERE id = ?', [_texto, _id],
					function (tx, r) {
						resolve();
					},
					function () {
						reject('There was an error.');
					}
				);	
			}	
		});
	};

	/**
	 * Deletes a note
	 * @param {integer} _id 
	 * @returns {Promise}
	 */
	webdb.deleteNote = function (_id) {
		return new Promise(function (resolve, reject) {
			webdb.executeSql('delete from nota where id = ?', [_id], resolve, reject);
		});
	};

	return webdb;
  })
  .controller('homeController', function (webdb, $log, $scope) {

	$scope.databaseSupport = webdb.supported;
	$scope.notes = [];

	$scope.save = function () {
		var _id = $scope.note.id;
		var _texto = $scope.note.texto;

		webdb.saveNote(_id, _texto).then(function () { 
			$scope.note = undefined; 
			load(); 
		}, tratarError);

	}

	$scope.delete = function (note) {
    	var id = note.id;
		if(!confirm("¿Confirma el borrado de la nota?")) return; 

		webdb.deleteNote(id).then(load, tratarError);
    }

	$scope.view = function (note) {
		$scope.note = angular.copy(note);
	} 

	function load() {

    	$scope.notes = [];

		webdb.getNotes().then(function (rows) { 
			
			if(rows.length == 0){
				$scope.notes.push( { texto: "No hay notas para mostrar..." } );
			}

			for(var i = 0; i<rows.length; i++){
				$scope.notes.push( rows.item(i) );
			}

			$scope.$apply();
		})
		.catch(tratarError);
	}

	load();

    function tratarError(){}

  });