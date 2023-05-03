var seleccionadaEsp="vacia", seleccionadaIng="vacia", ultimaSeleccion="0",
cartaTmp="vacia",  posIng, posEsp, cartasAdentro=0, cartasGanadas=0,
modo, nivel, puntos, totalCartas, consecutivoGanada=0,
limitePartidas, sonidoFondo, mainArray, audioOn, timerOn=false, hardReset=true,
primerJuego=true, flechasAnimadas=true, modoJuego="modoTraining", bloqueoMenu=true;

$(document).ready(function () {
    cargarjuego();
    cargarEventosListeners();
    cargarClicAccesos();
});

function cargarjuego() {
  console.log("Cargando juego");
    setTimeout(function () {
      abrirMenu();
      }, 2000);
    $.getJSON( "verbos/verbs.json", function( data ) {
      //console.log(data);
      mainArray = desordenarArray(data.label, data.audio, 2);
  });
};

function abrirMenu() {
  if (primerJuego) {
    console.log("Menú en juego nuevo");
    $("#divMenu").modal({backdrop: "static"});
    primerJuego=false;
    linksMenu();
  }else {
	  $("#divMenu").modal();
      console.log("Menú en juego iniciado");
	  hardReset=true;
	  $(".divs_cerrar").css("visibility", "visible");
	  $(".divs_cerrar").click(function() {
		$("#divMenu").modal("hide");
		console.log ("Cerrando Menu en juego iniciado");
	  })
  };

}

function linksMenu() {
  console.log("links menu");

  if (bloqueoMenu==false)  {
    $("#img_opt1").attr("src","img/opt1_inactivo.png");
    $("#img_opt2").attr("src","img/opt2_inactivo.png");
    $("#img_opt3").attr("src","img/opt3_inactivo.png");

    $(".options").mouseenter(function () {
      $("#img_"+this.id).attr("src","img/"+this.id+"_activo.png");
    });
    $(".options").mouseleave(function () {
      $("#img_"+this.id).attr("src","img/"+this.id+"_inactivo.png");
    });
    $(".options").click(function () {
      // parte el string y obtiene solo el número
      // seguidamente convierte el string a integer
      modo = parseInt(this.id.slice(3,4));
      // console.log(modo);
       $("#divMenu").modal("hide");
        crearNivel();
    })
  } else {
    $("#img_opt1").attr("src","img/opt1_gris.png");
    $("#img_opt2").attr("src","img/opt2_gris.png");
    $("#img_opt3").attr("src","img/opt3_gris.png");
  }
};

function crearNivel() {
    console.log("creando el nivel");
      $("#contenedor_boton_next").fadeOut("200");
      resetJuego();
      cargarBotonesAccesos();
      cargarFondos();
      ejecutarMusicaFondo();
      var listaPorNivel  = cambiarNivel(mainArray.array1, mainArray.array2, 9,nivel);
      cargarAudioVerbos(listaPorNivel.arrayHijo2);
      cargarCartasIzq(listaPorNivel.arrayHijo1);
      cargarCartasDer(desordenarArray(listaPorNivel.arrayHijo1," ", 1));
      crearEspaciosCartasAcomodadas();
      crearAreaArrastre();
      cargarDragnDrop();
      asignarDrop();
      startWorker();
      mostrarFlechas();


}

function crearAreaArrastre() {
  var divArea = $("<div id='area_arrastrable'> </div>");
  $("#contenedor_principal").append(divArea);
  console.log("");

}

function mostrarFlechas() {
  if (flechasAnimadas) {
    flechasAnimadas=false;
    setTimeout(function () {
      $(".flechas").fadeIn();
      $("#flecha_izquierda").effect("shake", "linear", "slow", function() {
        $("#flecha_derecha").effect("shake", "linear","slow", function () {
            $(".flechas").fadeOut();
          });
            });
          }, 1000);
    }
}

