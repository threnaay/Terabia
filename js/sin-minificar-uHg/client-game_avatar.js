const SRC_AVATAR_IMAGES_BASE = 'images/avatares/';

class Avatar extends CuerpoSala{
	static AvataresCaminando = [];

	/*
		Imágenes según el estado del avatar
	*/
	imagesEstados = {
		parado: {
			cabeza: [],
			cuerpo: []
		},
		/*
			Los demás estados, están comentados, debido a que todavía no están esas imágenes.
		*/

		/*sentado: {
			cabeza: [],
			cuerpo: []
		},
		acostado: {
			cabeza: [],
			cuerpo: []
		}*/
	}

	estadoActual = "parado";

	/*
		Tipo de cabeza, color de piel, etc
	*/
	apariencia = {
		cabeza: 1,

		sexo: 0
	}


	caminata = {
		// Si hay caminata en curso o qlq
		enCurso: false,
		/*
			Casillas que va a recorrer
		*/
		casillas_recorrer: [],

		// Tiempo en el que comenzó a caminar todo ese recorrido
		time_inicio: 0,

		// Tiempo en el que comenzó a caminar a la casilla próxima
		time_inicio_casilla: 0,

		// Cantidad de tiempo que se tarda en caminar a una casilla
		time_por_casilla: 500,

		caminos_recorridos: 0
	}

	constructor(id, coords, info){
		super('avatar', id, coords, info);

		this.apariencia.sexo = this.info.sexo;

		this.ubicarCuerpo();

		var avatar = this;
		this.cargarImagenes().then(function(){
			avatar.establecerApariencia();

			avatar.preparar();
		});
	}

	get GET_SRC_IMAGES_AVATAR(){
		return SRC_AVATAR_IMAGES_BASE + (this.apariencia.sexo ? 'fem' : 'mas') + '/';
	}

	ubicarCuerpo(){
		this.ajustarEnCapas();
	}

	cargarImagenes(){
		var images_cargar = [];

		for(var estado in this.imagesEstados){
			images_cargar.push([ 'cabeza_'+estado+'_c', this.GET_SRC_IMAGES_AVATAR + 'cabezas/' + this.apariencia.cabeza + '/' + estado + '.png']);

			images_cargar.push([ 'cuerpo_'+estado+'_c', this.GET_SRC_IMAGES_AVATAR + estado + '.png']);
		}

		var avatar = this;

		return new Promise(function(success, fail){
			ClientGame.Images.cargar(images_cargar).then(function(imagesResult){
				var images_cargadas = imagesResult.images;

				for(var name_image in images_cargadas){
					let name_div = name_image.split('_'),
						donde_guardar = name_div[0],
						name_estado = name_div[1];

					avatar.imagesEstados[name_estado][donde_guardar].push(images_cargadas[name_image]);
				}

				success();
			});
		});
	}

	establecerApariencia(){
		var avatar = this;
		var estado = avatar.estadoActual;

		switch(estado){
			case 'parado':
				avatar.image.width = 512;
				avatar.image.height = 1024;
				
				avatar.coords.px = 50;
				avatar.coords.py = -750;
			break;
		}

		avatar.image.images = [];

		return new Promise(function(success, fail){
			var imagesDeEstado = avatar.imagesEstados[estado];

			/*
				Crear imagen de ese estado
			*/
			if(!imagesDeEstado.image){
				var nImagesCrear = 0,
					nImagesCreadas = 0;

				var evaluarFinalizacion = function(){
					if(nImagesCrear <= nImagesCreadas){
						avatar.image.images = [ imagesDeEstado.cuerpo.image, imagesDeEstado.cabeza.image ];
						success();
					}
				}

				for(var i in imagesDeEstado){
					let name_estado = i;

					nImagesCrear++;

					let canvas = document.createElement('canvas'),
						ctx = canvas.getContext('2d');

					canvas.width = imagesDeEstado[i][0].width;
					canvas.height = imagesDeEstado[i][0].height;

					let images = imagesDeEstado[i];
					for(var img in images){
						ctx.drawImage(images[img], 0, 0);
					}

					canvas.toBlob(function(blob){
						var image = new Image();
						image.src = URL.createObjectURL(blob);
				
						image.onload = function(){
							imagesDeEstado[name_estado].image = this;	
							nImagesCreadas++;
							evaluarFinalizacion();
						}
					});
				}
			}else{
				avatar.image.images = [ imagesDeEstado.cuerpo.image, imagesDeEstado.cabeza.image ];
			}
		});
	}

