/** ACCESS_KEY = 17e37d155baf026cabad4d2fe2ab0912
 * 
 * https://weatherstack.com/documentation
 * 
 * 
 */

var jugador1
var jugador2

jugador2 = new Jugador();
jugador1 = new Jugador();
unirmeSala()
arranca = -1


var _log = document.getElementById('log');
var _rondaActual = null;
var _partidaActual = null;
var audio = null;
var limitePuntaje = 15;
var Debug = false;


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomReal(min, max) {
    return Math.random() * (max - min + 1) + min;
}

Array.prototype.getLast = function () {
    if (this.length > 0) {
        return this[this.length - 1];
    }
    else {
        return undefined;
    }
};

//Objetos
/*************************************************************************
 * 
 * Audio 
 * 
 * **********************************************************************
 */

function Sonido(cbxSonido) {
    this.fx = {};
    this.cbx = {};
    if (cbxSonido !== null && cbxSonido !== undefined) {
        this.cbx = cbxSonido;
    } else {
        this.cbx.checked = true;
    }

    this.play = function (soundName) {
        if (this.cbx.checked && this.fx[soundName] !== null && this.fx[soundName] !== undefined) {
            this.fx[soundName].play();
        }
    }
}


/*******************************************************************
 * 
 * Clase Naipe
 * 
 *******************************************************************
*/

function Naipe(v, p, n, t) {
    this.valor = 0;
    this.puntosEnvido = 0;
    this.numero = 0;
    this.palo = '';
    if (v !== null && v !== undefined) {
        this.valor = v;
    }
    if (p !== null && p !== undefined) {
        this.puntosEnvido = p;
    }
    if (n !== null && n !== undefined) {
        this.numero = n;
    }
    if (t !== null && t !== undefined) {
        this.palo = t;
    }

}

getCSS = function (carta) {

    var x = 97.5;
    var y = 150;
    switch (carta.palo) {
        case 'Oro':
            y = y * 0;
            break;
        case 'Copa':
            y = y * -1;
            break;
        case 'Espada':
            y = y * -2;
            break;
        case 'Basto':
            y = y * -3;
            break;
    }
    x = x * -1 * (carta.numero - 1);
    return x.toString() + 'px ' + y.toString() + 'px';
}

Naipe.prototype.getNombre = function () {
    return this.numero + ' de ' + this.palo;
};
// devuelve el valor y palo de la carta

/*******************************************************************
 * 
 * Clase Jugador
 * 
 *******************************************************************
*/

function Jugador() {
    this.cartas = new Array();
    this.cartasEnMano = new Array();
    this.cartasJugadas = new Array();
    this.esHumano = true;
    this.nombre = '';
    this.puntosGanadosEnvido = 0;


    this.envidoS = new Array();
    this.realEnvido = new Array();
    this.revire = new Array();
    this.faltaEnvido = new Array();
}
// si aca hago una clase jugador 2? 

//------------------------------------------------------------------
// Genera codigo HTML para las cartas en mano
//------------------------------------------------------------------

//.PROTOTYPE metodo donde los objetos heredan caracteristicas entre si
//El método hasOwnProperty() devuelve un booleano indicando si el objeto tiene la propiedad especificada.
//El método sort() ordena los elementos de un arreglo (array) localmente y devuelve el arreglo ordenado
//El metodo splice() permite cambiar el contenido del arreglo eliminando o sustituyendo los elementos existentes por otros nuevos.

Jugador.prototype.sayCartasEnMano = function () { // poruqe le pone prototype?
    var html = '';
    console.log(this.cartasEnMano)
    for (var i = 0; i < this.cartasEnMano.length; i++) {
        if (this.cartasEnMano[i] !== undefined) {
            //html += '<li class="naipe naipe-boca-abajo"></li>'; que lo mire tolo
            if (!this.esHumano) { // mostras las cartas boca abajo?
                html += '<li class="naipe naipe-boca-abajo"></li>';
            } else {
                var estilo = ' style="background-position: ' + getCSS(this.cartasEnMano[i]) + ';"';
                html += '<li><a href="#" class="naipe naipe-humano"  data-naipe-index="' + i + '" ' + estilo + '></a></li>';
            }
        }
    }
    if (this.esHumano) {
        $('#player-one').find('.player-cards').html(html);
        //document.getElementsByClassName("player-cards")[1].hidden = true
    } else {
        $('#player-two').find('.player-cards').html(html);
    }
}
//------------------------------------------------------------------
//  Determina los puntos de envido en la mano del jugador
//------------------------------------------------------------------

Jugador.prototype.getPuntosDeEnvido = function (cartas) {
    var pares = {
        Espada: new Array(),
        Basto: new Array(),
        Oro: new Array(),
        Copa: new Array()
    };
    for (var i = 0; i < cartas.length; i++) {
        var carta = cartas[i];
        if (carta !== undefined) {
            pares[carta.palo].push(carta.puntosEnvido);
        }
    }
    var puntos = 0;
    var prop;
    for (prop in pares) {
        if (pares.hasOwnProperty(prop)) {
            if (pares[prop].length >= 2) {
                puntos = 20 + pares[prop][0] + pares[prop][1];
                break;
            }
        }
    }
    if (puntos === 0) {
        var maximo = 0;
        for (prop in pares) {
            if (pares[prop].length > 0 && maximo < pares[prop][0]) {
                maximo = pares[prop][0];
            }
        }
        puntos = maximo;
    }
    return puntos;
}
// carta tirada por persona
// tirar carta, lo saca de cartasEnMano
Jugador.prototype.jugarCarta = function (index) {
    if (index !== null && index !== undefined && this.cartasEnMano.length > index) {
        var carta = this.cartasEnMano[index];
        enviarMovimiento(carta)
        _log.innerHTML = '<b>' + this.nombre + ' juega un :</b> ' + carta.getNombre + '<br /> ' + _log.innerHTML;
        //Aca creo q deberiamos emitir la carta jugada
        this.cartasJugadas.push(carta);
        console.log(this.cartasJugadas)
        this.cartasEnMano.splice(index, 1);
        return carta;
    }
}