function seleccionarModoJuego(btn) {
  modoJuego = btn.id;
  console.log(modoJuego);
  bloqueoMenu=false;
  switch (modoJuego) {
    case "modoTraining":
        timerOn=false;
        $("#imgTraining").attr("src",$("#imgTrainingActivo").attr("src"));
        $("#imgComp").attr("src",$("#imgCompetInactivo").attr("src"));
    break;
    case "modoCompetition":
        timerOn=true;
        $("#imgTraining").attr("src",$("#imgTrainingInactivo").attr("src"));
        $("#imgComp").attr("src",$("#imgCompetActivo").attr("src"));
    break;
    default: console.log("modo de juego desconocido");
  };
  linksMenu();
}

function ejecutarMusicaFondo() {
  console.log("musica de fondo");
  if (audioOn) {
    sonidoFondo.pause();
    sonidoFondo=null;
  }

  if (timerOn) {
    $(sonidoFondo).clearQueue();
    sonidoFondo = document.getElementById("aud_fondo2");
  }else {
    $(sonidoFondo).clearQueue();
    sonidoFondo = document.getElementById("aud_fondo1");
  }
  sonidoFondo.currentTime=0;
  sonidoFondo.play();
  audioOn=true;
  $("#img_interruptor_Audio").attr("src", "img/icon_volumen1.png");
  $("#img_interruptor_Audio").attr("alt", "Audio encendido");

}

function resetJuego() {
  //Recibe como parámetro si lo que va a resetear es todo el juego
  //o solamente el nivel

  if (hardReset==true) {
    limitePartidas=7;
    nivel=1;
    totalCartas=9;
    puntos=0;
    cartasGanadas=0;
    consecutivoGanada=0;
	teminarTiempo();
    console.log("Hard Reset");

  } else {
    consecutivoGanada=0;
    cartasGanadas=0;
    console.log("soft Reset");
  };
  $("#contenedor_fondos").empty();
  $( ".cartas" ).remove();
  $( "#pie" ).empty();
  $("#puntaje").text(puntos);
  $("#nivel").text(nivel);
}

function agregarClicInterruptorAudio() {
  if (audioOn) {
    $("#img_interruptor_Audio").attr("src", "img/icon_volumen2.png");
    $("#img_interruptor_Audio").attr("alt", "Audio Apagado");
    sonidoFondo.pause();
  }else {
    $("#img_interruptor_Audio").attr("src", "img/icon_volumen1.png");
    $("#img_interruptor_Audio").attr("alt", "Audio encendido");
    sonidoFondo.currentTime=0;
    sonidoFondo.play();
  };
  audioOn=!audioOn;
  console.log(audioOn);
}

function cambiarNivel(array1, array2, intervalo, nivel) {
  //Inicia el contador en el intevalo por nivel
    var  arrayHijo1=[], arrayHijo2=[], listArray, cont;
    cont = intervalo * nivel - intervalo;
    for (var i = 0; i < intervalo; i++) {
      arrayHijo1.push(array1[cont]);
      arrayHijo2.push(array2[cont]);
      cont++;
      //console.log("avance del vector: "+ cont);
    }
    listArray = {"arrayHijo1": arrayHijo1,"arrayHijo2": arrayHijo2}
    return listArray
}

function desordenarArray(array1, array2, cant ) {
  var longArray = array1.length, rnd1, rnd2, ite, tmp1, tmp2, listArray;
  //Define la cantidad de iteraciones que se ejecutan para desacomodar
  //el array
  ite = longArray * 2;
  switch (cant) {
    case 1:
    for (var i = 0; i < ite; i++) {
      rnd1 = Math.floor((Math.random() * longArray)),
      rnd2 = Math.floor((Math.random() * longArray));
      tmp1 = array1[rnd1];
      array1[rnd1] = array1[rnd2];
      array1[rnd2] = tmp1;
    }
    return array1
    break;
    case 2:
    for (var i = 0; i < ite; i++) {
      rnd1 = Math.floor((Math.random() * longArray)),
      rnd2 = Math.floor((Math.random() * longArray));
      tmp1 = array1[rnd1];
      array1[rnd1] = array1[rnd2];
      array1[rnd2] = tmp1;

      tmp2 = array2[rnd1];
      array2[rnd1] = array2[rnd2];
      array2[rnd2] = tmp2;
    }
    listArray = {"array1":array1, "array2":array2}
    return listArray;
    break;
    default:
      console.log("Número fuera de rango");
  }

}

