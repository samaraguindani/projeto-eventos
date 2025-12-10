# Script alternativo para adicionar campos e criar admin
# Execute com: .\adicionar-campos-admin.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ATUALIZAR BANCO E CRIAR ADMIN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Carregar assembly do PostgreSQL
Add-Type -Path "C:\Program Files\PostgreSQL\16\lib\Npgsql.dll" -ErrorAction SilentlyContinue

try {
    # Conectar ao banco
    $connectionString = "Host=localhost;Port=5432;Database=eventos_db;Username=postgres;Password=postgres"
    $conn = New-Object Npgsql.NpgsqlConnection($connectionString)
    $conn.Open()
    
    Write-Host "Conectado ao banco!" -ForegroundColor Green
    Write-Host ""
    
    # Array de comandos SQL
    $commands = @(
        "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS cpf VARCHAR(14) UNIQUE",
        "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS papel VARCHAR(20) DEFAULT 'usuario'",
        "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS cadastro_completo BOOLEAN DEFAULT TRUE",
        "CREATE INDEX IF NOT EXISTS idx_usuarios_cpf ON usuarios(cpf)",
        "CREATE INDEX IF NOT EXISTS idx_usuarios_papel ON usuarios(papel)",
        "UPDATE usuarios SET cadastro_completo = TRUE, papel = 'usuario' WHERE papel IS NULL OR papel = ''",
        "INSERT INTO usuarios (nome, email, senha, cpf, papel, cadastro_completo, created_at) VALUES ('Administrador', 'admin@eventos.com', '$2y$10`$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '000.000.000-00', 'admin', TRUE, CURRENT_TIMESTAMP) ON CONFLICT (email) DO UPDATE SET papel = 'admin', cpf = '000.000.000-00'",
        "INSERT INTO usuarios (nome, email, senha, cpf, papel, cadastro_completo, created_at) VALUES ('Atendente', 'atendente@eventos.com', '$2y$10`$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '000.000.000-01', 'atendente', TRUE, CURRENT_TIMESTAMP) ON CONFLICT (email) DO UPDATE SET papel = 'atendente', cpf = '000.000.000-01'"
    )
    
    foreach ($sql in $commands) {
        try {
            $cmd = $conn.CreateCommand()
            $cmd.CommandText = $sql
            $cmd.ExecuteNonQuery() | Out-Null
            Write-Host "✓ Executado com sucesso" -ForegroundColor Green
        } catch {
            Write-Host "⚠ $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
    
    $conn.Close()
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  CONCLUIDO COM SUCESSO!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "CREDENCIAIS:" -ForegroundColor Yellow
    Write-Host "Admin: admin@eventos.com | Senha: password" -ForegroundColor White
    Write-Host "Atendente: atendente@eventos.com | Senha: password" -ForegroundColor White
    
} catch {
    Write-Host ""
    Write-Host "ERRO: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Tente usar o pgAdmin ou outro cliente SQL para executar:" -ForegroundColor Yellow
    Write-Host "database\adicionar-cpf-e-admin.sql" -ForegroundColor Cyan
}

Write-Host ""
Read-Host "Pressione Enter para continuar"