function Probabilidad() {
    // Parametros para calcular la probabilidad de los puntos
    this.m1 = 0.15;
    this.m2 = 0.25; // antes ->  0.20;
    // Parametros para la carta vista
    this.cv1 = -20;
    this.cv2 = 20;
}
//------------------------------------------------------------------
//  considera los puntos de envido de la maquina
//------------------------------------------------------------------

Probabilidad.prototype.ponderarPuntos = function (puntos) {
    var pen1 = this.m1 / 7;
    var pen2 = (1 - this.m2) / (33 - 20);
    var h = 1 - 33 * pen2;

    if (puntos <= 7) return puntos * pen1;
    else return puntos * pen2 + h;

}
//------------------------------------------------------------------
//  considera la carta jugada del humano para envido
//------------------------------------------------------------------

Probabilidad.prototype.CartaVista = function (carta) {
    if (carta === undefined) return 0;
    else {
        var e = carta.puntosEnvido;
        var m = (this.cv2 - this.cv1) / 7;
        var h = this.cv1;
        return e * m + h;
    }
}
//------------------------------------------------------------------
// Calcula la media de un vector (Para determinar el canto usual del humano)
//------------------------------------------------------------------

Probabilidad.prototype.promedioPuntos = function (pcc) {
    if (pcc.length === 0) return null;
    var t = pcc.sort(function (a, b) { return a - b });
    if (t.length % 2 == 0) return (t[t.length / 2] + t[t.length / 2 - 1]) / 2;
    else return t[(t.length - 1) / 2];
}


Probabilidad.prototype.promedioTruco = function (cartas) {
    var suma = 0;
    for (var i = 0; i < cartas.length; i++)
        suma = suma + cartas[i].probGanar();
    return (suma / cartas.length);
}

/*******************************************************************
 * 
 * Clase Ronda
 * 
 *******************************************************************
*/
// aca puede haber algo de que equipo es cada uno
function Ronda(equipo1, equipo2) {
    this.equipoPrimero1 = equipo1;
    this.equipoSegundo2 = equipo2;
    this.numeroDeMano = 0;
    this.jugadasEnMano = 0;
    this.equipoEnTurno = null;
    this.enEspera = false;
    // Variables de entorno para manejar el envido		
    this.puedeEnvido = true;
    this.cantos = new Array();   // Posibles valores: "E" "EE" "RE" "FE"
    this.equipoEnvido = null;
    this.quienCanto = new Array();  //mantiene corresp biunivoca entre lo cantado y el que lo cant'o 
    this.envidoStatsFlag = true;
    this.puntosGuardados = null;
    //Variables para manejar el truco
    this.equipoTruco = null;
    this.puedeTruco = null;
    this.noQuiso = null;
    this.truco = new Array();
}
//------------------------------------------------------------------
// puede servir para socket
//------------------------------------------------------------------


Ronda.prototype.equipoEnEspera = function (e) {

    if (e === this.equipoPrimero) {
        return this.equipoSegundo;
    }
    else if (e === this.equipoSegundo) {
        return this.equipoPrimero;
    }
    else {
        return null;
    }

}
//------------------------------------------------------------------

//------------------------------------------------------------------

Ronda.prototype.pasarTurno = function () {
    if (this.equipoEnTurno === this.equipoPrimero) {
        this.equipoEnTurno = this.equipoSegundo;
    } else {
        this.equipoEnTurno = this.equipoPrimero;
    }
    this.jugadasEnMano = this.jugadasEnMano + 1;
}

//------------------------------------------------------------------
// Inicia la ronda
//------------------------------------------------------------------

var miPartida = new Partida();
Ronda.prototype.iniciar = function () {
    socket.on("usuario-unido", data => {
        if (data.user != localStorage.getItem("user")) {
            console.log("data",data.user) // data.user es con el que te unis
            console.log("local",localStorage.getItem("user")) // user es con el que se une la otr persona
            equipo1 = data.user // EL QUE SE UNE SEGUNDO VA A SER J1
            equipo2 = localStorage.getItem("user") // EL QUE SE UNE PRIMERO VA A SER J2
            this.equipoSegundo2 = equipo2
            this.equipoPrimero1 = equipo1
            arranca = 1
            socket.emit('arranca-partida', data )

        }
    });
    /* EL SEGUNDO QUE SE UNE ARRANCA TIRANDO LA CARTA DEL JUGADOR QUE PRIMERO SE UNIO, CUANDO EL DEBERIA SER MANO Y TIRAR SU CARTA PRIMERO
    (ERROR AL DECLARAR ORDEN DE EQUIPO PRIMER Y EQUIPOSEGUNDO)  */
    // el segundo que se une tiene que ser j2
    socket.on("arranco-partida", data => {
        if (arranca == -1) {
            arranca = 1
            jugador1.cartas = [...data.repartir];
            jugador2.cartas = [...data.repartir2];
            jugador1.cartasEnMano = [...data.repartir];
            jugador2.cartasEnMano = [...data.repartir2];

            jugador1.sayCartasEnMano();


            miPartida.equipoPrimero.jugador = jugador1
            //this.equipoPrimero.jugador = miPartida.equipoPrimero.jugador
            miPartida.equipoPrimero.esMano = false
            //this.equipoPrimero.esMano = miPartida.equipoPrimero.esMano

            miPartida.equipoSegundo.jugador = jugador2
            //this.equipoSegundo.jugador = miPartida.equipoSegundo.jugador
            miPartida.equipoSegundo.esMano = true
            //this.equipoSegundo.esMano = miPartida.equipoSegundo.esMano

            console.log("meti", miPartida )
            // new Ronda(this.equipoPrimero, this.equipoSegundo);
            socket.emit('mando-cartas', {data : jugador2} )
        }
     });
     
     
    if (miPartida.equipoPrimero.esMano) {
        miPartida.equipoPrimero.esSuTurno = true;
        miPartida.equipoEnTurno = this.equipoPrimero;
    } else {
        miPartida.equipoSegundo.esSuTurno = true;
        miPartida.equipoEnTurno = this.equipoSegundo;
    }
    miPartida.equipoPrimero.jugador.sayCartasEnMano();
    if (Debug)
    miPartida.equipoSegundo.jugador.sayCartasEnMano();
    if (Debug)
    $('.game-deck').find('.card').css('background-image', 'none');


}

