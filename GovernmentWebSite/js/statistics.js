//Si se llama a esta funcion, no se ejecuta lo que esta escrito anteriormente(?)
var app = new Vue({
	el: '#app',
	data: {
		parties: [],
		totalRep: 0,
		totalVot: 0,
		//Objeto JSON con propiedades para guardar información de las estadísticas
		statistics: {
			"listGlance": {
				"party": "",
				"numOfRep": 0,
				"pctVotedParty": 0,
			},
			"numberOfDemocrats": 0,
			"numberOfRepublicans": 0,
			"numberOfIndependent": 0,
			"promedioVotosDemocrats": 0,
			"promedioVotosRepublicans": 0,
			"promedioVotosIndependent": 0,
			"listDemocrats": [],
			"listRepublicans": [],
			"listIndependet": [],
			"listLeastLoyalty": [],
			"listMostLoyalty": [],
			"listLeastAttendance": [],
			"listMostAttendance": [],
		},

	}
});



//Clave que se necesita para acceder a los datos.Obtenido del mail recibido al registrarse en la página de ProPublica.
var key = {
	headers: {
		"X-API-Key": "26gGJmrTjORwsyimgrZJfcBFzRXEKswmSB4EfF4k"
	}
}
var members = [];

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
		//Aquí voy a guardar los datos de ProPublica Server
		//Obtiene la lista de miembros, para simplicar notación,código
		members = json.results[0].members;
		//Ejecuta funcion correspondiente segun la pagina que lo llame
		seguir()
	})

function seguir() {
	armarListParty()
	app.statistics.promedioVotosDemocrats = promedio(app.statistics.listDemocrats);
	app.statistics.promedioVotosRepublicans = promedio(app.statistics.listRepublicans);
	app.statistics.promedioVotosIndependent = promedio(app.statistics.listIndependet);
	app.statistics.listGlance = listGlance();
	calculoListGlance(app.statistics.listGlance)
	app.parties = app.statistics.listGlance;
	//Invoca a las función calcular para que obtenga los listados y lo guarde en el listado correspondiente.
	//Se llena la Tabla Least Loyal
	app.statistics.listLeastLoyalty = calcular(members, "loyalty", "least");
	//Se llena la Tabla Most Loyal
	app.statistics.listMostLoyalty = calcular(members, "loyalty", "most");
	//Se llena la Tabla Least Attendance
	app.statistics.listLeastAttendance = calcular(members, "attendance", "least");
	//Se llena la Tabla Most Attendance
	app.statistics.listMostAttendance = calcular(members, "attendance", "most");

}
//Arma los listados por partido 
function armarListParty() {
	var party = "";
	for (var i = 0; i < members.length; i++) {
		party = members[i].party;
		if (party == "D") {
			app.statistics.listDemocrats.push(members[i])

		} else if (party == "R") {
			app.statistics.listRepublicans.push(members[i])
		} else {
			app.statistics.listIndependet.push(members[i])
		}
	}
	app.statistics.numberOfDemocrats = app.statistics.listDemocrats.length;
	app.statistics.numberOfIndependent = app.statistics.listIndependet.length;
	app.statistics.numberOfRepublicans = app.statistics.listRepublicans.length;
}

//Calcula promedio de porcentajes por partido
function promedio(listado) {
	var suma = 0;
	var promedio = 0;
	for (var i = 0; i < listado.length; ++i) {
		//Para  solucionar cuando da NaN. Convierte a 0, el valor si es undefined o ... 
		listado[i].votes_with_party_pct = listado[i].votes_with_party_pct || 0;
		suma += listado[i].votes_with_party_pct;
	}
	promedio = suma / listado.length;
	return promedio;
}

//Genera el listado para la tabla "Senate/House at a glance"
function listGlance() {
	var listado = [];
	listado.push({
		"party": "Democrats",
		"numOfRep": app.statistics.numberOfDemocrats,
		"pctVotedParty": app.statistics.promedioVotosDemocrats,
	});
	listado.push({
		"party": "Republicans",
		"numOfRep": app.statistics.numberOfRepublicans,
		"pctVotedParty": app.statistics.promedioVotosRepublicans,
	});
	listado.push({
		"party": "Independents",
		"numOfRep": app.statistics.numberOfIndependent,
		"pctVotedParty": app.statistics.promedioVotosIndependent,
	});
	return listado;
}

//Llena las tabla "Senate/House at a glance"
function calculoListGlance(listado) {
	var totalRep = 0;
	var totalVot = 0;
	for (var i = 0; i < listado.length; ++i) {
		totalRep += listado[i].numOfRep;
		//NO ME SUMABA, ME ENCADENABA EL RESULTADO(?)
		totalVot += listado[i].pctVotedParty;
		console.log("Republicanos");
		console.log(listado[i].pctVotedParty);
	}
	app.totalRep = totalRep;
	app.totalVot = totalVot;
}