	mirada = {
		desde: [],
		hacia: []
	}

	mirarHacia(coords_desde, coords_hacia){
		var ftgrama_y = 0;

		if(this.mirada.desde.toString() == coords_desde.toString() && this.mirada.hacia.toString() == coords_hacia.toString())
			return;

		if(coords_desde[0] == coords_hacia[0] && coords_desde[0] < coords_hacia[0]){
			ftgrama_y = 0;
		}else if(coords_desde[0] > coords_hacia[0] && coords_desde[1] < coords_hacia[1]){
			ftgrama_y = 1;
		}else if(coords_desde[0] > coords_hacia[0] && coords_desde[1] == coords_hacia[1]){
			ftgrama_y = 2;
		}else if(coords_desde[0] > coords_hacia[0] && coords_desde[1] > coords_hacia[1]){
			ftgrama_y = 3;
		}else if(coords_desde[0] == coords_hacia[0] && coords_desde[1] > coords_hacia[1]){
			ftgrama_y = 4;
		}else if(coords_desde[0] < coords_hacia[0] && coords_desde[1] > coords_hacia[1]){
			ftgrama_y = 5;
		}else if(coords_desde[0] < coords_hacia[0] && coords_desde[1] == coords_hacia[1]){
			ftgrama_y = 6;
		}else if(coords_desde[0] < coords_hacia[0] && coords_desde[1] < coords_hacia[1]){
			ftgrama_y = 7;
		}

		this.image.fotogramaY[0] = ftgrama_y;
		this.mirada.desde = coords_desde;
		this.mirada.hacia = coords_hacia;
	}

	visualizar(){
		super.visualizar(...arguments);
	}

	caminar(casillas_recorrer){
		var time = ClientGame.Game.verTiempo();

		this.cancelarCaminata();

		this.caminata.casillas_recorrer = casillas_recorrer;
		this.caminata.time_inicio = time;
		this.caminata.time_inicio_casilla = time;

		this.caminata.enCurso = true;

		this.crearAnimacion(0, "caminar",  "perpetua", [1,2,3,4], 100);

		Avatar.AvataresCaminando.push(this);
	}

	cancelarCaminata(){
		if(!this.caminata.enCurso) return false;

		this.caminata.enCurso = false;

		this.caminata.casillas_recorrer = [];
		this.caminata.time_inicio = 0;
		this.caminata.time_inicio_casilla = 0;
		this.caminata.caminos_recorridos = 0;

		this.cancelarAnimacion(0);

		var indx = Avatar.AvataresCaminando.indexOf(this);

		if(indx != -1){
			Avatar.AvataresCaminando.splice(indx, 1);
		}
	}

	calcularCaminata(time){
		var prox_coord = this.caminata.casillas_recorrer[this.caminata.caminos_recorridos];
		
		if(!prox_coord) return this.cancelarCaminata();

		var prox_casilla = ClientGame.Sala.verCasilla(prox_coord[0], prox_coord[1]),
			miCasilla = this.MiCasilla;

		if(time - this.caminata.time_inicio_casilla >= this.caminata.time_por_casilla){
			/*
				Reasignar las coordenadas y todo eso.
			*/
			this.coords.cx = prox_coord[0];
			this.coords.cy = prox_coord[1];

			this.coords.caminata_x = 0;
			this.coords.caminata_y = 0;

			this.caminata.time_inicio_casilla = time;

			this.caminata.caminos_recorridos++;


			this.ubicarCuerpo();
		}else{
			let progreso = (time - this.caminata.time_inicio_casilla) / this.caminata.time_por_casilla;

			this.coords.caminata_x = (prox_casilla.posicion.px - miCasilla.posicion.px) * progreso;
			this.coords.caminata_y = (prox_casilla.posicion.py - miCasilla.posicion.py) * progreso;

			this.mirarHacia([this.coords.cx, this.coords.cy], prox_coord.slice());
		}
	}
}