//------------------------------------------------------------------
// En este momento se puede jugar una carta o hacer un canto
//------------------------------------------------------------------


Ronda.prototype.decidirCarta = function () {
    if (this.equipoEnTurno !== null) {
        if (this.equipoEnTurno.jugador.esHumano) {
            // Habilitamos los botones
            this.enEspera = true;
            _rondaActual = this;
            $("#Quiero").hide();
            $("#NoQuiero").hide();
            $('.label-cantos--SN').hide();
            $(".canto").hide();
            $(".cantot").hide();
            //  Envido del Humano
            if (this.puedeEnvido === true) {
                $(".canto").show();
                $(".canto").unbind('click').click(function (event) {
                    var c = $(this).attr('data-envido');
                    _rondaActual.puedeEnvido = false;
                    _rondaActual.cantos.push(c);
                    _rondaActual.quienCanto.push('H');
                    _rondaActual.equipoEnvido = _rondaActual.equipoEnEspera(_rondaActual.equipoEnTurno);
                    _rondaActual.logCantar(_rondaActual.equipoEnTurno.jugador, c);
                    _rondaActual.enEspera = false;
                    $(this).unbind('click');
                    //deshabilito los cantos correspondientes
                    $(".boton").hide();
                    _rondaActual.continuarRonda();

                });
            }
            //  Truco del humano
            if (this.puedeTruco === null || this.puedeTruco === this.equipoEnTurno) {
                var ultimo = this.truco.getLast();
                switch (ultimo) {
                    case 'T':
                        $('#reTruco').show();
                        break;
                    case 'RT':
                        $('#vale4').show();
                        break;
                    case 'V':
                        break;
                    default:
                        $('#Truco').show();
                        break;
                }
                $(".cantot").unbind('click').click(function (event) {
                    //alert("AAA");
                    var c = $(this).attr('data-truco');
                    _rondaActual.truco.push(c);
                    _rondaActual.equipoTruco = _rondaActual.equipoEnEspera(_rondaActual.equipoEnTurno);
                    _rondaActual.logCantar(_rondaActual.equipoEnTurno.jugador, c);
                    _rondaActual.enEspera = false;
                    $(".boton").hide();
                    $(this).unbind('click');
                    _rondaActual.continuarRonda();
                });
            }
            $('#IrAlMazo').unbind('click').click(function (event) {
                if (_rondaActual.equipoEnvido !== null) {
                    _rondaActual.jugarEnvido(false);
                }
                var puntosTruco = _rondaActual.calcularPuntosTruco();
                _rondaActual.equipoSegundo.puntos += puntosTruco.querido;
                _rondaActual.continuarRonda(_rondaActual.equipoSegundo);
                _rondaActual.logCantar(_rondaActual.equipoPrimero.jugador, 'M');
            });
            //  Jugar una carta del Humano
            $('.naipe-humano').unbind('click.jugar').not('.naipe-jugado').bind('click.jugar', function (event) {
                event.preventDefault();
                var $naipe = $(this);
                $naipe.addClass('naipe-jugado');
                var $elementoPosicionador = $('.card-' + (_rondaActual.numeroDeMano * 2 + 1));
                $naipe.css("-ms-transform", "translate(" + ($elementoPosicionador.offset().left - $naipe.offset().left) + "px, " + ($elementoPosicionador.offset().top - $naipe.offset().top) + "px )")
                    .css("-o-transform", "translate(" + ($elementoPosicionador.offset().left - $naipe.offset().left) + "px, " + ($elementoPosicionador.offset().top - $naipe.offset().top) + "px )")
                    .css("-webkit-transform", "translate(" + ($elementoPosicionador.offset().left - $naipe.offset().left) + "px, " + ($elementoPosicionador.offset().top - $naipe.offset().top) + "px )")
                    .css("-moz-transform", "translate(" + ($elementoPosicionador.offset().left - $naipe.offset().left) + "px, " + ($elementoPosicionador.offset().top - $naipe.offset().top) + "px )")
                    .css("transform", "translate(" + ($elementoPosicionador.offset().left - $naipe.offset().left) + "px, " + ($elementoPosicionador.offset().top - $naipe.offset().top) + "px )");


                var delay = function () {
                    $elementoPosicionador.css('background-image', $naipe.css('background-image'));
                    $elementoPosicionador.css('background-position', $naipe.css('background-position'));
                    $naipe.parent().addClass('naipe-animated');
                    setTimeout(function () {
                        $naipe.parent().addClass('naipe-remove');
                    }, 150);
                }

                setTimeout(delay, 1000);

                var index = parseInt($(this).attr('data-naipe-index'), 10);

                $('.naipe-humano').not('.naipe-jugado').each(function () {
                    var aux = parseInt($(this).attr('data-naipe-index'), 10);
                    if (aux > index) $(this).attr('data-naipe-index', (aux - 1));
                });
                _rondaActual.equipoEnTurno.jugador.jugarCarta(index);
                _rondaActual.enEspera = false;
                $('.naipe-humano').unbind('click.jugar');
                _rondaActual.pasarTurno();
                _rondaActual.continuarRonda();
            });
        } else {
            _rondaActual = this;
            // La maquina decide si cantar ENVIDO
            if (_rondaActual.puedeEnvido === true) {
                var carta = this.equipoPrimero.jugador.cartasJugadas.getLast();
                var accion = this.equipoSegundo.jugador.envido(this.cantos.getLast(), this.calcularPuntosEnvido().ganador, carta);
                if (accion !== '') {
                    audio.play(accion);
                    _rondaActual.puedeEnvido = false;
                    _rondaActual.cantos.push(accion);
                    _rondaActual.quienCanto.push('M');
                    _rondaActual.equipoEnvido = _rondaActual.equipoEnEspera(_rondaActual.equipoEnTurno);
                    _rondaActual.logCantar(_rondaActual.equipoEnTurno.jugador, accion);
                    return;
                }
            }

            if (this.puedeTruco === null || this.puedeTruco === this.equipoEnTurno) {
                var cantoMaquina = this.equipoSegundo.jugador.truco(false, _rondaActual.truco.getLast());
                if (cantoMaquina !== '') {
                    var delay = 0;
                    _playerVoice = $('#player-two').find('.player-voice');
                    if (_playerVoice.hasClass('recien-cantado')) {
                        delay = 1500;
                    }
                    setTimeout(function () {
                        audio.play(cantoMaquina);
                        _rondaActual.logCantar(_rondaActual.equipoEnTurno.jugador, cantoMaquina);

                    }, delay);
                    _rondaActual.truco.push(cantoMaquina);
                    _rondaActual.equipoTruco = _rondaActual.equipoEnEspera(_rondaActual.equipoEnTurno);
                    _rondaActual.puedeTruco = _rondaActual.equipoEnEspera(_rondaActual.equipoEnTurno);
                    return;
                }
            }
            var carta = this.equipoEnTurno.jugador.jugarCarta(); //ACA JUEGA LA CARTA LA IA
            var $elementoPosicionador = $('.card-' + (this.numeroDeMano + 1) * 2);
            var $card = $('#player-two').find('li:eq(' + (this.equipoEnTurno.jugador.cartasJugadas.length - 1).toString() + ')');
            //console.log("$card ", $card)
            $card.css('background-position', carta.getCSS())
                .css("-o-transform", "translate(" + ($elementoPosicionador.offset().left - $card.offset().left) + "px, " + ($elementoPosicionador.offset().top - $card.offset().top) + "px )")
                .css("-ms-transform", "translate(" + ($elementoPosicionador.offset().left - $card.offset().left) + "px, " + ($elementoPosicionador.offset().top - $card.offset().top) + "px )")
                .css("-webkit-transform", "translate(" + ($elementoPosicionador.offset().left - $card.offset().left) + "px, " + ($elementoPosicionador.offset().top - $card.offset().top) + "px )")
                .css("-moz-transform", "translate(" + ($elementoPosicionador.offset().left - $card.offset().left) + "px, " + ($elementoPosicionador.offset().top - $card.offset().top) + "px )")
                .css("transform", "translate(" + ($elementoPosicionador.offset().left - $card.offset().left) + "px, " + ($elementoPosicionador.offset().top - $card.offset().top) + "px )");
            var delay = function () {
                $elementoPosicionador.css('background-image', $card.css('background-image'));
                $elementoPosicionador.css('background-position', $card.css('background-position'));
                $card.attr('style', 'display:none!important;');
            }
            setTimeout(delay, 1000);
            this.pasarTurno();
        }
    }
}

