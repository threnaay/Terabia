{
	var Sala = ClientGame.Sala,
		Game = ClientGame.Game;

	/*
		Este código lo hice yo para Dalaxia desde 0 en 2019. No soy matemático, y no estoy seguro si hice una chapuza, pero funciona.
		Lo copio y pego acá en terabia.
	*/
	Sala.Controles.calcularCasilla = function(x, y){
		/*
			Calculamos qué casilla está apuntando el usuario
		*/
		var casilla_seleccionada = null,
		tamano_casilla = ClientGame.dimensiones_casilla.slice(); // La imagen de la casilla, esto, para usar su tamaño al calcular
		
		tamano_casilla[0] *= ClientGame.zoom;
		tamano_casilla[1] *= ClientGame.zoom;

		var cursor_coords = [x - ((Sala.estructura.nCasillas_x - 1) * (tamano_casilla[0] / 2 + 1)) - (tamano_casilla[0] * .34), y], // Coordenadas del cursor. A la coordenada X se le restan la distancia que hay desde la casilla X0, Y0
		/* 
			A continación, vamos a calcular qué casilla X y Y respectivamente está debajo del cursor 
		*/
		coords_x = Math.floor(cursor_coords[0] / (tamano_casilla[0] / 2 + 1)), /* Comenzamos por el cursor X, su 
		coordenada, que además se le restan las coordenadas de la casilla principal (0,0), vamos a dividirlo
		para saber cuántas casillas se pudo recorrer desde esa distancia */
		coords_y = Math.floor((cursor_coords[1] - (coords_x * tamano_casilla[1] / 2)) / tamano_casilla[1]);/* Ahora, con el cursor Y
		hacemos lo mismo, lo dividimos para saber cuántas casillas pudieron haberse recorrido, pero en
		las coordenadas del cursor, se le restan cierta cantidad de pixeles por cada casilla "Y" recorrida,
		esto considerando la vista isométrica, pues cada casilla "Y" recorrida, la siguiente se ubica más abajo. */
		coords_x = Math.floor((cursor_coords[0]  + (coords_y * (tamano_casilla[0] / 2 + 1))) / (tamano_casilla[0] / 2 + 1)); /* Ahora, finalmente
		reasignamos la coordenada X, teniendo en cuenta que cada casilla "X" recorrida, son menos pixeles considerando
		la vista isométrica */
		/*
			Hay que tener en cuenta que el cálculo del cursor en la posición X apunta a la casilla Y, y
			lo mismo con la posición Y, que apunta a la casilla X.
		*/
		return [coords_y, coords_x];
	}

	var moverSala = {
		tipoClick: null,
		clicked: false,
		clicked_x: 0,
		clicked_y: 0,

		camara: Game.camara.slice()
	}


	Sala.Controles.EVENTO_mousedown = function(event){
		var x = event.clientX,
			y = event.clientY;

		if(event.touches && event.touches[0]){
			x = event.touches[0].clientX;
			y = event.touches[0].clientY;
		}

		moverSala.tipoClick = event.type;
		moverSala.clicked = true;

		moverSala.clicked_x = x - Game.camara[0];
		moverSala.clicked_y = y - Game.camara[1];

		moverSala.camara = Game.camara.slice();
	}
	Sala.Controles.EVENTO_mousemove = function(event){
		event.preventDefault();

		var x = event.clientX,
			y = event.clientY;

		if(event.touches && event.touches[0]){
			x = event.touches[0].clientX;
			y = event.touches[0].clientY;
		}
		/*
			Calcular que casilla está seleccionando!
		*/

		if(moverSala.clicked){
			Game.moverCamara(x - moverSala.clicked_x, y - moverSala.clicked_y);
		}

		var coordenadas = Sala.Controles.calcularCasilla(x - Game.camara[0], y - Game.camara[1]);

		Sala.Controles.selector.coordenadas = coordenadas.slice();
		Sala.Controles.selector.casilla = Sala.verCasilla(coordenadas[0], coordenadas[1]);

		Game.pos_mouse_camara[0] = x - Game.camara[0];
		Game.pos_mouse_camara[1] = y - Game.camara[1];
	}
	Sala.Controles.EVENTO_mouseup = function(x, y){
		moverSala.clicked = false;

		if(Game.camara.toString() == moverSala.camara.toString()){
			if(Sala.Controles.selector.casilla){
				let coords = Sala.Controles.selector.coordenadas;
				CAMINAR_YO(Sala.miAvatar, coords[0] , coords[1]);
			}
		}
	}

	/*
		ZOOM CON MOUSE
	*/
	{
		let ultimoWheel = 0;
		Sala.container.addEventListener('wheel', function(event){
			var timestamp = (new Date).getTime();
			if(timestamp - ultimoWheel < 200) return;

			ultimoWheel = timestamp;

			ClientGame.cambiarZoom(event.deltaY < 0 ? 'aumentar' : 'disminuir');

			/*var canvasPrincipal = ClientGame.Canvas.verCanvas('principal');

			var new_camara_x = ((Game.pos_mouse_camara[0] * ClientGame.zoom) * -1) + (canvasPrincipal.width / 2),
				new_camara_y = (Game.pos_mouse_camara[1] * ClientGame.zoom) * -1;

			ClientGame.Game.moverCamara(new_camara_x, new_camara_y);*/
		});
	}

	Sala.Controles.preparar = function(){
		Sala.container.addEventListener('mousedown', Sala.Controles.EVENTO_mousedown);
		Sala.container.addEventListener('mousemove', Sala.Controles.EVENTO_mousemove);
		Sala.container.addEventListener('mouseup', Sala.Controles.EVENTO_mouseup);

		Sala.container.addEventListener('touchstart', Sala.Controles.EVENTO_mousedown);
		Sala.container.addEventListener('touchmove', Sala.Controles.EVENTO_mousemove);
		Sala.container.addEventListener('touchend', Sala.Controles.EVENTO_mouseup);
	}

	Sala.Controles.cancelar = function(){
		Sala.container.removeEventListener('mousedown', Sala.Controles.EVENTO_mousedown);
		Sala.container.removeEventListener('mousemove', Sala.Controles.EVENTO_mousemove);
		Sala.container.removeEventListener('mouseup', Sala.Controles.EVENTO_mousedown);

		Sala.container.removeEventListener('touchstart', Sala.Controles.EVENTO_mousedown);
		Sala.container.removeEventListener('touchmove', Sala.Controles.EVENTO_mousemove);
		Sala.container.removeEventListener('touchend', Sala.Controles.EVENTO_mouseup);
	}
}