namespace ProjetoEventosAuth.Models.DTOs;

public class UsuarioUpdateRequest
{
    public string? Nome { get; set; }
    public string? Cpf { get; set; }
    public string? Telefone { get; set; }
    public DateTime? DataNascimento { get; set; }
    public string? SenhaAtual { get; set; }
    public string? NovaSenha { get; set; }
}






