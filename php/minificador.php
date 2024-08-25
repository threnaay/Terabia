<?php

require_once('minify-master/src/Minify.php');
require_once('minify-master/src/JS.php');
require_once('minify-master/src/CSS.php');
require_once('minify-master/src/Exception.php');

use MatthiasMullie\Minify;

/*

	Este código lo tenía en Dalaxia, pero presto el uso a Terabia.

*/
class MinificadorDalaxiano{	
	private $archivos_agregados = [];
	private $dir = '';
	private $dirGeneral = '';

	private $cambios = 0;

	function __construct($dirGeneral, $dir){
		$this->dirGeneral = $dirGeneral;
		$this->dir = $dir;

		if(!file_exists($dirGeneral . $this->dir)){
			mkdir($dirGeneral . $this->dir);
		}
	}

	public function agregarArchivo($src_no_minificado, $src_minificado, $dir){

		$src = $this->minificar($src_no_minificado, $src_minificado, $dir);

		array_push($this->archivos_agregados, $src);
	}

	public function compilarTodo(){
		$archivoCompilado = $this->dirGeneral . $this->dir . 'index.js';

		if($this->cambios > 0){
			/*
				Sobre escribir el archivo compilado */

			# Abrir
			$archivo = fopen($archivoCompilado, 'w');

			foreach($this->archivos_agregados as $arch){
				$data_archivo = file_get_contents($arch);

				fwrite($archivo, $data_archivo . "\n");
			}

			fclose($archivo);
		}

		return $archivoCompilado;
	}

	public function minificar($src_no_minificado, $src_minificado, $dirArchivo){
		$dir_original = $this->dirGeneral . $src_no_minificado . $dirArchivo;
		$dir_comprimido = $this->dirGeneral . $src_minificado . $dirArchivo;

		if(!file_exists($dir_comprimido) || filemtime($dir_comprimido) < filemtime($dir_original)){
			/*
				Comprimir archivos */
			$minifier = new Minify\JS($dir_original);
			$minifier->minify($dir_comprimido);

			$this->cambios++;	
		}
		return $dir_comprimido;
	}

	static function minificarArchivo($tipo, $directorio, $archivo, $version){
		$dir = explode('/', $directorio);
		$raiz = $dir[count($dir) - 1];
		$dir = implode('/', array_slice($dir, 0, count($dir) - 1));
		/*
			Directorio original */
		$directorio_original = $dir . '/' . $version . '/' . $archivo;
		/*
			Directorio comprimido */
		$directorio_comprimido = $dir . '/' . $raiz . '/' . $archivo;
		if(!file_exists($directorio_comprimido) || filemtime($directorio_comprimido) < filemtime($directorio_original)){
			/*
				Comrpimir archivos */
			$minifier = new Minify\JS($directorio_original);
			$minifier->minify($directorio_comprimido);
		}
		return $directorio_comprimido . '?' . filemtime($directorio_comprimido);
	}
}

?>