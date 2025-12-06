# Script para testar a conexão com PostgreSQL usando .NET

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TESTE DE CONEXÃO POSTGRESQL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Criar arquivo de teste C#
$testCode = @'
using System;
using Npgsql;

class Program
{
    static void Main()
    {
        var connectionString = "Host=localhost;Port=5432;Database=eventos_db;Username=postgres;Password=postgres";
        
        Console.WriteLine("Testando conexão com PostgreSQL...");
        Console.WriteLine($"Connection String: {connectionString}");
        Console.WriteLine();
        
        try
        {
            using var connection = new NpgsqlConnection(connectionString);
            connection.Open();
            
            Console.WriteLine("✅ CONEXÃO ESTABELECIDA COM SUCESSO!");
            Console.WriteLine($"   Versão do PostgreSQL: {connection.ServerVersion}");
            Console.WriteLine($"   Database: {connection.Database}");
            Console.WriteLine();
            
            // Testar query simples
            using var cmd = new NpgsqlCommand("SELECT 1 as test", connection);
            var result = cmd.ExecuteScalar();
            Console.WriteLine($"✅ QUERY EXECUTADA: SELECT 1 = {result}");
            Console.WriteLine();
            
            // Listar tabelas
            using var cmd2 = new NpgsqlCommand("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename", connection);
            using var reader = cmd2.ExecuteReader();
            
            Console.WriteLine("📋 TABELAS NO BANCO:");
            int count = 0;
            while (reader.Read())
            {
                Console.WriteLine($"   - {reader.GetString(0)}");
                count++;
            }
            
            if (count == 0)
            {
                Console.WriteLine("   ⚠️  Nenhuma tabela encontrada! Execute o schema.sql primeiro.");
            }
            
            connection.Close();
        }
        catch (Exception ex)
        {
            Console.WriteLine("❌ ERRO AO CONECTAR!");
            Console.WriteLine($"   Tipo: {ex.GetType().Name}");
            Console.WriteLine($"   Mensagem: {ex.Message}");
            Console.WriteLine();
            Console.WriteLine("Stack Trace:");
            Console.WriteLine(ex.ToString());
        }
    }
}
'@

Write-Host "Criando projeto de teste..." -ForegroundColor Yellow

# Criar pasta temporária
$testDir = "test-connection-temp"
if (Test-Path $testDir) {
    Remove-Item -Recurse -Force $testDir
}
New-Item -ItemType Directory -Path $testDir | Out-Null

# Criar projeto
Push-Location $testDir
dotnet new console --force | Out-Null
dotnet add package Npgsql --version 8.0.0 | Out-Null

# Escrever código
$testCode | Set-Content Program.cs

Write-Host "Compilando e executando..." -ForegroundColor Yellow
Write-Host ""

# Executar
dotnet run

Pop-Location

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Limpando arquivos temporários..." -ForegroundColor Gray
Remove-Item -Recurse -Force $testDir -ErrorAction SilentlyContinue

Write-Host ""
Read-Host "Pressione Enter para sair"