//------------------------------------------------------------------
// ALgun jugador canto truco y el otro tiene que responder
//------------------------------------------------------------------

Ronda.prototype.decidirTruco = function () {
    if (this.equipoTruco.jugador.esHumano) {
        var _btnsCantoTruco = $('.cantot').hide();
        $('.boton').show();
        $('.label-cantos--SN').show();
        var ultimoCanto = this.truco.getLast();
        switch (ultimoCanto) {
            case 'T':
                $('#reTruco').show();
                break;
            case 'RT':
                $('#vale4').show();
                break;
        }
        this.enEspera = true;
        _rondaActual = this;

        _btnsCantoTruco.unbind('click').click(function (event) {
            var c = $(this).attr('data-truco');
            _rondaActual.logCantar(_rondaActual.equipoTruco.jugador, c);
            _rondaActual.truco.push(c);
            _rondaActual.equipoTruco = _rondaActual.equipoEnEspera(_rondaActual.equipoTruco);
            _rondaActual.enEspera = false;
            $(this).unbind('click');
            _rondaActual.continuarRonda();
        })

        $("#Quiero").unbind('click').click(function (event) {
            _rondaActual.logCantar(_rondaActual.equipoTruco.jugador, "S");
            _rondaActual.equipoTruco = null;
            _rondaActual.enEspera = false;
            _rondaActual.puedeTruco = _rondaActual.equipoPrimero;
            $(this).unbind('click');
            _rondaActual.continuarRonda();
        });

        $("#NoQuiero").unbind('click').click(function (event) {
            _rondaActual.logCantar(_rondaActual.equipoTruco.jugador, "N");
            _rondaActual.noQuiso = _rondaActual.equipoTruco;
            _rondaActual.enEspera = false;
            $(this).unbind('click');
            _rondaActual.continuarRonda();
        });
    } else {
        var cantoRespuesta = this.equipoSegundo.jugador.truco(true, _rondaActual.truco.getLast());
        audio.play(cantoRespuesta);
        _rondaActual.logCantar(_rondaActual.equipoTruco.jugador, cantoRespuesta);
        switch (cantoRespuesta) {
            case 'S': // Si quiero
                _rondaActual.puedeTruco = _rondaActual.equipoSegundo;
                _rondaActual.equipoTruco = null;
                break;
            case 'N': // No quiero
                _rondaActual.noQuiso = _rondaActual.equipoTruco;
                break;
            default:  // Re Truco
                _rondaActual.truco.push(cantoRespuesta);
                _rondaActual.equipoTruco = _rondaActual.equipoEnEspera(_rondaActual.equipoTruco);
                break;
        }
    }
}
//------------------------------------------------------------------
// Responder envido
//------------------------------------------------------------------

