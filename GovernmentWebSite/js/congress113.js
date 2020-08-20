//La url se lo obtiene del archivo senate/house .je, según corresponda.
//Clave que se necesita para acceder a los datos.Obtenido del mail recibido al registrarse en la página de ProPublica.
var key = {
	headers: {
		"X-API-Key": "26gGJmrTjORwsyimgrZJfcBFzRXEKswmSB4EfF4k"
	}
}
var app = new Vue({
	el: '#app',
	data: {
		//array con datos originales de miembros
		members: [],
		//almaceno la copia del  array recogido y trabajo sobre este último para hacer el filtrado
		filteredMembers: [],
		states: []
	}
});

//Función ya armada para obtener JSON con fetch. No cambiamos nada.
function fetchJson(url, init) {
	return fetch(url, init).then(function (response) {
		if (response.ok) {
			return response.json();
		}
		throw new Error(response.statusText);
	});
}

//Llamada a la función.
fetchJson(url, key)
	//Lo que quiero que haga cuando ya tenga los datos. Recién en ese momento, antes no.
	.then(function (json) {
		//Obtiene solo los miembros en una variable. Para simplificar notación.Array con datos originales. Aquí voy a guardar los datos de ProPublica Server
		app.members = json.results[0].members;
		//Array con copia de array original
		app.filteredMembers = app.members;
		//OBTIENE ARRAY DE STATES NO REPETIDOS. ARMA MENU DESPLEGABLE
		app.states = arrayStates(app.filteredMembers)
	})
//Las siguientes funciones no se ejecutan, a menos que se los invoque.
//Paso todo el código a funciones para que lo puede invocar desde le función "then". Si no se ejecutaría antes de que obtenga la respuesta del servidor y surgiría errores.
//OBTIENE ARRAY DE STATES NO REPETIDOS. ARMA MENU DESPLEGABLE
function arrayStates(members) {
	//array de estados
	var arrayStates = [];
	//indice para array de estados
	var k = 0;
	//variable booleana para verificar si el elemento ya existe, repetido
	var existe = false;
	//OBTIENE ARRAY DE STATES
	//recorre el array de members
	for (var i = 0; i < members.length; ++i) {
		// Elimina los repetidos
		for (var j = 0; j < arrayStates.length; ++j) {
			//verifica si el nuevo dato no existe ya en el array
			if (members[i].state == arrayStates[j]) {
				//la bandera cambia a true, ya está repetido
				existe = true;
			}
		}
		//si el elemento no existe, recién lo guarda en el array, si no significa que está repetido
		if (!existe) {
			arrayStates[k] = members[i].state;
			//incrementa el índice del array, se incrementa a medida que se agregan nuevos elmentos
			++k;
		}
	}
	return arrayStates;
}

//FUNCION FILTRO (ambos filtros en una sola función)
function filter() {
	//array con el resultado del filtro
	var arrayFilter = [];
	//tomar valores checked
	var array = document.querySelectorAll('input[name=filter]:checked');
	var arrayChecked = Array.from(array).map(elt => elt.value); //array de chequeados
	//recorro array de  miembros y verifico valores chequeados y seleccionado del menu para filtrar la tabla 
	var states = document.getElementById("estados").value;
	for (var j = 0; j < app.members.length; ++j) {
		var miembro = app.members[j];
		//filtra por party y state
		if (arrayChecked.length !== 0 && states !== "" && arrayChecked.indexOf(miembro.party) !== -1 && miembro.state == states) {
			arrayFilter.push(miembro);
		} else
			//filtra por party
			if (arrayChecked.length !== 0 && states == "" && (arrayChecked.indexOf(miembro.party)) !== (-1)) {
				arrayFilter.push(miembro);
			} else
				//filtra por state
				if (arrayChecked.length == 0 && states !== "" && miembro.state == states) {
					arrayFilter.push(miembro);
				}
		//Considero que en caso que no hay seleccionado ningún party y valor es "" (All) para state, no filtre,no muestre nada. El segundo filtro depende del primero.
	}
	//Actualizo la copia del array a mostrar
	app.filteredMembers = arrayFilter;
}
