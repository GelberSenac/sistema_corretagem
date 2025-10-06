# Teste de login e requisição de clientes
# Uso: powershell -NoProfile -File ./test_login.ps1

$loginUrl = 'http://localhost:3001/api/v1/login'
$clientesUrl = 'http://localhost:3001/api/v1/clientes'

$payload = @{ usuario = @{ login = 'admin'; password = 'password123' } } | ConvertTo-Json -Depth 3

Write-Output "POST $loginUrl"
Write-Output "Payload: $payload"

try {
  $resp = Invoke-RestMethod -Uri $loginUrl -Method Post -ContentType 'application/json' -Body $payload
  Write-Output 'LOGIN RESPONSE RAW:'
  $resp | ConvertTo-Json -Depth 10

  $token = $resp.token
  if ([string]::IsNullOrEmpty($token)) {
    Write-Output 'SEM TOKEN RETORNADO DO LOGIN'
    exit 1
  }
  Write-Output "Token recebido (truncado): $($token.Substring(0,16))..."

  $headers = @{ Authorization = "Bearer $token" }
  Write-Output "GET $clientesUrl com Authorization: Bearer <token>"
  $clientes = Invoke-RestMethod -Uri $clientesUrl -Headers $headers -Method Get
  Write-Output 'CLIENTES RESPONSE RAW:'
  $clientes | ConvertTo-Json -Depth 10
} catch {
  Write-Error $_
  exit 1
}