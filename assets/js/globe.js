/* =====================================================================
   Alessandro Chiri — "Dove ho lavorato"
   Globo a punti su canvas 2D (proiezione ortografica), guidato dallo
   scroll: rotazione verso l'Italia → zoom → Milano, Roma, Bari.
   Dati terre: Natural Earth via world-atlas (pubblico dominio),
   pre-calcolati come maschere di bit (sfera di Fibonacci + griglia Italia).
   Con "Riduci movimento" mostra una mappa statica; senza JS restano le schede.
   ===================================================================== */
(function () {
  "use strict";
  var DATA = {"N":40000,"g":"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pKaAEJQKQkJSSAhIDQGhKAQEhKagEJQSAkJTSAhITQEhKAUEhKaQEJASAkJRSAhITQEhKAUEhKaQEJCaAkJRSAgITWEhKCUEhKKQEJCaAkJRCAgIRSEhICUEhKKQEBCaAkJQCggIRSEhICUFhKKQEBCKQkJQSggIRSEhIAUFhKCUEBCCQkJASggIRSEhIASEhKAUEBCKQkJACgoISSEhIASEhIAUEBCKwkJACggKQSkhIASFhIAUUBCKQkJACAgIQSkgIBSFhIAUFBCCQkJASAgLASmgIBSFhICQUBCCQkJBSAoLASmoIBSFhICQUBACUkBBKAoJASmhIASEhIKQUBACUkJBKCoLASGhIASEhIIQUBYCUlJBKCgJASGhIASkhIIQVBICQkJBCCgJBSGhKBSkpIIQUBYCQkJBCAgJBSGgIBSEpIJQUBIKQkJBCGgJBSGgLBSkhIJQUBIKQkBRCAgJBSGgJBSEhIJQUBIKQkBZKEhJBSGgJBSEgKIQUBIKQkBJKEgJBSGgJBSEgKIQEBIKQkBJKAgBBSGgJBSEgKJQkJIKQkBJKAgBBSGgJBSEgIJQEJIKAkBJKAoBBSGgJBQEgIJQUIIKAkBJKAoABaGgJBUEgJJUVAIKQkBJKAoABaGgABUEgJJUVAAKQkBBKAgABaGoABUEgIJQFAAKAkEBKggABamoABQEgIJQEAAKAlEBKggABamoABQEggJQEAAKQlEBKggABamgABQEogJUEAAKQlEBKAgABaggABSEogJUEAAKUkEBKAhEBaAgABSFogJUEIgKUEEBKAhEBaAgABSEogJQEIgKUEEAKApFBaggABSAggJQEIgKUEEAKAhFBaAgEBWgggJQEIoKQEEAKkBFBaAgEBWgogBQEIoKQFEgKgAFBaAgEBWgggBUAIoKQEEgKkBFBaAgFBWggkBUBAoKQEEgKkAFBaAAFBWAgkBUAAoKQEEoKkAFhagAFBSAgkBUhIoKQAEoKkAFhagIFBSAgkBUhIoKQAEoKEAFhagIFBWAAlBUgAoKUREoKEIFgagIFBWAAlBUgAoKUQEoKAIFhKgAFRSCAlBQhAoKUQEqKkIFpKgAFRSiAlBQhAoIUQEoKgJFpKAIFRSCAnBUBIoIUREqKAYFpKAIFRCCIlBQBAoIQREqKAYFpKAIFBCCAlBUDApIQREqIAYFoKgIFBCCAlBQDApIQREqIAQFoKAIFBCCAlRQDArIQREoIAQF5KAYFJCCAlRADApIQREoIAYFoKAYFJCDIlBADApIQTEoIAYFoKAYFJCCIlRADApAQTEoIAUFoIAYFJCCIlRACApAQTEqIAVFqIAYFJCCIlRACApAATEqIAVFqIAQFICCYlRACopAATEoIAVFoIAQFICCQlRACopAATEoIAVFoIAQFYADQlRAiopAATEoAAVFoIAUFYAiQlBAiopAASEqAAWEoIAUFIACYlAACgpAASEoAAWEoIAUFIACYlAAigpAASkoAAWEoAAUFIACYlAACghBASkqAAWEoAAUFIACQlAACghBASgoAAWEoAAUFIACUlAACghBASgoAgWEoAAUFIICUFAACghBASgoAEWkoAAUEIICUFAACghBASgoAAWgoAAUEIICUFAECghBASggBEWgoAAUEIIiUFAAikhBASggBEWhoAgUEIICUFAAikBBASggBEWgoAgUgYICUEAIikJBESggBAWgoAAUgYICUEAIjkJBESgiBQWgoAAUhYICUEAICkBBASgCBQWgiBAUhYIiUEAICkBBESgCBQWgiBAUgYIiUEQKCkARASgKBQWgiBAUgIIiUBQKCkARASgCBUWgiBQUgCIiUBQKCkARASgCBUWgKBQUgCICUBQKikARSToCRUSgKBQUgCIDUASKikBRKSgCRUSgKBQUgSICUASKiEBRKCgCRQSgCBQUgaISUASKjEBRKCgCRQSgCBQRgaIQUASKCEBRKCgCRQWgCBQRgaIQUASKCEARKCICRSWgCBQRgaJQUASKCEARKCICRSGgCBQRgSJQRASKCkARKCICRaGgCBQRgCJQRASKQkARKCICRaGICBQRgCJQRASOQlARKCICRaCICBQFgCJQRASKQhERKCICRaCICBSFoCJQRASKQBERKApARaCICBSFoCJQRASKQBERKApARaCICBSBIiJQVISKQBERKApARaCICBSBIiJQFISKQBERKApFRaCICBWBIiJQFICKQBERKAJFRKAoCBWBIiJQFIiKQBEQKgJFRKAoCBWBIiBQBIqIQBEQKgJFQKAoCBWBIiBUBIqIQFEQKgJFQKAIFBWBIiBUBIqAQFEQKgJFQKAIFBGBIiBUBIqAQBEQIgJFQKgIFAGBIiBUBIqAQBE4IgJFQKgIFAGBIiBEBIqAUBEoAgJFQKgIFAGBImBEBIqAUBEoAgJFQKgIFAGBIlBEBIqAUBEoAgJFQIgIFAGhIlAEBIqAUBEoAgJFwIgIFAGhIlAEBIqAEBEoAgJFoIgIFAGhIlAEBIqAEREoAkJFoAgIFAEhIlAEBIqAEREoAkJFoAgIFAEjIlAEBIoAERAoAkJEoAgIFAEjIlAEhIpAERAoAkJEoAgIFAEiIFAEhIhAERAoAkZAoAgIFAEiIFAEhIhAERAoAkZAoAgIEYEiIFAEjIBAERAoAkRAoAgIEYEiIFAEjIBAERAgAkRAoAAIEYEiIFAAiIBAARAiAkVAoAAYAYECIEAAiIBAARAiAgVAoAAQAYECIEAEiIBAARACAgVAgAAQAYECIEQECoAAASACAgVAgAAQAIECIAQECoAAASAAAgRAiAgQAAECQAAECIAAASAAAgRACAAQAAECQAAECIAAACAAAgTAAAAQAAEAQAAECIAAACAAAgSAAAAQAAEAQCAECIABACAAAgSAAAgQAAEAQCAECAABACAAAgCAAAgQAAEAQAAECAABACAAAgCAQAgQAAIAQCAEAAABECAAAACAQAgQAAIAQAAEAAABACAABACAQAAAAAIAQAAAAACBAAAABACAAAAAAAIAAAAAAACBAAAABACAAAAAAAIBAAAIAAABAAAABAAAAAAAAAIBAAAIAAABAAAABAAAABAAAAIAAAAIBAAAEAAABAIAABAAAAAgAAAIBAAAAAAABAAAABAIAAAgAAAIAAAAAAAABAAAABAIAAAgAAAIAAAAIAAABEAAABAAAAAAAAAIAAAAIBAAAAAAABAAAABAIAAAAAAAIAAAAAAAABAAAABAIAAAAAAAIAAAAIBAAAAAAABAAAAAAIAAIAAAAIBAAAAAAABAAAAAAIAAAAAAAIAAAAAAAAFAAAAAAIEAAAAAAIAAAAAAAgAAAAAAAAEAAAAAAIAAAAAAAgAAAAAAAAEAAAAAAIAAAAAAAgAAAAAAAAEAAAAEAIAAAAAAAgAAAAAAAAEAAAAEAAAAAAAAAgAAAAgAAAIAAAAEAAAAAAAAAgAAAAgAAAAAAAAEAAAAAAAAAAAAAAgAAAAAAAAEAAAAEAAAAAAAAAgAAAAAAAAAAAAAEAAAAABAAAgAAAAAAAAAAAAAEAAAAAAAAAAAAAAgAAAAAAAAEAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAEAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAEAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAQAAAACAAAAQgAAAAgBICUgBASEgJASEAJCSkRICSghISUgpISUkJASUFJCSkRICSkpISWgpISUjJASUnJKSkZJCSkJJSWkpJSUjNKSUlpKSk9paSkNpaW1tLSWntLSWjpKS29paS09paX1tJSW3tLSenpLT+v5KT29p6f19Jae3/NTen7Lz+n5OT+v5/f8/J6f9/N7fl7P7/l5P7/v5/f9vN/f9/N6ft/v+/n5vb/n5/38vN7f8/N6ft/P7/n9P7/v9/f+/t/f//v/fy8AEAAAAAAAAAAAAAA=","d":{"lat0":27.0,"lat1":54.0,"lon0":-5.0,"lon1":33.0,"step":0.14,"land":"////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////9////////////////////////////////////////P////////////////////////////////////8////////////////////////////////////////n///////////////////////////////////////8/////////////////////////////////////+////////////////////////////////////////z/////////////////////////////////////z////////////////////////////////////////f/////////////////////////////////////v///////////////////////////////////////////////////////////////////////////////////////////////////////w/////////////////////////////////////wH/////////////////////////////////////A/j///////////////////////////////////8D4P///////////////////////////////////wOA////////H/////////////////////////9/AAD///////8H/P+//////////////////////x8AAP7/////PwDg/wv///////////////////9/AAAA/v////8fAID/AP///////////////////z8AAAD+/////wEAAHIB////////////////////HwAAAP///38AAAAAAID///////////////////8PAACA////PwAAAAAAwP///////////////////wMAAOD///8PAAAAAADw////////////////////AAAA8P//DwAAAAAAAPj//////////////////z8AAAD4//8AAAAAAAAA/v//////////////////DwAAAPz/BwAAAAAAAID//////////////////z8AAAAA//8BAAAAAAAA8P//////////////////AQAAAID/PwAAAAAAAAD+/////////////////wcAAAAA4P8AAAAAAAAA4P///////////////x8MAAAAAADgAwAAAAAAAAD+//////////////9/AAAAAAAAAAAAAAAAAAAA4P///////////////wEAAAAAAAAAAAAAAAAAAAD+//////////////8BAAAAAAAAAAAAAAAAAAAA8P//////////////DwAAAAAAAAAAAAAAAAAAAID//////////////08AAAAAAAAAAAAAAAAAAAAA/v////////////8PAAAAAAAAAAAAAAAAAAAAAPj/////////////HwMAAAAAAAAAAAAAAAAAAADw/////////////z8AAAAAAAAAAAAAAAAAAAAAwP////////////9/AAAAAAAAAAAAAAAAAAAAAID//////////////wEAAAAAAAAAAAAAAAAAAAAA//////////////8HAAAAAAAAAAAAAAAAAAAAAP//////////////DwAAAAAAAAAAAAAAAAAAAAD//////////////w8AAAAAAAAAAAAAAAAAAADg//////////////8fAAAAAAAAAAAAAAAAAAAA+P//////////////BwAAAAAAAAAAAHAAAAAAAP//if///////////wMAAAAAAAAAAAD+BgAAAAAPRID///////////8BAAAAAAAAAAD8PwAAAAAAAQCA//////////9/AAAAAAAAAAAAzwAIAAAAAAAA4P//////////DwAAAAAAAAAAAAEAAAAAAAAAAPD//////////wEAAAAAAAAAAAAAAAAAAAAAAADI/////////w8AAAAAAAAAAAAAAAAAAAAAAAAA+P///////38AACAAAAAAAAAAAAAIAAAAAAAAgP////////8DAAAAAAAAAAAAAADAAAAADAAAAPD///////8/AAAAAAAAAAAgAAAADjgBeAAAAAD+////////AAAAAAAAAAAAAAAAIPgH4B8AAACA////////HwAAAAAAAAAAAAAAAMB/gP8AAAAAAP7//v///wAAAAAAAAAAJAACAAT/gf//nwAAAAD/4f//PwcBgAMAAAAA0gCBgHj/h////wcAAAAAAJ6T/xgAAA8AAAAA9gEEgMD//////w8AAAAAAAgA/AEAAD8AAAAA/APAAfz//////x8AAAAAAAAAcAEA4D8AAAAA/AMAAPD//////z8AAAAAAAAAAAAA8D8AAAAA+CkEAPz//////38AAAAAAAAAAAAA/h8AAAAA/AwQAP7///////8HAAAAAAAAAADA/x8AAAAA/wMRCP////////8BAAAAAAAAAAD4/wcAAADk/xAAsP////////8BAAAAAAAAAAD4/wcAAADwPwwBwP///////38AAAAAAAAAAAB04DsAAAD49xMA+P///////38AAAAAAAAAAAAAgB8AACA4+ANI/////////w8AAAAAAAAAAAAAAAcAAKbgTwDq/////////wcAAAAAAAAAAAAA4AEAAPz/DmD5/////////wEAAAAAAAAAAAAAHgAA4P/3AND/////////fwAAAAAAAAAAAAAAAwAA/Z8BAPj/////////AQEAAAAAAAAAAAA4AADwvwcAgP////////8HGAAAAAAwAAAAAMAHAAD/LwDg/v///////x8AAAAAAPAJAAAAAD8AQP+fA8D5////////fwAAAAAAAD8AAAAA/AAA/v8DAOT/////////AQAcAAAA/gAAAAD4AQD9/wMAgP////////8PAPwAAADwAwAAAPADAPT/BwDg/////////x8A4AMAAOAPAAAA4AEA/P8PAMD//////////wAAQQAAgB8AAADABxjg/x8Ahv//////////AQBgAADAHwAAANAHGOD/DwkA//////////8DAAAAAIAfAAAA+A848P8PJGD//////////wMAAAAAwB8AAAD8Dx/8/8cJgP//////////AwAAAADgHwAAAP7vB/z/9wGEicD///////8DAAAAAPgHAACA//8A//97AAAB+P///////wEAAAAA/gEAAPj/H+D//x8G/ACA//////8/AAAAAEA+AADA//8A+P//n+A/AP///////x8AAAAAgA8AAPj/DwD///+//y/0////////BwAAAABgAADA/z8A8P/////////w//////8HAAAAAAAAQP//AAD+//////8HAP7//////wAAAAAAAAD//wMA8P//////DwDA//////8/AAAAgAMA+P8fAAD//////38AAPj//////wcAAAA4AMD//wEA8P//////AQAA////////AAAAwAEA//8fAID//////w8AAOD//////wcAAAAPAP7/AQCA//////8/AAAA/v////8fAAAAfAD8/wMAAP7//////wAAAPj/////fwAAAPgA+P8DAAD+//////8AAADw//////8AAADwAfr/BwAA/P//////AQAA4P////9/AAAA4AH8/wMAAP///////wAAAOD//////wAAAIAB/P8BAID///////8BAADg/////38AAAAAIf//AADw////////AQAA8P////9/AAAAAOD/fwDA/v///////wAAAPj/////HwAYAADw/x8AAP///////38AAAD+/////x+APwAA/P8HAPD///////8fAACA/47///8P+g8AgP//AGD+////////BwAAAADA////9/4DAPD/HwD6/////////wcAAAAA+P//////AAD//wDg/////////z8AAAAAAP//////fwDw/wcA//////////8HAAAAAPD//////x+A/x8A/f////////8/AAAAAID///////8A/38A4P//////////AQAAAAD8//////8P/v8AwP//////////BwAAAADA////////+P8HgP7/////////fwAAAAAA//////////8fAPT//////////wEAAAAA+P////////9/AOT//////////w8AAAAA8P//////////Acj//////////x8AAAAAwP//////////B4T//////////78DAAAAwP//////////B+7///////////8DAAAAgP//////////B87///////////8DAAAAwP7/////////A/////////////8BgAAAQP//////////gf////////////8AgAEA4P//////////h////////////z8AQAAA/P///////////////////////z8AAACA/////////////////////////w8AAADQ/////////////////////////wNAAAD8////////////////////////f4AHAID/////////////////////////D34AgP////////////////////////9/6AMA/P////////////////////////8HGgDw//////////////////////////9/AMD///////////////////////////8BQP//////////////////////////7wMA////////////////////////////B4D9//////////////////////////8HAP///////////////////////////wfA////////////////////////////A/T////////////////////////////R////////////////////////////f/z///////////////////////////8f//////////////////////////////P///////////////////////////9//////////////////////////////+e///////////////////////////9/2KH//////////////////////////wMG+P////////////////////////8fAOD/////////////////////////fwCA//////////////////////////8BAP7/////////////////////////AwAO/P///////////////////////wcADvj///////////////////////8HABT4////////////////////////BwAA8P///////////////////////wMAAID///////////////////////8BAADA////////////////////////IAAAwP///////////////////////w8AAPj///////////////////////8BAAD//////////////////////39/nADg///////////////////////H/08M/v////////////////////9//v//4///////////////////////w///P/D/////////////////////H87//wP/////////////////////fwD+/w2w/////////////////////4H5/wGA/f///////////////////4f//x8A/P////////////////////e//x8A+P///////////////////////38A+P////////////////////f///8A+P///////////////////+P///8A8P///////////////////+H//z8A+P//////////////////f/D//x8A/v//////////////////H/7//wOA////////////////////w///fwDw//////////////////9/+v+fAwD+///////////////////H//8DAKD//////////////////3/+/z8AAPD//////////////////7Py/wEAAL//////////////////H+D/BwAADN////////////////9/AP8PAAAAeP7///////////////8B/j8AAAAA/P//8////////////wP4fwAAAACA////////////////Bw==","italy":"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABgAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4D8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8D8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/h8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADA/x8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD4/wcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD4/wcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB04DsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgB8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAAMAHAAAAAAAAAAAAAAAAAAAAAAAAAPAJAAAAAD8AAAAAAAAAAAAAAAAAAAAAAAAAAD8AAAAA/AAAAAAAAAAAAAAAAAAAAAAAAAAA/gAAAAD4AQAAAAAAAAAAAAAAAAAAAAAAAADwAwAAAPADAAAAAAAAAAAAAAAAAAAAAAAAAOAPAAAA4AEAAAAAAAAAAAAAAAAAAAAAAAAAgB8AAADABxgAAAAAAAAAAAAAAAAAAAAAAADAHwAAANAHGAAAAAAAAAAAAAAAAAAAAAAAAIAfAAAA+A84AAAAAAAAAAAAAAAAAAAAAAAAwB8AAAD8Dx8AAAAAAAAAAAAAAAAAAAAAAADgHwAAAP7vBwAAAAAAAAAAAAAAAAAAAAAAAPgHAACA//8AAAAAAAAAAAAAAAAAAAAAAAAA/gEAAPj/HwAAAAAAAAAAAAAAAAAAAAAAAEA+AADA//8AAAAAAAAAAAAAAAAAAAAAAAAAgA8AAPj/DwAAAAAAAAAAAAAAAAAAAAAAAABgAADA/z8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAQP//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//wMAAAAAAAAAAAAAAAAAAAAAAAAAAAAA+P8fAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMD//wEAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//8fAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP7/AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAD8/wMAAAAAAAAAAAAAAAAAAAAAAAAAAAAA+P8DAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPr/BwAAAAAAAAAAAAAAAAAAAAAAAAAAAAD8/wMAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/P8BAAAAAAAAAAAAAAAAAAAAAAAAAAAAIP//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAOD/fwAAAAAAAAAAAAAAAAAAAAAAAAAAAADw/x8AAAAAAAAAAAAAAAAAAAAAAAAAAAAA/P8HAAAAAAAAAAAAAAAAAAAAAAAAAAAAgP//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAPD/HwAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//wAAAAAAAAAAAAAAAAAAAAAAAAAAQADw/wcAAAAAAAAAAAAAAAAAAAAAAAAAAByA/xsAAAAAAAAAAAAAAAAAAAAAAAAAAMAA/38AAAAAAAAAAAAAAAAAAAAAAAAAAOAP/v8AAAAAAAAAAAAAAAAAAAAAAAAAAID/+P8HAAAAAAAAAAAAAAAAAAAAAAAAAAD+//8fAAAAAAAAAAAAAAAAAAAAAAAAAADw//9/AAAAAAAAAAAAAAAAAAAAAAAAAADA////AQAAAAAAAAAAAAAAAAAAAAAAAADA////BwAAAAAAAAAAAAAAAAAAAAAAAADA////BwAAAAAAAAAAAAAAAAAAAAAAAAAA////BwAAAAAAAAAAAAAAAAAAAAAAAAAA////AwAAAAAAAAAAAAAAAAAAAAAAAACA////AQAAAAAAAAAAAAAAAAAAAAAAAADg////BwAAAAAAAAAAAAAAAAAAAAAAAAD8////HwAAAAAAAAAAAAAAAAAAAAAAAAD8+///AQAAAAAAAAAAAAAAAAAAAAAAAAB4//8/AAAAAAAAAAAAAAAAAAAAAAAAAADj//8HAAAAAAAAAAAAAAAAAAAAAAAAACDU/z8AAAAAAAAAAAAAAAAAAAAAAAAAACD+/wcAAAAAAAAAAAAAAAAAAAAAAAAAAMD/BwAAAAAAAAAAAAAAAAAAAAAAAAAAAP8DAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=="}};

  var sec = document.getElementById("dove");
  if (!sec || !DATA) return;
  var canvas = sec.querySelector(".where__canvas");
  var scroller = sec.querySelector(".where__scroller");
  var ctx = canvas && canvas.getContext ? canvas.getContext("2d") : null;
  if (!ctx) return;

  var AC = window.AC || null;
  var reduced = AC ? AC.reduced() : matchMedia("(prefers-reduced-motion: reduce)").matches;
  var live = !!AC && !reduced;
  sec.classList.add(live ? "is-live" : "is-static");

  var D2R = Math.PI / 180;
  var cards = Array.prototype.slice.call(sec.querySelectorAll(".city"));
  var chips = Array.prototype.slice.call(sec.querySelectorAll(".segmented button"));

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* ---------- decodifica maschere ---------- */
  function bytes(b64) {
    var bin = atob(b64), u = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    return u;
  }
  function bit(u, i) { return (u[i >> 3] >> (i & 7)) & 1; }

  /* sfera di Fibonacci: stessi calcoli dello script di generazione */
  var N = DATA.N, GA = Math.PI * (3 - Math.sqrt(5)), gm = bytes(DATA.g), gc = 0, i;
  for (i = 0; i < N; i++) if (bit(gm, i)) gc++;
  var gSP = new Float32Array(gc), gCP = new Float32Array(gc), gSL = new Float32Array(gc), gCL = new Float32Array(gc);
  for (i = 0, gc = 0; i < N; i++) {
    if (!bit(gm, i)) continue;
    var y = 1 - 2 * (i + 0.5) / N, lon = (i * GA) % (2 * Math.PI);
    if (lon > Math.PI) lon -= 2 * Math.PI;
    gSP[gc] = y; gCP[gc] = Math.sqrt(1 - y * y); gSL[gc] = Math.sin(lon); gCL[gc] = Math.cos(lon); gc++;
  }

  /* griglia esagonale di dettaglio sull'Italia */
  var d = DATA.d, lm = bytes(d.land), im = bytes(d.italy);
  var dList = [], idx = 0, j = 0, la = d.lat0;
  while (la <= d.lat1 + 1e-9) {
    var step = d.step / Math.cos(la * D2R), off = (j % 2) ? step / 2 : 0;
    var n = Math.floor((d.lon1 - d.lon0 - off) / step) + 1;
    for (var k = 0; k < n; k++, idx++) {
      if (bit(lm, idx)) {
        var lo = d.lon0 + off + k * step, cl = Math.cos(la * D2R);
        var ed = Math.min(la - d.lat0, d.lat1 - la, (lo - d.lon0) * cl, (d.lon1 - lo) * cl);
        dList.push(la, lo, bit(im, idx) ? 4 : Math.min(3, Math.floor(clamp(ed / 4, 0, 1) * 3.999)));
      }
    }
    j++; la = d.lat0 + j * d.step;
  }
  var dc = dList.length / 3;
  var dSP = new Float32Array(dc), dCP = new Float32Array(dc), dSL = new Float32Array(dc), dCL = new Float32Array(dc), dIT = new Uint8Array(dc);
  for (i = 0; i < dc; i++) {
    var p0 = dList[i * 3] * D2R, l0 = dList[i * 3 + 1] * D2R;
    dSP[i] = Math.sin(p0); dCP[i] = Math.cos(p0); dSL[i] = Math.sin(l0); dCL[i] = Math.cos(l0); dIT[i] = dList[i * 3 + 2];
  }
  dList = null;

  /* ---------- luoghi ---------- */
  var CITIES = [
    { lat: 45.4642, lon: 9.19 },   /* Milano */
    { lat: 41.9028, lon: 12.4964 },/* Roma */
    { lat: 41.1171, lon: 16.8719 } /* Bari */
  ];
  var ARCS = [[0, 1], [1, 2], [2, 0]];
  var ITALY = { lat: 42.2, lon: 12.4 };
  var START = { lat: 22, lon: -38 };
  function names() {
    return cards.map(function (c) { var h = c.querySelector(".city__name"); return h ? h.textContent : ""; });
  }
  var labels = names();

  /* ---------- utilità ---------- */
  function seg(p, a, b) { return clamp((p - a) / (b - a), 0, 1); }
  function eio(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function lerpAng(a, b, t) { var dd = ((b - a + 540) % 360) - 180; return a + dd * t; }
  function mix(a, b, t) { return { lat: lerp(a.lat, b.lat, t), lon: lerpAng(a.lon, b.lon, t) }; }
  var FONT = '-apple-system, BlinkMacSystemFont, "InterVariable", "Segoe UI", Roboto, sans-serif';

  /* ---------- dimensioni ---------- */
  var W = 0, H = 0, DPR = 1, cw = 0, ch = 0;
  function resize() {
    var r = canvas.getBoundingClientRect();
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    cw = r.width; ch = r.height;
    W = Math.max(1, Math.round(cw * DPR)); H = Math.max(1, Math.round(ch * DPR));
    if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
    dirty = true;
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
    var f = function (k) { return mix(ITALY, CITIES[k], 0.5); };
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

  /* ---------- disegno ---------- */
  var dirty = true, pulse = 0;
  function project(sp, cp, sl, cl, S, out) {
    var cosD = cl * S.cl0 + sl * S.sl0, sinD = sl * S.cl0 - cl * S.sl0;
    var cosc = S.sp0 * sp + S.cp0 * cp * cosD;
    out[0] = S.x + S.R * cp * sinD;
    out[1] = S.y - S.R * (S.cp0 * sp - S.sp0 * cp * cosD);
    out[2] = cosc;
  }
  var tmp = [0, 0, 0];
  var BUCKETS = 6;
  var paths = [];

  function draw(now) {
    var s = state(P);
    var R = s.R * DPR, cx = s.x * DPR, cy = s.y * DPR;
    var S = { x: cx, y: cy, R: R,
      sp0: Math.sin(s.c.lat * D2R), cp0: Math.cos(s.c.lat * D2R),
      sl0: Math.sin(s.c.lon * D2R), cl0: Math.cos(s.c.lon * D2R) };

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);

    var big = Math.max(W, H);
    /* atmosfera e corpo del globo */
    if (R < big * 2.2) {
      var glow = ctx.createRadialGradient(cx, cy, R * 0.92, cx, cy, R * 1.22);
      glow.addColorStop(0, "rgba(41,151,255,0.20)");
      glow.addColorStop(1, "rgba(41,151,255,0)");
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.22, 0, 6.2832); ctx.fill();
    }
    if (R < big * 6) {
      var body = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.45, R * 0.05, cx, cy, R);
      body.addColorStop(0, "#1b1f27");
      body.addColorStop(1, "#07080a");
      ctx.fillStyle = body;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.2832); ctx.fill();
    } else {
      ctx.fillStyle = "#0b0c0f"; ctx.fillRect(0, 0, W, H);
    }

    var m = 8 * DPR, i, bI;
    function paint(arr, r, color) {
      if (!arr.length) return;
      ctx.fillStyle = color;
      var q;
      if (r < 1.6) { var w = r * 2; for (q = 0; q < arr.length; q += 2) ctx.fillRect(arr[q] - r, arr[q + 1] - r, w, w); return; }
      ctx.beginPath();
      for (q = 0; q < arr.length; q += 2) { ctx.moveTo(arr[q] + r, arr[q + 1]); ctx.arc(arr[q], arr[q + 1], r, 0, 6.2832); }
      ctx.fill();
    }
    /* punti globali */
    var gA = 1 - 0.9 * s.t;
    if (gA > 0.01) {
      var rg = clamp(R * 0.0043, 0.75 * DPR, 2.3 * DPR);
      for (bI = 0; bI < BUCKETS; bI++) { paths[bI] = paths[bI] || []; paths[bI].length = 0; }
      for (i = 0; i < gSP.length; i++) {
        project(gSP[i], gCP[i], gSL[i], gCL[i], S, tmp);
        if (tmp[2] <= 0.02) continue;
        var px = tmp[0], py = tmp[1];
        if (px < -m || py < -m || px > W + m || py > H + m) continue;
        bI = Math.min(BUCKETS - 1, (tmp[2] * BUCKETS) | 0);
        paths[bI].push(px, py);
      }
      for (bI = 0; bI < BUCKETS; bI++) {
        var al = gA * (0.16 + 0.7 * ((bI + 0.5) / BUCKETS));
        paint(paths[bI], rg, "rgba(214,218,226," + al.toFixed(3) + ")");
      }
    }

    /* punti di dettaglio (Italia evidenziata, bordi della regione sfumati) */
    if (s.t > 0.01) {
      var rd = clamp(R * 0.0024 * 0.34, 0.6 * DPR, 3.4 * DPR);
      var det = [[], [], [], [], []];
      for (i = 0; i < dSP.length; i++) {
        project(dSP[i], dCP[i], dSL[i], dCL[i], S, tmp);
        if (tmp[2] <= 0) continue;
        if (tmp[0] < -m || tmp[1] < -m || tmp[0] > W + m || tmp[1] > H + m) continue;
        det[dIT[i]].push(tmp[0], tmp[1]);
      }
      for (bI = 0; bI < 4; bI++) paint(det[bI], rd, "rgba(200,205,215," + (0.27 * s.t * (bI + 1) / 4).toFixed(3) + ")");
      paint(det[4], rd, "rgba(41,151,255," + (0.92 * s.t).toFixed(3) + ")");
    }

    /* archi tra le città */
    var pts = CITIES.map(function (c) {
      var o = [0, 0, 0];
      project(Math.sin(c.lat * D2R), Math.cos(c.lat * D2R), Math.sin(c.lon * D2R), Math.cos(c.lon * D2R), S, o);
      return o;
    });
    ctx.lineCap = "round";
    ARCS.forEach(function (ab, k) {
      var pr = s.arcs[k]; if (pr <= 0 || s.cityA <= 0) return;
      var A = pts[ab[0]], B = pts[ab[1]];
      if (A[2] <= 0 || B[2] <= 0) return;
      var mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2;
      var dx = B[0] - A[0], dy = B[1] - A[1], len = Math.sqrt(dx * dx + dy * dy) || 1;
      var nx = -dy / len, ny = dx / len; if (ny > 0) { nx = -nx; ny = -ny; }
      var bx = mx + nx * len * 0.28, by = my + ny * len * 0.28;
      var steps = 48, end = Math.max(1, Math.round(steps * pr));
      var grad = ctx.createLinearGradient(A[0], A[1], B[0], B[1]);
      grad.addColorStop(0, "rgba(41,151,255,0.95)");
      grad.addColorStop(1, "rgba(167,170,255,0.95)");
      ctx.strokeStyle = grad; ctx.lineWidth = 2.2 * DPR;
      ctx.beginPath();
      for (var u = 0; u <= end; u++) {
        var tt = u / steps, it1 = 1 - tt;
        var qx = it1 * it1 * A[0] + 2 * it1 * tt * bx + tt * tt * B[0];
        var qy = it1 * it1 * A[1] + 2 * it1 * tt * by + tt * tt * B[1];
        if (u === 0) ctx.moveTo(qx, qy); else ctx.lineTo(qx, qy);
      }
      ctx.globalAlpha = s.cityA;
      ctx.stroke();
      ctx.globalAlpha = 1;
    });

    /* città */
    if (s.cityA > 0) {
      ctx.font = "600 " + (13 * DPR) + "px " + FONT;
      ctx.textBaseline = "middle";
      pts.forEach(function (o, k) {
        if (o[2] <= 0) return;
        var on = s.active === -1 || s.active === k;
        var a = s.cityA * (on ? 1 : 0.55);
        var gr = (on ? 26 : 16) * DPR;
        var g = ctx.createRadialGradient(o[0], o[1], 0, o[0], o[1], gr);
        g.addColorStop(0, "rgba(41,151,255," + (0.55 * a).toFixed(3) + ")");
        g.addColorStop(1, "rgba(41,151,255,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(o[0], o[1], gr, 0, 6.2832); ctx.fill();
        if (live && s.active === k) {
          var ph = (now % 2200) / 2200;
          ctx.strokeStyle = "rgba(255,255,255," + (0.5 * (1 - ph) * a).toFixed(3) + ")";
          ctx.lineWidth = 1.5 * DPR;
          ctx.beginPath(); ctx.arc(o[0], o[1], (6 + 18 * ph) * DPR, 0, 6.2832); ctx.stroke();
        }
        ctx.fillStyle = "rgba(255,255,255," + a.toFixed(3) + ")";
        ctx.beginPath(); ctx.arc(o[0], o[1], (on ? 4.5 : 3.5) * DPR, 0, 6.2832); ctx.fill();
        ctx.fillStyle = "rgba(245,245,247," + a.toFixed(3) + ")";
        var lx = o[0] + 12 * DPR, ly = o[1] - 12 * DPR;
        if (k === 2) { lx = o[0] + 12 * DPR; ly = o[1] + 14 * DPR; }
        ctx.fillText(labels[k] || "", lx, ly);
      });
    }
    return s;
  }

  /* ---------- UI collegata ---------- */
  var lastActive = -2, lastUi = -1;
  function syncUI(s) {
    if (!live) return;
    sec.style.setProperty("--head-o", s.head.toFixed(3));
    sec.style.setProperty("--ui-o", s.ui.toFixed(3));
    sec.style.setProperty("--hint-o", s.hint.toFixed(3));
    var uiOn = s.ui > 0.05;
    if (uiOn !== lastUi) { sec.classList.toggle("ui-on", uiOn); lastUi = uiOn; }
    if (s.active !== lastActive) {
      lastActive = s.active;
      var a = s.active < 0 ? 0 : s.active;
      cards.forEach(function (c, k) { c.classList.toggle("is-active", k === a); });
      chips.forEach(function (b, k) { b.setAttribute("aria-pressed", k === a && s.active >= 0 ? "true" : "false"); });
    }
  }

  /* ---------- ciclo ---------- */
  var visible = false, raf = 0, lastT = 0, lastP = -1;
  function frame(now) {
    raf = 0;
    if (!visible) return;
    var dt = lastT ? Math.min(64, now - lastT) : 16; lastT = now;
    var drifting = live && P <= 0.001;
    if (drifting) { drift = (drift + dt * 0.0035) % 360; dirty = true; }
    var pulsing = live && P >= 0.4;
    if (dirty || pulsing || P !== lastP) {
      var s = draw(now);
      syncUI(s);
      dirty = false; lastP = P;
    }
    if (live) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf && visible) raf = requestAnimationFrame(frame); }

  resize();
  if ("ResizeObserver" in window) new ResizeObserver(function () { resize(); kick(); }).observe(canvas);
  else addEventListener("resize", function () { resize(); kick(); });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (visible) { lastT = 0; dirty = true; kick(); }
    }, { rootMargin: "10% 0px" }).observe(live ? scroller : canvas);
  } else { visible = true; kick(); }

  if (live) {
    AC.scene(scroller, "pin", function (p) { P = p; kick(); }, false);
    /* pulsanti città: portano lo scroll al capitolo giusto */
    var TARGET = [0.53, 0.73, 0.93];
    function goTo(k) {
      var top = scroller.getBoundingClientRect().top + window.scrollY;
      var span = scroller.offsetHeight - window.innerHeight;
      window.scrollTo({ top: Math.round(top + TARGET[k] * span), behavior: "smooth" });
    }
    chips.forEach(function (b, k) { b.addEventListener("click", function () { goTo(k); }); });
    sec.querySelector(".where__ui").addEventListener("focusin", function () { if (P < 0.44) goTo(0); });
  } else {
    chips.forEach(function (b) { b.hidden = true; });
    var sg = sec.querySelector(".segmented"); if (sg) sg.hidden = true;
  }
  if (AC) AC.on("lang", function () { labels = names(); dirty = true; kick(); });
})();
