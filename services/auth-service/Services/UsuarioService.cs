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
}

