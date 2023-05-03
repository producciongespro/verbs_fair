function ModificarCaracteres() {
  this.palabraModificada ="";
  this.listaChar = [];
}


ModificarCaracteres.prototype.addGuion = function (palabra) {
  this.palabraModificada="";
  for (var i = 0; i < palabra.length; i ++){
  this.palabraModificada += (palabra.charAt(i) == " " || palabra.charAt(i) == "/" || palabra.charAt(i) == "'"  ) ? "-" : palabra.charAt(i);
  }

  return this.palabraModificada;
};

ModificarCaracteres.prototype.rmvAcento = function (palabra) {
  this.palabraModificada = palabra;
    this.palabraModificada = this.palabraModificada.replace(/[áà]/g, "a");
    this.palabraModificada = this.palabraModificada.replace(/[èéê]/g, "e");
    this.palabraModificada = this.palabraModificada.replace(/[ìí]/g, "i");
    this.palabraModificada = this.palabraModificada.replace(/[òó]/g, "e");
    this.palabraModificada = this.palabraModificada.replace(/[ùú]/g, "u");
return this.palabraModificada;
};

ModificarCaracteres.prototype.getNombreArchivo = function (palabra) {
  //Realiza las dos funciones anteriores en una sola llamada
    var p = this.addGuion (palabra);
    p = this.rmvAcento (p);
    p = this.pasarAminuscula (p);
    return p;
};


ModificarCaracteres.prototype.minusculaPrimera = function (palabra) {
  return this.palabraModificada.charAt(0).toLowerCase() + palabra.slice(1);
};

ModificarCaracteres.prototype.pasarAminuscula = function (palabra) {
  return this.palabraModificada.toLowerCase();
};
