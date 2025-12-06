using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EventosService.Data;
using EventosService.Models;

namespace EventosService.Controllers;

/// <summary>
/// Controller responsável pela gestão de eventos
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class EventosController : ControllerBase
{
    private readonly EventosDbContext _context;

    public EventosController(EventosDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Lista todos os eventos com filtros opcionais
    /// </summary>
    /// <param name="status">Filtrar por status (ativo, cancelado, finalizado)</param>
    /// <param name="categoria">Filtrar por categoria</param>
    /// <param name="dataInicio">Filtrar eventos que iniciam a partir desta data</param>
    /// <param name="dataFim">Filtrar eventos que terminam até esta data</param>
    /// <returns>Lista de eventos</returns>
    /// <response code="200">Retorna a lista de eventos</response>
    /// <response code="500">Erro interno do servidor</response>
    [HttpGet]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ListarEventos(
        [FromQuery] string? status = null,
        [FromQuery] string? categoria = null,
        [FromQuery] DateTime? dataInicio = null,
        [FromQuery] DateTime? dataFim = null)
    {
        var query = _context.Eventos.AsQueryable();

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(e => e.Status == status);
        }

        if (!string.IsNullOrEmpty(categoria))
        {
            query = query.Where(e => e.Categoria == categoria);
        }

        if (dataInicio.HasValue)
        {
            query = query.Where(e => e.DataInicio >= dataInicio.Value);
        }

        if (dataFim.HasValue)
        {
            query = query.Where(e => e.DataFim <= dataFim.Value);
        }

        var eventos = await query
            .OrderBy(e => e.DataInicio)
            .ToListAsync();

        // Buscar contagem de participantes de cada evento usando LINQ
        var eventoIds = eventos.Select(e => e.Id).ToList();
        
        var participantesPorEvento = await _context.Inscricoes
            .Where(i => eventoIds.Contains(i.EventoId) && i.Status == "ativa")
            .GroupBy(i => i.EventoId)
            .Select(g => new { EventoId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.EventoId, x => x.Count);

        var eventosComParticipantes = eventos.Select(e => new
        {
            e.Id,
            e.Titulo,
            e.Descricao,
            e.DataInicio,
            e.DataFim,
            e.Localizacao,
            e.CapacidadeMaxima,
            e.VagasDisponiveis,
            e.ValorInscricao,
            e.Categoria,
            e.Status,
            NumeroParticipantes = participantesPorEvento.GetValueOrDefault(e.Id, 0)
        }).ToList();

        return Ok(new
        {
            total = eventosComParticipantes.Count,
            eventos = eventosComParticipantes
        });
    }

    /// <summary>
    /// Busca um evento específico por ID
    /// </summary>
    /// <param name="id">ID do evento</param>
    /// <returns>Dados completos do evento</returns>
    /// <response code="200">Retorna o evento encontrado</response>
    /// <response code="404">Evento não encontrado</response>
    /// <response code="500">Erro interno do servidor</response>
    [HttpGet("{id}")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> BuscarEvento(int id)
    {
        var evento = await _context.Eventos
            .Where(e => e.Id == id)
            .FirstOrDefaultAsync();

        if (evento == null)
        {
            return NotFound(new { message = "Evento não encontrado" });
        }

        // Contar participantes usando LINQ
        var numeroParticipantes = await _context.Inscricoes
            .Where(i => i.EventoId == id && i.Status == "ativa")
            .CountAsync();

        return Ok(new
        {
            evento.Id,
            evento.Titulo,
            evento.Descricao,
            evento.DataInicio,
            evento.DataFim,
            evento.Localizacao,
            evento.CapacidadeMaxima,
            evento.VagasDisponiveis,
            evento.ValorInscricao,
            evento.Categoria,
            evento.Status,
            evento.CreatedAt,
            evento.UpdatedAt,
            NumeroParticipantes = numeroParticipantes
        });
    }
}