function cargarFondos() {
  console.log("Cargando fondo...");
  $(".accesos").css("visibility", "visible");
  switch (modo) {
    case 1:
      $("#contenedor_fondos").attr("src","img/fondo_pantalla_spanishpair.jpg");
    break;
    case 2:
      $("#contenedor_fondos").attr("src","img/fondo_pantalla_simplepast.jpg");
    break;
    case 3:
      $("#contenedor_fondos").attr("src","img/fondo_pantalla_pastparticiple.jpg");
    break;
    default:
      console.log("fondo no encontrado");
  }

}

function cargarBotonesAccesos() {
  $("#btnAyuda").attr("src","img/btn_ayuda_inactivo.png");
  $("#btnAyuda").attr("alt","Help");
  $("#btnMenu").attr("src","img/btn_menu_inactivo.png");
  $("#btnMenu").attr("alt","Menu");
  $("#btnAcerca").attr("src","img/btn_acerca_de_inactivo.png");
  $("#btnAcerca").attr("alt","About");
}

function cargarAudioVerbos(lista) {
  //console.log(lista);
  switch (modo) {
    case 1:
      console.log("modo 1");
      for (var i = 0; i < lista.length; i++) {
      // console.log(lista[i].ing);
      $(".grupo_audios").append("<audio class='audios' preload='auto' src='audio/"+lista[i].pre+".mp3'  id='"+lista[i].pre+"'></audio>");
      }
    break;
    case 2:
      console.log("modo 2");
      for (var i = 0; i < lista.length; i++) {
      //console.log(lista[i].pre);
      $(".grupo_audios").append("<audio class='audios'  preload='auto' src='audio/"+lista[i].pre+".mp3'  id='"+lista[i].pre+"'></audio>");
      $(".grupo_audios").append("<audio class='audios'  preload='auto' src='audio/"+lista[i].pas+".mp3'  id='"+lista[i].pas+"'></audio>")
    }
    break;
    case 3:
      console.log("modo 3");
      for (var i = 0; i < lista.length; i++) {
        // console.log(lista[i].ing);
        $(".grupo_audios").append("<audio class='audios'  preload='auto' src='audio/"+lista[i].pre+".mp3'  id='"+lista[i].pre+"'></audio>");
        $(".grupo_audios").append("<audio class='audios'  preload='auto' src='audio/"+lista[i].par+".mp3'  id='"+lista[i].par+"'></audio>")
      }
      break;
  default:
  }
}

function cargarCartasIzq(lista) {
  //console.log(lista);
  switch (modo) {
    case 1:
      // modo de cartas en español
      for (var i = 0; i < lista.length; i++) {
            $("#contendorIzquierdo").append("<div class='cartas cartas_izq' id='izq"+lista[i].id+"'>"+ lista[i].esp +"</div>");
      }
    break;
    case 2:
      // modo cartas presente y pasdo simple
      for (var i = 0; i < lista.length; i++) {
            $("#contendorIzquierdo").append("<div class='cartas cartas_izq' id='izq"+lista[i].id+"'>"+ lista[i].pas +"</div>");
      };
    break;
    case 3:
    // modo 3 cartas participio
    for (var i = 0; i < lista.length; i++) {
          $("#contendorIzquierdo").append("<div class='cartas cartas_izq' id='izq"+lista[i].id+"'>"+ lista[i].par +"</div>");
    };
      break;
    default:
      console.log("No se pudo cargar el método cargarCartasIzq");
  }
}

function cargarCartasDer(lista) {
  //console.log("Cartas derecha: " + lista);
  for (var i = 0; i < lista.length; i++) {
    $("#contendorDerecho").append("<div class='cartas cartas_ing' id='ing"+lista[i].id+"'>"+ lista[i].pre +"</div>");
  }
}

function crearEspaciosCartasAcomodadas() {
  var espacioHtml="";
  for (var i = 0; i < 9; i++) {
      espacioHtml="<div class='espacioCartasAcomodadas' id='aEsp"+i+"'> . </div>"
      $("#pie").append(espacioHtml);
    };
    for (var i = 0; i < 9; i++) {
        espacioHtml="<div class='espacioCartasAcomodadas' id='aIng"+i+"'> . </div>"
        $("#pie").append(espacioHtml);
      };
}

