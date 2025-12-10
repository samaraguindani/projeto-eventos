using System.ComponentModel.DataAnnotations;

namespace ProjetoEventosAuth.Models.DTOs;

public class UsuarioCreateRequest
{
    [Required(ErrorMessage = "Nome é obrigatório")]
    [StringLength(255, ErrorMessage = "Nome deve ter no máximo 255 caracteres")]
    public string Nome { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email é obrigatório")]
    [EmailAddress(ErrorMessage = "Email inválido")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Senha é obrigatória")]
    [MinLength(6, ErrorMessage = "Senha deve ter no mínimo 6 caracteres")]
    public string Senha { get; set; } = string.Empty;

    public string? Cpf { get; set; }
    public string? Telefone { get; set; }
    public DateTime? DataNascimento { get; set; }
}










