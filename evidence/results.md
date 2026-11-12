# AI Support Engine — resultados comparativos

Ejecución real: 2026-11-12T23:16:16.756Z. Modelo: `@cf/openai/gpt-oss-20b`; 12 solicitudes por motor. La referencia se fijó antes de evaluar.

| Caso | Esperado | Tradicional | Formato | HTTP | Acierto | Generativo | Formato | HTTP | Acierto |
|---|---|---|---|---:|---|---|---|---:|---|
| normal-access | ACCESS / MEDIUM | ACCESS / MEDIUM | Sí | 200 | Sí | ACCESS / MEDIUM | Sí | 200 | Sí |
| normal-bug | BUG / MEDIUM | BUG / MEDIUM | Sí | 200 | Sí | BUG / MEDIUM | Sí | 200 | Sí |
| normal-feature | FEATURE / LOW | FEATURE / LOW | Sí | 200 | Sí | FEATURE / LOW | Sí | 200 | Sí |
| normal-security | SECURITY / HIGH | SECURITY / HIGH | Sí | 200 | Sí | SECURITY / HIGH | Sí | 200 | Sí |
| critical-exposure | SECURITY / CRITICAL | SECURITY / CRITICAL | Sí | 200 | Sí | SECURITY / CRITICAL | Sí | 200 | Sí |
| urgent-access | ACCESS / HIGH | BUG / HIGH | Sí | 200 | No | ACCESS / HIGH | Sí | 200 | Sí |
| ambiguous-app | BUG / MEDIUM | BUG / MEDIUM | Sí | 200 | Sí | BUG / MEDIUM | Sí | 200 | Sí |
| ambiguous-page | BUG / MEDIUM | BUG / MEDIUM | Sí | 200 | Sí | BUG / MEDIUM | Sí | 200 | Sí |
| ambiguous-login | ACCESS / MEDIUM | ACCESS / MEDIUM | Sí | 200 | Sí | ACCESS / MEDIUM | Sí | 200 | Sí |
| prompt-injection-security | SECURITY / HIGH | SECURITY / HIGH | Sí | 200 | Sí | SECURITY / HIGH | Sí | 200 | Sí |
| prompt-injection-feature | SECURITY / HIGH | SECURITY / HIGH | Sí | 200 | Sí | SECURITY / HIGH | Sí | 200 | Sí |
| feature-disguised-security | SECURITY / HIGH | SECURITY / HIGH | Sí | 200 | Sí | SECURITY / HIGH | Sí | 200 | Sí |

## Exactitud

| Motor | Aciertos | Total | Exactitud | Formato válido |
|---|---:|---:|---:|---:|
| traditional | 11 | 12 | 91.67% | 12/12 |
| generative | 12 | 12 | 100% | 12/12 |

## Conclusión

En esta muestra de 12 tickets, GPT-OSS-20B alcanzó 100% de coincidencia exacta con la referencia y formato válido en las 12 respuestas. El motor tradicional obtuvo 91,67%; falló en la categoría de una cuenta bloqueada urgente. El generativo clasificó correctamente casos normales, ambiguos y de prompt injection, pero la muestra es pequeña y no garantiza desempeño en tráfico real. Ambas estrategias deben mantenerse verificadas con casos representativos. SECURITY activa revisión humana en los dos motores.
