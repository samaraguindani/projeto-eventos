namespace EventosService.Models;

public class Inscricao
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public int EventoId { get; set; }
    public DateTime DataInscricao { get; set; }
    public string Status { get; set; } = "ativa";
    public bool PresencaRegistrada { get; set; }
    public DateTime? DataPresenca { get; set; }
    public string CodigoInscricao { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}



