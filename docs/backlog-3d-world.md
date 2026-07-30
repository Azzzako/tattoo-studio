# Mundo 3D — backlog

Fuera de scope en esta iteración. Pendiente para después de validar
el flujo Cotizar/Reservar en producción.

## Visión

Los clientes podrán previsualizar un tatuaje sobre un modelo 3D de su
cuerpo (o zona específica) antes de reservar. El tatuador valida la
composición en 3D durante la consulta y antes de aceptar.

## Features candidatos

1. **Modelos 3D de referencia** (brazo, antebrazo, espalda, pierna).
   Reusables, ajustables por tono de piel.
2. **Upload de imagen del tatuaje** (PNG transparente, 1024x1024).
3. **Overlay AR en canvas** del tatuaje sobre la zona. Decal automático
   con curvatura básica.
4. **Snapshot** que se adjunta a la cotización (`quote_attachments`).
5. **Panel del tatuador**: ajusta escala, ángulo, posición del tatuaje.
6. **Compartir con cliente** vía WhatsApp con snapshot + URL.

## Stack tentativo

- Three.js + React Three Fiber para rendering.
- Modelos 3D desde Sketchfab CC0 o generación procedural.
- WebXR / WebGL en navegadores modernos.
- Storage: bucket `ar-models` en Supabase Storage.

## Riesgos

- Performance en móviles: debe ser < 60 FPS en gama media.
- Privacidad: el modelo 3D del cliente es dato sensible. ¿Se guarda o
  se procesa client-side y se descarta?
- Acoplamiento: el feature no debería tocar el booking flow actual
  hasta que esté maduro.

## Out of scope ahora

- Cualquier implementación de UI 3D.
- Storage de modelos 3D.
- Tracking de feedback del tatuador.

## Trigger para retomar

Cuando tengamos ≥ 50 cotizaciones reales validadas en producción y el
equipo tenga banda, evaluar costo-beneficio y stack.
