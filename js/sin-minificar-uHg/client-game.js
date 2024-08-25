window.ClientGame = {
	// Dimensiones normales de cada casilla
	dimensiones_casilla: [576, 288],

	Sala: {
		// Avatar del player...
		miAvatar: null,

		container: DGame,
		/*
			NameSesion, es solamente un código aleatorio para comprobar que se trata de la misma sala.
			Es decir, pongamos de ejemplo que entras a una sala, se está cargando y construyendo el suelo, pero justo antes de terminar
			de cargar el suelo, entras a otra sala cuyo suelo cargue más rápido. Entonces la nueva sala a la que entres, se creará el suelo
			y luego por el proceso anterior de la sala en la que estabas, va a reemplazar el suelo por el anterior.

			Así que se me ocurrió crear un "nombre de sesión" para la sala en la que estás. Así, solo debemos comparar que sea
			"la misma sesión" antes de terminar cualquier proceso.
		*/
		NameSesion: "",
		comprobarSesion(NameSesion){
			return this.NameSesion == NameSesion;
		},

		src_image_baldosa_principal: '',

		images: {},

		estructura: {
			casillas: [],

			nCasillas_x: 0,
			nCasillas_y: 0,

			/*
				La imagen del suelo ya construido
			*/
			image_suelo: null
		},

		info: {},

		cuerpos: {
			avatares: {},
			furnis: {},

			other: {}
		},

		verAvatar(id){
			return this.cuerpos.avatares[id] || null; 
		},

		agregarCuerpo(tipoCuerpo, dataCuerpo){
			var cuerpo = new Avatar( dataCuerpo.id, dataCuerpo.coords, dataCuerpo.info );

			var dondeGuardar = ({ avatar: 'avatares', furni: 'furnis' })[tipoCuerpo] || 'other';

			this.cuerpos[dondeGuardar][cuerpo.id] = cuerpo;
			return cuerpo;
		},


		verCasilla(x, y){
			return this.estructura.casillas[x] ? (this.estructura.casillas[x][y] || null) : null;
		},

		Controles: {
			/*
				La casilla seleccionada cuando pasa el cursor por la sala
			*/
			selector: {
				casilla: null,
				coordenadas: null
			}
		}
	},

	zoom: .5,
	cambiarZoom(tipo, multiplo = .1){
		var zoom = ClientGame.zoom;

		zoom += multiplo * (tipo == "disminuir" ? -1 : 1);

		if(zoom < .1){
			zoom = .1;
		}else if(zoom > 1){
			zoom = 1;
		}

		ClientGame.zoom = zoom;
	},
	
	Game: {
		/*
			Cámara del juego.

			Para saber en qué lugar está enfocando la cámara del videojuego.
		*/
		camara: [0, 0],
		// Posición del mouse sobre la cámara.
		pos_mouse_camara: [],

		timeIniciado: 0,

		verTiempo(){
			return (new Date).getTime() - this.timeIniciado;
		},

		moverCamara(x, y){
			this.camara[0] = x;
			this.camara[1] = y;
		}
	},

	Canvas: {
		id_canvas: [],
		elementos: {},
		ctx: {},

		buffer_elementos: {},
		buffer_ctx: {},

		agregarCanvas(canvas){
			var name_canvas = canvas.getAttribute('data-game');

			this.elementos[name_canvas] = canvas;
			this.ctx[name_canvas] = canvas.getContext('2d');

			this.buffer_elementos[name_canvas] = document.createElement('canvas');
			this.buffer_ctx[name_canvas] = this.buffer_elementos[name_canvas].getContext('2d');

			this.id_canvas.push(name_canvas);

			this.ajustarDimension(name_canvas);
		},

		ajustarDimension(name_canvas){
			this.elementos[name_canvas].width = innerWidth;
			this.elementos[name_canvas].height = innerHeight;

			this.buffer_elementos[name_canvas].width = innerWidth;
			this.buffer_elementos[name_canvas].height = innerHeight;
		},

		reajustarDimensionesCanvas(){
			var canvas = this.id_canvas;

			for(var i in canvas){
				this.ajustarDimension(canvas[i]);
			}
		},

		insertarImagen(name_canvas, image, pos_x, pos_y, fwidth, fheight, image_width, image_height, opacidad, cutImage_x = 0, cutImage_y = 0){
			if(!fwidth) fwidth = image.width;
			if(!fheight) fheight = image.height;

			if(!image_width) image_width = fwidth;
			if(!image_height) image_height = fheight;

			var ctx = this.verCtxBuffer(name_canvas);
			
			if(!ctx) return null;

			ctx.drawImage(image, cutImage_x, cutImage_y, fwidth, fheight, pos_x, pos_y, image_width, image_height);
		},

		verCanvasBuffer(name_canvas){
			return this.buffer_elementos[name_canvas];
		},

		verCanvas(name_canvas){
			return this.elementos[name_canvas];
		},

		verCtxBuffer(name_canvas){
			return this.buffer_ctx[name_canvas];
		},

		verCtx(name_canvas){
			return this.ctx[name_canvas];
		},

		// Termina de dibujar en buffer, y dibuja en el lienzo real
		terminarBuffer(name_canvas){
			var canvasBuffer = this.verCanvasBuffer(name_canvas),
				canvas = this.verCanvas(name_canvas),
				ctxBuffer = this.verCtxBuffer(name_canvas),
				ctx = this.verCtx(name_canvas);

			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(canvasBuffer, 0, 0);
			ctxBuffer.clearRect(0, 0, canvasBuffer.width, canvasBuffer.height);
		}
	},

	Images: {
		imagesCargadas:{
			images_preparadas: {},
			images_cargando: {}
		},

		cargar($images, $tipo){
			var tiposAdmitidos = [ 'array', 'asociativo' ];
			
			if(!tiposAdmitidos.includes($tipo))
				$tipo = tiposAdmitidos[0];

			return new Promise(function(success, fail){
				var images_mandar,
					nImagenes_no_cargadas = 0;

				if($tipo == 'array'){
					images_mandar = [];
				}else if($tipo == 'asociativo'){
					images_mandar = {};
				}

				var images = $images.slice(),
				nImagesProcesadas = 0,
				procesarImagen = function(){
					if(!images.length){
						exito();
						return;
					}
					var imagenCargada = function(image, index){
						if(image !== undefined && index !== undefined){
							images_mandar[index] = image;
						}

						nImagesProcesadas++;
						images.splice(0, 1);

						procesarImagen();
					}

					/*
						Preparar la carga de la imagen
					*/
					var verImg = images[0];
					var src = Array.isArray(verImg) ? verImg[1] : verImg[0],
						index = Array.isArray(verImg) ? verImg[0] : nImagesProcesadas;

					/*
			
						Si ya está preparada, no se vuelve a cargar, sino que se 
	
					*/
					var imagenYa_Cargada = ClientGame.Images.imagesCargadas.images_preparadas[src];
					if(imagenYa_Cargada){
						return imagenCargada(imagenYa_Cargada, index);
					}

					var imagenYaEnPreparacion = ClientGame.Images.imagesCargadas.images_cargando[src];
					if(imagenYaEnPreparacion){
						let EventoImagenCargar = function(src_cargado, img_cargado){
							if(src == src_cargado){
								ClientGame.eliminarEvento('ImageCargada', EventoImagenCargar);

								imagenCargada(img_cargado, index);
							}
						};

						ClientGame.agregarEvento('ImageCargada', EventoImagenCargar);
						return;
					}

					/*
	
						Cargar la imagen

					*/

					var img = new Image();

					img.src = src;

					ClientGame.Images.imagesCargadas.images_cargando[src] = img;

					img.onload = function(){
						ClientGame.procesarEvento('ImageCargada', [ src, img ]);
						
						ClientGame.Images.imagesCargadas.images_cargando[src] = null;
						ClientGame.Images.imagesCargadas.images_preparadas[src] = this;

						imagenCargada(img, index);
					}

					img.onerror = function(){
						ClientGame.procesarEvento('ImageCargaErrada', [ src, img ]);
						nImagenes_no_cargadas++;
						imagenCargada();
					}
				}, exito = function(){
					success({
						images: images_mandar,
						no_cargadas: nImagenes_no_cargadas
					});
				};

				procesarImagen();
			});
		}
	},

	eventos: {},
	eventos_configs: {},
	agregarEvento($name, $func, $bUnaVez){
		if(!this.eventos[$name])
			this.eventos[$name] = [];
		if(!this.eventos_configs[$name])
			this.eventos_configs[$name] = [];

		this.eventos[$name].push($func);
		this.eventos_configs[$name].push({
			unavez: $bUnaVez ? 1 : 0
		});
	},
	eliminarEvento($name, $func){
		if(this.eventos[$name]){
			var indx = this.eventos[$name].indexOf($func);

			if(indx != -1){
				this.eventos[$name].splice(indx, 1);
				this.eventos_configs[$name].splice(indx, 1);
			}
		}
	},
	procesarEvento($name, parms = []){
		var eventos = this.eventos[$name],
			configs = this.eventos_configs[$name];

		if(!Array.isArray(parms))
			parms = [];

		if(eventos){
			eventos = eventos.slice();
			configs = configs.slice();
			for(var i in eventos){
				let func = eventos[i],
					conf = configs[i];

				try{

					if(func){
						func(...parms);

						if(conf.unavez) this.eliminarEvento($name, func);
					}

				}catch(err){
					throw err;
				}
			}
		}
	}
}

/*
	Preparar canvas, etc
*/
{
	let canvas = ClientGame.Sala.container.querySelectorAll('canvas[data-game]');

	for(var i = 0; i < canvas.length; i++){
		let c = canvas[i];

		ClientGame.Canvas.agregarCanvas(c);
	}

	window.addEventListener('resize', function(){
		ClientGame.Canvas.reajustarDimensionesCanvas();
	});
}