namespace ProjetoEventosAuth.Models;

public class Log
{
    public int Id { get; set; }
    public DateTime Timestamp { get; set; }
    public string Metodo { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string? Ip { get; set; }
    public string? UserAgent { get; set; }
    public int? StatusCode { get; set; }
    public int? UserId { get; set; }
    public int? ResponseTime { get; set; }
    public string? RequestBody { get; set; }
    public string? ResponseBody { get; set; }
}