function cargarDragnDrop() {
  var sonidoIzq, sonidoDer;
  $(".cartas_izq").draggable({
    containment: $("#area_arrastrable"),
    start:function (event, ui) {
        ultimaSeleccion="izq";
        seleccionadaEsp=this;
        posEsp = $("#"+seleccionadaEsp.id).offset();
        //Rerpdouce el sonido al arrastra la tajeta
      if (modo>1 && timerOn==false) {
        $(sonidoIzq).clearQueue();
        sonidoIzq = document.getElementById($("#"+this.id).html());
        sonidoIzq.currentTime=0;
        sonidoIzq.play();
      }
    }
  });
  $(".cartas_ing").draggable({
    containment: $("#area_arrastrable"),
    start:function (event, ui) {
        ultimaSeleccion="ing";
          seleccionadaIng=this;
          posIng = $("#"+seleccionadaIng.id).offset();
          if (timerOn==false) {
            $(sonidoDer).clearQueue();
            sonidoDer = document.getElementById($("#"+this.id).html());
            sonidoDer.currentTime=0;
            sonidoDer.play();
          }
    }
  })
}

function asignarDrop() {
  $("#principal").droppable({
    drop:function () {
      cartasAdentro++;
      //Deshabilitar para que no tome dos de una misma seguidamente
      if (ultimaSeleccion=="ing") {
        $( ".cartas_ing" ).draggable( "disable" );
        $( ".cartas_izq" ).draggable( "enable" );
        //console.log("ingles desactivado");
      }else {
        $( ".cartas_ing" ).draggable( "enable" );
        $( ".cartas_izq" ).draggable( "disable" );
        // console.log("Izquierda desactivado");
      }

      // console.log(cartasAdentro);
      if (cartasAdentro==2) {
        verificarCorrecta();
      }
    }
  });
}

function verificarCorrecta() {
  cartasAdentro=0;
    // console.log(seleccionadaIng);
    // console.log(seleccionadaEsp);
    $( ".cartas_ing" ).draggable( "enable" );
    $( ".cartas_izq" ).draggable( "enable" );
  //  console.log("todas activadas");
    if (seleccionadaIng.id.slice(3)==seleccionadaEsp.id.slice(3)) {
      cartasGanadas++;
      incrementarPuntos();
      acomodarCartasGanadas();
    } else {
      document.getElementById("aud_try").play();
	    //mostrarIntentaNuevo();
      decrementarPuntos();
      $("#"+seleccionadaIng.id).offset({top:posIng.top,left:posIng.left});
      $("#"+seleccionadaEsp.id).offset({top:posEsp.top,left:posEsp.left});
    };
    seleccionadaIng="vacia";
    seleccionadaEsp="vacia";
}

function mostrarIntentaNuevo() {
      $("#divTryAgain").modal({backdrop: false});

    setTimeout(function(){
      $("#divTryAgain").modal("hide");
    }, 500);
}

function acomodarCartasGanadas() {
  $("#"+seleccionadaIng.id).draggable("disable" );
  $("#"+seleccionadaEsp.id).draggable("disable" );
  $("#"+seleccionadaIng.id).fadeOut();
  $("#"+seleccionadaEsp.id).fadeOut();
  cartasAdentro=0;
  //Se escriben las cartas acomodadas:
  $("#aEsp"+consecutivoGanada).html($("#"+seleccionadaEsp.id).html());
  $("#aIng"+consecutivoGanada).html($("#"+seleccionadaIng.id).html());
  //Efecto animación:
  $("#aEsp"+consecutivoGanada).show("drop", {
       distance: 20,
      }, 2000, function () {
       $(this).show();
     });
  $("#aIng"+consecutivoGanada).show("drop", {
        distance: 20,
         }, 2000, function () {
          $(this).show();
        });
  consecutivoGanada++;

  //Verifica si tiene que pasar de nivel o terminar el juego
  console.log(cartasGanadas);
  if (cartasGanadas>=totalCartas) {
    nivel++
    console.log("Nivel: "+nivel);
      if (nivel>=limitePartidas) {
        mostrarFinJuego();
      }else {
            if (timerOn==false) {
              setTimeout(function () {
                document.getElementById("aud_exc").play();
                $("#nivel").text(nivel);
                hardReset=false
                $("#contenedor_boton_next").fadeIn();
              }, 1000)
            }else {
              document.getElementById("aud_exc").play();
              $("#nivel").text(nivel);
              hardReset=false
              $("#contenedor_boton_next").fadeIn();
            }
      }
 }
}