Ronda.prototype.decidirEnvido = function () {
    if (this.equipoEnvido.jugador.esHumano) {
        var ultimoCanto = this.cantos.getLast();
        var _canto = $('.canto').hide();
        var _quiero = $("#Quiero").show();
        var _noQuiero = $("#NoQuiero").show();
        $('.label-cantos--SN').show();
        switch (ultimoCanto) {
            case 'E':
                $('#Envido').show();
            case 'EE':
                $('#RealEnvido').show();
            case 'R':
                $('#FaltaEnvido').show();
        }
        this.enEspera = true;
        _rondaActual = this;
        // que es el . unbind y porque esta tachado
        _canto.unbind('click').click(function (event) {
            var c = $(this).attr('data-envido');
            if (ultimoCanto === "E" && c === "E") c = "EE";
            _rondaActual.logCantar(_rondaActual.equipoEnvido.jugador, c);
            _rondaActual.cantos.push(c);
            _rondaActual.quienCanto.push('H');
            _rondaActual.equipoEnvido = _rondaActual.equipoEnEspera(_rondaActual.equipoEnvido);
            _rondaActual.enEspera = false;
            $(this).unbind('click');
            _rondaActual.continuarRonda();
        });
        _quiero.unbind('click').click(function (event) {
            _rondaActual.logCantar(_rondaActual.equipoEnvido.jugador, "S");
            _rondaActual.jugarEnvido(true);
            _rondaActual.enEspera = false;
            $(this).unbind('click');
            _rondaActual.continuarRonda();
        });

        _noQuiero.unbind('click').click(function (event) {
            _rondaActual.logCantar(_rondaActual.equipoEnvido.jugador, "N");
            _rondaActual.jugarEnvido(false);
            _rondaActual.enEspera = false;
            $(this).unbind('click');
            _rondaActual.continuarRonda();
        });

    } else {
        _rondaActual = this;
        var carta = this.equipoPrimero.jugador.cartasJugadas.getLast();
        var accion = this.equipoSegundo.jugador.envido(this.cantos.getLast(), this.calcularPuntosEnvido().ganador, carta);
        if (accion !== '') {
            audio.play(accion);
            if (accion === 'S' || accion === 'N') {
                _rondaActual.logCantar(_rondaActual.equipoEnvido.jugador, accion);
                _rondaActual.jugarEnvido((accion === 'S') ? true : false);
            } else {
                _rondaActual.cantos.push(accion);
                _rondaActual.quienCanto.push('M');
                _rondaActual.logCantar(_rondaActual.equipoEnvido.jugador, accion);
                _rondaActual.equipoEnvido = _rondaActual.equipoEnEspera(_rondaActual.equipoEnvido);
            }
        }

    }
}


//------------------------------------------------------------------
// Flujo central de la ronda
//------------------------------------------------------------------

Ronda.prototype.continuarRonda = function (gano) {
    var ganador = null;
    if (gano !== null && gano !== undefined) {
        ganador = gano;

    }
    while (ganador === null) {
        if (this.jugadasEnMano === 2 || this.noQuiso != null) {
            if (this.jugadasEnMano === 2) {
                this.puedeEnvido = false;
                this.jugadasEnMano = 0;
                this.equipoEnTurno = this.determinarGanadorMano(this.numeroDeMano);
            }
            ganador = this.determinarGanadorRonda();
            this.numeroDeMano = this.numeroDeMano + 1;
            if (this.numeroDeMano === 3 || ganador !== null) {
                break;
            }
        }

        if (this.equipoEnvido === null && this.equipoTruco === null)
            this.decidirCarta();
        else if (this.equipoEnvido !== null)
            this.decidirEnvido();
        else
            this.decidirTruco();
        if (this.enEspera === true) break;
    }
    if (ganador !== null) {
        _rondaActual = this;
        var repartir = function () {
            _log.innerHTML = 'Resultado Ronda: <b><i>' + ganador.nombre + '</i></b>' + '<br /> ' + _log.innerHTML;

           /* if (_rondaActual.envidoStatsFlag && _rondaActual.equipoPrimero.jugador.cartasJugadas.length === 3) {
                var puntosEnv = _rondaActual.equipoPrimero.jugador.getPuntosDeEnvido(_rondaActual.equipoPrimero.jugador.cartasJugadas);
                _rondaActual.equipoSegundo.jugador.statsEnvido(_rondaActual.cantos, _rondaActual.quienCanto, puntosEnv);
            }*/
            _partidaActual.continuar();
        }

        var juntarNaipes = function () {
            $('.naipe').remove();
        }

        setTimeout(juntarNaipes, 2000);
        setTimeout(repartir, 2500);
    }
}
//------------------------------------------------------------------
// Determina quien gana el envido 
//------------------------------------------------------------------

