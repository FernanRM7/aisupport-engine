# AI Support Engine

API de clasificación de solicitudes de soporte con dos modos: reglas determinísticas (`traditional`) y análisis generativo con Workers AI a través de Cloudflare AI Gateway (`generative`).

## Fases del reto

1. Contrato y validación: Zod valida entrada y salida común.
2. Motor tradicional: reglas, prioridad, respuesta predeterminada y precedencia de seguridad.
3. API: `POST /api/analyze`, errores controlados y endpoint `/health`.
4. Motor generativo: invocación real del modelo enlazado al Worker, salida JSON validada y elevación de revisión humana para `SECURITY`.
5. Evaluación: dataset de 12 casos con ambigüedad e intentos de prompt injection.
6. Repositorio público y demo: proyecto publicado; smoke test y comparación real del modelo documentados abajo.

## Requisitos

Node.js 22+ y npm. Para análisis generativo se necesita una cuenta Cloudflare con Workers AI habilitado. La cuenta debe disponer del binding AI y Gateway configurados; no se guardan credenciales en el código.

## Ejecutar localmente

```sh
npm install
npm run dev
```

Prueba tradicional:

```sh
curl -s http://localhost:8787/api/analyze \
  -H 'content-type: application/json' \
  -d '{"message":"No puedo iniciar sesión","mode":"traditional"}'
```

Prueba generativa (requiere autenticación de Wrangler y configuración del Gateway):

```sh
npx wrangler login
curl -s http://localhost:8787/api/analyze \
  -H 'content-type: application/json' \
  -d '{"message":"No puedo iniciar sesión","mode":"generative"}'
```

Ambos modos devuelven `category`, `priority`, `response`, `requiresHumanReview` y `mode`. La entrada acepta mensajes de 1 a 4000 caracteres. `SECURITY` siempre activa revisión humana. Los fallos de proveedor o del formato del modelo responden HTTP 502; el detalle interno no se devuelve.

## Pruebas y comparación

```sh
npm test
npm run typecheck
```

Prueba real del modelo (abre otra terminal; requiere `npm run dev`, `npx wrangler login` y Workers AI habilitado):

```sh
npm run test:live
```

Con el servidor local funcionando y autenticado para AI:

```sh
npm run compare
```

El comparador consulta ambos modos sobre los mismos 12 casos definidos previamente en `tests/dataset.json` (12 invocaciones reales del modelo), valida el contrato y genera `evidence/comparison.json` con resultados observados, referencia y métricas. El resultado comprometido en `evidence/results.md` corresponde a una ejecución real del 12 de noviembre de 2026. También imprime porcentaje de aciertos por motor. Define otra URL con `API_BASE_URL` si hace falta.

## Límites y costos

AI Gateway está disponible en todos los planes, pero no convierte la inferencia en ilimitada ni necesariamente gratuita. Workers Free permite 100.000 solicitudes de Worker por día y 10 ms de CPU por invocación. Workers AI publica una asignación gratuita de 10.000 Neurons diarios; al excederla, la documentación indica que hace falta Workers Paid. El costo y los límites dependen del modelo. Unified Billing usa créditos prepagados (con 5% de cargo al comprar créditos). Verifica la facturación del modelo y el Gateway en el dashboard antes de ejecutar lotes.

La inferencia usa el modelo Workers AI `@cf/openai/gpt-oss-20b` mediante binding remoto y Gateway `default`; también consume cuota durante desarrollo local. La documentación lista 18.182 Neurons por millón de tokens de entrada y 27.273 por millón de salida. Con `max_tokens: 512`, una ejecución típica usa una pequeña fracción de las 10.000 Neurons gratuitas diarias; el consumo real depende del prompt y de los tokens de razonamiento. Revisa el dashboard de Workers AI. La espera externa es una subrequest y no consume CPU activa del Worker.

## Referencias oficiales

- [Hono en Cloudflare Workers](https://hono.dev/docs/getting-started/cloudflare-workers)
- [AI Gateway](https://developers.cloudflare.com/ai-gateway/)
- [AI Gateway: inicio rápido](https://developers.cloudflare.com/ai-gateway/get-started/)
- [Workers AI: gpt-oss-20b, uso y precio](https://developers.cloudflare.com/workers-ai/models/gpt-oss-20b/)
- [Workers AI: precios y cuota gratuita](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- [Workers: precios y límites del plan Free](https://developers.cloudflare.com/workers/platform/pricing/)
- [AI Gateway: Unified Billing](https://developers.cloudflare.com/ai-gateway/features/unified-billing/)

## Nota sobre métricas

La clasificación de referencia es una convención definida para este ejercicio. Accuracy exige coincidencia de categoría **y** prioridad. Una ejecución generativa requiere conexión real con el modelo; no se incluyen respuestas generativas pregrabadas.