function mostrarFinJuego() {
  console.log(nivel);
  sonidoFondo.pause();
  if (nivel >= 5) {
      $("#imagen_modal").attr("src","img/oro.jpg");
      $("#imagen_modal").attr("alt","Gold Medal");
  };
  if (nivel >= 3 && nivel < 5) {
    $("#imagen_modal").attr("src","img/plata.jpg");
    $("#imagen_modal").attr("alt","Silver Medal");
  };
  if (nivel <= 2) {
    htmlcode = "<img alt='medalla de Bronce' src='img/bronce.jpg'>";
    $("#imagen_modal").attr("src","img/bronce.jpg");
    $("#imagen_modal").attr("alt","Bronze medal");
  }
      $("#divModales").modal();
      setTimeout(function () {
          $("#divModales").modal("hide");
          $("#divMenu").modal();
      }, 3000);
}

function incrementarPuntos() {
  puntos = puntos + modo * 10;
  $("#puntaje").html(puntos);
}

function decrementarPuntos() {
  puntos = puntos - modo * 10;
  $("#puntaje").html(puntos);
}

function abrirModal(opcion) {
  //console.log(opcion);
  if (opcion=="btnAyuda") {
      $("#imagen_modal").attr("src",$("#imgAyuda").attr("src"));
  };
  if (opcion=="btnAcerca") {
    $("#imagen_modal").attr("src",$("#imgAcercaDe").attr("src"));
  };
  $(".divs_cerrar").css("visibility", "visible");
  $("#divModales").modal();
  console.log("abriendo modal");
}

function cargarClicAccesos() {
  $("#btnAyuda").click(function () {
    //console.log("Ayuda");
    abrirModal(this.id);
  });
  $("#btnMenu").click(function () {
    //console.log("Menu");
    abrirMenu();
  });
  $("#btnAcerca").click(function () {
    //console.log("Acerca de");
    abrirModal(this.id);
  });
  $("#switch_audio").click(function () {
      agregarClicInterruptorAudio();
  });
  $(".modos").click(function () {
      seleccionarModoJuego(this);
  });
  $("#contenedor_boton_next").click(crearNivel);

}

function startWorker() {
  if (timerOn) {
    var datoWorker;
    $("#reloj").css("visibility", "visible");
      if(typeof(Worker) !== "undefined") {
          if(typeof(w) == "undefined") {
              w = new Worker("js/reloj.js");
          }
          w.onmessage = function(event) {
            datoWorker = event.data;
              $("#reloj").text(datoWorker);
              if (datoWorker>120) {
                //termina el worker
                  w.terminate();
                  w = undefined;
                  mostrarFinJuego();
              }
          };
      } else {
          alert("web worker no soportado");
      }
  }else {
		teminarTiempo();
  }
};

function teminarTiempo ( ) {
	  if(typeof(w) !== "undefined") {
        w.terminate();
        w = undefined;
        console.log("worker terminado");
		console.log("timer desactivado");
		$("#reloj").css("visibility", "hidden");
      }else{
		console.log("Objeto timer no existe");
	  };

}

function agregarClicInterruptorTiempo() {
  if (timerOn) {
    $("#imgSwitchTimer").attr("src","img/img_timer_off.png");
  }else {
    $("#imgSwitchTimer").attr("src","img/img_timer_on.png");
  };
  timerOn=!timerOn;
  console.log(timerOn);
}

function cargarEventosListeners() {
  $("#imgCerrar2").click(function() {
    $("#divModales").modal("hide");
  });
}
