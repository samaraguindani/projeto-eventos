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
        // Verificar se o usuário está tentando acessar seu próprio perfil
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId) || userId != id)
        {
            return Forbid();
        }

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
            data_nascimento = usuario.DataNascimento,
            papel = usuario.Papel,
            cadastro_completo = usuario.CadastroCompleto
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> AtualizarUsuario(int id, [FromBody] UsuarioUpdateRequest request)
    {
        // Verificar se o usuário está tentando atualizar seu próprio perfil
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId) || userId != id)
        {
            return Forbid();
        }

        var resultado = await _usuarioService.AtualizarUsuarioAsync(id, request);

        if (resultado == null)
        {
            return BadRequest(new { message = "Erro ao atualizar usuário. Verifique os dados informados." });
        }

        return Ok(new
        {
            id = resultado.Id,
            nome = resultado.Nome,
            email = resultado.Email,
            cpf = resultado.Cpf,
            telefone = resultado.Telefone,
            data_nascimento = resultado.DataNascimento,
            papel = resultado.Papel,
            cadastro_completo = resultado.CadastroCompleto
        });
    }
}





