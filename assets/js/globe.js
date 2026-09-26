/* =====================================================================
   Alessandro Chiri — "Dove ho lavorato"
   Globo a punti guidato dallo scroll: rotazione verso l'Italia → zoom →
   Milano, Roma, Bari. Il globo è disegnato dalla GPU (WebGL): i punti
   restano in memoria video e la proiezione ortografica avviene nello
   shader, così ogni fotogramma costa pochi decimi di millisecondo.
   Archi, città ed etichette stanno su un canvas 2D sovrapposto.
   Senza WebGL si usa il canvas 2D. Dati terre: Natural Earth via
   world-atlas (pubblico dominio), pre-calcolati come maschere di bit
   (sfera di Fibonacci + griglia Italia).
   Con "Riduci movimento" mostra una mappa statica; senza JS restano le schede.
   ===================================================================== */
(function () {
  "use strict";
  var DATA = {"N":40000,"g":"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pKaAEJQKQkJSSAhIDQGhKAQEhKagEJQSAkJTSAhITQEhKAUEhKaQEJASAkJRSAhITQEhKAUEhKaQEJCaAkJRSAgITWEhKCUEhKKQEJCaAkJRCAgIRSEhICUEhKKQEBCaAkJQCggIRSEhICUFhKKQEBCKQkJQSggIRSEhIAUFhKCUEBCCQkJASggIRSEhIASEhKAUEBCKQkJACgoISSEhIASEhIAUEBCKwkJACggKQSkhIASFhIAUUBCKQkJACAgIQSkgIBSFhIAUFBCCQkJASAgLASmgIBSFhICQUBCCQkJBSAoLASmoIBSFhICQUBACUkBBKAoJASmhIASEhIKQUBACUkJBKCoLASGhIASEhIIQUBYCUlJBKCgJASGhIASkhIIQVBICQkJBCCgJBSGhKBSkpIIQUBYCQkJBCAgJBSGgIBSEpIJQUBIKQkJBCGgJBSGgLBSkhIJQUBIKQkBRCAgJBSGgJBSEhIJQUBIKQkBZKEhJBSGgJBSEgKIQUBIKQkBJKEgJBSGgJBSEgKIQEBIKQkBJKAgBBSGgJBSEgKJQkJIKQkBJKAgBBSGgJBSEgIJQEJIKAkBJKAoBBSGgJBQEgIJQUIIKAkBJKAoABaGgJBUEgJJUVAIKQkBJKAoABaGgABUEgJJUVAAKQkBBKAgABaGoABUEgIJQFAAKAkEBKggABamoABQEgIJQEAAKAlEBKggABamoABQEggJQEAAKQlEBKggABamgABQEogJUEAAKQlEBKAgABaggABSEogJUEAAKUkEBKAhEBaAgABSFogJUEIgKUEEBKAhEBaAgABSEogJQEIgKUEEAKApFBaggABSAggJQEIgKUEEAKAhFBaAgEBWgggJQEIoKQEEAKkBFBaAgEBWgogBQEIoKQFEgKgAFBaAgEBWgggBUAIoKQEEgKkBFBaAgFBWggkBUBAoKQEEgKkAFBaAAFBWAgkBUAAoKQEEoKkAFhagAFBSAgkBUhIoKQAEoKkAFhagIFBSAgkBUhIoKQAEoKEAFhagIFBWAAlBUgAoKUREoKEIFgagIFBWAAlBUgAoKUQEoKAIFhKgAFRSCAlBQhAoKUQEqKkIFpKgAFRSiAlBQhAoIUQEoKgJFpKAIFRSCAnBUBIoIUREqKAYFpKAIFRCCIlBQBAoIQREqKAYFpKAIFBCCAlBUDApIQREqIAYFoKgIFBCCAlBQDApIQREqIAQFoKAIFBCCAlRQDArIQREoIAQF5KAYFJCCAlRADApIQREoIAYFoKAYFJCDIlBADApIQTEoIAYFoKAYFJCCIlRADApAQTEoIAUFoIAYFJCCIlRACApAQTEqIAVFqIAYFJCCIlRACApAATEqIAVFqIAQFICCYlRACopAATEoIAVFoIAQFICCQlRACopAATEoIAVFoIAQFYADQlRAiopAATEoAAVFoIAUFYAiQlBAiopAASEqAAWEoIAUFIACYlAACgpAASEoAAWEoIAUFIACYlAAigpAASkoAAWEoAAUFIACYlAACghBASkqAAWEoAAUFIACQlAACghBASgoAAWEoAAUFIACUlAACghBASgoAgWEoAAUFIICUFAACghBASgoAEWkoAAUEIICUFAACghBASgoAAWgoAAUEIICUFAECghBASggBEWgoAAUEIIiUFAAikhBASggBEWhoAgUEIICUFAAikBBASggBEWgoAgUgYICUEAIikJBESggBAWgoAAUgYICUEAIjkJBESgiBQWgoAAUhYICUEAICkBBASgCBQWgiBAUhYIiUEAICkBBESgCBQWgiBAUgYIiUEQKCkARASgKBQWgiBAUgIIiUBQKCkARASgCBUWgiBQUgCIiUBQKCkARASgCBUWgKBQUgCICUBQKikARSToCRUSgKBQUgCIDUASKikBRKSgCRUSgKBQUgSICUASKiEBRKCgCRQSgCBQUgaISUASKjEBRKCgCRQSgCBQRgaIQUASKCEBRKCgCRQWgCBQRgaIQUASKCEARKCICRSWgCBQRgaJQUASKCEARKCICRSGgCBQRgSJQRASKCkARKCICRaGgCBQRgCJQRASKQkARKCICRaGICBQRgCJQRASOQlARKCICRaCICBQFgCJQRASKQhERKCICRaCICBSFoCJQRASKQBERKApARaCICBSFoCJQRASKQBERKApARaCICBSBIiJQVISKQBERKApARaCICBSBIiJQFISKQBERKApFRaCICBWBIiJQFICKQBERKAJFRKAoCBWBIiJQFIiKQBEQKgJFRKAoCBWBIiBQBIqIQBEQKgJFQKAoCBWBIiBUBIqIQFEQKgJFQKAIFBWBIiBUBIqAQFEQKgJFQKAIFBGBIiBUBIqAQBEQIgJFQKgIFAGBIiBUBIqAQBE4IgJFQKgIFAGBIiBEBIqAUBEoAgJFQKgIFAGBImBEBIqAUBEoAgJFQKgIFAGBIlBEBIqAUBEoAgJFQIgIFAGhIlAEBIqAUBEoAgJFwIgIFAGhIlAEBIqAEBEoAgJFoIgIFAGhIlAEBIqAEREoAkJFoAgIFAEhIlAEBIqAEREoAkJFoAgIFAEjIlAEBIoAERAoAkJEoAgIFAEjIlAEhIpAERAoAkJEoAgIFAEiIFAEhIhAERAoAkZAoAgIFAEiIFAEhIhAERAoAkZAoAgIEYEiIFAEjIBAERAoAkRAoAgIEYEiIFAEjIBAERAgAkRAoAAIEYEiIFAAiIBAARAiAkVAoAAYAYECIEAAiIBAARAiAgVAoAAQAYECIEAEiIBAARACAgVAgAAQAYECIEQECoAAASACAgVAgAAQAIECIAQECoAAASAAAgRAiAgQAAECQAAECIAAASAAAgRACAAQAAECQAAECIAAACAAAgTAAAAQAAEAQAAECIAAACAAAgSAAAAQAAEAQCAECIABACAAAgSAAAgQAAEAQCAECAABACAAAgCAAAgQAAEAQAAECAABACAAAgCAQAgQAAIAQCAEAAABECAAAACAQAgQAAIAQAAEAAABACAABACAQAAAAAIAQAAAAACBAAAABACAAAAAAAIAAAAAAACBAAAABACAAAAAAAIBAAAIAAABAAAABAAAAAAAAAIBAAAIAAABAAAABAAAABAAAAIAAAAIBAAAEAAABAIAABAAAAAgAAAIBAAAAAAABAAAABAIAAAgAAAIAAAAAAAABAAAABAIAAAgAAAIAAAAIAAABEAAABAAAAAAAAAIAAAAIBAAAAAAABAAAABAIAAAAAAAIAAAAAAAABAAAABAIAAAAAAAIAAAAIBAAAAAAABAAAAAAIAAIAAAAIBAAAAAAABAAAAAAIAAAAAAAIAAAAAAAAFAAAAAAIEAAAAAAIAAAAAAAgAAAAAAAAEAAAAAAIAAAAAAAgAAAAAAAAEAAAAAAIAAAAAAAgAAAAAAAAEAAAAEAIAAAAAAAgAAAAAAAAEAAAAEAAAAAAAAAgAAAAgAAAIAAAAEAAAAAAAAAgAAAAgAAAAAAAAEAAAAAAAAAAAAAAgAAAAAAAAEAAAAEAAAAAAAAAgAAAAAAAAAAAAAEAAAAABAAAgAAAAAAAAAAAAAEAAAAAAAAAAAAAAgAAAAAAAAEAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAEAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAEAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAQAAAACAAAAQgAAAAgBICUgBASEgJASEAJCSkRICSghISUgpISUkJASUFJCSkRICSkpISWgpISUjJASUnJKSkZJCSkJJSWkpJSUjNKSUlpKSk9paSkNpaW1tLSWntLSWjpKS29paS09paX1tJSW3tLSenpLT+v5KT29p6f19Jae3/NTen7Lz+n5OT+v5/f8/J6f9/N7fl7P7/l5P7/v5/f9vN/f9/N6ft/v+/n5vb/n5/38vN7f8/N6ft/P7/n9P7/v9/f+/t/f//v/fy8AEAAAAAAAAAAAAAA=","d":{"lat0":27.0,"lat1":54.0,"lon0":-5.0,"lon1":33.0,"step":0.14,"land":"////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////9////////////////////////////////////////P////////////////////////////////////8////////////////////////////////////////n///////////////////////////////////////8/////////////////////////////////////+////////////////////////////////////////z/////////////////////////////////////z////////////////////////////////////////f/////////////////////////////////////v///////////////////////////////////////////////////////////////////////////////////////////////////////w/////////////////////////////////////wH/////////////////////////////////////A/j///////////////////////////////////8D4P///////////////////////////////////wOA////////H/////////////////////////9/AAD///////8H/P+//////////////////////x8AAP7/////PwDg/wv///////////////////9/AAAA/v////8fAID/AP///////////////////z8AAAD+/////wEAAHIB////////////////////HwAAAP///38AAAAAAID///////////////////8PAACA////PwAAAAAAwP///////////////////wMAAOD///8PAAAAAADw////////////////////AAAA8P//DwAAAAAAAPj//////////////////z8AAAD4//8AAAAAAAAA/v//////////////////DwAAAPz/BwAAAAAAAID//////////////////z8AAAAA//8BAAAAAAAA8P//////////////////AQAAAID/PwAAAAAAAAD+/////////////////wcAAAAA4P8AAAAAAAAA4P///////////////x8MAAAAAADgAwAAAAAAAAD+//////////////9/AAAAAAAAAAAAAAAAAAAA4P///////////////wEAAAAAAAAAAAAAAAAAAAD+//////////////8BAAAAAAAAAAAAAAAAAAAA8P//////////////DwAAAAAAAAAAAAAAAAAAAID//////////////08AAAAAAAAAAAAAAAAAAAAA/v////////////8PAAAAAAAAAAAAAAAAAAAAAPj/////////////HwMAAAAAAAAAAAAAAAAAAADw/////////////z8AAAAAAAAAAAAAAAAAAAAAwP////////////9/AAAAAAAAAAAAAAAAAAAAAID//////////////wEAAAAAAAAAAAAAAAAAAAAA//////////////8HAAAAAAAAAAAAAAAAAAAAAP//////////////DwAAAAAAAAAAAAAAAAAAAAD//////////////w8AAAAAAAAAAAAAAAAAAADg//////////////8fAAAAAAAAAAAAAAAAAAAA+P//////////////BwAAAAAAAAAAAHAAAAAAAP//if///////////wMAAAAAAAAAAAD+BgAAAAAPRID///////////8BAAAAAAAAAAD8PwAAAAAAAQCA//////////9/AAAAAAAAAAAAzwAIAAAAAAAA4P//////////DwAAAAAAAAAAAAEAAAAAAAAAAPD//////////wEAAAAAAAAAAAAAAAAAAAAAAADI/////////w8AAAAAAAAAAAAAAAAAAAAAAAAA+P///////38AACAAAAAAAAAAAAAIAAAAAAAAgP////////8DAAAAAAAAAAAAAADAAAAADAAAAPD///////8/AAAAAAAAAAAgAAAADjgBeAAAAAD+////////AAAAAAAAAAAAAAAAIPgH4B8AAACA////////HwAAAAAAAAAAAAAAAMB/gP8AAAAAAP7//v///wAAAAAAAAAAJAACAAT/gf//nwAAAAD/4f//PwcBgAMAAAAA0gCBgHj/h////wcAAAAAAJ6T/xgAAA8AAAAA9gEEgMD//////w8AAAAAAAgA/AEAAD8AAAAA/APAAfz//////x8AAAAAAAAAcAEA4D8AAAAA/AMAAPD//////z8AAAAAAAAAAAAA8D8AAAAA+CkEAPz//////38AAAAAAAAAAAAA/h8AAAAA/AwQAP7///////8HAAAAAAAAAADA/x8AAAAA/wMRCP////////8BAAAAAAAAAAD4/wcAAADk/xAAsP////////8BAAAAAAAAAAD4/wcAAADwPwwBwP///////38AAAAAAAAAAAB04DsAAAD49xMA+P///////38AAAAAAAAAAAAAgB8AACA4+ANI/////////w8AAAAAAAAAAAAAAAcAAKbgTwDq/////////wcAAAAAAAAAAAAA4AEAAPz/DmD5/////////wEAAAAAAAAAAAAAHgAA4P/3AND/////////fwAAAAAAAAAAAAAAAwAA/Z8BAPj/////////AQEAAAAAAAAAAAA4AADwvwcAgP////////8HGAAAAAAwAAAAAMAHAAD/LwDg/v///////x8AAAAAAPAJAAAAAD8AQP+fA8D5////////fwAAAAAAAD8AAAAA/AAA/v8DAOT/////////AQAcAAAA/gAAAAD4AQD9/wMAgP////////8PAPwAAADwAwAAAPADAPT/BwDg/////////x8A4AMAAOAPAAAA4AEA/P8PAMD//////////wAAQQAAgB8AAADABxjg/x8Ahv//////////AQBgAADAHwAAANAHGOD/DwkA//////////8DAAAAAIAfAAAA+A848P8PJGD//////////wMAAAAAwB8AAAD8Dx/8/8cJgP//////////AwAAAADgHwAAAP7vB/z/9wGEicD///////8DAAAAAPgHAACA//8A//97AAAB+P///////wEAAAAA/gEAAPj/H+D//x8G/ACA//////8/AAAAAEA+AADA//8A+P//n+A/AP///////x8AAAAAgA8AAPj/DwD///+//y/0////////BwAAAABgAADA/z8A8P/////////w//////8HAAAAAAAAQP//AAD+//////8HAP7//////wAAAAAAAAD//wMA8P//////DwDA//////8/AAAAgAMA+P8fAAD//////38AAPj//////wcAAAA4AMD//wEA8P//////AQAA////////AAAAwAEA//8fAID//////w8AAOD//////wcAAAAPAP7/AQCA//////8/AAAA/v////8fAAAAfAD8/wMAAP7//////wAAAPj/////fwAAAPgA+P8DAAD+//////8AAADw//////8AAADwAfr/BwAA/P//////AQAA4P////9/AAAA4AH8/wMAAP///////wAAAOD//////wAAAIAB/P8BAID///////8BAADg/////38AAAAAIf//AADw////////AQAA8P////9/AAAAAOD/fwDA/v///////wAAAPj/////HwAYAADw/x8AAP///////38AAAD+/////x+APwAA/P8HAPD///////8fAACA/47///8P+g8AgP//AGD+////////BwAAAADA////9/4DAPD/HwD6/////////wcAAAAA+P//////AAD//wDg/////////z8AAAAAAP//////fwDw/wcA//////////8HAAAAAPD//////x+A/x8A/f////////8/AAAAAID///////8A/38A4P//////////AQAAAAD8//////8P/v8AwP//////////BwAAAADA////////+P8HgP7/////////fwAAAAAA//////////8fAPT//////////wEAAAAA+P////////9/AOT//////////w8AAAAA8P//////////Acj//////////x8AAAAAwP//////////B4T//////////78DAAAAwP//////////B+7///////////8DAAAAgP//////////B87///////////8DAAAAwP7/////////A/////////////8BgAAAQP//////////gf////////////8AgAEA4P//////////h////////////z8AQAAA/P///////////////////////z8AAACA/////////////////////////w8AAADQ/////////////////////////wNAAAD8////////////////////////f4AHAID/////////////////////////D34AgP////////////////////////9/6AMA/P////////////////////////8HGgDw//////////////////////////9/AMD///////////////////////////8BQP//////////////////////////7wMA////////////////////////////B4D9//////////////////////////8HAP///////////////////////////wfA////////////////////////////A/T////////////////////////////R////////////////////////////f/z///////////////////////////8f//////////////////////////////P///////////////////////////9//////////////////////////////+e///////////////////////////9/2KH//////////////////////////wMG+P////////////////////////8fAOD/////////////////////////fwCA//////////////////////////8BAP7/////////////////////////AwAO/P///////////////////////wcADvj///////////////////////8HABT4////////////////////////BwAA8P///////////////////////wMAAID///////////////////////8BAADA////////////////////////IAAAwP///////////////////////w8AAPj///////////////////////8BAAD//////////////////////39/nADg///////////////////////H/08M/v////////////////////9//v//4///////////////////////w///P/D/////////////////////H87//wP/////////////////////fwD+/w2w/////////////////////4H5/wGA/f///////////////////4f//x8A/P////////////////////e//x8A+P///////////////////////38A+P////////////////////f///8A+P///////////////////+P///8A8P///////////////////+H//z8A+P//////////////////f/D//x8A/v//////////////////H/7//wOA////////////////////w///fwDw//////////////////9/+v+fAwD+///////////////////H//8DAKD//////////////////3/+/z8AAPD//////////////////7Py/wEAAL//////////////////H+D/BwAADN////////////////9/AP8PAAAAeP7///////////////8B/j8AAAAA/P//8////////////wP4fwAAAACA////////////////Bw==","italy":"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABgAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4D8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8D8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/h8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADA/x8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD4/wcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD4/wcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB04DsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgB8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAAMAHAAAAAAAAAAAAAAAAAAAAAAAAAPAJAAAAAD8AAAAAAAAAAAAAAAAAAAAAAAAAAD8AAAAA/AAAAAAAAAAAAAAAAAAAAAAAAAAA/gAAAAD4AQAAAAAAAAAAAAAAAAAAAAAAAADwAwAAAPADAAAAAAAAAAAAAAAAAAAAAAAAAOAPAAAA4AEAAAAAAAAAAAAAAAAAAAAAAAAAgB8AAADABxgAAAAAAAAAAAAAAAAAAAAAAADAHwAAANAHGAAAAAAAAAAAAAAAAAAAAAAAAIAfAAAA+A84AAAAAAAAAAAAAAAAAAAAAAAAwB8AAAD8Dx8AAAAAAAAAAAAAAAAAAAAAAADgHwAAAP7vBwAAAAAAAAAAAAAAAAAAAAAAAPgHAACA//8AAAAAAAAAAAAAAAAAAAAAAAAA/gEAAPj/HwAAAAAAAAAAAAAAAAAAAAAAAEA+AADA//8AAAAAAAAAAAAAAAAAAAAAAAAAgA8AAPj/DwAAAAAAAAAAAAAAAAAAAAAAAABgAADA/z8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAQP//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//wMAAAAAAAAAAAAAAAAAAAAAAAAAAAAA+P8fAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMD//wEAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//8fAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP7/AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAD8/wMAAAAAAAAAAAAAAAAAAAAAAAAAAAAA+P8DAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPr/BwAAAAAAAAAAAAAAAAAAAAAAAAAAAAD8/wMAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/P8BAAAAAAAAAAAAAAAAAAAAAAAAAAAAIP//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAOD/fwAAAAAAAAAAAAAAAAAAAAAAAAAAAADw/x8AAAAAAAAAAAAAAAAAAAAAAAAAAAAA/P8HAAAAAAAAAAAAAAAAAAAAAAAAAAAAgP//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAPD/HwAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//wAAAAAAAAAAAAAAAAAAAAAAAAAAQADw/wcAAAAAAAAAAAAAAAAAAAAAAAAAAByA/xsAAAAAAAAAAAAAAAAAAAAAAAAAAMAA/38AAAAAAAAAAAAAAAAAAAAAAAAAAOAP/v8AAAAAAAAAAAAAAAAAAAAAAAAAAID/+P8HAAAAAAAAAAAAAAAAAAAAAAAAAAD+//8fAAAAAAAAAAAAAAAAAAAAAAAAAADw//9/AAAAAAAAAAAAAAAAAAAAAAAAAADA////AQAAAAAAAAAAAAAAAAAAAAAAAADA////BwAAAAAAAAAAAAAAAAAAAAAAAADA////BwAAAAAAAAAAAAAAAAAAAAAAAAAA////BwAAAAAAAAAAAAAAAAAAAAAAAAAA////AwAAAAAAAAAAAAAAAAAAAAAAAACA////AQAAAAAAAAAAAAAAAAAAAAAAAADg////BwAAAAAAAAAAAAAAAAAAAAAAAAD8////HwAAAAAAAAAAAAAAAAAAAAAAAAD8+///AQAAAAAAAAAAAAAAAAAAAAAAAAB4//8/AAAAAAAAAAAAAAAAAAAAAAAAAADj//8HAAAAAAAAAAAAAAAAAAAAAAAAACDU/z8AAAAAAAAAAAAAAAAAAAAAAAAAACD+/wcAAAAAAAAAAAAAAAAAAAAAAAAAAMD/BwAAAAAAAAAAAAAAAAAAAAAAAAAAAP8DAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=="}};

  var sec = document.getElementById("dove");
  if (!sec || !DATA) return;
  var viz = sec.querySelector(".where__viz");
  var canvas = sec.querySelector(".where__canvas");
  var over = sec.querySelector(".where__overlay");
  var scroller = sec.querySelector(".where__scroller");
  var octx = over && over.getContext ? over.getContext("2d") : null;
  if (!viz || !canvas || !octx) return;

  var AC = window.AC || null;
  var reduced = AC ? AC.reduced() : matchMedia("(prefers-reduced-motion: reduce)").matches;
  var live = !!AC && !reduced;
  sec.classList.add(live ? "is-live" : "is-static");

  var D2R = Math.PI / 180;
  var cards = Array.prototype.slice.call(sec.querySelectorAll(".city"));
  var chips = Array.prototype.slice.call(sec.querySelectorAll(".segmented button"));
  var headEl = sec.querySelector(".where__head");
  var uiEl = sec.querySelector(".where__ui");
  var hintEl = sec.querySelector(".where__hint");

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* ---------- decodifica maschere ---------- */
  function bytes(b64) {
    var bin = atob(b64), u = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    return u;
  }
  function bit(u, i) { return (u[i >> 3] >> (i & 7)) & 1; }

  /* sfera di Fibonacci (stessi calcoli dello script di generazione).
     Ogni punto è già nella forma usata dalla GPU: sin φ, cos φ, sin λ, cos λ */
  var N = DATA.N, GA = Math.PI * (3 - Math.sqrt(5)), gm = bytes(DATA.g), gN = 0, i, k;
  for (i = 0; i < N; i++) if (bit(gm, i)) gN++;
  var GP = new Float32Array(gN * 4);
  for (i = 0, k = 0; i < N; i++) {
    if (!bit(gm, i)) continue;
    var y = 1 - 2 * (i + 0.5) / N, lon = (i * GA) % (2 * Math.PI);
    if (lon > Math.PI) lon -= 2 * Math.PI;
    GP[k++] = y; GP[k++] = Math.sqrt(1 - y * y); GP[k++] = Math.sin(lon); GP[k++] = Math.cos(lon);
  }

  /* griglia esagonale di dettaglio sull'Italia; quinto valore: livello
     (0-3 = terre vicine, sfumate verso i bordi della regione; 4 = Italia) */
  var dd = DATA.d, lm = bytes(dd.land), im = bytes(dd.italy);
  var dl = [], idx = 0, row = 0, la = dd.lat0;
  while (la <= dd.lat1 + 1e-9) {
    var step = dd.step / Math.cos(la * D2R), off = (row % 2) ? step / 2 : 0;
    var n = Math.floor((dd.lon1 - dd.lon0 - off) / step) + 1;
    for (var c = 0; c < n; c++, idx++) {
      if (bit(lm, idx)) {
        var lo = dd.lon0 + off + c * step, cl = Math.cos(la * D2R);
        var ed = Math.min(la - dd.lat0, dd.lat1 - la, (lo - dd.lon0) * cl, (dd.lon1 - lo) * cl);
        dl.push(la, lo, bit(im, idx) ? 4 : Math.min(3, Math.floor(clamp(ed / 4, 0, 1) * 3.999)));
      }
    }
    row++; la = dd.lat0 + row * dd.step;
  }
  var dN = dl.length / 3, DP = new Float32Array(dN * 5);
  for (i = 0; i < dN; i++) {
    var p0 = dl[i * 3] * D2R, l0 = dl[i * 3 + 1] * D2R;
    DP[i * 5] = Math.sin(p0); DP[i * 5 + 1] = Math.cos(p0);
    DP[i * 5 + 2] = Math.sin(l0); DP[i * 5 + 3] = Math.cos(l0); DP[i * 5 + 4] = dl[i * 3 + 2];
  }
  dl = null;

  /* ---------- luoghi ---------- */
  var CITIES = [
    { lat: 45.4642, lon: 9.19 },   /* Milano */
    { lat: 41.9028, lon: 12.4964 },/* Roma */
    { lat: 41.1171, lon: 16.8719 } /* Bari */
  ];
  CITIES.forEach(function (ct) {
    ct.sp = Math.sin(ct.lat * D2R); ct.cp = Math.cos(ct.lat * D2R);
    ct.sl = Math.sin(ct.lon * D2R); ct.cl = Math.cos(ct.lon * D2R);
  });
  var ARCS = [[0, 1], [1, 2], [2, 0]];
  var ITALY = { lat: 42.2, lon: 12.4 };
  var START = { lat: 22, lon: -38 };
  function names() {
    return cards.map(function (el) { var h = el.querySelector(".city__name"); return h ? h.textContent : ""; });
  }
  var labels = names();

  /* ---------- utilità ---------- */
  function seg(p, a, b) { return clamp((p - a) / (b - a), 0, 1); }
  function eio(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function lerpAng(a, b, t) { var dg = ((b - a + 540) % 360) - 180; return a + dg * t; }
  function mix(a, b, t) { return { lat: lerp(a.lat, b.lat, t), lon: lerpAng(a.lon, b.lon, t) }; }
  var FONT = '-apple-system, BlinkMacSystemFont, "InterVariable", "Segoe UI", Roboto, sans-serif';

  /* ---------- dimensioni ---------- */
  var W = 0, H = 0, DPR = 1, cw = 0, ch = 0;
  var dirtyG = true, dirtyO = true;
  function resize() {
    var r = viz.getBoundingClientRect();
    /* senza WebGL si disegna a densità 1: meno pixel da riempire, scroll fluido */
    DPR = gl ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    cw = r.width; ch = r.height;
    W = Math.max(1, Math.round(cw * DPR)); H = Math.max(1, Math.round(ch * DPR));
    if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
    if (over.width !== W || over.height !== H) { over.width = W; over.height = H; }
    dirtyG = dirtyO = true;
  }

  /* layout in px CSS → moltiplicati per DPR */
  function layout() {
    var wide = cw >= 834;
    var R0 = Math.min(cw * 0.4, ch * 0.3);
    var A = { x: cw * 0.5, y: ch * 0.66 };
    var T, bw, bh;
    if (!live) { T = { x: cw * 0.5, y: ch * 0.5 }; bw = cw * 0.92; bh = ch * 0.9; }
    else if (wide) { T = { x: cw * 0.4, y: ch * 0.53 }; bw = cw * 0.6; bh = ch * 0.78; }
    else { T = { x: cw * 0.5, y: ch * 0.4 }; bw = cw * 0.94; bh = ch * 0.52; }
    var Rt = Math.min(bh / 0.2, bw / 0.17);
    return { R0: R0, A: A, T: T, Rt: Rt };
  }

  /* ---------- timeline dello scroll ---------- */
  var P = 0, drift = 0;
  function state(p) {
    var L = layout(), s = {};
    if (!live) {
      s.c = ITALY; s.R = L.Rt; s.x = L.T.x; s.y = L.T.y;
      s.t = 1; s.cityA = 1; s.active = -1; s.arcs = [1, 1, 1];
      s.head = 1; s.ui = 1; s.hint = 0;
      return s;
    }
    var a = eio(seg(p, 0, 0.2));
    var b = eio(seg(p, 0.2, 0.44));
    var from = { lat: START.lat, lon: START.lon + drift };
    var c = mix(from, ITALY, a);
    var R = L.R0 * Math.pow(L.Rt / L.R0, b);
    var x = lerp(L.A.x, L.T.x, b), y = lerp(L.A.y, L.T.y, b);

    /* fuoco città */
    var f = function (q) { return mix(ITALY, CITIES[q], 0.5); };
    var z0 = eio(seg(p, 0.44, 0.52)), z1 = eio(seg(p, 0.63, 0.71)), z2 = eio(seg(p, 0.82, 0.9));
    if (p > 0.44) {
      var target = mix(ITALY, f(0), z0);
      if (z1 > 0) target = mix(f(0), f(1), z1);
      if (z2 > 0) target = mix(f(1), f(2), z2);
      c = target;
      R *= 1 + 0.22 * z0;
    }
    s.c = c; s.R = R; s.x = x; s.y = y;
    s.t = seg(p, 0.3, 0.42);
    s.cityA = seg(p, 0.36, 0.44);
    s.active = p >= 0.4 ? (p < 0.63 ? 0 : p < 0.82 ? 1 : 2) : -1;
    s.arcs = [seg(p, 0.63, 0.72), seg(p, 0.82, 0.91), seg(p, 0.92, 0.99)];
    s.head = 1 - seg(p, 0.1, 0.24);
    s.ui = seg(p, 0.4, 0.46);
    s.hint = 1 - seg(p, 0.015, 0.07);
    return s;
  }

  /* vista corrente in px del canvas */
  var S = { x: 0, y: 0, R: 1, sp0: 0, cp0: 1, sl0: 0, cl0: 1 };
  function view(s) {
    S.R = s.R * DPR; S.x = s.x * DPR; S.y = s.y * DPR;
    S.sp0 = Math.sin(s.c.lat * D2R); S.cp0 = Math.cos(s.c.lat * D2R);
    S.sl0 = Math.sin(s.c.lon * D2R); S.cl0 = Math.cos(s.c.lon * D2R);
    return S;
  }
  function project(sp, cp, sl, cl, out) {
    var cosD = cl * S.cl0 + sl * S.sl0, sinD = sl * S.cl0 - cl * S.sl0;
    out[0] = S.x + S.R * cp * sinD;
    out[1] = S.y - S.R * (S.cp0 * sp - S.sp0 * cp * cosD);
    out[2] = S.sp0 * sp + S.cp0 * cp * cosD;
  }

  /* =====================================================================
     Globo su GPU (WebGL): i punti stanno in memoria video e la proiezione
     avviene nello shader; a ogni fotogramma si aggiornano pochi numeri.
     ===================================================================== */
  /* sfondo: si colora solo il quadrato che contiene globo e atmosfera,
     il resto è già nero grazie a clear() (costo quasi nullo sulla GPU) */
  var BG_VS = "attribute vec2 a_xy;uniform vec4 u_box;void main(){gl_Position=vec4(mix(u_box.xy,u_box.zw,a_xy),0.0,1.0);}";
  var BG_FS = [
    "#ifdef GL_FRAGMENT_PRECISION_HIGH",
    "precision highp float;",
    "#else",
    "precision mediump float;",
    "#endif",
    "uniform vec2 u_res;uniform vec3 u_g;uniform float u_glow;",
    "void main(){",
    "  vec2 q=(vec2(gl_FragCoord.x,u_res.y-gl_FragCoord.y)-u_g.xy)/u_g.z;",
    "  float d=length(q);",
    /* atmosfera: 20% d'azzurro fino a 0.92R, sfuma a zero entro 1.22R */
    "  vec3 col=vec3(0.1608,0.5922,1.0)*(u_glow*0.2*clamp((1.22-d)/0.3,0.0,1.0));",
    "  float e=clamp((1.0-d)*u_g.z+0.5,0.0,1.0);",
    "  if(e>0.0){",
    /* gradiente radiale a due cerchi, come createRadialGradient del canvas 2D */
    "    vec2 pd=q-vec2(-0.35,-0.45);",
    "    float b=dot(pd,vec2(0.35,0.45))+0.0475;",
    "    float c=dot(pd,pd)-0.0025;",
    "    float w=clamp((sqrt(max(b*b+0.5775*c,0.0))-b)/0.5775,0.0,1.0);",
    "    col=mix(col,mix(vec3(0.1059,0.1216,0.1529),vec3(0.0275,0.0314,0.0392),w),e);",
    "  }",
    /* rumore di un livello: niente bande nel gradiente scuro */
    "  col+=(fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-0.5)/255.0;",
    "  gl_FragColor=vec4(col,1.0);",
    "}"
  ].join("\n");
  var PT_VS = [
    "attribute vec4 a_p;attribute float a_k;",
    "uniform vec4 u_c;uniform vec3 u_g;uniform vec2 u_res;uniform float u_r;uniform vec3 u_m;",
    "varying vec4 v_col;varying float v_r;",
    "void main(){",
    "  float cosD=a_p.w*u_c.w+a_p.z*u_c.z;",
    "  float sinD=a_p.z*u_c.w-a_p.w*u_c.z;",
    "  float cosc=u_c.x*a_p.x+u_c.y*a_p.y*cosD;",
    "  v_r=u_r;",
    "  if(cosc<=u_m.z){v_col=vec4(0.0);gl_PointSize=1.0;gl_Position=vec4(2.0,2.0,2.0,1.0);return;}",
    "  vec2 s=vec2(u_g.x+u_g.z*a_p.y*sinD,u_g.y-u_g.z*(u_c.y*a_p.x-u_c.x*a_p.y*cosD));",
    "  gl_Position=vec4(s.x/u_res.x*2.0-1.0,1.0-s.y/u_res.y*2.0,0.0,1.0);",
    "  gl_PointSize=2.0*u_r+2.0;",
    "  float a;vec3 c;",
    "  if(u_m.x<0.5){a=u_m.y*(0.16+0.64*cosc);c=vec3(0.8392,0.8549,0.8863);}",
    "  else if(a_k>3.5){a=0.92*u_m.y;c=vec3(0.1608,0.5922,1.0);}",
    "  else{a=0.0675*u_m.y*(a_k+1.0);c=vec3(0.7843,0.8039,0.8431);}",
    "  v_col=vec4(c*a,a);",
    "}"
  ].join("\n");
  var PT_FS = [
    "precision mediump float;",
    "varying vec4 v_col;varying float v_r;",
    "void main(){",
    "  vec2 d=gl_PointCoord*2.0-1.0;",
    "  gl_FragColor=v_col*clamp(v_r+0.5-length(d)*(v_r+1.0),0.0,1.0);",
    "}"
  ].join("\n");

  var gl = null, ctx2 = null, glBg = null, glPt = null, bufQ = null, bufG = null, bufD = null, maxPt = 64;

  function program(vs, fs, attrs) {
    function sh(type, src) {
      var o = gl.createShader(type);
      gl.shaderSource(o, src); gl.compileShader(o);
      if (!gl.getShaderParameter(o, gl.COMPILE_STATUS) && !gl.isContextLost()) throw new Error(gl.getShaderInfoLog(o));
      return o;
    }
    var pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs));
    attrs.forEach(function (a, q) { gl.bindAttribLocation(pr, q, a); });
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS) && !gl.isContextLost()) throw new Error(gl.getProgramInfoLog(pr));
    var u = {}, cnt = gl.getProgramParameter(pr, gl.ACTIVE_UNIFORMS) || 0;
    for (var q = 0; q < cnt; q++) { var inf = gl.getActiveUniform(pr, q); u[inf.name] = gl.getUniformLocation(pr, inf.name); }
    return { p: pr, u: u };
  }
  function buffer(data) {
    var b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return b;
  }
  function setupGL() {
    glBg = program(BG_VS, BG_FS, ["a_xy"]);
    glPt = program(PT_VS, PT_FS, ["a_p", "a_k"]);
    bufQ = buffer(new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]));
    bufG = buffer(GP);
    bufD = buffer(DP);
    var rng = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE);
    maxPt = rng && rng[1] ? rng[1] : 64;
    gl.disable(gl.DEPTH_TEST);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);   /* colori premoltiplicati */
  }
  function drawGL(s) {
    if (gl.isContextLost()) return;
    var big = Math.max(W, H), u;
    var glow = S.R < big * 2.2, flat = S.R >= big * 6;
    gl.viewport(0, 0, W, H);
    /* sfondo: nero (o grigio pieno quando il globo riempie lo schermo),
       poi atmosfera e corpo del globo solo nel quadrato che li contiene */
    if (flat) gl.clearColor(0.0431, 0.0471, 0.0588, 1); else gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (!flat) {
      var ext = S.R * (glow ? 1.22 : 1) + 2;
      var x0 = Math.max(0, S.x - ext), x1 = Math.min(W, S.x + ext);
      var y0 = Math.max(0, S.y - ext), y1 = Math.min(H, S.y + ext);
      if (x1 > x0 && y1 > y0) {
        gl.disable(gl.BLEND);
        gl.useProgram(glBg.p); u = glBg.u;
        gl.bindBuffer(gl.ARRAY_BUFFER, bufQ);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.disableVertexAttribArray(1);
        gl.uniform4f(u.u_box, x0 / W * 2 - 1, 1 - y0 / H * 2, x1 / W * 2 - 1, 1 - y1 / H * 2);
        gl.uniform2f(u.u_res, W, H);
        gl.uniform3f(u.u_g, S.x, S.y, S.R);
        gl.uniform1f(u.u_glow, glow ? 1 : 0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
    }
    /* punti */
    gl.enable(gl.BLEND);
    gl.useProgram(glPt.p); u = glPt.u;
    gl.uniform4f(u.u_c, S.sp0, S.cp0, S.sl0, S.cl0);
    gl.uniform3f(u.u_g, S.x, S.y, S.R);
    gl.uniform2f(u.u_res, W, H);
    var lim = Math.max(0.5, (maxPt - 2) / 2);
    /* i puntini più piccoli erano quadrati: stesso "peso" visivo con cerchi di area pari */
    var dot = function (r) { return Math.min(lim, r < 1.6 ? r * 1.128 : r); };
    var gA = 1 - 0.9 * s.t;
    if (gA > 0.01) {
      gl.uniform1f(u.u_r, dot(clamp(S.R * 0.0043, 0.75 * DPR, 2.3 * DPR)));
      gl.uniform3f(u.u_m, 0, gA, 0.02);
      gl.bindBuffer(gl.ARRAY_BUFFER, bufG);
      gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 16, 0);
      gl.disableVertexAttribArray(1);
      gl.vertexAttrib1f(1, 0);
      gl.drawArrays(gl.POINTS, 0, gN);
    }
    if (s.t > 0.01) {
      gl.uniform1f(u.u_r, dot(clamp(S.R * 0.0024 * 0.34, 0.6 * DPR, 3.4 * DPR)));
      gl.uniform3f(u.u_m, 1, s.t, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, bufD);
      gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 20, 0);
      gl.enableVertexAttribArray(1);
      gl.vertexAttribPointer(1, 1, gl.FLOAT, false, 20, 16);
      gl.drawArrays(gl.POINTS, 0, dN);
    }
  }

  /* ---------- riserva: canvas 2D (dispositivi senza WebGL) ---------- */
  var tmp = [0, 0, 0], BUCKETS = 6, paths = [];
  function paint(arr, r, color) {
    if (!arr.length) return;
    ctx2.fillStyle = color;
    var q;
    if (r < 2.5) { var w = r * 2; for (q = 0; q < arr.length; q += 2) ctx2.fillRect(arr[q] - r, arr[q + 1] - r, w, w); return; }
    ctx2.beginPath();
    for (q = 0; q < arr.length; q += 2) { ctx2.moveTo(arr[q] + r, arr[q + 1]); ctx2.arc(arr[q], arr[q + 1], r, 0, 6.2832); }
    ctx2.fill();
  }
  function draw2D(s) {
    var R = S.R, cx = S.x, cy = S.y, big = Math.max(W, H), m = 8 * DPR, q, bI;
    ctx2.setTransform(1, 0, 0, 1, 0, 0);
    ctx2.fillStyle = "#000";
    ctx2.fillRect(0, 0, W, H);
    if (R < big * 2.2) {
      var glow = ctx2.createRadialGradient(cx, cy, R * 0.92, cx, cy, R * 1.22);
      glow.addColorStop(0, "rgba(41,151,255,0.20)");
      glow.addColorStop(1, "rgba(41,151,255,0)");
      ctx2.fillStyle = glow;
      ctx2.beginPath(); ctx2.arc(cx, cy, R * 1.22, 0, 6.2832); ctx2.fill();
    }
    if (R < big * 6) {
      var body = ctx2.createRadialGradient(cx - R * 0.35, cy - R * 0.45, R * 0.05, cx, cy, R);
      body.addColorStop(0, "#1b1f27");
      body.addColorStop(1, "#07080a");
      ctx2.fillStyle = body;
      ctx2.beginPath(); ctx2.arc(cx, cy, R, 0, 6.2832); ctx2.fill();
    } else {
      ctx2.fillStyle = "#0b0c0f"; ctx2.fillRect(0, 0, W, H);
    }
    var gA = 1 - 0.9 * s.t;
    if (gA > 0.01) {
      var rg = clamp(R * 0.0043, 0.75 * DPR, 2.3 * DPR);
      for (bI = 0; bI < BUCKETS; bI++) { paths[bI] = paths[bI] || []; paths[bI].length = 0; }
      for (q = 0; q < gN; q++) {
        project(GP[q * 4], GP[q * 4 + 1], GP[q * 4 + 2], GP[q * 4 + 3], tmp);
        if (tmp[2] <= 0.02) continue;
        if (tmp[0] < -m || tmp[1] < -m || tmp[0] > W + m || tmp[1] > H + m) continue;
        paths[Math.min(BUCKETS - 1, (tmp[2] * BUCKETS) | 0)].push(tmp[0], tmp[1]);
      }
      for (bI = 0; bI < BUCKETS; bI++) paint(paths[bI], rg, "rgba(214,218,226," + (gA * (0.16 + 0.7 * ((bI + 0.5) / BUCKETS))).toFixed(3) + ")");
    }
    if (s.t > 0.01) {
      var rd = clamp(R * 0.0024 * 0.34, 0.6 * DPR, 3.4 * DPR), det = [[], [], [], [], []];
      for (q = 0; q < dN; q++) {
        project(DP[q * 5], DP[q * 5 + 1], DP[q * 5 + 2], DP[q * 5 + 3], tmp);
        if (tmp[2] <= 0) continue;
        if (tmp[0] < -m || tmp[1] < -m || tmp[0] > W + m || tmp[1] > H + m) continue;
        det[DP[q * 5 + 4]].push(tmp[0], tmp[1]);
      }
      for (bI = 0; bI < 4; bI++) paint(det[bI], rd, "rgba(200,205,215," + (0.27 * s.t * (bI + 1) / 4).toFixed(3) + ")");
      paint(det[4], rd, "rgba(41,151,255," + (0.92 * s.t).toFixed(3) + ")");
    }
  }

  /* ---------- livello 2D sovrapposto: archi, città, etichette ----------
     Si ridisegna solo quando la scena cambia. L'impulso sulla città attiva
     è un elemento con animazione CSS: gira sul compositore, anche a
     pagina ferma, senza lavoro per il processore. */
  var cpt = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], overlayEmpty = false;
  var pulseEl = document.createElement("span"), pulseO = -1, pulseXY = "";
  pulseEl.className = "where__pulse";
  viz.appendChild(pulseEl);
  function placePulse(o, a) {
    var op = o && live ? r3(a) : 0;
    if (op !== pulseO) { pulseO = op; pulseEl.style.opacity = op; }
    if (!op) return;
    var xy = "translate3d(" + (o[0] / DPR).toFixed(1) + "px," + (o[1] / DPR).toFixed(1) + "px,0)";
    if (xy !== pulseXY) { pulseXY = xy; pulseEl.style.transform = xy; }
  }
  function drawOverlay(s) {
    var c = octx;
    if (s.cityA <= 0) {
      if (!overlayEmpty) { c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, H); overlayEmpty = true; }
      placePulse(null, 0);
      return;
    }
    overlayEmpty = false;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, W, H);
    for (var q = 0; q < CITIES.length; q++) project(CITIES[q].sp, CITIES[q].cp, CITIES[q].sl, CITIES[q].cl, cpt[q]);

    /* archi tra le città */
    c.lineCap = "round";
    c.lineWidth = 2.2 * DPR;
    c.globalAlpha = s.cityA;
    ARCS.forEach(function (ab, a) {
      var pr = s.arcs[a]; if (pr <= 0) return;
      var A = cpt[ab[0]], B = cpt[ab[1]];
      if (A[2] <= 0 || B[2] <= 0) return;
      var mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2;
      var dx = B[0] - A[0], dy = B[1] - A[1], len = Math.sqrt(dx * dx + dy * dy) || 1;
      var nx = -dy / len, ny = dx / len; if (ny > 0) { nx = -nx; ny = -ny; }
      var bx = mx + nx * len * 0.28, by = my + ny * len * 0.28;
      var steps = 48, end = Math.max(1, Math.round(steps * pr));
      var grad = c.createLinearGradient(A[0], A[1], B[0], B[1]);
      grad.addColorStop(0, "rgba(41,151,255,0.95)");
      grad.addColorStop(1, "rgba(167,170,255,0.95)");
      c.strokeStyle = grad;
      c.beginPath();
      for (var u = 0; u <= end; u++) {
        var tt = u / steps, it1 = 1 - tt;
        var qx = it1 * it1 * A[0] + 2 * it1 * tt * bx + tt * tt * B[0];
        var qy = it1 * it1 * A[1] + 2 * it1 * tt * by + tt * tt * B[1];
        if (u === 0) c.moveTo(qx, qy); else c.lineTo(qx, qy);
      }
      c.stroke();
    });
    c.globalAlpha = 1;

    /* città */
    c.font = "600 " + (13 * DPR) + "px " + FONT;
    c.textBaseline = "middle";
    cpt.forEach(function (o, q) {
      if (o[2] <= 0) return;
      var on = s.active === -1 || s.active === q;
      var a = s.cityA * (on ? 1 : 0.55);
      var gr = (on ? 26 : 16) * DPR;
      var g = c.createRadialGradient(o[0], o[1], 0, o[0], o[1], gr);
      g.addColorStop(0, "rgba(41,151,255," + (0.55 * a).toFixed(3) + ")");
      g.addColorStop(1, "rgba(41,151,255,0)");
      c.fillStyle = g; c.beginPath(); c.arc(o[0], o[1], gr, 0, 6.2832); c.fill();
      c.fillStyle = "rgba(255,255,255," + a.toFixed(3) + ")";
      c.beginPath(); c.arc(o[0], o[1], (on ? 4.5 : 3.5) * DPR, 0, 6.2832); c.fill();
      c.fillStyle = "rgba(245,245,247," + a.toFixed(3) + ")";
      var lx = o[0] + 12 * DPR, ly = o[1] - 12 * DPR;
      if (q === 2) { ly = o[1] + 14 * DPR; }
      c.fillText(labels[q] || "", lx, ly);
    });
    var act = s.active >= 0 ? cpt[s.active] : null;
    placePulse(act && act[2] > 0 ? act : null, s.cityA);
  }

  /* ---------- UI collegata: si scrive solo ciò che cambia ---------- */
  var lastActive = -2, lastUi = null, lastHead = -1, lastUiO = -1, lastHint = -1;
  function r3(v) { return Math.round(v * 1000) / 1000; }
  function syncUI(s) {
    if (!live) return;
    var h = r3(s.head), u = r3(s.ui), t = r3(s.hint);
    if (headEl && h !== lastHead) { lastHead = h; headEl.style.setProperty("--head-o", h); }
    if (uiEl && u !== lastUiO) { lastUiO = u; uiEl.style.setProperty("--ui-o", u); }
    if (hintEl && t !== lastHint) { lastHint = t; hintEl.style.setProperty("--hint-o", t); }
    var uiOn = s.ui > 0.05;
    if (uiOn !== lastUi) { sec.classList.toggle("ui-on", uiOn); lastUi = uiOn; }
    if (s.active !== lastActive) {
      lastActive = s.active;
      var a = s.active < 0 ? 0 : s.active;
      cards.forEach(function (el, q) { el.classList.toggle("is-active", q === a); });
      chips.forEach(function (b, q) { b.setAttribute("aria-pressed", q === a && s.active >= 0 ? "true" : "false"); });
    }
  }

  /* ---------- avvio del disegno ---------- */
  var GLOPT = { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: true, preserveDrawingBuffer: false };
  try { gl = canvas.getContext("webgl", GLOPT) || canvas.getContext("experimental-webgl", GLOPT); } catch (e) { gl = null; }
  if (gl) {
    try { setupGL(); }
    catch (e) {
      gl = null;
      /* un canvas con contesto WebGL non accetta il 2D: se ne usa uno nuovo */
      var fresh = canvas.cloneNode(false);
      canvas.parentNode.replaceChild(fresh, canvas);
      canvas = fresh;
    }
  }
  if (!gl) ctx2 = canvas.getContext("2d");
  if (!gl && !ctx2) return;
  if (gl) {
    canvas.addEventListener("webglcontextlost", function (e) { e.preventDefault(); }, false);
    canvas.addEventListener("webglcontextrestored", function () {
      try { setupGL(); } catch (e) {}
      dirtyG = dirtyO = true; schedule();
    }, false);
  }

  /* ---------- ciclo: un solo fotogramma per scroll, sincronizzato col resto della pagina ---------- */
  var visible = false, lastT = 0, lastP = -1, raf = 0;
  function frame(now) {
    if (!visible) { lastT = 0; return false; }
    var dt = lastT ? now - lastT : 16;
    if (!(dt > 0 && dt < 100)) dt = 16;
    lastT = now;
    var anim = false, s = null;
    /* rotazione lenta prima dello scroll: solo su GPU, dove costa poco */
    if (live && gl && P <= 0.001) { drift = (drift + dt * 0.0035) % 360; dirtyG = true; anim = true; }
    if (P !== lastP) { lastP = P; dirtyG = true; }
    if (dirtyG) {
      s = state(P); view(s);
      if (gl) drawGL(s); else draw2D(s);
      dirtyG = false; dirtyO = true;
    }
    if (dirtyO) {
      if (!s) { s = state(P); view(s); }
      drawOverlay(s);
      syncUI(s);
      dirtyO = false;
    }
    if (!anim) lastT = 0;
    return anim;
  }
  function schedule() {
    if (AC && AC.kick) { AC.kick(); return; }
    if (!raf) raf = requestAnimationFrame(function (now) { raf = 0; if (frame(now)) schedule(); });
  }
  if (AC && AC.loop) AC.loop(frame);

  resize();
  if ("ResizeObserver" in window) new ResizeObserver(function () { resize(); schedule(); }).observe(viz);
  else addEventListener("resize", function () { resize(); schedule(); });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) {
      visible = es[es.length - 1].isIntersecting;
      sec.classList.toggle("is-vis", visible); /* animazioni CSS del capitolo solo quando si vede */
      if (visible) { dirtyG = dirtyO = true; schedule(); }
    }, { rootMargin: "10% 0px" }).observe(live ? scroller : viz);
  } else { visible = true; schedule(); }

  if (live) {
    /* il progresso arriva nel fotogramma comune, prima del disegno (AC.loop) */
    AC.scene(scroller, "pin", function (p) { P = p; if (!AC.loop) schedule(); }, false);
    /* pulsanti città: portano lo scroll al capitolo giusto */
    var TARGET = [0.53, 0.73, 0.93];
    var goTo = function (q) {
      var top = scroller.getBoundingClientRect().top + window.scrollY;
      var span = scroller.offsetHeight - window.innerHeight;
      window.scrollTo({ top: Math.round(top + TARGET[q] * span), behavior: "smooth" });
    };
    chips.forEach(function (b, q) { b.addEventListener("click", function () { goTo(q); }); });
    uiEl.addEventListener("focusin", function () { if (P < 0.44) goTo(0); });
  } else {
    chips.forEach(function (b) { b.hidden = true; });
    var sg = sec.querySelector(".segmented"); if (sg) sg.hidden = true;
  }
  if (AC) AC.on("lang", function () { labels = names(); dirtyO = true; schedule(); });
})();