Ronda.prototype.jugarEnvido = function (quiere_envido) {
    var puntos = this.calcularPuntosEnvido();
    if (quiere_envido) {
        if (this.equipoPrimero.esMano) {
            var primero = this.equipoPrimero; var p1 = primero.jugador.getPuntosDeEnvido(primero.jugador.cartas);
            var segundo = this.equipoSegundo; var p2 = segundo.jugador.getPuntosDeEnvido(segundo.jugador.cartas);
        } else {
            var primero = this.equipoSegundo; var p1 = primero.jugador.getPuntosDeEnvido(primero.jugador.cartas);
            var segundo = this.equipoPrimero; var p2 = segundo.jugador.getPuntosDeEnvido(segundo.jugador.cartas);
        }

        this.logCantar(primero.jugador, p1);
        if (this.envidoStatsFlag && primero === this.equipoPrimero) { // persona Canta primero, Registro los puntos
            this.equipoSegundo.jugador.statsEnvido(this.cantos, this.quienCanto, p1);
            this.puntosGuardados = p1;
            this.envidoStatsFlag = false;
        }

        if (p2 > p1) {
            this.logCantar(segundo.jugador, p2);
            if (this.envidoStatsFlag && segundo === this.equipoPrimero) { // Humano canta para ganarme
                this.equipoSegundo.jugador.statsEnvido(this.cantos, this.quienCanto, p2);
                this.puntosGuardados = p2;
                this.envidoStatsFlag = false;
            }
            segundo.jugador.puntosGanadosEnvido = puntos.ganador;
            segundo.puntos += puntos.ganador;

        } else { // NO CANTA
            primero.puntos += puntos.ganador;
            primero.jugador.puntosGanadosEnvido = puntos.ganador;
        }

    } else { // No Quiero
        var ganador = this.equipoEnEspera(this.equipoEnvido);
        ganador.puntos += puntos.perdedor;
        ganador.jugador.puntosGanadosEnvido = puntos.perdedor;
    }

    this.puedeEnvido = false;
    this.equipoEnvido = null;

}
//------------------------------------------------------------------
// Calcula los puntos de Envido para le ganador y el perdedor
//------------------------------------------------------------------

Ronda.prototype.calcularPuntosEnvido = function () {
    var g = 0, p = 0;
    for (var c in this.cantos) {
        switch (this.cantos[c]) {
            case 'E':
                g += 2;
                p += 1;
                break;
            case 'EE':
                g += 2;
                p += 1;
                break;
            case 'R':
                g += 3;
                p += 1;
                break;
            case 'F':
                g = limitePuntaje - (this.equipoPrimero.puntos < this.equipoSegundo.puntos ? this.equipoSegundo.puntos : this.equipoPrimero.puntos);          // GANA EL PARTIDO POR EL MOMENTO
                p += 1;
                break;
        }
    }
    return { ganador: g, perdedor: p };
}
//------------------------------------------------------------------
// Calcula los puntos de truco 
//------------------------------------------------------------------

Ronda.prototype.calcularPuntosTruco = function () {
    var g = 0, p = 0;
    var c = this.truco.getLast();
    switch (c) {
        case 'T':
            g = 2;
            p = 1;
            break;
        case 'RT':
            g = 3;
            p = 2;
            break;
        case 'V':
            g = 4;
            p = 3;
            break;
        default: //si no se canto truco la ronda vale 1 punto
            g = 1;
            break;
    }
    return { querido: g, noQuerido: p };
}
//------------------------------------------------------------------
// Escribe en el log quien canto
//------------------------------------------------------------------

Ronda.prototype.logCantar = function (jugador, canto) {
    var _playerVoice = null;
    if (this.equipoPrimero.jugador == jugador) {
        _playerVoice = $('#player-one').find('.player-voice');
    } else {
        _playerVoice = $('#player-two').find('.player-voice');
    }
    var mensaje = '';
    switch (canto) {
        case "E":
        case "EE":
            mensaje += "Envido";
            break;
        case "R":
            mensaje += "Real Envido";
            break;
        case "F":
            mensaje += "Falta Envido";
            break;
        case "T":
            mensaje += "Truco!";
            break;
        case "RT":
            mensaje += "Quiero RE-Truco!";
            break;
        case "V":
            mensaje += "Quiero vale Cuatro!";
            break;
        case "S":
            mensaje += "Quiero";
            break;
        case "N":
            mensaje += "No Quiero";
            break;
        case "M":
            mensaje += "Me voy al mazo.";
            break;
        default:
            mensaje += canto;
            break;
    }
    _playerVoice.html(mensaje).addClass('recien-cantado').attr('data-mensaje', mensaje);
    setTimeout(function () {
        _playerVoice.html('').removeClass('recien-cantado');
        setTimeout(function () {
            if (_playerVoice.attr('data-mensaje') === mensaje) {
                _playerVoice.html('');
            }
        }, 500);
    }, 1300);
}

//------------------------------------------------------------------
// Determina el ganador de una mano
//------------------------------------------------------------------

