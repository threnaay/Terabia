{
	let Sala = ClientGame.Sala,
		Canvas = ClientGame.Canvas,
		Game = ClientGame.Game;

	Sala.procesarSala = function(NameSesion = "", images = {}, estructura = {}){
		/*
		*
		*	Preparar información de la sala
		*
		*/
		Sala.NameSesion = NameSesion;

		Sala.info.nombre = '';

		Sala.estructura.nCasillas_x = estructura.nCasillas_x;
		Sala.estructura.nCasillas_y = estructura.nCasillas_y;

		Sala.crearCasillas(estructura.nCasillas_x, estructura.nCasillas_y);

		Sala.Controles.preparar();

		/*
		*
		*	Las imágenes que se tienen que cargar
		*
		*/
		var imagesCargar = [];

		imagesCargar.push( ['baldosa_principal',  images.baldosa_principal || 'images/salas/AL8BALDOSA@8x-min_v2.png?1' ] );
		imagesCargar.push( ['selector', 'images/salas/SELECTORA_TEST.png' ] );

		return new Promise(function(success, fail){
			ClientGame.Images.cargar(imagesCargar, "asociativo").then(function(imgEntregadas){
				if(!Sala.comprobarSesion(NameSesion)) return "Está en otra sala.";

				Sala.images = imgEntregadas.images;

				Sala.construirSuelo().then(function(ImageSuelo){
					if(!Sala.comprobarSesion(NameSesion)) return "Está en otra sala.";

					Sala.estructura.image_suelo = ImageSuelo;

					Game.timeIniciado = (new Date).getTime();

					/*
						Comenzar a reproducir el juego
					*/
					Game.reproducir();

					success();
				});
			}).catch(function(err){
				alert("No se pudo cargar las imágenes. " + err);
				fail(err);
			});
		});
	}

	Sala.crearCasillas = function(nCasillas_x, nCasillas_y){
		for(var x = 0; x < nCasillas_x; x++){
			for(var y = 0; y < nCasillas_y; y++){
				if(!Sala.estructura.casillas[x])
					Sala.estructura.casillas[x] = [];
				
				Sala.estructura.casillas[x][y] = new SalaCasilla(x, y);
			}
		}
	}

	Sala.construirSuelo = function(){
		var canvas = document.createElement('canvas'),
			ctx = canvas.getContext('2d');

		canvas.width = ClientGame.dimensiones_casilla[0] + (ClientGame.Sala.estructura.nCasillas_y - 1) * (ClientGame.dimensiones_casilla[0] / 2 + 1) + (ClientGame.Sala.estructura.nCasillas_x - 1) * (ClientGame.dimensiones_casilla[0] / 2 + 1);
		canvas.height = (ClientGame.Sala.estructura.nCasillas_y + 1) * (ClientGame.dimensiones_casilla[1] / 2) + (ClientGame.Sala.estructura.nCasillas_x - 1) * (ClientGame.dimensiones_casilla[1] / 2);


		var casillas = Sala.estructura.casillas;
		for(var x in casillas){
			for(var y in casillas[x]){
				let ca = casillas[x][y];

				ctx.drawImage(Sala.images.baldosa_principal, ca.posicion.px, ca.posicion.py);
			}
		}

		return new Promise(function(success, fail){
			var imageSuelo = new Image();
			canvas.toBlob(function(blob){
				imageSuelo.src = URL.createObjectURL(blob);
				
				imageSuelo.onload = function(){
					success(imageSuelo);
				}
			});
		});
	}

	class SalaCasilla{
		coord_x = 0;
		coord_y = 0;

		posicion = {
			px: 0,
			py: 0
		}

		constructor(coord_x, coord_y){
			this.coord_x = coord_x;
			this.coord_y = coord_y;

			/*
				Establecer pues, la posición isométrica
			*/
			this.posicion.px = ((Sala.estructura.nCasillas_x - 1) * (ClientGame.dimensiones_casilla[0] / 2 + 1)) + coord_y * (ClientGame.dimensiones_casilla[0] / 2 + 1) - coord_x * (ClientGame.dimensiones_casilla[0] / 2 + 1)
			this.posicion.py = coord_y * (ClientGame.dimensiones_casilla[1] / 2) + coord_x * (ClientGame.dimensiones_casilla[1] / 2);
		}
	}
}