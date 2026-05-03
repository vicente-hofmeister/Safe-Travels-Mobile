#Requires -RunAsAdministrator

$rules = @(
    @{ Name = "Safe Travels API";   Port = 3000 },
    @{ Name = "Expo Metro Bundler"; Port = 8081 }
)

foreach ($rule in $rules) {
    $existing = Get-NetFirewallRule -DisplayName $rule.Name -ErrorAction SilentlyContinue
    if ($existing) {
        # Garante que o perfil cobre todos os tipos de rede (Public incluso)
        Set-NetFirewallRule -DisplayName $rule.Name -Profile Any
        Write-Host "[$($rule.Name)] Regra atualizada para todos os perfis de rede."
    } else {
        New-NetFirewallRule -DisplayName $rule.Name -Direction Inbound -Protocol TCP -LocalPort $rule.Port -Action Allow -Profile Any | Out-Null
        Write-Host "[$($rule.Name)] Regra criada na porta $($rule.Port) para todos os perfis."
    }
}

Write-Host ""
Write-Host "Verificando se as portas estão acessíveis na rede local..."
foreach ($rule in $rules) {
    $test = Test-NetConnection -ComputerName 127.0.0.1 -Port $rule.Port -WarningAction SilentlyContinue
    $status = if ($test.TcpTestSucceeded) { "OK - porta aberta" } else { "FALHOU - nada ouvindo nessa porta" }
    Write-Host "  Porta $($rule.Port): $status"
}

Write-Host ""
Write-Host "Pronto. O celular na mesma rede Wi-Fi pode conectar diretamente sem tunnel."
Write-Host "Teste no browser do celular: http://$(((Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '172.*' } | Select-Object -First 1).IPAddress)):3000/health"
