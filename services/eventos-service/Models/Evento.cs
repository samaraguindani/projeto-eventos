namespace EventosService.Models;

public class Evento
{
    public int Id { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public DateTime DataInicio { get; set; }
    public DateTime DataFim { get; set; }
    public string? Localizacao { get; set; }
    public int? CapacidadeMaxima { get; set; }
    public int? VagasDisponiveis { get; set; }
    public decimal ValorInscricao { get; set; }
    public string? Categoria { get; set; }
    public string Status { get; set; } = "ativo";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}










