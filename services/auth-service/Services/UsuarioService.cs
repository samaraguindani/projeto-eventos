using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using ProjetoEventosAuth.Data;
using ProjetoEventosAuth.Models;
using ProjetoEventosAuth.Models.DTOs;

namespace ProjetoEventosAuth.Services;

public class UsuarioService
{
    private readonly ApplicationDbContext _context;

    public UsuarioService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Usuario?> CriarUsuarioAsync(UsuarioCreateRequest request)
    {
        // Verificar se email já existe
        if (await _context.Usuarios.AnyAsync(u => u.Email == request.Email))
        {
            return null;
        }

        // Verificar se CPF já existe (se fornecido)
        if (!string.IsNullOrEmpty(request.Cpf) && 
            await _context.Usuarios.AnyAsync(u => u.Cpf == request.Cpf))
        {
            return null;
        }

        var usuario = new Usuario
        {
            Nome = request.Nome,
            Email = request.Email,
            Senha = BCrypt.Net.BCrypt.HashPassword(request.Senha),
            Cpf = request.Cpf,
            Telefone = request.Telefone,
            DataNascimento = request.DataNascimento,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Ativo = true
        };

        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();

        return usuario;
    }

    public async Task<Usuario?> ValidarLoginAsync(string email, string senha)
    {
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Email == email && u.Ativo);

        if (usuario == null)
        {
            return null;
        }

        if (!BCrypt.Net.BCrypt.Verify(senha, usuario.Senha))
        {
            return null;
        }

        return usuario;
    }

    public async Task<Usuario?> ObterUsuarioPorIdAsync(int id)
    {
        return await _context.Usuarios.FindAsync(id);
    }

    public async Task<Usuario?> ObterUsuarioPorEmailAsync(string email)
    {
        return await _context.Usuarios.FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<Usuario?> AtualizarUsuarioAsync(int id, UsuarioUpdateRequest request)
    {
        var usuario = await _context.Usuarios.FindAsync(id);

        if (usuario == null)
        {
            return null;
        }

        // Atualizar nome se fornecido
        if (!string.IsNullOrEmpty(request.Nome))
        {
            usuario.Nome = request.Nome;
        }

        // Atualizar CPF apenas se ainda não tiver (cadastro incompleto)
        if (!string.IsNullOrEmpty(request.Cpf) && string.IsNullOrEmpty(usuario.Cpf))
        {
            // Verificar se CPF já existe
            if (await _context.Usuarios.AnyAsync(u => u.Cpf == request.Cpf && u.Id != id))
            {
                return null; // CPF já existe
            }
            usuario.Cpf = request.Cpf;
        }

        // Atualizar telefone
        if (request.Telefone != null)
        {
            usuario.Telefone = request.Telefone;
        }

        // Atualizar data de nascimento (garantir UTC - usar apenas a data, sem hora)
        if (request.DataNascimento.HasValue)
        {
            var dataNascimento = request.DataNascimento.Value;
            // Criar DateTime UTC à meia-noite usando apenas a data
            usuario.DataNascimento = new DateTime(
                dataNascimento.Year,
                dataNascimento.Month,
                dataNascimento.Day,
                0, 0, 0,
                DateTimeKind.Utc
            );
        }

        // Atualizar senha se fornecida
        if (!string.IsNullOrEmpty(request.NovaSenha))
        {
            if (string.IsNullOrEmpty(request.SenhaAtual))
            {
                return null; // Senha atual é obrigatória
            }

            // Verificar senha atual
            if (!BCrypt.Net.BCrypt.Verify(request.SenhaAtual, usuario.Senha))
            {
                return null; // Senha atual incorreta
            }

            // Atualizar senha
            usuario.Senha = BCrypt.Net.BCrypt.HashPassword(request.NovaSenha);
        }

        // Marcar cadastro como completo se tinha CPF vazio e agora foi preenchido
        if (!usuario.CadastroCompleto && !string.IsNullOrEmpty(usuario.Cpf) && !string.IsNullOrEmpty(usuario.Nome))
        {
            usuario.CadastroCompleto = true;
        }

        usuario.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return usuario;
    }
}





