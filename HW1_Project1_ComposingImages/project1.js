// bgImg is the background image to be modified.
// fgImg is the foreground image.
// fgOpac is the opacity of the foreground image.
// fgPos is the position of the foreground image in pixels. It can be negative and (0,0) means the top-left pixels of the foreground and background are aligned.
function composite( bgImg, fgImg, fgOpac, fgPos )
{
      // Recorremos píxeles del fg (foreground)
      for (let j = 0; j < fgImg.height; j++) {
        for (let i = 0; i < fgImg.width; i++) {
            
            // Calculamos posición en bg (background)
            let xBg = fgPos.x + i;
            let yBg = fgPos.y + j;

            // Si está fuera de los límites del background, lo ignoramos
            if (xBg < 0 || xBg >= bgImg.width)  continue;
            if (yBg < 0 || yBg >= bgImg.height) continue;

            // Índices en el array data
            let fgIndex = (j * fgImg.width + i) * 4;
            let bgIndex = (yBg * bgImg.width + xBg) * 4;

            // Escalamos alpha de primer plano [0..1]
            let alphaF = (fgImg.data[fgIndex + 3] / 255) * fgOpac;
            // Alpha del fondo [0..1]
            let alphaB = bgImg.data[bgIndex + 3] / 255;

            // Mezclamos R, G, B
            for (let c = 0; c < 3; c++) {
                let colorF = fgImg.data[fgIndex + c];
                let colorB = bgImg.data[bgIndex + c];
                let out = colorF * alphaF + colorB * (1 - alphaF);
                bgImg.data[bgIndex + c] = out;
            }

            let outA = alphaF + alphaB * (1 - alphaF);
            bgImg.data[bgIndex + 3] = outA * 255;
        }
    } 
}
