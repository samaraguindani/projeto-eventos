using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using ProjetoEventosAuth.Models.DTOs;
using ProjetoEventosAuth.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ProjetoEventosAuth.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UsuarioService _usuarioService;
    private readonly IConfiguration _configuration;

    public AuthController(UsuarioService usuarioService, IConfiguration configuration)
    {
        _usuarioService = usuarioService;
        _configuration = configuration;
    }

    [HttpPost("cadastro")]
    public async Task<IActionResult> Cadastro([FromBody] UsuarioCreateRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var usuario = await _usuarioService.CriarUsuarioAsync(request);

        if (usuario == null)
        {
            return Conflict(new { message = "Email ou CPF já cadastrado" });
        }

        var token = GerarToken(usuario);

        return Ok(new
        {
            message = "Usuário cadastrado com sucesso",
            token = token,
            usuario = new
            {
                id = usuario.Id,
                nome = usuario.Nome,
                email = usuario.Email
            }
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var usuario = await _usuarioService.ValidarLoginAsync(request.Email, request.Senha);

        if (usuario == null)
        {
            return Unauthorized(new { message = "Email ou senha inválidos" });
        }

        var token = GerarToken(usuario);

        return Ok(new
        {
            message = "Login realizado com sucesso",
            token = token,
            usuario = new
            {
                id = usuario.Id,
                nome = usuario.Nome,
                email = usuario.Email
            }
        });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> ObterUsuarioAtual()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized();
        }

        var usuario = await _usuarioService.ObterUsuarioPorIdAsync(userId);

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

    private string GerarToken(Models.Usuario usuario)
    {
        var jwtSecret = _configuration["Jwt:Secret"] ?? "MinhaChaveSecretaSuperSeguraParaJWT2024!@#$%";
        var jwtIssuer = _configuration["Jwt:Issuer"] ?? "EventosAuth";
        var jwtAudience = _configuration["Jwt:Audience"] ?? "EventosApp";

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
            new Claim(ClaimTypes.Email, usuario.Email),
            new Claim(ClaimTypes.Name, usuario.Nome),
            new Claim("userId", usuario.Id.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: jwtIssuer,
            audience: jwtAudience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(24),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

