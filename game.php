<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Terabia</title>
	<style type="text/css">
		*{
			padding: 0;
			margin: 0;
		}

		#DGame canvas[data-game]{
			position: fixed;
			top: 0;
			left: 0;
			background-color: #000;
		}

		#zoom_manage{
			position: fixed;
			top: 10px;
			left: 10px;
		}

		.btn_zoom{
			cursor: pointer;
			padding: 15px 25px;
			font-size: 24px;
			border: 1px solid #000;
			background-color: #fff;
			box-shadow: 0 0 0 1px #fff inset, 0 -6px 0 0 rgba(0,0,0,.4) inset;
			margin-right: 15px;
			border-radius: 10px;
		}
	</style>
</head>
<body>

<div id="DGame">
	<!-- El canvas del juego -->
	<canvas data-game="principal"></canvas>
</div>

<!--
	Botones de zoom
-->
<div id="zoom_manage">
	<button class="btn_zoom" data-zoom="disminuir">-</button>
	<button class="btn_zoom" data-zoom="aumentar">+</button>
</div>

<?php

require_once('php/minificador.php');
/*
*
*	Importar archivos de javascript
*
**/

$minificador = new MinificadorDalaxiano('js/', 'compilado/');

define('src_minificado', 'minificado-fZk/');
define('src_no_minificado', 'sin-minificar-uHg/');

/*
	General */
$minificador->agregarArchivo(src_no_minificado, src_minificado, 'client-game.js');
$minificador->agregarArchivo(src_no_minificado, src_minificado, 'client-game_sala.js');
$minificador->agregarArchivo(src_no_minificado, src_minificado, 'client-game_sala_controles.js');

$minificador->agregarArchivo(src_no_minificado, src_minificado, 'client-game_game.js');
$minificador->agregarArchivo(src_no_minificado, src_minificado, 'client-game_avatar.js');

/*
*
*	Compilar todo!
*
**/

$url = $minificador->compilarTodo();

echo '<script type="text/javascript" src="'.$url.'?'.filemtime($url).'"></script>';

?>
<script type="text/javascript">
	ClientGame.Sala.procesarSala("NombreAleatorio-" + (Math.random()), {}, { nCasillas_x: 8, nCasillas_y: 8 }).then(function(){

		var yo = ClientGame.Sala.agregarCuerpo('avatar', {
			id: 'yo',
			
			info: {
				nombre: 'Nenyer',
				sexo: 0
			},

			coords: {
				cx: 2,
				cy: 0
			}
		});

		ClientGame.Sala.agregarCuerpo('avatar', {
			id: 'bot1',
			
			info: {
				nombre: 'Avatar quietesillo',
				sexo: 0
			},

			coords: {
				cx: 1,
				cy: 1
			}
		});

		ClientGame.Sala.agregarCuerpo('avatar', {
			id: 'bot_caminador',
			
			info: {
				nombre: 'Avatar caminante',
				sexo: 0
			},

			coords: {
				cx: 0,
				cy: 0
			}
		});

		ClientGame.Sala.miAvatar = yo;

		yo.enfocarCamara();
	});

	/*
	
		Manejar el zoom

	*/
	{
		let btns_zooms = zoom_manage.querySelectorAll('button[data-zoom]');

		for(var i = 0; i < btns_zooms.length; i++){
			btns_zooms[i].onclick = function(){
				ClientGame.cambiarZoom(this.getAttribute('data-zoom'));
				ClientGame.Sala.miAvatar.enfocarCamara();
			}
		}
	}


	/*
	
		LA siguiente función debería ser parte del server, pero como esto es solamente un DEMO del cliente, la pongo acá

	*/

	function CAMINAR_YO(miAvatar, x, y){
		if(!miAvatar || miAvatar.caminata.enCurso || [x, y].toString() == [miAvatar.coords.cx, miAvatar.coords.cy].toString()) return;

		var casillas = [],
			caminoSenalado = {
				x: miAvatar.coords.cx,
				y: miAvatar.coords.cy
			};

		while([caminoSenalado.x, caminoSenalado.y].toString() != [x, y].toString()){
			if(caminoSenalado.x != x) caminoSenalado.x += (miAvatar.coords.cx < x ? 1 : -1);
			if(caminoSenalado.y != y) caminoSenalado.y += (miAvatar.coords.cy < y ? 1 : -1);

			casillas.push( [caminoSenalado.x, caminoSenalado.y]  );
		}

		miAvatar.caminar(casillas);
	}
</script>

</body>
</html>