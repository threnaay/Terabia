{let Game=ClientGame.Game,Canvas=ClientGame.Canvas,Sala=ClientGame.Sala;Game.reproducir=function(){window.requestAnimationFrame(Game.reproducir);var selector=Sala.Controles.selector;var time=Game.verTiempo();Game.dibujarSuelo();var bot_caminador=Sala.verAvatar('bot_caminador');if(!window.botCaminador_ultimaComprobacion)
window.botCaminador_ultimaComprobacion=time;if(bot_caminador&&!bot_caminador.caminata.enCurso&&time-window.botCaminador_ultimaComprobacion>=2000&&bot_caminador.preparado){CAMINAR_YO(bot_caminador,Math.floor(Sala.estructura.nCasillas_x*Math.random()),Math.floor(Sala.estructura.nCasillas_y*Math.random()));window.botCaminador_ultimaComprobacion=time}
if(selector.casilla){Canvas.insertarImagen('principal',Sala.images.selector,Game.camara[0]+(selector.casilla.posicion.px*ClientGame.zoom),Game.camara[1]+(selector.casilla.posicion.py*ClientGame.zoom),0,0,Sala.images.selector.width*ClientGame.zoom,Sala.images.selector.height*ClientGame.zoom)}
var avataresCaminando=Avatar.AvataresCaminando.slice();for(var i in avataresCaminando){avataresCaminando[i].calcularCaminata(time)}
var capas=CapaGame.Capas;for(var i in capas){capas[i].visualizarTodo()}
Canvas.terminarBuffer('principal')}
Game.dibujarSuelo=function(){Canvas.insertarImagen('principal',Sala.estructura.image_suelo,Game.camara[0],Game.camara[1],0,0,Sala.estructura.image_suelo.width*ClientGame.zoom,Sala.estructura.image_suelo.height*ClientGame.zoom)}
Game.moverCamara=function(x,y){x=Math.floor(x);y=Math.floor(y);Game.camara=[x,y]}}
class CapaGame{static Capas=[];static CapasPorId={};id="";x=0;y=0;zIndex=0;cuerposAlojados=[];constructor(x,y){this.x=x;this.y=y;this.zIndex=(x*ClientGame.Sala.estructura.nCasillas_y)+y;this.id=x+'-'+y}
visualizarTodo(){var time=ClientGame.Game.verTiempo();for(var i in this.cuerposAlojados){this.cuerposAlojados[i].visualizar(time)}}
agregarCuerpo(cuerpo){this.cuerposAlojados.push(cuerpo)}
retirarCuerpo(cuerpo){var indx=this.cuerposAlojados.indexOf(cuerpo);if(indx!=-1){this.cuerposAlojados.splice(indx,1)}
if(!this.cuerposAlojados.length){this.borrarCapa()}}
borrarCapa(){CapaGame.CapasPorId[this.id]=null;var indx=CapaGame.Capas.indexOf(this);if(!indx)
CapaGame.Capas.splice(indx,1)}
static verCapa(capaId){return CapaGame.CapasPorId[capaId]||null}
static crearCapa(x,y){var capa_existente=CapaGame.verCapa(x,y);if(capa_existente){return capa_existente}else{var crearCapa=new CapaGame(x,y);CapaGame.CapasPorId[x+'-'+y]=crearCapa;CapaGame.Capas.push(crearCapa);CapaGame.OrdenarCapas();return crearCapa}}
static OrdenarCapas(){CapaGame.Capas.sort(function(a,b){return a.zIndex-b.zIndex})}}
class CuerpoSala{id="";tipo="";preparado=!1;info={nombre:'',sexo:0}
coords={cx:0,cy:0,px:0,py:0,caminata_x:0,caminata_y:0}
image={width:0,height:0,images:[],fotogramaX:[0],fotogramaY:[0]}
animaciones=[];CapaId=null;constructor(tipo,id,coords,info){this.tipo=tipo;this.id=id;this.coords.cx=coords.cx;this.coords.cy=coords.cy}
preparar(){this.preparado=!0}
get MiCapa(){return CapaGame.verCapa(this.CapaId)}
get MiCasilla(){return ClientGame.Sala.verCasilla(this.coords.cx,this.coords.cy)}
ajustarEnCapas(){this.borrarDeCapa();var crearCapa=CapaGame.crearCapa(this.coords.cx,this.coords.cy);crearCapa.agregarCuerpo(this);this.CapaId=crearCapa.id}
borrarDeCapa(){var miCapa=this.MiCapa;if(!miCapa)return;miCapa.retirarCuerpo(this)}
visualizar(time){var Canvas=ClientGame.Canvas,cuerpo=this,posicion=cuerpo.posicion,images=this.images,camara_game=ClientGame.Game.camara;this.procesarAnimaciones(time);for(var i in images){let img=images[i],ftgrama_x=(cuerpo.image.fotogramaX[i]||cuerpo.image.fotogramaX[0]||0)*cuerpo.image.width,ftgrama_y=(cuerpo.image.fotogramaY[i]||cuerpo.image.fotogramaY[0]||0)*cuerpo.image.height;Canvas.insertarImagen('principal',img,camara_game[0]+posicion.x,camara_game[1]+posicion.y,cuerpo.image.width,cuerpo.image.height,cuerpo.image.width*ClientGame.zoom,cuerpo.image.height*ClientGame.zoom,0,ftgrama_x,ftgrama_y)}}
get posicion(){var x=0,y=0;var verCasilla=ClientGame.Sala.verCasilla(this.coords.cx,this.coords.cy);x+=verCasilla.posicion.px+this.coords.px+this.coords.caminata_x;y+=verCasilla.posicion.py+this.coords.py+this.coords.caminata_y;return{x:x*ClientGame.zoom,y:y*ClientGame.zoom}}
get images(){return this.image.images}
crearAnimacion(capa=0,name="",tipo="perpetua",fotogramas=[],time_por_fotograma=100){if(!Array.isArray(fotogramas)||!fotogramas.length)
return;if(isNaN(time_por_fotograma))
time_por_fotograma=300;this.animaciones[capa]={name:name,tipo:tipo,capa:capa,fotogramas:fotogramas,time_inicio:ClientGame.Game.verTiempo(),time_por_fotograma:Number(time_por_fotograma),fotogramaActual:this.image.fotogramaX[capa]}}
cancelarAnimacion(capa){var animacion=this.animaciones[capa];if(animacion){if(animacion.fotogramaActual!==undefined){this.image.fotogramaX[animacion.capa]=animacion.fotogramaActual}}
this.animaciones[capa]=null}
procesarAnimaciones(time){for(var i in this.animaciones){let animacion=this.animaciones[i];if(!animacion)continue;let duracionTotal=(animacion.time_por_fotograma*animacion.fotogramas.length),time_progreso=((time-animacion.time_inicio)%(duracionTotal+1))/duracionTotal;this.image.fotogramaX[animacion.capa]=animacion.fotogramas[Math.floor((animacion.fotogramas.length)*time_progreso)]}}
enfocarCamara(){var miPosicion=this.posicion,canvasPrincipal=ClientGame.Canvas.verCanvas('principal'),miCasilla=this.MiCasilla;var new_x=((miCasilla.posicion.px*-1)*ClientGame.zoom)+((canvasPrincipal.width-(ClientGame.dimensiones_casilla[0]*ClientGame.zoom))/2),new_y=((miPosicion.y*-1)*ClientGame.zoom)+((canvasPrincipal.height-(this.image.height*ClientGame.zoom))/2);Game.moverCamara(new_x,new_y)}}