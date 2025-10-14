# Teste completo: login, listar clientes, refresh e logout
# Uso: powershell -NoProfile -File ./test_login.ps1

$baseUrl = 'http://127.0.0.1:3001/api/v1'
$loginUrl = "$baseUrl/login"
$clientesUrl = "$baseUrl/clientes"
$refreshUrl = "$baseUrl/auth/refresh"
$logoutUrl = "$baseUrl/logout"

# Mantém cookies HttpOnly entre requisições
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

# Payload de login
$payloadObj = @{ usuario = @{ login = 'admin'; password = 'password123' } }
$payload = $payloadObj | ConvertTo-Json -Depth 5

Write-Output "POST $loginUrl"
Write-Output "Payload: $payload"

try {
  # LOGIN (mantendo cookies na sessão)
  $respLogin = Invoke-RestMethod -Uri $loginUrl -Method Post -ContentType 'application/json' -Body $payload -WebSession $session
  Write-Output 'LOGIN RESPONSE RAW:'
  $respLogin | ConvertTo-Json -Depth 10

  $token = $respLogin.token
  if ([string]::IsNullOrEmpty($token)) {
    Write-Output 'SEM TOKEN RETORNADO DO LOGIN'
    exit 1
  }
  Write-Output "Token recebido (truncado): $($token.Substring(0,16))..."

  # LISTAR CLIENTES (com Authorization)
  $headers = @{ Authorization = "Bearer $token"; Accept = 'application/json' }
  Write-Output "GET $clientesUrl com Authorization: Bearer <token>"
  $clientes = Invoke-RestMethod -Uri $clientesUrl -Headers $headers -Method Get -WebSession $session
  Write-Output 'CLIENTES RESPONSE RAW:'
  $clientes | ConvertTo-Json -Depth 10

  # REFRESH (usa cookie HttpOnly mantido na sessão)
  Write-Output "POST $refreshUrl (com cookie HttpOnly da sessão)"
  $respRefresh = Invoke-RestMethod -Uri $refreshUrl -Method Post -Headers @{ Accept = 'application/json' } -WebSession $session
  Write-Output 'REFRESH RESPONSE RAW:'
  $respRefresh | ConvertTo-Json -Depth 10
  $newToken = $respRefresh.token
  if ([string]::IsNullOrEmpty($newToken)) {
    Write-Output 'SEM NOVO TOKEN NO REFRESH'
    exit 1
  }
  Write-Output "Novo token (truncado): $($newToken.Substring(0,16))..."

  # LOGOUT (usa Authorization + revoga refresh da sessão)
  $headersLogout = @{ Authorization = "Bearer $newToken"; Accept = 'application/json' }
  Write-Output "POST $logoutUrl (Authorization + revoga refresh)"
  $respLogout = Invoke-RestMethod -Uri $logoutUrl -Method Post -Headers $headersLogout -WebSession $session
  Write-Output 'LOGOUT RESPONSE RAW:'
  $respLogout | ConvertTo-Json -Depth 10

  Write-Output "Teste concluído com sucesso."
} catch {
  Write-Output "ERRO: $($_.Exception.Message)"
  if ($_.Exception.Response) {
    try {
      $reader = New-Object IO.StreamReader($_.Exception.Response.GetResponseStream())
      $body = $reader.ReadToEnd()
      Write-Output 'ERRO RESPONSE BODY:'
      Write-Output $body
    } catch {}
  }
  exit 1
}