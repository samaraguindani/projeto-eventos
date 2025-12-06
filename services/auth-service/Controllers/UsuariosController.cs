using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjetoEventosAuth.Models.DTOs;
using ProjetoEventosAuth.Services;
using System.Security.Claims;

namespace ProjetoEventosAuth.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsuariosController : ControllerBase
{
    private readonly UsuarioService _usuarioService;

    public UsuariosController(UsuarioService usuarioService)
    {
        _usuarioService = usuarioService;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> ObterUsuario(int id)
    {
        var usuario = await _usuarioService.ObterUsuarioPorIdAsync(id);

        if (usuario == null)
        {
            return NotFound(new { message = "Usuário não encontrado" });
        }

        return Ok(new
        {
            id = usuario.Id,
            nome = usuario.Nome,
            email = usuario.Email,
            cpf = usuario.Cpf,
            telefone = usuario.Telefone,
            dataNascimento = usuario.DataNascimento
        });
    }
}