Ronda.prototype.determinarGanadorMano = function (indice, acumularPuntos) {
    if (acumularPuntos == undefined || acumularPuntos == null) {
        acumularPuntos = true;
    }

    // aca declara quien es quien podria hacer esto yo 
    var j1 = this.equipoPrimero.jugador;
    var j2 = this.equipoSegundo.jugador;
    //console.log(this.equipoSegundo.jugador)
    if (j1.cartasJugadas[indice].valor > j2.cartasJugadas[indice].valor) {
        //console.log(indice)
        if (acumularPuntos) {
            this.equipoPrimero.manos = this.equipoPrimero.manos + 1;
        }
        _log.innerHTML = '<i> GANA ' + this.equipoPrimero.jugador.nombre + '</i><br />' + _log.innerHTML;
        $('.game-deck').find('.card-' + (this.numeroDeMano * 2 + 1).toString()).css('z-index', 100);
        $('.game-deck').find('.card-' + (this.numeroDeMano * 2 + 2).toString()).css('z-index', 0);
        return this.equipoPrimero;
    } else {
        if (j1.cartasJugadas[indice].valor < j2.cartasJugadas[indice].valor) {
            //console.log(indice)
            if (acumularPuntos) {
                this.equipoSegundo.manos = this.equipoSegundo.manos + 1;
            }

            $('.game-deck').find('.card-' + ((this.numeroDeMano + 1) * 2).toString()).css('z-index', 100);
            $('.game-deck').find('.card-' + ((this.numeroDeMano + 1) * 2 - 1).toString()).css('z-index', 0);
            _log.innerHTML = ' <i> GANA ' + this.equipoSegundo.jugador.nombre + '</i><br />' + _log.innerHTML;
            return this.equipoSegundo;
        } else {
            if (acumularPuntos) {
                this.equipoPrimero.manos = this.equipoPrimero.manos + 1;
                this.equipoSegundo.manos = this.equipoSegundo.manos + 1;
            }
            _log.innerHTML = '<i>PARDA</i><br />' + _log.innerHTML;
            if (this.equipoPrimero.esMano) {
                return this.equipoPrimero;
            } else {
                return this.equipoSegundo;
            }
        }
    }
}
//------------------------------------------------------------------
// Determina el ganador de la ronda
//------------------------------------------------------------------

Ronda.prototype.determinarGanadorRonda = function () {
    var e1 = this.equipoPrimero;
    var e2 = this.equipoSegundo;
    //console.log(this.equipoSegundo)
    var puntosTruco = this.calcularPuntosTruco();
    if (this.noQuiso !== null) {
        var equipoGanador = this.equipoEnEspera(this.noQuiso);
        equipoGanador.puntos += puntosTruco.noQuerido;
        return equipoGanador.jugador;
    } else if (e1.manos === e2.manos && (e1.manos === 3 || e1.manos === 2)) {
        if (e1.manos === 3) {
            if (e1.esMano) {
                //e1.puntos = e1.puntos + 1;
                e1.puntos = e1.puntos + puntosTruco.querido;
                return e1.jugador;
            } else {
                e2.puntos = e2.puntos + puntosTruco.querido;
                return e2.jugador;
            }
        } else {
            if (e1 === this.determinarGanadorMano(0, false)) {
                e1.puntos = e1.puntos + puntosTruco.querido;
                return e1.jugador;
            } else {
                e2.puntos = e2.puntos + puntosTruco.querido;
                return e2.jugador;
            }
        }
    } else {
        if (e1.manos == 2 && e1.manos > e2.manos) {
            e1.puntos = e1.puntos + puntosTruco.querido;
            return e1.jugador;
        } else {
            if (e2.manos == 2 && e2.manos > e1.manos) {
                e2.puntos = e2.puntos + puntosTruco.querido;
                return e2.jugador;
            } else {
                //console.log("j1: " + e1.manos + "j2: " + e2.manos);
                return null;
            }
        }
    }

}

/*******************************************************************
 * 
 * Clase Partida
 * 
 *******************************************************************
*/

function Partida() {
    this.equipoPrimero = {
        jugador: {},
        puntos: 0,
        esMano: true,
        manos: 0,
        esSuTurno: true
    };
    this.equipoSegundo = {
        jugador: {},
        puntos: 0,
        esMano: false,
        manos: 0,
        esSuTurno: false
    };
}
//------------------------------------------------------------------
// Inicia la partidajugador
//------------------------------------------------------------------

Partida.prototype.iniciar = function (nombreJugadorUno, nombreJugadorDos) {
    if (nombreJugadorUno !== null && nombreJugadorUno !== undefined && nombreJugadorUno !== '') {
        jugador1.nombre = nombreJugadorUno;
    } else {
        jugador1.nombre = 'Jugador 1';
    }
    this.equipoPrimero.jugador = jugador1;
    //var maquina = new IA();
    //maquina.prob = new Probabilidad();
    //maquina.esHumano = false;
    if (nombreJugadorDos !== null && nombreJugadorDos !== undefined && nombreJugadorDos !== '') {
        jugador2.nombre = nombreJugadorDos;
    } else {
        jugador2.nombre = 'jugador 2';
    }
    this.equipoSegundo.jugador = jugador2;

    var _$tbl = $('#game-score');
    _$tbl.find('.player-one-name').html(jugador1.nombre);
    _$tbl.find('.player-two-name').html(jugador2.nombre);
    _$tbl.find('.player-one-points').html('');
    _$tbl.find('.player-two-points').html('');
    $('#player-two').find('.player-name').html(jugador2.nombre);
    $('#player-one').find('.player-name').html(jugador1.nombre);

    this.continuar();
}
//------------------------------------------------------------------
// Continua la partida, una nueva ronda
//------------------------------------------------------------------

