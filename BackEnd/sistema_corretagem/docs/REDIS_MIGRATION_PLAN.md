# Plano de Migração para Redis (Tokens & Blacklist)

## Objetivo
Migrar armazenamento de refresh tokens e blacklist de tokens para Redis, visando TTL eficiente, performance e revogação imediata.

## Variáveis de Ambiente (placeholders)
- `REDIS_URL` (ex.: `redis://localhost:6379/0` ou `rediss://...`)
- `REDIS_TLS` (`true|false`)
- `REDIS_REFRESH_NAMESPACE` (ex.: `auth:refresh`)
- `REDIS_REFRESH_TTL_SECONDS` (ex.: `604800` para 7 dias)

## Estratégia
1. Provisionar serviço Redis (dev/staging/prod) e validar conectividade.
2. Implementar camada de storage com interface unificada:
   - Adapter PostgreSQL (atual)
   - Adapter Redis (novo)
   - Fallback automático para PostgreSQL em caso de falha de Redis.
3. Definir TTLs:
   - Access token: 900s (15 min) — gerado e validado via JWT, sem storage.
   - Refresh token: 7 dias (604800s) — armazenado em Redis com TTL.
4. Namespaces e chaves:
   - `auth:refresh:{usuario_id}:{device_fingerprint}` → valor: hash do token
   - Blacklist: `auth:blacklist:{token_jti}` (se necessário)
5. Operações suportadas:
   - Create/Rotate: set com TTL
   - Validate: get/verificação de existência
   - Revoke: del
   - Logout all: scan por usuário e del
6. Observabilidade e auditoria:
   - Logs de sucesso/erro nas operações Redis
   - Eventos de auditoria (info/warning/error/critical)
7. Testes e rollout:
   - Testes unitários dos adapters
   - Testes integrados (login/refresh/logout/logout_all)
   - Rollout em staging, monitoramento e depois produção.

## Riscos e mitigação
- Indisponibilidade do Redis → fallback PostgreSQL
- Duplicidade/Drift entre stores → fonte única de verdade (Redis) + revogação agressiva
- Segurança/TLS → `REDIS_TLS=true` em ambientes externos