//Elimina los elementos repetidos del listado del array de porcentajes  
function noRepetidos(array, referencia) {
	//array nuevo sin repetidos 
	var arrayNuevo = [];
	//índice para el arrayNuevo
	var k = 0;
	//Bandera para saber si existe el elemento en el array
	var existe = false;
	//Recorre el array original, repetido.
	for (var i = 0; i < array.length; ++i) {
		//Recorre el array nuevo, para ver si el elemento del array original ya se encuentra en el nuevo array, y si está no lo agrega en el nuevo array  
		for (var j = 0; j < arrayNuevo.length; ++j) {
			//Agrego condiciones para diferenciar si es para calcular para la página "Loyalty" o para "Attendance"
			if (referencia == "loyalty" && array[i].votes_with_party_pct == arrayNuevo[j]) {
				existe = true;
			} else if (referencia == "attendance" && array[i].missed_votes_pct == arrayNuevo[j]) {
				existe = true;
			}
		}
		//Al terminar de recorrer todo el array y verificar que no está, recién lo inserta en el nuevo array
		if (!existe && referencia == "loyalty") {
			arrayNuevo[k] = array[i].votes_with_party_pct;
			++k;
		} else if (!existe && referencia == "attendance") {
			arrayNuevo[k] = array[i].missed_votes_pct;
			++k;
		}
	}
	return arrayNuevo;
}

//Agrega nuevos miembros a los diferentes Listados de Loyalty.
function agregarLoyalty(array, dato) {
	array.push({
		name: dato.last_name + " " + dato.first_name + " " + (dato.middle_name || " "),
		nroPartyVotes: dato.total_votes,
		votePartyPct: dato.votes_with_party_pct,
	})
	return array;

}

//Agrega nuevos miembros a los diferentes Listados de Attendance.
function agregarAttendance(array, dato) {
	array.push({
		name: dato.last_name + " " + dato.first_name + " " + (dato.middle_name || " "),
		missed_votes: dato.missed_votes,
		missed_votes_pct: dato.missed_votes_pct,
	})
	return array;

}

//Realiza los calculos para armar los listados de las diferentes tablas de estadíticas
function calcular(listado, referencia, indicador) {
	//Guarda el porcentaje a buscar. El más grande o el más chico según corresponda
	var medida = 0;
	//Funciona como indice para ir tomando los datos del array de porcentajes
	var veces = 0;
	//Array de porcentajes, almacena los porcentajes.
	var arrayPorcentaje = [];
	//Array para guardar el resultado, los listados
	var leastOrMostMembers = [];
	//Invoca a la función noRepetidos(), según sea least/most y loyalty/attendance
	if (indicador == "least" && referencia == "loyalty") {
		//Agrego función a sort para que el orden sea ascendente o descendente, según corresponda.
		arrayPorcentaje = noRepetidos(listado, referencia).sort(function (a, b) {
			return a - b;
		});
	} else if (indicador == "most" && referencia == "loyalty") {
		arrayPorcentaje = noRepetidos(listado, referencia).sort(function (a, b) {
			return b - a;
		});
	} else if (indicador == "least" && referencia == "attendance") {
		arrayPorcentaje = noRepetidos(listado, referencia).sort(function (a, b) {
			return a - b;
		});
	} else if (indicador == "most" && referencia == "attendance") {
		arrayPorcentaje = noRepetidos(listado, referencia).sort(function (a, b) {
			return b - a;
		});
	}
	//Va cargando el listado hasta que sea >=10%(0,1)
	while ((leastOrMostMembers.length / listado.length) < 0.1) {
		medida = arrayPorcentaje[veces];
		++veces;
		//Vuelve a poner vacío el array leastOrMostMembers para que vuelva a cargar el array, usando como nueva referencia un nuevo valor de porcentaje. 
		leastOrMostMembers = [];
		//Según sea Least/Most(indicador) y Loyalty(referencia) invoca a la función correspondiente, agregar.
		for (var i = 0; i < listado.length; ++i) {

			if (indicador == "least" && referencia == "loyalty" && listado[i].votes_with_party_pct <= medida) {
				leastOrMostMembers = agregarLoyalty(leastOrMostMembers, members[i]);
			} else if (indicador == "most" && referencia == "loyalty" && listado[i].votes_with_party_pct >= medida) {
				leastOrMostMembers = agregarLoyalty(leastOrMostMembers, members[i]);
			} else if (indicador == "least" && referencia == "attendance" && listado[i].missed_votes_pct <= medida) {
				leastOrMostMembers = agregarAttendance(leastOrMostMembers, members[i]);

			} else if (indicador == "most" && referencia == "attendance" && listado[i].missed_votes_pct >= medida) {
				leastOrMostMembers = agregarAttendance(leastOrMostMembers, members[i]);
			}
		}
	}
	//Antes de retornar el resultado, listado correspondiente. Se lo ordena con la función sort y a esta se le agrega condiciones según sea least/most t loyalty para orden ascendente/descendente
	return leastOrMostMembers.sort(function (a, b) {
		if (indicador == "least" && referencia == "loyalty") {
			return a.votePartyPct - b.votePartyPct;
		} else if (indicador == "most" && referencia == "loyalty") {
			return b.votePartyPct - a.votePartyPct;
		} else if (indicador == "least" && referencia == "attendance") {
			return a.voteMissedPartyPct - b.voteMissedPartyPct;
		} else if (indicador == "most" && referencia == "attendance") {
			return b.voteMissedPartyPct - a.voteMissedPartyPct;
		}
	});

}