Partida.prototype.continuar = function () {
    limitePuntaje = parseInt($('.rbd-ptos-partida:checked').val(), 10);
    while (this.equipoPrimero.puntos < limitePuntaje && this.equipoSegundo.puntos < limitePuntaje) {
        var _$tbl = $('#game-score');
        _log.innerHTML = "";
        _$tbl.find('.player-one-points').html(this.equipoPrimero.puntos);
        _$tbl.find('.player-two-points').html(this.equipoSegundo.puntos);
        _log.innerHTML = '<hr />' + '<br /> Puntaje parcial : ' + this.equipoPrimero.jugador.nombre + ' ' + this.equipoPrimero.puntos + ' - ' + this.equipoSegundo.jugador.nombre + ' ' + this.equipoSegundo.puntos + '<br /> ' + '<hr />' + _log.innerHTML;
        if (this.equipoSegundo.esMano) {
            this.equipoSegundo.esMano = false;
            this.equipoPrimero.esMano = true;
        } else {
            this.equipoSegundo.esMano = true;
            this.equipoPrimero.esMano = false;
        }
        if (Debug)
            $('#player-one').find('.player-name').html("Envido: " + this.equipoSegundo.jugador.prob.promedioPuntos(this.equipoSegundo.jugador.envidoS) + " - " +
                "EE: " + this.equipoSegundo.jugador.prob.promedioPuntos(this.equipoSegundo.jugador.revire) + " - " +
                "RE: " + this.equipoSegundo.jugador.prob.promedioPuntos(this.equipoSegundo.jugador.realEnvido) + " - " +
                "TODO: " + this.equipoSegundo.jugador.prob.promedioPuntos(this.equipoSegundo.jugador.realEnvido.concat(this.equipoSegundo.jugador.revire, this.equipoSegundo.jugador.envidoS))
            );

        var ronda = new Ronda(this.equipoPrimero, this.equipoSegundo);
        ronda.iniciar();
        if (ronda.enEspera) {
            break;
        }

    }
    if ((this.equipoPrimero.puntos >= limitePuntaje || this.equipoSegundo.puntos >= limitePuntaje)) {
        swal({
            title: "Ganaste",
            icon: "success",
            button: "Ok!",
        });
        _log.innerHTML = '<hr />' + '<br /> PUNTAJE FINAL : ' + this.equipoPrimero.jugador.nombre + ' ' + this.equipoPrimero.puntos + ' - ' + this.equipoSegundo.jugador.nombre + ' ' + this.equipoSegundo.puntos + _log.innerHTML;
    }
}

$(document).ready(function () {
    audio = new Sonido($('#cbxAudio').get(0));
    //Cargo recursos
    var a = new Audio();
    a.setAttribute("src", "audio/envido.wav");
    a.load();
    audio.fx['E'] = a;
    a = new Audio();
    a.setAttribute("src", "audio/real-envido.wav");
    a.load();
    audio.fx['R'] = a;
    a = new Audio();
    a.setAttribute("src", "audio/falta-envido.wav");
    a.load();
    audio.fx['F'] = a;
    a = new Audio();
    a.setAttribute("src", "audio/quiero.wav");
    a.load();
    audio.fx['S'] = a;
    a = new Audio();
    a.setAttribute("src", "audio/no-quiero.wav");
    a.load();
    audio.fx['N'] = a;
    a = new Audio();
    a.setAttribute("src", "audio/truco.wav");
    a.load();
    audio.fx['T'] = a;
    a = new Audio();
    a.setAttribute("src", "audio/re-truco.wav");
    a.load();
    audio.fx['RT'] = a;
    a = new Audio();
    a.setAttribute("src", "audio/vale-cuatro.wav");
    a.load();
    audio.fx['V'] = a;
    //Comienza la acción
    _partidaActual = new Partida();
    _partidaActual.iniciar(this.equipoPrimero1, this.equipoSegundo2);

    var _inputsName = $('.human-name');
    var _nAnterior = '';
    var _nNuevo = '';
    var _estabaEditando = false;
    _inputsName.keydown(function (event) {
        if (event.keyCode === 13) {
            event.preventDefault();
        }
    });
    _inputsName.keyup(function (event) {
        if (event.keyCode !== 13) {
            var name = $(this).html();
            var _other = _inputsName.not(this);
            if (!_estabaEditando) {
                _nAnterior = _other.html();
                _estabaEditando = true;
            }
            _other.html(name);
            _nNuevo = _partidaActual.equipoPrimero.jugador.nombre = name;
        } else {
            event.preventDefault();
        }
    });
    _inputsName.blur(function () {
        _log.innerHTML = "<br />" + _nAnterior + " cambia su nombre a: " + _nNuevo + _log.innerHTML;
        _estabaEditando = false;
    });

    $('#cbxDebug').change(function () {
        Debug = $(this).is(':checked');
    }).attr('checked', false);

    var _cajasCollapsables = $('.box--collapsable');
    if (_cajasCollapsables.length > 0) {
        _cajasCollapsables.find('.box-content').addClass('box-content--hidden');
        _cajasCollapsables.find('.box-title').addClass('box-title--hidden').click(function () {
            var _title = $(this);
            if (_title.hasClass('box-title--hidden')) {
                _title.removeClass('box-title--hidden').children('img').addClass('title-rotate');
                _title.parent().children('.box-content--hidden').removeClass('box-content--hidden');
            } else {
                _title.addClass('box-title--hidden').children('img').removeClass('title-rotate');
                _title.parent().children('.box-content').addClass('box-content--hidden');
            }
        });
    }
});